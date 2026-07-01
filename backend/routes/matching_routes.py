from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from models import User
from auth import get_current_user
from schemas import MatchResponse
from repositories import user_repo, interest_repo, circle_repo, match_repo

router = APIRouter(prefix="/match", tags=["matching"])

@router.post("/run", response_model=MatchResponse)
def run_matching(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if not current_user.city:
        return MatchResponse(matched=False, reason="no city set")

    my_interests = interest_repo.get_by_user(db, current_user.id)
    if not my_interests:
        return MatchResponse(matched=False, reason="no interests")

    city_users = user_repo.get_by_city(db, current_user.city, exclude_id=current_user.id)
    categories = ["movies", "shows", "music", "books"]
    results = {}

    for category in categories:
        my_items = interest_repo.get_content_ids_by_user_category(db, current_user.id, category)
        if not my_items:
            continue

        matches = []
        for u in city_users:
            their_items = interest_repo.get_content_ids_by_user_category(db, u.id, category)
            overlap = my_items & their_items
            score = len(overlap)
            if score >= 1:
                matches.append((u.id, score, [str(c) for c in overlap]))
                match_repo.upsert(
                    db, current_user.id, u.id,
                    category, score, [str(c) for c in overlap]
                )

        if not matches:
            continue

        circle = circle_repo.get_by_category_city(db, category, current_user.city)
        if not circle:
            circle = circle_repo.create(
                db, category, current_user.city,
                current_user.state, current_user.country
            )

        if circle_repo.get_member_count(db, circle.id) >= circle.max_members:
            continue

        circle_repo.add_member(db, circle.id, current_user.id)
        for user_id, score, common in matches:
            if circle_repo.get_member_count(db, circle.id) >= circle.max_members:
                break
            circle_repo.add_member(db, circle.id, user_id)

        results[category] = {"circle_id": str(circle.id), "matches": len(matches)}

    return MatchResponse(matched=True, circles=results)