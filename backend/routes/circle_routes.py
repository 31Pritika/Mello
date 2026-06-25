from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import User, Circle, CircleMember, Post, Reaction, Interest, ContentCache
from auth import get_current_user
from schemas import CreatePostRequest, ReactionRequest
from datetime import datetime

router = APIRouter(prefix="/circles", tags=["circles"])

@router.get("/mine")
def get_my_circles(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    memberships = db.query(CircleMember).filter(
        CircleMember.user_id == current_user.id
    ).all()

    result = []
    for m in memberships:
        circle = m.circle
        member_count = db.query(CircleMember).filter(
            CircleMember.circle_id == circle.id
        ).count()

        member_names = db.query(User.name).join(
            CircleMember, CircleMember.user_id == User.id
        ).filter(CircleMember.circle_id == circle.id).limit(6).all()

        result.append({
            "id": str(circle.id),
            "category": circle.category,
            "city": circle.city,
            "name": circle.name,
            "member_count": member_count,
            "member_names": [n[0] for n in member_names],
            "joined_at": m.joined_at,
        })
    return result

@router.get("/{circle_id}/posts")
def get_posts(
    circle_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    member = db.query(CircleMember).filter(
        CircleMember.circle_id == circle_id,
        CircleMember.user_id == current_user.id
    ).first()
    if not member:
        raise HTTPException(status_code=403, detail="Not a member of this circle")

    posts = db.query(Post).filter(
        Post.circle_id == circle_id,
        Post.is_deleted == False
    ).order_by(Post.created_at.desc()).limit(30).all()

    return [
        {
            "id": str(p.id),
            "content": p.content,
            "post_type": p.post_type,
            "created_at": p.created_at,
            "user_id": str(p.user_id),
            "user_name": p.user.name if p.user else "Unknown",
            "reaction_count": len(p.reactions),
            "reactions": [{"type": r.reaction_type, "user": r.user.name} for r in p.reactions]
        }
        for p in posts
    ]

@router.post("/posts")
def create_post(
    req: CreatePostRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    member = db.query(CircleMember).filter(
        CircleMember.circle_id == req.circle_id,
        CircleMember.user_id == current_user.id
    ).first()
    if not member:
        raise HTTPException(status_code=403, detail="Not a member of this circle")

    post = Post(
        circle_id=req.circle_id,
        user_id=current_user.id,
        content=req.content,
        post_type=req.post_type
    )
    db.add(post)
    db.commit()
    db.refresh(post)

    return {
        "id": str(post.id),
        "content": post.content,
        "post_type": post.post_type,
        "created_at": post.created_at,
        "user_id": str(post.user_id),
        "user_name": current_user.name,
        "reaction_count": 0,
        "reactions": []
    }

@router.post("/posts/react")
def react_to_post(
    req: ReactionRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    existing = db.query(Reaction).filter(
        Reaction.post_id == req.post_id,
        Reaction.user_id == current_user.id
    ).first()

    if existing:
        if existing.reaction_type == req.reaction_type:
            db.delete(existing)
            db.commit()
            return {"action": "removed"}
        else:
            existing.reaction_type = req.reaction_type
            db.commit()
            return {"action": "updated"}

    reaction = Reaction(
        post_id=req.post_id,
        user_id=current_user.id,
        reaction_type=req.reaction_type
    )
    db.add(reaction)
    db.commit()
    return {"action": "added"}

@router.put("/{circle_id}/rename")
def rename_circle(
    circle_id: str,
    body: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    circle = db.query(Circle).filter(Circle.id == circle_id).first()
    if not circle:
        raise HTTPException(status_code=404, detail="Circle not found")
    circle.name = body.get("name", circle.name)
    circle.updated_at = datetime.utcnow()
    db.commit()
    return {"message": "Renamed"}