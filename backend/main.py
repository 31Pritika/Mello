from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from fastapi import HTTPException
from sqlalchemy.exc import SQLAlchemyError
from starlette.middleware.sessions import SessionMiddleware
from dotenv import load_dotenv
from database import ensure_required_columns
from routes.auth_routes import router as auth_router
from routes.content_routes import router as content_router
from routes.circle_routes import router as circle_router
from routes.matching_routes import router as matching_router
from email_utils import send_email
from routes.oauth_routes import router as oauth_router
from exceptions import (
    validation_exception_handler,
    sqlalchemy_exception_handler,
    generic_exception_handler,
    http_exception_handler
)
import logging
import os

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