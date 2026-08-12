from sqlalchemy.orm import Session, joinedload
from sqlalchemy import and_
from models import Interest, ContentCache, User
from .base import BaseRepository
from typing import Optional, List, Set
from uuid import UUID

class InterestRepository(BaseRepository[Interest]):
    def __init__(self, db: Session):
        super().__init__(Interest, db)

    def get_by_user(self, user_id, category: str = None) -> List[Interest]:
        # Single query with content preloaded — avoids N+1 when accessing i.content
        q = self.db.query(Interest).options(
            joinedload(Interest.content)
        ).filter(Interest.user_id == user_id)
        if category:
            q = q.filter(Interest.category == category)
        return q.all()

    def get_content_ids_by_category(self, user_id, category: str) -> Set[UUID]:
        # Lean query — only fetches content_id column, not full rows
        rows = self.db.query(Interest.content_id).filter(
            Interest.user_id == user_id,
            Interest.category == category
        ).all()
        return {r[0] for r in rows}

    def get_existing(self, user_id, content_id) -> Optional[Interest]:
        return self.db.query(Interest).filter(
            Interest.user_id == user_id,
            Interest.content_id == content_id
        ).first()

    def bulk_create(self, user_id, items: list) -> List[str]:
        # Single commit for all interests instead of one commit per item
        from models import ContentCache
        saved_titles = []
        new_interests = []

        # Fetch all existing interests for this user in one query
        existing_content_ids = {
            r[0] for r in self.db.query(Interest.content_id)
            .filter(Interest.user_id == user_id).all()
        }

        for content, title, category in items:
            if content.id not in existing_content_ids:
                new_interests.append(Interest(
                    user_id=user_id,
                    content_id=content.id,
                    category=category
                ))
                saved_titles.append(title)

        if new_interests:
            self.db.bulk_save_objects(new_interests)
            self.db.commit()

        return saved_titles