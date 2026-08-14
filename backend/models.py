from sqlalchemy import (
    Column, String, Text, Boolean, Integer,
    ForeignKey, TIMESTAMP, func, CheckConstraint,
    UniqueConstraint
)
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from database import Base
import uuid


# =========================
# USER
# =========================
class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String, unique=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    name = Column(String, nullable=False)
    bio = Column(Text)
    avatar_url = Column(String)

    city = Column(String)
    state = Column(String)
    country = Column(String)
    location_id = Column(UUID(as_uuid=True), ForeignKey("locations.id"))

    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    last_seen_at = Column(TIMESTAMP)

    created_at = Column(TIMESTAMP, server_default=func.now())
    updated_at = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now())

    interests = relationship("Interest", back_populates="user", cascade="all, delete")
    posts = relationship("Post", back_populates="user", cascade="all, delete")
    reactions = relationship("Reaction", back_populates="user", cascade="all, delete")
    circle_memberships = relationship("CircleMember", back_populates="user", cascade="all, delete")
    phone = Column(String, unique=True)
    oauth_accounts = relationship("OAuthAccount", back_populates="user", cascade="all, delete")


# =========================
# CONTENT CACHE
# =========================
class ContentCache(Base):
    __tablename__ = "content_cache"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    external_id = Column(String, nullable=False)
    source = Column(String, nullable=False)
    title = Column(String, nullable=False)
    cover_image = Column(String)

    creator_id = Column(UUID(as_uuid=True), ForeignKey("creators.id"))
    language_id = Column(UUID(as_uuid=True), ForeignKey("languages.id"))

    release_year = Column(Integer)
    description = Column(Text)

    extra_data = Column(JSONB, default=dict)

    last_fetched_at = Column(TIMESTAMP, server_default=func.now())
    created_at = Column(TIMESTAMP, server_default=func.now())

    interests = relationship("Interest", back_populates="content")
    genres = relationship("ContentGenre", back_populates="content", cascade="all, delete")


# =========================
# INTERESTS
# =========================
class Interest(Base):
    __tablename__ = "interests"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"))
    content_id = Column(UUID(as_uuid=True), ForeignKey("content_cache.id", ondelete="CASCADE"))

    category = Column(String, nullable=False, default="general")
    category_id = Column(UUID(as_uuid=True), ForeignKey("categories.id"))

    rating = Column(Integer)
    status = Column(String, default="completed")
    is_favorite = Column(Boolean, default=False)

    created_at = Column(TIMESTAMP, server_default=func.now())

    user = relationship("User", back_populates="interests")
    content = relationship("ContentCache", back_populates="interests")

    __table_args__ = (
        UniqueConstraint("user_id", "content_id", name="uq_user_content"),
        CheckConstraint("status in ('completed','in_progress','want_to','dropped')"),
        CheckConstraint("rating >= 1 and rating <= 5"),
    )


# =========================
# CIRCLES
# =========================
class Circle(Base):
    __tablename__ = "circles"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    category = Column(String, nullable=False, default="general")
    category_id = Column(UUID(as_uuid=True), ForeignKey("categories.id"))
    location_id = Column(UUID(as_uuid=True), ForeignKey("locations.id"))

    city = Column(String)
    state = Column(String)
    country = Column(String)
    name = Column(String)
    description = Column(Text)
    max_members = Column(Integer, default=40)
    is_active = Column(Boolean, default=True)

    created_at = Column(TIMESTAMP, server_default=func.now())
    updated_at = Column(TIMESTAMP, server_default=func.now())

    members = relationship("CircleMember", back_populates="circle", cascade="all, delete")
    posts = relationship("Post", back_populates="circle", cascade="all, delete")


# =========================
# CIRCLE MEMBERS
# =========================
class CircleMember(Base):
    __tablename__ = "circle_members"

    circle_id = Column(UUID(as_uuid=True), ForeignKey("circles.id", ondelete="CASCADE"), primary_key=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)

    role = Column(String, default="member")
    joined_at = Column(TIMESTAMP, server_default=func.now())

    circle = relationship("Circle", back_populates="members")
    user = relationship("User", back_populates="circle_memberships")


# =========================
# POSTS
# =========================
class Post(Base):
    __tablename__ = "posts"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    circle_id = Column(UUID(as_uuid=True), ForeignKey("circles.id", ondelete="CASCADE"))
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"))
    content = Column(Text, nullable=False)

    content_id = Column(UUID(as_uuid=True), ForeignKey("content_cache.id", ondelete="SET NULL"))

    post_type = Column(String, default="thought")
    is_deleted = Column(Boolean, default=False)

    created_at = Column(TIMESTAMP, server_default=func.now())
    updated_at = Column(TIMESTAMP, server_default=func.now())

    user = relationship("User", back_populates="posts")
    circle = relationship("Circle", back_populates="posts")
    reactions = relationship("Reaction", back_populates="post", cascade="all, delete")


# =========================
# REACTIONS
# =========================
class Reaction(Base):
    __tablename__ = "reactions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    post_id = Column(UUID(as_uuid=True), ForeignKey("posts.id", ondelete="CASCADE"))
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"))

    reaction_type = Column(String)

    created_at = Column(TIMESTAMP, server_default=func.now())

    post = relationship("Post", back_populates="reactions")
    user = relationship("User", back_populates="reactions")

    __table_args__ = (
        UniqueConstraint("post_id", "user_id", name="uq_post_user_reaction"),
        CheckConstraint("reaction_type in ('resonate','love','intrigued')"),
    )


# =========================
# MATCHES
# =========================
class Match(Base):
    __tablename__ = "matches"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    user_1_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"))
    user_2_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"))

    category = Column(String, nullable=False, default="general")
    category_id = Column(UUID(as_uuid=True), ForeignKey("categories.id"))
    score = Column(Integer, nullable=False)
    common_content = Column(JSONB, default=list)

    created_at = Column(TIMESTAMP, server_default=func.now())

    user_1 = relationship("User", foreign_keys=[user_1_id])
    user_2 = relationship("User", foreign_keys=[user_2_id])

class OAuthAccount(Base):
    __tablename__ = "oauth_accounts"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"))
    provider = Column(String, nullable=False)
    provider_user_id = Column(String, nullable=False)
    email = Column(String)
    access_token = Column(String)
    created_at = Column(TIMESTAMP, server_default=func.now())

    user = relationship("User", back_populates="oauth_accounts")
    __table_args__ = (
        UniqueConstraint('provider', 'provider_user_id', name='uq_provider_user'),
    )

class AuthToken(Base):
    __tablename__ = "auth_tokens"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"))
    token = Column(String, nullable=False, unique=True)
    token_type = Column(String, nullable=False)
    expires_at = Column(TIMESTAMP, nullable=False)
    used_at = Column(TIMESTAMP)
    created_at = Column(TIMESTAMP, server_default=func.now())

    user = relationship("User")