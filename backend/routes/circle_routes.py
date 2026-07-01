from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import User, Circle
from auth import get_current_user
from schemas import (
    CreatePostRequest, ReactionRequest,
    PostOut, CircleOut, ReactionResponse,
    MessageResponse, RenameRequest
)
from repositories import circle_repo
from typing import List

router = APIRouter(prefix="/circles", tags=["circles"])

@router.get("/mine", response_model=List[CircleOut])
def get_my_circles(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    memberships = circle_repo.get_user_circles(db, current_user.id)
    return [
        CircleOut(
            id=str(m.circle.id),
            category=m.circle.category,
            city=m.circle.city,
            name=m.circle.name,
            member_count=circle_repo.get_member_count(db, m.circle.id),
            member_names=[n[0] for n in circle_repo.get_member_names(db, m.circle.id)],
            joined_at=m.joined_at
        )
        for m in memberships
    ]

@router.get("/{circle_id}/posts", response_model=List[PostOut])
def get_posts(
    circle_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if not circle_repo.get_member(db, circle_id, current_user.id):
        raise HTTPException(status_code=403, detail="Not a member of this circle")
    posts = circle_repo.get_posts(db, circle_id)
    return [PostOut.from_orm(p) for p in posts]

@router.post("/posts", response_model=PostOut)
def create_post(
    req: CreatePostRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if not circle_repo.get_member(db, req.circle_id, current_user.id):
        raise HTTPException(status_code=403, detail="Not a member of this circle")
    post = circle_repo.create_post(
        db, req.circle_id, current_user.id,
        req.content, req.post_type
    )
    post.user = current_user
    post.reactions = []
    return PostOut.from_orm(post)

@router.post("/posts/react", response_model=ReactionResponse)
def react_to_post(
    req: ReactionRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    existing = circle_repo.get_reaction(db, req.post_id, current_user.id)
    if existing:
        if existing.reaction_type == req.reaction_type:
            circle_repo.remove_reaction(db, existing)
            return ReactionResponse(action="removed")
        circle_repo.update_reaction(db, existing, req.reaction_type)
        return ReactionResponse(action="updated")
    circle_repo.add_reaction(db, req.post_id, current_user.id, req.reaction_type)
    return ReactionResponse(action="added")

@router.put("/{circle_id}/rename", response_model=MessageResponse)
def rename_circle(
    circle_id: str,
    body: RenameRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    circle = db.query(Circle).filter(Circle.id == circle_id).first()
    if not circle:
        raise HTTPException(status_code=404, detail="Circle not found")
    circle_repo.rename(db, circle, body.name)
    return MessageResponse(message="Renamed")