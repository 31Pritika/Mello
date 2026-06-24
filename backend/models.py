from sqlalchemy import Column, String, Text, ForeignKey, TIMESTAMP, func
from sqlalchemy.dialects.postgresql import UUID
from database import Base
import uuid

class Profile(Base):
    __tablename__ = "profiles"
    id = Column(UUID(as_uuid=True), primary_key=True)
    name = Column(String)
    city = Column(String)
    created_at = Column(TIMESTAMP, server_default=func.now())

class Interest(Base):
    __tablename__ = "interests"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("profiles.id", ondelete="CASCADE"))
    category = Column(String)
    item_id = Column(String)
    item_name = Column(String)
    cover_image = Column(String)
    created_at = Column(TIMESTAMP, server_default=func.now())

class Circle(Base):
    __tablename__ = "circles"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    category = Column(String)
    city = Column(String)
    created_at = Column(TIMESTAMP, server_default=func.now())

class CircleMember(Base):
    __tablename__ = "circle_members"
    circle_id = Column(UUID(as_uuid=True), ForeignKey("circles.id", ondelete="CASCADE"), primary_key=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("profiles.id", ondelete="CASCADE"), primary_key=True)

class Post(Base):
    __tablename__ = "posts"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    circle_id = Column(UUID(as_uuid=True), ForeignKey("circles.id", ondelete="CASCADE"))
    user_id = Column(UUID(as_uuid=True), ForeignKey("profiles.id", ondelete="CASCADE"))
    content = Column(Text)
    created_at = Column(TIMESTAMP, server_default=func.now())