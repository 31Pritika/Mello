from sqlalchemy.orm import Session
from models import Interest, ContentCache

def get_by_user(db: Session, user_id, category: str = None):
    q = db.query(Interest).filter(Interest.user_id == user_id)
    if category:
        q = q.filter(Interest.category == category)
    return q.all()

def get_content_ids_by_user_category(db: Session, user_id, category: str):
    return {
        i.content_id for i in db.query(Interest).filter(
            Interest.user_id == user_id,
            Interest.category == category
        ).all()
    }

def get_existing(db: Session, user_id, content_id) -> Interest:
    return db.query(Interest).filter(
        Interest.user_id == user_id,
        Interest.content_id == content_id
    ).first()

def create(db: Session, user_id, content_id, category: str) -> Interest:
    interest = Interest(
        user_id=user_id,
        content_id=content_id,
        category=category
    )
    db.add(interest)
    db.commit()
    db.refresh(interest)
    return interest

def update(db: Session, interest: Interest, **kwargs) -> Interest:
    for field, value in kwargs.items():
        if value is not None:
            setattr(interest, field, value)
    db.commit()
    db.refresh(interest)
    return interest