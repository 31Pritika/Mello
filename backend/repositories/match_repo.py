from sqlalchemy.orm import Session
from models import Match
from .base import BaseRepository
from typing import Optional, List

class MatchRepository(BaseRepository[Match]):
    def __init__(self, db: Session):
        super().__init__(Match, db)

    def upsert(self, user_1_id, user_2_id, category: str,
               score: int, common_content: list) -> Match:
        existing = self.db.query(Match).filter(
            Match.user_1_id == user_1_id,
            Match.user_2_id == user_2_id,
            Match.category == category
        ).first()
        if existing:
            existing.score = score
            existing.common_content = common_content
            self.db.commit()
            return existing
        return self.create(
            user_1_id=user_1_id,
            user_2_id=user_2_id,
            category=category,
            score=score,
            common_content=common_content
        )

    def bulk_upsert(self, current_user_id, matches: list, category: str) -> None:
        # matches = list of (user_id, score, common_content)
        # Fetch all existing matches for this user+category in one query
        match_ids = [m[0] for m in matches]
        existing = {
            m.user_2_id: m for m in self.db.query(Match).filter(
                Match.user_1_id == current_user_id,
                Match.user_2_id.in_(match_ids),
                Match.category == category
            ).all()
        }

        new_matches = []
        for user_id, score, common in matches:
            if user_id in existing:
                existing[user_id].score = score
                existing[user_id].common_content = common
            else:
                new_matches.append(Match(
                    user_1_id=current_user_id,
                    user_2_id=user_id,
                    category=category,
                    score=score,
                    common_content=common
                ))

        if new_matches:
            self.db.bulk_save_objects(new_matches)
        self.db.commit()

    def get_user_matches(self, user_id, category: str = None) -> List[Match]:
        q = self.db.query(Match).filter(Match.user_1_id == user_id)
        if category:
            q = q.filter(Match.category == category)
        return q.order_by(Match.score.desc()).all()