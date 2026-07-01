from sqlalchemy.orm import Session
from models import ContentCache
from datetime import datetime

def get_by_external(db: Session, external_id: str, source: str) -> ContentCache:
    return db.query(ContentCache).filter(
        ContentCache.external_id == external_id,
        ContentCache.source == source
    ).first()

def search_cache(db: Session, source: str, query: str, limit: int = 8):
    return db.query(ContentCache).filter(
        ContentCache.source == source,
        ContentCache.title.ilike(f"%{query}%")
    ).limit(limit).all()

def create(db: Session, external_id: str, source: str, data: dict) -> ContentCache:
    content = ContentCache(external_id=external_id, source=source, **data)
    db.add(content)
    db.commit()
    db.refresh(content)
    return content

def update(db: Session, content: ContentCache, data: dict) -> ContentCache:
    for k, v in data.items():
        setattr(content, k, v)
    content.last_fetched_at = datetime.utcnow()
    db.commit()
    db.refresh(content)
    return content

def get_or_create(db: Session, external_id: str, source: str, data: dict) -> ContentCache:
    content = get_by_external(db, external_id, source)
    if content:
        age = (datetime.utcnow() - content.last_fetched_at).days
        if age > 7:
            return update(db, content, data)
        return content
    return create(db, external_id, source, data)