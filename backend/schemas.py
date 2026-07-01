from pydantic import BaseModel, EmailStr, field_validator
from typing import Optional, List
from datetime import datetime
import re

# ─── Request schemas ──────────────────────────────────────────────────────────

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

class UpdateProfileRequest(BaseModel):
    name: Optional[str] = None
    bio: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    country: Optional[str] = None

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

class ReactionRequest(BaseModel):
    post_id: str
    reaction_type: str

    @field_validator('reaction_type')
    @classmethod
    def valid_reaction(cls, v):
        if v not in ['resonate', 'love', 'intrigued']:
            raise ValueError('Invalid reaction type')
        return v

# ─── Response schemas ─────────────────────────────────────────────────────────

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: str
    name: str
    email: str

class UserOut(BaseModel):
    id: str
    name: str
    email: str
    bio: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    country: Optional[str] = None
    is_active: bool
    created_at: datetime

    model_config = {"from_attributes": True}

    @classmethod
    def from_orm(cls, user):
        return cls(
            id=str(user.id),
            name=user.name,
            email=user.email,
            bio=user.bio,
            city=user.city,
            state=user.state,
            country=user.country,
            is_active=user.is_active,
            created_at=user.created_at
        )

class ContentOut(BaseModel):
    external_id: str
    source: str
    title: str
    cover_image: Optional[str] = None
    creator: Optional[str] = None
    genres: List = []
    release_year: Optional[int] = None
    language: Optional[str] = None
    category: str
    cached_id: Optional[str] = None

    model_config = {"from_attributes": True}

    @classmethod
    def from_cache(cls, content, category: str):
        return cls(
            external_id=content.external_id,
            source=content.source,
            title=content.title,
            cover_image=content.cover_image,
            creator=content.creator,
            genres=content.genres or [],
            release_year=content.release_year,
            language=content.language,
            category=category,
            cached_id=str(content.id)
        )

class InterestOut(BaseModel):
    id: str
    category: str
    content_id: str
    title: Optional[str] = None
    cover_image: Optional[str] = None
    genres: List = []
    status: Optional[str] = None
    rating: Optional[int] = None
    is_favorite: bool = False

    model_config = {"from_attributes": True}

    @classmethod
    def from_orm(cls, interest):
        return cls(
            id=str(interest.id),
            category=interest.category,
            content_id=str(interest.content_id),
            title=interest.content.title if interest.content else None,
            cover_image=interest.content.cover_image if interest.content else None,
            genres=interest.content.genres if interest.content else [],
            status=interest.status,
            rating=interest.rating,
            is_favorite=interest.is_favorite
        )

class SaveInterestResponse(BaseModel):
    saved: int
    titles: List[str]

class ReactionOut(BaseModel):
    type: str
    user: str

class PostOut(BaseModel):
    id: str
    circle_id: str
    user_id: str
    content: str
    post_type: str
    created_at: datetime
    user_name: str
    reaction_count: int = 0
    reactions: List[ReactionOut] = []

    model_config = {"from_attributes": True}

    @classmethod
    def from_orm(cls, post):
        return cls(
            id=str(post.id),
            circle_id=str(post.circle_id),
            user_id=str(post.user_id),
            content=post.content,
            post_type=post.post_type,
            created_at=post.created_at,
            user_name=post.user.name if post.user else "Unknown",
            reaction_count=len(post.reactions),
            reactions=[ReactionOut(type=r.reaction_type, user=r.user.name) for r in post.reactions]
        )

class CircleOut(BaseModel):
    id: str
    category: str
    city: Optional[str] = None
    name: Optional[str] = None
    member_count: int = 0
    member_names: List[str] = []
    joined_at: Optional[datetime] = None

class MatchCategoryResult(BaseModel):
    circle_id: str
    matches: int

class MatchResponse(BaseModel):
    matched: bool
    reason: Optional[str] = None
    circles: Optional[dict] = None

class ReactionResponse(BaseModel):
    action: str

class MessageResponse(BaseModel):
    message: str

class RenameRequest(BaseModel):
    name: str