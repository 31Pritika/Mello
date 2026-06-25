from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from database import get_db
from models import User, ContentCache, Interest
from auth import get_current_user
from schemas import SaveInterestRequest
import httpx, os, base64
from datetime import datetime

router = APIRouter(prefix="/content", tags=["content"])

TMDB_KEY = os.getenv("TMDB_KEY")
SPOTIFY_CLIENT_ID = os.getenv("SPOTIFY_CLIENT_ID")
SPOTIFY_CLIENT_SECRET = os.getenv("SPOTIFY_CLIENT_SECRET")
GOOGLE_BOOKS_KEY = os.getenv("GOOGLE_BOOKS_KEY")

async def get_spotify_token():
    auth = base64.b64encode(f"{SPOTIFY_CLIENT_ID}:{SPOTIFY_CLIENT_SECRET}".encode()).decode()
    async with httpx.AsyncClient() as client:
        res = await client.post(
            "https://accounts.spotify.com/api/token",
            headers={"Authorization": f"Basic {auth}", "Content-Type": "application/x-www-form-urlencoded"},
            data={"grant_type": "client_credentials"}
        )
    return res.json()["access_token"]

def get_or_create_content(db: Session, external_id: str, source: str, data: dict) -> ContentCache:
    content = db.query(ContentCache).filter(
        ContentCache.external_id == external_id,
        ContentCache.source == source
    ).first()

    if content:
        # Update cache if older than 7 days
        age = (datetime.utcnow() - content.last_fetched_at).days
        if age > 7:
            for k, v in data.items():
                setattr(content, k, v)
            content.last_fetched_at = datetime.utcnow()
            db.commit()
        return content

    content = ContentCache(external_id=external_id, source=source, **data)
    db.add(content)
    db.commit()
    db.refresh(content)
    return content

@router.get("/search/movies")
async def search_movies(q: str = Query(...), db: Session = Depends(get_db)):
    # Check cache first
    cached = db.query(ContentCache).filter(
        ContentCache.source == "tmdb_movie",
        ContentCache.title.ilike(f"%{q}%")
    ).limit(8).all()

    if cached:
        return [_format_content(c, "movies") for c in cached]

    # Hit API
    async with httpx.AsyncClient() as client:
        res = await client.get(
            f"https://api.themoviedb.org/3/search/movie",
            params={"api_key": TMDB_KEY, "query": q}
        )
    results = res.json().get("results", [])[:8]

    output = []
    for m in results:
        data = {
            "title": m.get("title", ""),
            "cover_image": f"https://image.tmdb.org/t/p/w200{m['poster_path']}" if m.get("poster_path") else None,
            "release_year": int(m["release_date"][:4]) if m.get("release_date") else None,
            "language": m.get("original_language"),
            "description": m.get("overview"),
            "genres": [],
            "extra_data": {"popularity": m.get("popularity")}
        }
        content = get_or_create_content(db, str(m["id"]), "tmdb_movie", data)
        output.append(_format_content(content, "movies"))
    return output

@router.get("/search/shows")
async def search_shows(q: str = Query(...), db: Session = Depends(get_db)):
    cached = db.query(ContentCache).filter(
        ContentCache.source == "tmdb_show",
        ContentCache.title.ilike(f"%{q}%")
    ).limit(8).all()

    if cached:
        return [_format_content(c, "shows") for c in cached]

    async with httpx.AsyncClient() as client:
        res = await client.get(
            f"https://api.themoviedb.org/3/search/tv",
            params={"api_key": TMDB_KEY, "query": q}
        )
    results = res.json().get("results", [])[:8]

    output = []
    for s in results:
        data = {
            "title": s.get("name", ""),
            "cover_image": f"https://image.tmdb.org/t/p/w200{s['poster_path']}" if s.get("poster_path") else None,
            "release_year": int(s["first_air_date"][:4]) if s.get("first_air_date") else None,
            "language": s.get("original_language"),
            "description": s.get("overview"),
            "genres": [],
            "extra_data": {}
        }
        content = get_or_create_content(db, str(s["id"]), "tmdb_show", data)
        output.append(_format_content(content, "shows"))
    return output

