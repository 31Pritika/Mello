from sqlalchemy.orm import Session
from sqlalchemy import func
from models import User, Interest, CircleMember
from auth import hash_password
from datetime import datetime
from .base import BaseRepository
from typing import Optional, List

class UserRepository(BaseRepository[User]):
    def __init__(self, db: Session):
        super().__init__(User, db)

    def get_by_email(self, email: str) -> Optional[User]:
        return self.db.query(User).filter(User.email == email).first()

    def get_by_city(self, city: str, exclude_id=None) -> List[User]:
        # Single query — gets all active users in city with their interests
        # preloaded to avoid N+1 in matching
        from sqlalchemy.orm import joinedload
        q = self.db.query(User).options(
            joinedload(User.interests)
        ).filter(
            func.lower(User.city) == func.lower(city),
            User.is_active == True
        )
        if exclude_id:
            q = q.filter(User.id != exclude_id)
        return q.all()

    def create_user(self, email: str, password: str, name: str,
                    city=None, state=None, country=None) -> User:
        return self.create(
            email=email,
            hashed_password=hash_password(password),
            name=name,
            city=city.strip().lower() if city else None,
            state=state,
            country=country,
        )

    def update_location(self, user: User, city: str, state: str, country: str) -> User:
        return self.update(
            user,
            city=city.strip().lower() if city else None,
            state=state,
            country=country
        )

    def update_last_seen(self, user: User) -> None:
        user.last_seen_at = datetime.utcnow()
        self.db.commit()