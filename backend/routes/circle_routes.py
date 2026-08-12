from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import User, Circle
from auth import get_current_user
from schemas import CreatePostRequest, ReactionRequest, PostOut, CircleOut, ReactionResponse, MessageResponse, RenameRequest
from repositories import CircleRepository
from exceptions import ForbiddenError, NotFoundError
from typing import List

router = APIRouter(prefix="/circles", tags=["circles"])

@router.get("/mine", response_model=List[CircleOut])
def get_my_circles(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    repo = CircleRepository(db)
    # Single method call — all enrichment done in one place with minimal queries
    enriched = repo.get_user_circles_enriched(current_user.id)
    return [CircleOut(**c) for c in enriched]

@router.get("/{circle_id}/posts", response_model=List[PostOut])
def get_posts(circle_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    repo = CircleRepository(db)
    if not repo.get_member(circle_id, current_user.id):
        raise ForbiddenError("Not a member of this circle")
    posts = repo.get_posts_with_reactions(circle_id)
    return [PostOut.from_orm(p) for p in posts]

@router.post("/posts", response_model=PostOut)
def create_post(req: CreatePostRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    repo = CircleRepository(db)
    if not repo.get_member(req.circle_id, current_user.id):
        raise ForbiddenError("Not a member of this circle")
    post = repo.create_post(req.circle_id, current_user.id, req.content, req.post_type)
    post.user = current_user
    post.reactions = []
    return PostOut.from_orm(post)

@router.post("/posts/react", response_model=ReactionResponse)
def react_to_post(req: ReactionRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    action = CircleRepository(db).upsert_reaction(req.post_id, current_user.id, req.reaction_type)
    return ReactionResponse(action=action)

@router.put("/{circle_id}/rename", response_model=MessageResponse)
def rename_circle(circle_id: str, body: RenameRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    repo = CircleRepository(db)
    circle = repo.get_by_id(circle_id)
    if not circle:
        raise NotFoundError("Circle not found")
    repo.rename(circle, body.name)
    return MessageResponse(message="Renamed")