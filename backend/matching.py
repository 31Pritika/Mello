from sqlalchemy.orm import Session
from models import Profile, Interest, Circle, CircleMember

def run_matching(db: Session, user_id: str):
    profile = db.query(Profile).filter(Profile.id == user_id).first()
    if not profile or not profile.city:
        return {"matched": False, "reason": "no profile or city"}

    my_interests = db.query(Interest).filter(Interest.user_id == user_id).all()
    if not my_interests:
        return {"matched": False, "reason": "no interests"}

    city_users = db.query(Profile).filter(
        Profile.city == profile.city,
        Profile.id != user_id
    ).all()

    categories = ["movies", "shows", "music", "books"]
    results = {}

    for category in categories:
        my_items = {i.item_id for i in my_interests if i.category == category}
        if not my_items:
            continue

        matches = []
        for u in city_users:
            their_items = {
                i.item_id for i in db.query(Interest).filter(
                    Interest.user_id == u.id,
                    Interest.category == category
                ).all()
            }
            if len(my_items & their_items) >= 2:
                matches.append(u.id)

        if not matches:
            continue

        circle = db.query(Circle).filter(
            Circle.category == category,
            Circle.city == profile.city
        ).first()

        if not circle:
            circle = Circle(category=category, city=profile.city)
            db.add(circle)
            db.commit()
            db.refresh(circle)

        for uid in [user_id] + [str(m) for m in matches]:
            exists = db.query(CircleMember).filter_by(
                circle_id=circle.id,
                user_id=uid
            ).first()
            if not exists:
                db.add(CircleMember(circle_id=circle.id, user_id=uid))

        db.commit()
        results[category] = {
            "circle_id": str(circle.id),
            "matched_with": [str(m) for m in matches]
        }

    return {"matched": True, "circles": results}