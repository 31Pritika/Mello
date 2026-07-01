from sqlalchemy.orm import Session
from models import Match

def get_existing(db: Session, user_1_id, user_2_id, category: str) -> Match:
    return db.query(Match).filter(
        Match.user_1_id == user_1_id,
        Match.user_2_id == user_2_id,
        Match.category == category
    ).first()

def upsert(db: Session, user_1_id, user_2_id, category: str, score: int, common_content: list):
    existing = get_existing(db, user_1_id, user_2_id, category)
    if existing:
        existing.score = score
        existing.common_content = common_content
        db.commit()
        return existing
    match = Match(
        user_1_id=user_1_id,
        user_2_id=user_2_id,
        category=category,
        score=score,
        common_content=common_content
    )
    db.add(match)
    db.commit()
    return match

def get_user_matches(db: Session, user_id, category: str = None):
    q = db.query(Match).filter(Match.user_1_id == user_id)
    if category:
        q = q.filter(Match.category == category)
    return q.order_by(Match.score.desc()).all()