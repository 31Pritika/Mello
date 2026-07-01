from sqlalchemy.orm import Session
from models import Circle, CircleMember, Post, Reaction, User
from datetime import datetime

def get_by_category_city(db: Session, category: str, city: str) -> Circle:
    return db.query(Circle).filter(
        Circle.category == category,
        Circle.city == city,
        Circle.is_active == True
    ).first()

def create(db: Session, category: str, city: str, state: str = None, country: str = None) -> Circle:
    circle = Circle(category=category, city=city, state=state, country=country)
    db.add(circle)
    db.commit()
    db.refresh(circle)
    return circle

def get_member(db: Session, circle_id, user_id) -> CircleMember:
    return db.query(CircleMember).filter(
        CircleMember.circle_id == circle_id,
        CircleMember.user_id == user_id
    ).first()

def add_member(db: Session, circle_id, user_id, role: str = "member") -> CircleMember:
    existing = get_member(db, circle_id, user_id)
    if existing:
        return existing
    member = CircleMember(circle_id=circle_id, user_id=user_id, role=role)
    db.add(member)
    db.commit()
    return member

def get_member_count(db: Session, circle_id) -> int:
    return db.query(CircleMember).filter(
        CircleMember.circle_id == circle_id
    ).count()

def get_member_names(db: Session, circle_id, limit: int = 6):
    return db.query(User.name).join(
        CircleMember, CircleMember.user_id == User.id
    ).filter(CircleMember.circle_id == circle_id).limit(limit).all()

def get_user_circles(db: Session, user_id):
    return db.query(CircleMember).filter(
        CircleMember.user_id == user_id
    ).all()

def rename(db: Session, circle: Circle, name: str) -> Circle:
    circle.name = name
    circle.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(circle)
    return circle

def get_posts(db: Session, circle_id, limit: int = 30):
    return db.query(Post).filter(
        Post.circle_id == circle_id,
        Post.is_deleted == False
    ).order_by(Post.created_at.desc()).limit(limit).all()

def create_post(db: Session, circle_id, user_id, content: str, post_type: str = "thought") -> Post:
    post = Post(
        circle_id=circle_id,
        user_id=user_id,
        content=content,
        post_type=post_type
    )
    db.add(post)
    db.commit()
    db.refresh(post)
    return post

def get_reaction(db: Session, post_id, user_id) -> Reaction:
    return db.query(Reaction).filter(
        Reaction.post_id == post_id,
        Reaction.user_id == user_id
    ).first()

def add_reaction(db: Session, post_id, user_id, reaction_type: str) -> Reaction:
    reaction = Reaction(post_id=post_id, user_id=user_id, reaction_type=reaction_type)
    db.add(reaction)
    db.commit()
    return reaction

def remove_reaction(db: Session, reaction: Reaction):
    db.delete(reaction)
    db.commit()

def update_reaction(db: Session, reaction: Reaction, reaction_type: str) -> Reaction:
    reaction.reaction_type = reaction_type
    db.commit()
    return reaction