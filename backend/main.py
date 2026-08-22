from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from sqlalchemy.exc import SQLAlchemyError
from starlette.middleware.sessions import SessionMiddleware
from dotenv import load_dotenv
from database import ensure_required_columns, get_db
from routes.auth_routes import router as auth_router
from routes.content_routes import router as content_router
from routes.circle_routes import router as circle_router
from routes.matching_routes import router as matching_router
from email_utils import send_email
from routes.oauth_routes import router as oauth_router
from pydantic import BaseModel, EmailStr
from exceptions import (
    validation_exception_handler,
    sqlalchemy_exception_handler,
    generic_exception_handler,
    http_exception_handler
)
from sqlalchemy.orm import Session
from datetime import datetime, timezone, timedelta
import logging
import os
from auth import create_magic_link_auth_token
from models import AuthToken, AuthToken, User
import hashlib

load_dotenv()
ensure_required_columns()

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(name)s — %(message)s"
)

app = FastAPI(title="Mello API", version="1.0.0", redirect_slashes=False)
# Session middleware must come before CORS

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_exception_handler(RequestValidationError, validation_exception_handler)
app.add_exception_handler(SQLAlchemyError, sqlalchemy_exception_handler)
app.add_exception_handler(HTTPException, http_exception_handler)
app.add_exception_handler(Exception, generic_exception_handler)

app.include_router(auth_router)
app.include_router(oauth_router)
app.include_router(content_router)
app.include_router(circle_router)
app.include_router(matching_router)

@app.get("/")
def root():
    return {"status": "Mello API running", "version": "1.0.0"}

@app.get("/test-email")
async def test_email():
    await send_email(
        to_email="prishaagarwal3107@gmail.com",
        subject="SMTP Test",
        body="If you're reading this, SMTP is working!"
    )

    return {"message": "Email sent successfully"}

class MagicLinkRequest(BaseModel):
    email: EmailStr
    
@app.post("/auth/magic-link")
async def request_magic_link(
    request: MagicLinkRequest,
    db: Session = Depends(get_db)
):
    email = request.email

    user = db.query(User).filter(User.email == email).first()

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    raw_token = create_magic_link_auth_token(user, db)

    magic_link = (
        f"http://127.0.0.1:8000/auth/magic-link/verify"
        f"?token={raw_token}"
    )

    await send_email(
        to_email=email,
        subject="Your Mello Magic Login Link",
        body=f"""
Hello!

Click the link below to log in to Mello:

{magic_link}

This link will expire in 15 minutes.

If you didn't request this link, you can ignore this email.
"""
    )

    return {
        "message": "Magic link sent"
    }
@app.get("/auth/magic-link/verify")
async def verify_magic_link(
    token: str,
    db: Session = Depends(get_db)
):
    token_hash = hashlib.sha256(
        token.encode()
    ).hexdigest()

    auth_token = (
        db.query(AuthToken)
        .filter(
            AuthToken.token == token_hash,
            AuthToken.token_type == "magic_link"
        )
        .first()
    )

    if not auth_token:
        raise HTTPException(
            status_code=400,
            detail="Invalid magic link"
        )

    if auth_token.used_at is not None:
        raise HTTPException(
            status_code=400,
            detail="Magic link has already been used"
        )

    if auth_token.expires_at < datetime.utcnow():
        raise HTTPException(
            status_code=400,
            detail="Magic link has expired"
        )

    auth_token.used_at = datetime.utcnow()
    db.commit()

    access_token = create_access_token(
        {"sub": str(auth_token.user_id)}
    )

    return {
        "message": "Login successful",
        "access_token": access_token,
        "token_type": "bearer"
    }