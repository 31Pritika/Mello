from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from models import User, Interest, Circle, CircleMember, Match
from auth import get_current_user

router = APIRouter(prefix="/match", tags=["matching"])


@router.post("/run")
def run_matching(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        if not current_user.city:
            return {"matched": False, "reason": "no city set"}

        my_interests = db.query(Interest).filter(
            Interest.user_id == current_user.id
        ).all()

        if not my_interests:
            return {"matched": False, "reason": "no interests"}

        city_users = db.query(User).filter(
            User.city == current_user.city,
            User.id != current_user.id,
            User.is_active == True
        ).all()

        categories = ["movies", "shows", "music", "books"]
        results = {}

        print("MATCH START")
        print("USER:", current_user.id, current_user.city)
        print("CITY USERS:", len(city_users))
        print("INTERESTS:", len(my_interests))

        for category in categories:

            my_items = {
                i.content_id for i in my_interests if i.category == category
            }

            if not my_items:
                continue

            matches = []

            for u in city_users:

                their_items = {
                    i.content_id for i in db.query(Interest).filter(
                        Interest.user_id == u.id,
                        Interest.category == category
                    ).all()
                }

                overlap = my_items & their_items
                score = len(overlap)

                if score >= 1:
                    matches.append((u.id, score, overlap))

                    existing = db.query(Match).filter(
                        Match.user_1_id == current_user.id,
                        Match.user_2_id == u.id,
                        Match.category == category
                    ).first()

                    if existing:
                        existing.score = score
                        existing.common_content = ",".join(map(str, overlap))
                    else:
                        db.add(Match(
                            user_1_id=current_user.id,
                            user_2_id=u.id,
                            category=category,
                            score=score,
                            common_content=",".join(map(str, overlap))
                        ))

            if not matches:
                continue

            circle = db.query(Circle).filter(
                Circle.category == category,
                Circle.city == current_user.city,
                Circle.is_active == True
            ).first()

            if not circle:
                circle = Circle(
                    category=category,
                    city=current_user.city,
                    state=current_user.state,
                    country=current_user.country,
                )
                db.add(circle)
                db.commit()
                db.refresh(circle)

            current_count = db.query(CircleMember).filter(
                CircleMember.circle_id == circle.id
            ).count()

            if current_count >= circle.max_members:
                continue

            if not db.query(CircleMember).filter_by(
                circle_id=circle.id,
                user_id=current_user.id
            ).first():
                db.add(CircleMember(
                    circle_id=circle.id,
                    user_id=current_user.id
                ))

            for user_id, score, common in matches:
                count = db.query(CircleMember).filter(
                    CircleMember.circle_id == circle.id
                ).count()

                if count >= circle.max_members:
                    break

                if not db.query(CircleMember).filter_by(
                    circle_id=circle.id,
                    user_id=user_id
                ).first():
                    db.add(CircleMember(
                        circle_id=circle.id,
                        user_id=user_id
                    ))

            db.commit()

            results[category] = {
                "circle_id": str(circle.id),
                "matches": len(matches)
            }

        print("MATCH END")

        return {"matched": True, "circles": results}

    except Exception as e:
        print("MATCH ERROR:", str(e))
        raise