from pydantic import BaseModel, EmailStr, field_validator
from typing import Optional, List
from datetime import datetime
import re

# ─── Request schemas ──────────────────────────────────────────────────────────

class RegisterRequest(BaseModel):
    """Schema for user registration request."""
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
        extra = content.extra_data if isinstance(getattr(content, "extra_data", None), dict) else {}

        if hasattr(content, "creator_name"):
            creator = content.creator_name
        elif isinstance(getattr(content, "creator", None), str):
            creator = content.creator
        elif getattr(content, "creator", None) is not None and hasattr(content.creator, "name"):
            creator = content.creator.name
        else:
            authors = extra.get("authors")
            creator = extra.get("creator") or (", ".join(authors) if isinstance(authors, list) and authors else None)

        if hasattr(content, "language_name"):
            language = content.language_name
        elif isinstance(getattr(content, "language", None), str):
            language = content.language
        elif getattr(content, "language", None) is not None and hasattr(content.language, "name"):
            language = content.language.name
        else:
            language = extra.get("language")

        if hasattr(content, "genre_list"):
            genres = content.genre_list
        else:
            raw_genres = getattr(content, "genres", None) or []
            genres = [
                g if isinstance(g, str) else getattr(getattr(g, "genre", None), "name", None)
                for g in raw_genres
            ]
            genres = [g for g in genres if g] or list(extra.get("genres") or [])

        return cls(
            external_id=content.external_id,
            source=content.source,
            title=content.title,
            cover_image=content.cover_image,
            creator=creator,
            genres=genres,
            release_year=content.release_year,
            language=language,
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
        content = interest.content
        if content is None:
            genres = []
        elif hasattr(content, "genre_list"):
            genres = content.genre_list
        else:
            extra = content.extra_data if isinstance(getattr(content, "extra_data", None), dict) else {}
            raw_genres = getattr(content, "genres", None) or []
            genres = [
                g if isinstance(g, str) else getattr(getattr(g, "genre", None), "name", None)
                for g in raw_genres
            ]
            genres = [g for g in genres if g] or list(extra.get("genres") or [])

        return cls(
            id=str(interest.id),
            category=interest.category,
            content_id=str(interest.content_id),
            title=content.title if content else None,
            cover_image=content.cover_image if content else None,
            genres=genres,
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