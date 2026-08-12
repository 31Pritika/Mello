from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from models import User
from auth import get_current_user
from schemas import MatchResponse
from repositories import UserRepository, InterestRepository, CircleRepository, MatchRepository

router = APIRouter(prefix="/match", tags=["matching"])

@router.post("/run", response_model=MatchResponse)
def run_matching(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    user_repo = UserRepository(db)
    interest_repo = InterestRepository(db)
    circle_repo = CircleRepository(db)
    match_repo = MatchRepository(db)

    if not current_user.city:
        return MatchResponse(matched=False, reason="no city set")

    # Single query — fetches all city users with interests preloaded
    city_users = user_repo.get_by_city(current_user.city, exclude_id=current_user.id)
    if not city_users:
        return MatchResponse(matched=False, reason="no other users in your city yet")

    # Single query — fetches current user's all interests
    my_interests = interest_repo.get_by_user(current_user.id)
    if not my_interests:
        return MatchResponse(matched=False, reason="no interests")

    # Group current user's interests by category
    my_items_by_cat = {}
    for i in my_interests:
        my_items_by_cat.setdefault(i.category, set()).add(i.content_id)

    categories = ["movies", "shows", "music", "books"]
    results = {}

    for category in categories:
        my_items = my_items_by_cat.get(category, set())
        if not my_items:
            continue

        # city_users already have interests preloaded — no extra queries needed
        matches = []
        for u in city_users:
            their_items = {i.content_id for i in u.interests if i.category == category}
            overlap = my_items & their_items
            score = len(overlap)
            if score >= 1:
                matches.append((u.id, score, [str(c) for c in overlap]))

        if not matches:
            continue

        # Bulk upsert all matches in one DB round trip
        match_repo.bulk_upsert(current_user.id, matches, category)

        # Find or create circle
        circle = circle_repo.get_by_category_city(category, current_user.city)
        if not circle:
            circle = circle_repo.create(
                category=category,
                city=current_user.city,
                state=current_user.state,
                country=current_user.country
            )

        if circle_repo.get_member_count(circle.id) >= circle.max_members:
            continue

        # Bulk add all members in one DB round trip
        all_user_ids = [current_user.id] + [m[0] for m in matches]
        circle_repo.bulk_add_members(circle.id, all_user_ids, circle.max_members)

        results[category] = {"circle_id": str(circle.id), "matches": len(matches)}

    return MatchResponse(matched=True, circles=results)