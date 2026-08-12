from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import User
from auth import verify_password, create_access_token, get_current_user
from schemas import RegisterRequest, LoginRequest, TokenResponse, UpdateProfileRequest, UserOut, MessageResponse
from repositories import UserRepository
from exceptions import ConflictError, UnauthorizedError

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/register", response_model=TokenResponse)
def register(req: RegisterRequest, db: Session = Depends(get_db)):
    repo = UserRepository(db)
    if repo.get_by_email(req.email):
        raise ConflictError("Email already registered")
    user = repo.create_user(req.email, req.password, req.name, req.city, req.state, req.country)
    token = create_access_token({"sub": str(user.id)})
    return TokenResponse(access_token=token, user_id=str(user.id), name=user.name, email=user.email)

@router.post("/login", response_model=TokenResponse)
def login(req: LoginRequest, db: Session = Depends(get_db)):
    repo = UserRepository(db)
    user = repo.get_by_email(req.email)
    if not user or not verify_password(req.password, user.hashed_password):
        raise UnauthorizedError("Invalid email or password")
    repo.update_last_seen(user)
    token = create_access_token({"sub": str(user.id)})
    return TokenResponse(access_token=token, user_id=str(user.id), name=user.name, email=user.email)

@router.get("/me", response_model=UserOut)
def get_me(current_user: User = Depends(get_current_user)):
    return UserOut.from_orm(current_user)

@router.put("/me", response_model=MessageResponse)
def update_profile(req: UpdateProfileRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    UserRepository(db).update(current_user, **req.dict(exclude_none=True))
    return MessageResponse(message="Profile updated")