@router.get("/search/music")
async def search_music(q: str = Query(...), db: Session = Depends(get_db)):
    cached = db.query(ContentCache).filter(
        ContentCache.source == "spotify_artist",
        ContentCache.title.ilike(f"%{q}%")
    ).limit(8).all()

    if cached:
        return [_format_content(c, "music") for c in cached]

    token = await get_spotify_token()
    async with httpx.AsyncClient() as client:
        res = await client.get(
            "https://api.spotify.com/v1/search",
            params={"q": q, "type": "artist", "limit": 8},
            headers={"Authorization": f"Bearer {token}"}
        )
    artists = res.json().get("artists", {}).get("items", [])

    output = []
    for a in artists:
        data = {
            "title": a["name"],
            "cover_image": a["images"][0]["url"] if a.get("images") else None,
            "genres": a.get("genres", []),
            "extra_data": {"popularity": a.get("popularity"), "followers": a.get("followers", {}).get("total")}
        }
        content = get_or_create_content(db, a["id"], "spotify_artist", data)
        output.append(_format_content(content, "music"))
    return output

@router.get("/search/books")
async def search_books(q: str = Query(...), db: Session = Depends(get_db)):
    cached = db.query(ContentCache).filter(
        ContentCache.source == "google_books",
        ContentCache.title.ilike(f"%{q}%")
    ).limit(8).all()

    if cached:
        return [_format_content(c, "books") for c in cached]

    async with httpx.AsyncClient() as client:
        res = await client.get(
            "https://www.googleapis.com/books/v1/volumes",
            params={"q": q, "key": GOOGLE_BOOKS_KEY, "maxResults": 8}
        )
    items = res.json().get("items", [])

    output = []
    for b in items:
        info = b.get("volumeInfo", {})
        data = {
            "title": info.get("title", ""),
            "cover_image": info.get("imageLinks", {}).get("thumbnail"),
            "creator": ", ".join(info.get("authors", [])),
            "genres": info.get("categories", []),
            "release_year": int(info["publishedDate"][:4]) if info.get("publishedDate") else None,
            "language": info.get("language"),
            "description": info.get("description"),
            "extra_data": {"page_count": info.get("pageCount")}
        }
        content = get_or_create_content(db, b["id"], "google_books", data)
        output.append(_format_content(content, "books"))
    return output

@router.post("/interests")
def save_interests(
    req: SaveInterestRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Update location if provided
    if req.city:
        current_user.city = req.city
        current_user.state = req.state
        current_user.country = req.country
        db.commit()

    saved = []
    for item in req.items:
        content = get_or_create_content(db, item.external_id, item.source, {
            "title": item.title,
            "cover_image": item.cover_image,
            "creator": item.creator,
            "genres": item.genres,
            "release_year": item.release_year,
        })

        existing = db.query(Interest).filter(
            Interest.user_id == current_user.id,
            Interest.content_id == content.id
        ).first()

        if not existing:
            interest = Interest(
                user_id=current_user.id,
                content_id=content.id,
                category=item.category
            )
            db.add(interest)
            saved.append(item.title)

    db.commit()
    return {"saved": len(saved), "titles": saved}

@router.get("/interests")
def get_interests(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    interests = db.query(Interest).filter(Interest.user_id == current_user.id).all()
    return [
        {
            "id": str(i.id),
            "category": i.category,
            "content_id": str(i.content_id),
            "title": i.content.title if i.content else None,
            "cover_image": i.content.cover_image if i.content else None,
            "genres": i.content.genres if i.content else [],
            "status": i.status,
            "rating": i.rating,
            "is_favorite": i.is_favorite,
        }
        for i in interests
    ]

def _format_content(content: ContentCache, category: str) -> dict:
    return {
        "external_id": content.external_id,
        "source": content.source,
        "title": content.title,
        "cover_image": content.cover_image,
        "creator": content.creator,
        "genres": content.genres or [],
        "release_year": content.release_year,
        "category": category,
        "cached_id": str(content.id)
    }