from datetime import datetime, timedelta #timedelta adds the time duration
from jose import JWTError, jwt #used for jwt tokens
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer #extracts jwt token from the request header
from sqlalchemy.orm import Session 
from database import get_db #my own file
from models import User, AuthToken # sqlalchemy model for user
import os
import hashlib
import secrets


SECRET_KEY = os.getenv("SECRET_KEY", "mello-secret-key-change-in-production") #searches for secret key or uses the default one if not found, should be changed in production
ALGORITHM = "HS256" #hashing system for jwt (hmac + sha256)
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7  # 7 days

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto") # uses bcrypt for hashing passwords, deprecated auto means it will automatically handle deprecated algorithms
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login") #the user gets tokens at that point, looks for bearer token in the request header and extracts it, if not found it will return 401 error

def hash_password(password: str) -> str:
    return pwd_context.hash(password) #stores the hashed password in the database, not the plain text one

def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed) 

def create_access_token(data: dict) -> str:
    to_encode = data.copy() #copies the data
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES) 
    to_encode.update({"exp": expire}) 
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    user = db.query(User).filter(User.id == user_id).first()
    if user is None or not user.is_active:
        raise credentials_exception
    return user