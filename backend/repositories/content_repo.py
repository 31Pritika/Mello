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

    @staticmethod
    def _sanitize_data(data: dict) -> dict:
        clean = dict(data)
        extra = dict(clean.get("extra_data") or {})

        if isinstance(clean.get("creator"), str):
            extra["creator"] = clean.pop("creator")
        elif "creator" in clean and clean["creator"] is None:
            clean.pop("creator")

        if isinstance(clean.get("language"), str):
            extra["language"] = clean.pop("language")
        elif "language" in clean and clean["language"] is None:
            clean.pop("language")

        if "genres" in clean:
            genres_val = clean.get("genres")
            if genres_val is None or (isinstance(genres_val, list) and all(isinstance(g, str) for g in genres_val)):
                extra["genres"] = list(genres_val or [])
                clean.pop("genres")

        if extra or "extra_data" in clean:
            clean["extra_data"] = extra
        return clean

    def get_or_create(self, external_id: str, source: str, data: dict) -> ContentCache:
        clean_data = self._sanitize_data(data)
        content = self.get_by_external(external_id, source)
        if content:
            if content.last_fetched_at and (datetime.utcnow() - content.last_fetched_at).days > 7:
                return self.update(content, **clean_data, last_fetched_at=datetime.utcnow())
            return content
        return self.create(external_id=external_id, source=source, **clean_data)

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
                clean_data = self._sanitize_data(data)
                obj = ContentCache(external_id=external_id, source=source, **clean_data)
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