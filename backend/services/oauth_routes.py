from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session
from database import get_db
from models import User, OAuthAccount, AuthToken
from auth import create_access_token, get_current_user, hash_password
from schemas import TokenResponse, MessageResponse
from repositories import UserRepository
from services.google_oauth import oauth
from services.email_services import generate_token, verify_token, send_magic_link, send_password_reset
from exceptions import NotFoundError, BadRequestError
from pydantic import BaseModel, EmailStr
import os
import secrets

router = APIRouter(prefix="/auth", tags=["oauth"])

FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")

# ─── Google OAuth ─────────────────────────────────────────────────────────────

@router.get("/google")
async def google_login(request: Request):
    redirect_uri = os.getenv("GOOGLE_REDIRECT_URI")
    return await oauth.google.authorize_redirect(request, redirect_uri)

@router.get("/google/callback")
async def google_callback(request: Request, db: Session = Depends(get_db)):
    try:
        token = await oauth.google.authorize_access_token(request)
    except Exception:
        raise BadRequestError("Google authentication failed")

    user_info = token.get("userinfo")
    if not user_info:
        raise BadRequestError("Could not retrieve user info from Google")

    google_id = user_info["sub"]
    email = user_info["email"]
    name = user_info.get("name", email.split("@")[0])

    # Check if OAuth account already exists
    oauth_account = db.query(OAuthAccount).filter(
        OAuthAccount.provider == "google",
        OAuthAccount.provider_user_id == google_id
    ).first()

    if oauth_account:
        user = oauth_account.user
    else:
        # Check if user exists with this email
        user_repo = UserRepository(db)
        user = user_repo.get_by_email(email)

        if not user:
            # Create new user — no password since they're using Google
            user = User(
                email=email,
                name=name,
                hashed_password=hash_password(secrets.token_urlsafe(32)),
                is_verified=True,
            )
            db.add(user)
            db.commit()
            db.refresh(user)

        # Link OAuth account
        db.add(OAuthAccount(
            user_id=user.id,
            provider="google",
            provider_user_id=google_id,
            email=email,
            access_token=token.get("access_token")
        ))
        db.commit()

    jwt_token = create_access_token({"sub": str(user.id)})

    # Redirect to frontend with token in URL — frontend stores it
    is_new = oauth_account is None
    return RedirectResponse(
        url=f"{FRONTEND_URL}/auth/callback?token={jwt_token}&user_id={user.id}&name={user.name}&email={user.email}&new={is_new}"
    )

# ─── Magic Link ───────────────────────────────────────────────────────────────

class MagicLinkRequest(BaseModel):
    email: EmailStr

@router.post("/magic-link")
def request_magic_link(req: MagicLinkRequest, db: Session = Depends(get_db)):
    user_repo = UserRepository(db)
    user = user_repo.get_by_email(req.email)

    if not user:
        # Don't reveal whether email exists — just say "if account exists, link sent"
        return MessageResponse(message="If an account exists with this email, a login link has been sent.")

    token = generate_token(db, user.id, "magic_link", expires_in_minutes=30)
    send_magic_link(user.email, token, user.name)
    return MessageResponse(message="If an account exists with this email, a login link has been sent.")

class VerifyTokenRequest(BaseModel):
    token: str
    token_type: str

@router.post("/verify-token", response_model=TokenResponse)
def verify_magic_link(req: VerifyTokenRequest, db: Session = Depends(get_db)):
    record = verify_token(db, req.token, req.token_type)
    if not record:
        raise BadRequestError("This link is invalid or has expired. Please request a new one.")

    user = db.query(User).filter(User.id == record.user_id).first()
    if not user:
        raise NotFoundError("User not found")

    jwt_token = create_access_token({"sub": str(user.id)})
    return TokenResponse(
        access_token=jwt_token,
        user_id=str(user.id),
        name=user.name,
        email=user.email
    )

# ─── Forgot Password ──────────────────────────────────────────────────────────

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

@router.post("/forgot-password")
def forgot_password(req: ForgotPasswordRequest, db: Session = Depends(get_db)):
    user = UserRepository(db).get_by_email(req.email)
    if user:
        token = generate_token(db, user.id, "password_reset", expires_in_minutes=30)
        send_password_reset(user.email, token, user.name)
    return MessageResponse(message="If an account exists with this email, a reset link has been sent.")

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str
    confirm_password: str

    @classmethod
    def validate_passwords(cls, v, info):
        if 'new_password' in info.data and v != info.data['new_password']:
            raise ValueError('Passwords do not match')
        return v

@router.post("/reset-password")
def reset_password(req: ResetPasswordRequest, db: Session = Depends(get_db)):
    if req.new_password != req.confirm_password:
        raise BadRequestError("Passwords do not match")
    if len(req.new_password) < 8:
        raise BadRequestError("Password must be at least 8 characters")

    record = verify_token(db, req.token, "password_reset")
    if not record:
        raise BadRequestError("This link is invalid or has expired. Please request a new one.")

    user = db.query(User).filter(User.id == record.user_id).first()
    if not user:
        raise NotFoundError("User not found")

    from auth import hash_password
    user.hashed_password = hash_password(req.new_password)
    db.commit()
    return MessageResponse(message="Password reset successfully. You can now log in.")