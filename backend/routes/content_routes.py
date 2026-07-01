from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from database import get_db
from models import User
from auth import get_current_user
from schemas import (
    SaveInterestRequest, SaveInterestResponse,
    ContentOut, InterestOut
)
from repositories import content_repo, interest_repo, user_repo
from typing import List
import httpx, os, base64

router = APIRouter(prefix="/content", tags=["content"])

TMDB_KEY = os.getenv("TMDB_KEY")
SPOTIFY_CLIENT_ID = os.getenv("SPOTIFY_CLIENT_ID")
SPOTIFY_CLIENT_SECRET = os.getenv("SPOTIFY_CLIENT_SECRET")
GOOGLE_BOOKS_KEY = os.getenv("GOOGLE_BOOKS_KEY")

async def get_spotify_token():
    auth = base64.b64encode(
        f"{SPOTIFY_CLIENT_ID}:{SPOTIFY_CLIENT_SECRET}".encode()
    ).decode()
    async with httpx.AsyncClient() as client:
        res = await client.post(
            "https://accounts.spotify.com/api/token",
            headers={
                "Authorization": f"Basic {auth}",
                "Content-Type": "application/x-www-form-urlencoded"
            },
            data={"grant_type": "client_credentials"}
        )
    return res.json()["access_token"]

@router.get("/search/movies", response_model=List[ContentOut])
async def search_movies(q: str = Query(...), db: Session = Depends(get_db)):
    cached = content_repo.search_cache(db, "tmdb_movie", q)
    if cached:
        return [ContentOut.from_cache(c, "movies") for c in cached]
    async with httpx.AsyncClient() as client:
        res = await client.get(
            "https://api.themoviedb.org/3/search/movie",
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
        content = content_repo.get_or_create(db, str(m["id"]), "tmdb_movie", data)
        output.append(ContentOut.from_cache(content, "movies"))
    return output

@router.get("/search/shows", response_model=List[ContentOut])
async def search_shows(q: str = Query(...), db: Session = Depends(get_db)):
    cached = content_repo.search_cache(db, "tmdb_show", q)
    if cached:
        return [ContentOut.from_cache(c, "shows") for c in cached]
    async with httpx.AsyncClient() as client:
        res = await client.get(
            "https://api.themoviedb.org/3/search/tv",
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
        content = content_repo.get_or_create(db, str(s["id"]), "tmdb_show", data)
        output.append(ContentOut.from_cache(content, "shows"))
    return output

@router.get("/search/music", response_model=List[ContentOut])
async def search_music(q: str = Query(...), db: Session = Depends(get_db)):
    cached = content_repo.search_cache(db, "spotify_artist", q)
    if cached:
        return [ContentOut.from_cache(c, "music") for c in cached]
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
            "extra_data": {
                "popularity": a.get("popularity"),
                "followers": a.get("followers", {}).get("total")
            }
        }
        content = content_repo.get_or_create(db, a["id"], "spotify_artist", data)
        output.append(ContentOut.from_cache(content, "music"))
    return output

@router.get("/search/books", response_model=List[ContentOut])
async def search_books(q: str = Query(...), db: Session = Depends(get_db)):
    cached = content_repo.search_cache(db, "google_books", q)
    if cached:
        return [ContentOut.from_cache(c, "books") for c in cached]
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
        content = content_repo.get_or_create(db, b["id"], "google_books", data)
        output.append(ContentOut.from_cache(content, "books"))
    return output

@router.post("/interests", response_model=SaveInterestResponse)
def save_interests(
    req: SaveInterestRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if req.city:
        user_repo.update_location(db, current_user, req.city, req.state, req.country)
    saved = []
    for item in req.items:
        content = content_repo.get_or_create(db, item.external_id, item.source, {
            "title": item.title,
            "cover_image": item.cover_image,
            "creator": item.creator,
            "genres": item.genres,
            "release_year": item.release_year,
        })
        if not interest_repo.get_existing(db, current_user.id, content.id):
            interest_repo.create(db, current_user.id, content.id, item.category)
            saved.append(item.title)
    return SaveInterestResponse(saved=len(saved), titles=saved)

@router.get("/interests", response_model=List[InterestOut])
def get_interests(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    interests = interest_repo.get_by_user(db, current_user.id)
    return [InterestOut.from_orm(i) for i in interests]