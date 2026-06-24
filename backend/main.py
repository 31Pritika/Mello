from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from database import get_db
from matching import run_matching
import requests, os, base64
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"status": "Mello backend running"}

@app.post("/match/{user_id}")
def match(user_id: str, db: Session = Depends(get_db)):
    return run_matching(db, user_id)

@app.get("/spotify/search")
def spotify_search(q: str):
    client_id = os.getenv("SPOTIFY_CLIENT_ID")
    client_secret = os.getenv("SPOTIFY_CLIENT_SECRET")
    auth = base64.b64encode(f"{client_id}:{client_secret}".encode()).decode()

    token_res = requests.post(
        "https://accounts.spotify.com/api/token",
        headers={
            "Authorization": f"Basic {auth}",
            "Content-Type": "application/x-www-form-urlencoded"
        },
        data={"grant_type": "client_credentials"}
    )
    token = token_res.json()["access_token"]

    search_res = requests.get(
        f"https://api.spotify.com/v1/search?q={q}&type=artist&limit=8",
        headers={"Authorization": f"Bearer {token}"}
    )
    artists = search_res.json().get("artists", {}).get("items", [])

    return [
        {
            "item_id": a["id"],
            "item_name": a["name"],
            "cover_image": a["images"][0]["url"] if a["images"] else None,
            "category": "music"
        }
        for a in artists
    ]