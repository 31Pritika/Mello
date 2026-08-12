from sqlalchemy.orm import Session
from models import ContentCache
from datetime import datetime
from .base import BaseRepository
from typing import Optional, List

class ContentRepository(BaseRepository[ContentCache]):
    def __init__(self, db: Session):
        super().__init__(ContentCache, db)

    def get_by_external(self, external_id: str, source: str) -> Optional[ContentCache]:
        return self.db.query(ContentCache).filter(
            ContentCache.external_id == external_id,
            ContentCache.source == source
        ).first()

    def search_cache(self, source: str, query: str, limit: int = 8) -> List[ContentCache]:
        return self.db.query(ContentCache).filter(
            ContentCache.source == source,
            ContentCache.title.ilike(f"%{query}%")
        ).limit(limit).all()

    def get_or_create(self, external_id: str, source: str, data: dict) -> ContentCache:
        content = self.get_by_external(external_id, source)
        if content:
            if (datetime.utcnow() - content.last_fetched_at).days > 7:
                return self.update(content, **data, last_fetched_at=datetime.utcnow())
            return content
        return self.create(external_id=external_id, source=source, **data)

    def bulk_get_or_create(self, items: list) -> dict:
        # Fetch all existing in one query instead of one query per item
        # items = list of (external_id, source, data) tuples
        keys = [(i[0], i[1]) for i in items]
        existing = self.db.query(ContentCache).filter(
            ContentCache.external_id.in_([k[0] for k in keys])
        ).all()
        existing_map = {(c.external_id, c.source): c for c in existing}

        result = {}
        new_items = []
        for external_id, source, data in items:
            key = (external_id, source)
            if key in existing_map:
                result[key] = existing_map[key]
            else:
                obj = ContentCache(external_id=external_id, source=source, **data)
                new_items.append(obj)

        if new_items:
            self.db.bulk_save_objects(new_items)
            self.db.commit()
            # Refetch to get generated IDs
            new_ids = [i.external_id for i in new_items]
            refetched = self.db.query(ContentCache).filter(
                ContentCache.external_id.in_(new_ids)
            ).all()
            for c in refetched:
                result[(c.external_id, c.source)] = c

        return result