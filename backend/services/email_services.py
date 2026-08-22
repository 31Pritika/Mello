import os
import secrets
from datetime import datetime, timedelta
from email.message import EmailMessage

import aiosmtplib
from dotenv import load_dotenv
from models import AuthToken
from sqlalchemy.orm import Session

load_dotenv()

FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")

SMTP_HOST = os.getenv("SMTP_HOST")
SMTP_PORT = int(os.getenv("SMTP_PORT", 587))
SMTP_USERNAME = os.getenv("SMTP_USERNAME")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD")
SMTP_FROM = os.getenv("SMTP_FROM")

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


async def send_magic_link(email: str, token: str, name: str):
    link = f"{FRONTEND_URL}/auth/verify?token={token}&type=magic_link"

    message = EmailMessage()

    message["From"] = SMTP_FROM
    message["To"] = email
    message["Subject"] = "Your Mello login link"

    message.set_content(
        f"""
Hi {name},

Click the link below to sign in to Mello:

{link}

This link expires in 30 minutes and can only be used once.

If you didn't request this, you can safely ignore this email.
"""
    )

    message.add_alternative(
        f"""
        <div style="font-family: 'Georgia', serif; max-width: 480px; margin: 0 auto; background: #0A0706; color: #EFECE6; padding: 40px; border-radius: 8px;">
            <h1 style="font-size: 2rem; color: #EFECE6; margin-bottom: 4px;">mello</h1>

            <p style="color: #7D746D; font-size: 0.8rem; letter-spacing: 0.2em; text-transform: uppercase; margin-bottom: 32px;">
                Taste Collective
            </p>

            <p style="color: #EFECE6; margin-bottom: 8px;">
                Hi {name},
            </p>

            <p style="color: #B8B0A8; line-height: 1.7; margin-bottom: 32px;">
                Click the button below to sign in to Mello.
                This link expires in 30 minutes and can only be used once.
            </p>

            <a href="{link}"
               style="display: inline-block; background: #C4547A; color: #0A0706; padding: 14px 32px; border-radius: 4px; text-decoration: none; font-weight: 600; letter-spacing: 0.05em;">
                Enter Mello →
            </a>

            <p style="color: #5A5450; font-size: 0.8rem; margin-top: 32px; line-height: 1.6;">
                If you didn't request this, you can safely ignore this email.<br/>
                Or copy this link: {link}
            </p>
        </div>
        """,
        subtype="html"
    )

    await aiosmtplib.send(
        message,
        hostname=SMTP_HOST,
        port=SMTP_PORT,
        username=SMTP_USERNAME,
        password=SMTP_PASSWORD,
        start_tls=True,
    )

    
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