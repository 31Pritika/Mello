from sqlalchemy import (
    Column, String, Text, Boolean, Integer, Float,
    ForeignKey, TIMESTAMP, func, CheckConstraint
)
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from database import Base
import uuid
from sqlalchemy import UniqueConstraint, CheckConstraint

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
    latitude = Column(Float)
    longitude = Column(Float)
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    last_seen_at = Column(TIMESTAMP)
    created_at = Column(TIMESTAMP, server_default=func.now())
    updated_at = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now())

    interests = relationship("Interest", back_populates="user", cascade="all, delete")
    posts = relationship("Post", back_populates="user", cascade="all, delete")
    reactions = relationship("Reaction", back_populates="user", cascade="all, delete")
    circle_memberships = relationship("CircleMember", back_populates="user", cascade="all, delete")

class ContentCache(Base):
    __tablename__ = "content_cache"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    external_id = Column(String, nullable=False) #api id
    source = Column(String, nullable=False)
    title = Column(String, nullable=False)
    cover_image = Column(String)
    creator = Column(String)
    genres = Column(JSONB, default=list) #json list
    release_year = Column(Integer)
    language = Column(String)
    description = Column(Text)
    extra_data = Column(JSONB, default=dict) #api
    last_fetched_at = Column(TIMESTAMP, server_default=func.now())
    created_at = Column(TIMESTAMP, server_default=func.now())

    interests = relationship("Interest", back_populates="content")

class Interest(Base):
    __tablename__ = "interests"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"))
    content_id = Column(UUID(as_uuid=True), ForeignKey("content_cache.id", ondelete="CASCADE"))
    category = Column(String, nullable=False)
    mood_tags = Column(JSONB, default=list)
    rating = Column(Integer)
    status = Column(String, default="completed")
    is_favorite = Column(Boolean, default=False)
    created_at = Column(TIMESTAMP, server_default=func.now())

    user = relationship("User", back_populates="interests")
    content = relationship("ContentCache", back_populates="interests")
    __table_args__ = (
        UniqueConstraint('user_id', 'content_id', name='uq_user_content'),
        CheckConstraint("status in ('completed','in_progress','want_to','dropped')", name='ck_interest_status'),
        CheckConstraint("rating >= 1 and rating <= 5", name='ck_interest_rating'),
    )

class Circle(Base):
    __tablename__ = "circles"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    category = Column(String, nullable=False)
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

class CircleMember(Base):
    __tablename__ = "circle_members"
    __table_args__ = (
        CheckConstraint("role in ('member','moderator')", name='ck_member_role'),
    )
    circle_id = Column(UUID(as_uuid=True), ForeignKey("circles.id", ondelete="CASCADE"), primary_key=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
    role = Column(String, default="member")
    joined_at = Column(TIMESTAMP, server_default=func.now())

    circle = relationship("Circle", back_populates="members")
    user = relationship("User")
    user = relationship("User", back_populates="circle_memberships")

class Post(Base):
    __tablename__ = "posts"
    __table_args__ = (
        CheckConstraint("post_type in ('thought','recommendation','reaction','question')", name='ck_post_type'),
    )
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    circle_id = Column(UUID(as_uuid=True), ForeignKey("circles.id", ondelete="CASCADE"))
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"))
    content = Column(Text, nullable=False)
    content_id = Column(UUID(as_uuid=True), ForeignKey("content_cache.id", ondelete="SET NULL"), nullable=True)
    post_type = Column(String, default="thought")
    is_deleted = Column(Boolean, default=False)
    created_at = Column(TIMESTAMP, server_default=func.now())
    updated_at = Column(TIMESTAMP, server_default=func.now())

    user = relationship("User", back_populates="posts")
    circle = relationship("Circle", back_populates="posts")
    reactions = relationship("Reaction", back_populates="post", cascade="all, delete")

class Reaction(Base):
    __tablename__ = "reactions"
    __table_args__ = (
        UniqueConstraint('post_id', 'user_id', name='uq_post_user_reaction'),
        CheckConstraint("reaction_type in ('resonate','love','intrigued')", name='ck_reaction_type'),
    )
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    post_id = Column(UUID(as_uuid=True), ForeignKey("posts.id", ondelete="CASCADE"))
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"))
    reaction_type = Column(String)
    created_at = Column(TIMESTAMP, server_default=func.now())

    post = relationship("Post", back_populates="reactions")
    user = relationship("User", back_populates="reactions")

class Match(Base):
    __tablename__ = "matches"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_1_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"))
    user_2_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"))
    category = Column(String, nullable=False)
    score = Column(Integer, nullable=False)
    common_content = Column(JSONB, default=list)
    created_at = Column(TIMESTAMP, server_default=func.now())
    user_1 = relationship("User", foreign_keys=[user_1_id])
    user_2 = relationship("User", foreign_keys=[user_2_id])