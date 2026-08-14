import resend
import os
from datetime import datetime, timedelta
import secrets
from models import AuthToken
from sqlalchemy.orm import Session

resend.api_key = os.getenv("RESEND_API_KEY")
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")
FROM_EMAIL = os.getenv("RESEND_FROM_EMAIL")

def generate_token(db: Session, user_id, token_type: str, expires_in_minutes: int = 30) -> str:
    token = secrets.token_urlsafe(32)
    expires_at = datetime.utcnow() + timedelta(minutes=expires_in_minutes)
    db.add(AuthToken(
        user_id=user_id,
        token=token,
        token_type=token_type,
        expires_at=expires_at
    ))
    db.commit()
    return token

def verify_token(db: Session, token: str, token_type: str) -> AuthToken | None:
    record = db.query(AuthToken).filter(
        AuthToken.token == token,
        AuthToken.token_type == token_type,
        AuthToken.used_at == None,
        AuthToken.expires_at > datetime.utcnow()
    ).first()
    if record:
        record.used_at = datetime.utcnow()
        db.commit()
    return record

def send_magic_link(email: str, token: str, name: str):
    link = f"{FRONTEND_URL}/auth/verify?token={token}&type=magic_link"
    resend.Emails.send({
        "from": FROM_EMAIL,
        "to": email,
        "subject": "Your Mello login link",
        "html": f"""
        <div style="font-family: 'Georgia', serif; max-width: 480px; margin: 0 auto; background: #0A0706; color: #EFECE6; padding: 40px; border-radius: 8px;">
            <h1 style="font-size: 2rem; color: #EFECE6; margin-bottom: 4px;">mello</h1>
            <p style="color: #7D746D; font-size: 0.8rem; letter-spacing: 0.2em; text-transform: uppercase; margin-bottom: 32px;">Taste Collective</p>
            <p style="color: #EFECE6; margin-bottom: 8px;">Hi {name},</p>
            <p style="color: #B8B0A8; line-height: 1.7; margin-bottom: 32px;">
                Click the button below to sign in to Mello. This link expires in 30 minutes and can only be used once.
            </p>
            <a href="{link}" style="display: inline-block; background: #C4547A; color: #0A0706; padding: 14px 32px; border-radius: 4px; text-decoration: none; font-weight: 600; letter-spacing: 0.05em;">
                Enter Mello →
            </a>
            <p style="color: #5A5450; font-size: 0.8rem; margin-top: 32px; line-height: 1.6;">
                If you didn't request this, you can safely ignore this email.<br/>
                Or copy this link: {link}
            </p>
        </div>
        """
    })

def send_password_reset(email: str, token: str, name: str):
    link = f"{FRONTEND_URL}/auth/reset-password?token={token}"
    resend.Emails.send({
        "from": FROM_EMAIL,
        "to": email,
        "subject": "Reset your Mello password",
        "html": f"""
        <div style="font-family: 'Georgia', serif; max-width: 480px; margin: 0 auto; background: #0A0706; color: #EFECE6; padding: 40px; border-radius: 8px;">
            <h1 style="font-size: 2rem; color: #EFECE6; margin-bottom: 4px;">mello</h1>
            <p style="color: #7D746D; font-size: 0.8rem; letter-spacing: 0.2em; text-transform: uppercase; margin-bottom: 32px;">Taste Collective</p>
            <p style="color: #EFECE6; margin-bottom: 8px;">Hi {name},</p>
            <p style="color: #B8B0A8; line-height: 1.7; margin-bottom: 32px;">
                We received a request to reset your Mello password. Click below to choose a new one. This link expires in 30 minutes.
            </p>
            <a href="{link}" style="display: inline-block; background: #C4547A; color: #0A0706; padding: 14px 32px; border-radius: 4px; text-decoration: none; font-weight: 600; letter-spacing: 0.05em;">
                Reset Password →
            </a>
            <p style="color: #5A5450; font-size: 0.8rem; margin-top: 32px; line-height: 1.6;">
                If you didn't request this, ignore this email — your password won't change.<br/>
                Or copy this link: {link}
            </p>
        </div>
        """
    })