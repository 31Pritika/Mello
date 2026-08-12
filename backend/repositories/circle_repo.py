from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func
from models import Circle, CircleMember, Post, Reaction, User
from datetime import datetime
from .base import BaseRepository
from typing import Optional, List

class CircleRepository(BaseRepository[Circle]):
    def __init__(self, db: Session):
        super().__init__(Circle, db)

    def get_by_category_city(self, category: str, city: str) -> Optional[Circle]:
        return self.db.query(Circle).filter(
            Circle.category == category,
            func.lower(Circle.city) == func.lower(city),
            Circle.is_active == True
        ).first()

    def get_user_circles_enriched(self, user_id) -> List[dict]:
        # Single query joining circles + members + user names
        # Avoids multiple round trips for member count and member names
        memberships = self.db.query(CircleMember).options(
            joinedload(CircleMember.circle)
        ).filter(CircleMember.user_id == user_id).all()

        result = []
        circle_ids = [m.circle_id for m in memberships]

        # One query to get all member counts
        counts = dict(
            self.db.query(CircleMember.circle_id, func.count(CircleMember.user_id))
            .filter(CircleMember.circle_id.in_(circle_ids))
            .group_by(CircleMember.circle_id)
            .all()
        )

        # One query to get all member names
        names_rows = self.db.query(CircleMember.circle_id, User.name)\
            .join(User, User.id == CircleMember.user_id)\
            .filter(CircleMember.circle_id.in_(circle_ids))\
            .all()

        names_map = {}
        for circle_id, name in names_rows:
            names_map.setdefault(circle_id, []).append(name)

        for m in memberships:
            circle = m.circle
            cid = circle.id
            result.append({
                "id": str(cid),
                "category": circle.category,
                "city": circle.city,
                "name": circle.name,
                "member_count": counts.get(cid, 0),
                "member_names": names_map.get(cid, [])[:6],
                "joined_at": m.joined_at,
            })
        return result

    def get_member(self, circle_id, user_id) -> Optional[CircleMember]:
        return self.db.query(CircleMember).filter(
            CircleMember.circle_id == circle_id,
            CircleMember.user_id == user_id
        ).first()

    def get_member_count(self, circle_id) -> int:
        return self.db.query(func.count(CircleMember.user_id))\
            .filter(CircleMember.circle_id == circle_id).scalar()

    def add_member(self, circle_id, user_id, role: str = "member") -> Optional[CircleMember]:
        if self.get_member(circle_id, user_id):
            return None
        member = CircleMember(circle_id=circle_id, user_id=user_id, role=role)
        self.db.add(member)
        self.db.commit()
        return member

    def bulk_add_members(self, circle_id, user_ids: list, max_members: int) -> None:
        # Check existing members once, then bulk insert
        existing = {
            r[0] for r in self.db.query(CircleMember.user_id)
            .filter(CircleMember.circle_id == circle_id).all()
        }
        current_count = len(existing)
        new_members = []
        for uid in user_ids:
            if current_count >= max_members:
                break
            if uid not in existing:
                new_members.append(CircleMember(circle_id=circle_id, user_id=uid))
                current_count += 1

        if new_members:
            self.db.bulk_save_objects(new_members)
            self.db.commit()

    def get_posts_with_reactions(self, circle_id, limit: int = 30) -> List[Post]:
        # Single query — preloads user and reactions to avoid N+1
        return self.db.query(Post).options(
            joinedload(Post.user),
            joinedload(Post.reactions).joinedload(Reaction.user)
        ).filter(
            Post.circle_id == circle_id,
            Post.is_deleted == False
        ).order_by(Post.created_at.desc()).limit(limit).all()

    def create_post(self, circle_id, user_id, content: str,
                    post_type: str = "thought") -> Post:
        post = Post(
            circle_id=circle_id,
            user_id=user_id,
            content=content,
            post_type=post_type
        )
        self.db.add(post)
        self.db.commit()
        self.db.refresh(post)
        return post

    def get_reaction(self, post_id, user_id) -> Optional[Reaction]:
        return self.db.query(Reaction).filter(
            Reaction.post_id == post_id,
            Reaction.user_id == user_id
        ).first()

    def upsert_reaction(self, post_id, user_id, reaction_type: str) -> str:
        existing = self.get_reaction(post_id, user_id)
        if existing:
            if existing.reaction_type == reaction_type:
                self.db.delete(existing)
                self.db.commit()
                return "removed"
            existing.reaction_type = reaction_type
            self.db.commit()
            return "updated"
        self.db.add(Reaction(post_id=post_id, user_id=user_id, reaction_type=reaction_type))
        self.db.commit()
        return "added"

    def rename(self, circle: Circle, name: str) -> Circle:
        circle.name = name
        circle.updated_at = datetime.utcnow()
        self.db.commit()
        self.db.refresh(circle)
        return circle