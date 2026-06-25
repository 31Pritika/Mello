from pydantic import BaseModel, EmailStr, field_validator
from typing import Optional, List
from uuid import UUID
from datetime import datetime
import re

class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    confirm_password: str
    name: str
    city: Optional[str] = None
    state: Optional[str] = None
    country: Optional[str] = None

    @field_validator('password')
    @classmethod
    def password_strength(cls, v):
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters')
        if not re.search(r'[A-Z]', v):
            raise ValueError('Password must contain at least one uppercase letter')
        if not re.search(r'[0-9]', v):
            raise ValueError('Password must contain at least one number')
        return v

    @field_validator('confirm_password')
    @classmethod
    def passwords_match(cls, v, info):
        if 'password' in info.data and v != info.data['password']:
            raise ValueError('Passwords do not match')
        return v

    @field_validator('name')
    @classmethod
    def name_valid(cls, v):
        if len(v.strip()) < 2:
            raise ValueError('Name must be at least 2 characters')
        return v.strip()

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: str
    name: str
    email: str

class ContentSearchResult(BaseModel):
    external_id: str
    source: str
    title: str
    cover_image: Optional[str] = None
    creator: Optional[str] = None
    genres: List[str] = []
    release_year: Optional[int] = None
    category: str

class SaveInterestRequest(BaseModel):
    items: List[ContentSearchResult]
    city: Optional[str] = None
    state: Optional[str] = None
    country: Optional[str] = None

class CreatePostRequest(BaseModel):
    circle_id: str
    content: str
    post_type: str = "thought"

    @field_validator('content')
    @classmethod
    def content_not_empty(cls, v):
        if not v.strip():
            raise ValueError('Post cannot be empty')
        if len(v) > 2000:
            raise ValueError('Post cannot exceed 2000 characters')
        return v.strip()

class PostResponse(BaseModel):
    id: str
    circle_id: str
    user_id: str
    content: str
    post_type: str
    created_at: datetime
    user_name: str
    reaction_count: int = 0

class ReactionRequest(BaseModel):
    post_id: str
    reaction_type: str

    @field_validator('reaction_type')
    @classmethod
    def valid_reaction(cls, v):
        if v not in ['resonate', 'love', 'intrigued']:
            raise ValueError('Invalid reaction type')
        return v

class UpdateProfileRequest(BaseModel):
    name: Optional[str] = None
    bio: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    country: Optional[str] = None