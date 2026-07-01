from sqlalchemy.orm import Session
from models import User
from auth import hash_password
from datetime import datetime

def get_by_id(db: Session, user_id) -> User:
    return db.query(User).filter(User.id == user_id).first()

def get_by_email(db: Session, email: str) -> User:
    return db.query(User).filter(User.email == email).first()

def get_by_city(db: Session, city: str, exclude_id=None):
    q = db.query(User).filter(
        User.city == city,
        User.is_active == True
    )
    if exclude_id:
        q = q.filter(User.id != exclude_id)
    return q.all()

def create(db: Session, email: str, password: str, name: str, city=None, state=None, country=None) -> User:
    user = User(
        email=email,
        hashed_password=hash_password(password),
        name=name,
        city=city,
        state=state,
        country=country
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

def update_location(db: Session, user: User, city: str, state: str, country: str) -> User:
    user.city = city
    user.state = state
    user.country = country
    db.commit()
    db.refresh(user)
    return user

def update_last_seen(db: Session, user: User):
    user.last_seen_at = datetime.utcnow()
    db.commit()

def update_profile(db: Session, user: User, **kwargs) -> User:
    for field, value in kwargs.items():
        if value is not None:
            setattr(user, field, value)
    db.commit()
    db.refresh(user)
    return user