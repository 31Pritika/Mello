Ran a command
bash

cat > /mnt/user-data/outputs/README.md << 'EOF'
# mello

> A taste-based social platform that connects people through shared interest in movies, shows, music, and books.

Mello uses interest overlap and geographic proximity to place users into small, curated **Circles** — intimate communities of up to 40 people per interest category. Each Circle has a **Common Room**: a low-pressure, asynchronous space to drop thoughts, reactions, and recommendations. No algorithms. No noise. Just people who get it.

---

## Features

- **Taste-based matching** — users are matched by interest overlap per category (movies, shows, music, books) within the same city
- **Circles** — small, curated groups (up to 40 people) formed automatically from matched users
- **Common Room** — async post feed per circle with three reaction types: resonate, love, intrigued
- **Multiple auth methods** — email/password, Google OAuth, magic link (passwordless), forgot/reset password
- **Content caching** — all external API results cached in PostgreSQL; platform continues working if APIs go down
- **Cinematic UI** — Midnight Library aesthetic: dark warm charcoal, deep rose accent, Playfair Display + Inter typography, custom cursor, ambient glow, cinematic card hover states

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, React Router v6 |
| Backend | FastAPI (Python 3.12) |
| ORM | SQLAlchemy + psycopg2 |
| Database | PostgreSQL via Supabase |
| Auth | JWT (python-jose + passlib bcrypt) + Google OAuth |
| Email | Resend |
| Content APIs | TMDB, Spotify Web API, Google Books |
| Location | Geoapify |

---

## Project Structure

```
mello/
├── src/
│   ├── pages/
│   │   ├── Landing.jsx          # Cinematic homepage
│   │   ├── Auth.jsx             # Register, login, magic link, forgot password
│   │   ├── Onboarding.jsx       # City autocomplete + taste profile setup
│   │   ├── Dashboard.jsx        # Circle sidebar + Common Room
│   │   ├── AuthCallback.jsx     # Google OAuth + magic link redirect handler
│   │   └── ResetPassword.jsx    # Password reset form
│   └── utils/
│       ├── api.js               # All FastAPI calls, JWT storage
│       ├── matching.js          # Calls POST /match/run
│       └── circles.js           # Circle utility re-exports
├── backend/
│   ├── main.py                  # FastAPI app, CORS, exception handlers
│   ├── database.py              # SQLAlchemy engine + session
│   ├── models.py                # 8 SQLAlchemy ORM models
│   ├── schemas.py               # Pydantic request + response models
│   ├── auth.py                  # JWT creation, verification, get_current_user
│   ├── exceptions.py            # Custom exception classes + global handlers
│   ├── repositories/
│   │   ├── base.py              # BaseRepository with generic CRUD
│   │   ├── user_repo.py
│   │   ├── interest_repo.py
│   │   ├── content_repo.py      # Cache-first external content logic
│   │   ├── circle_repo.py
│   │   └── match_repo.py
│   ├── routes/
│   │   ├── auth_routes.py       # /auth/register, /auth/login, /auth/me
│   │   ├── oauth_routes.py      # Google OAuth, magic link, password reset
│   │   ├── content_routes.py    # /content/search/*, /content/interests
│   │   ├── circle_routes.py     # /circles/mine, posts, reactions, rename
│   │   └── matching_routes.py   # /match/run
│   └── services/
│       ├── google_oauth.py      # Google OAuth2 flow
│       └── email_services.py    # Resend magic link + password reset emails
└── README.md
```

---

## Setup

### Prerequisites

- Node.js 18+
- Python 3.12+
- A [Supabase](https://supabase.com) project
- API keys for TMDB, Spotify, Google Books, Geoapify, Resend, Google OAuth

---

### Frontend

```bash
# Install dependencies
npm install

# Create .env in project root
cp .env.example .env
# Fill in VITE_GEOAPIFY_KEY

# Start dev server
npm run dev
```

Runs at `http://localhost:5173`

---

### Backend

```bash
cd backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install fastapi uvicorn sqlalchemy psycopg2-binary python-dotenv
pip install python-jose[cryptography] passlib[bcrypt] httpx authlib resend

# Create .env in backend/
cp .env.example .env
# Fill in all required variables (see Environment Variables below)

# Start server
uvicorn main:app --reload
```

Runs at `http://localhost:8000`  
API docs at `http://localhost:8000/docs`

---

### Database

Run the full schema in the Supabase SQL Editor. The schema creates all tables, indexes, constraints, and disables RLS (access control is handled by FastAPI JWT).

---

## Environment Variables

### Frontend (`/.env`)

```env
VITE_GEOAPIFY_KEY=            # City autocomplete — myprojects.geoapify.com
```

### Backend (`/backend/.env`)

```env
DATABASE_URL=                 # Supabase direct connection URI (not pooler)
SECRET_KEY=                   # JWT signing secret — generate with: python -c "import secrets; print(secrets.token_hex(32))"

TMDB_KEY=                     # themoviedb.org → Settings → API
SPOTIFY_CLIENT_ID=            # developer.spotify.com → Create App
SPOTIFY_CLIENT_SECRET=        # developer.spotify.com → App Dashboard
GOOGLE_BOOKS_KEY=             # console.cloud.google.com → Books API → Credentials

GOOGLE_CLIENT_ID=             # console.cloud.google.com → OAuth 2.0 Client ID
GOOGLE_CLIENT_SECRET=         # console.cloud.google.com → OAuth 2.0 Client Secret
GOOGLE_REDIRECT_URI=http://localhost:8000/auth/google/callback

RESEND_API_KEY=               # resend.com → API Keys
RESEND_FROM_EMAIL=            # Must be from a verified domain on Resend

FRONTEND_URL=http://localhost:5173
```

> **Note:** If your database password contains special characters like `[` or `]`, percent-encode them in the URL: `[` → `%5B`, `]` → `%5D`

---

## API Reference

Full interactive documentation available at `/docs` when the server is running.

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/auth/register` | — | Register with email + password |
| POST | `/auth/login` | — | Login, returns JWT |
| GET | `/auth/me` | ✓ | Get current user profile |
| PUT | `/auth/me` | ✓ | Update profile |
| GET | `/auth/google` | — | Initiate Google OAuth flow |
| GET | `/auth/google/callback` | — | Google OAuth callback |
| POST | `/auth/magic-link` | — | Send passwordless login link |
| POST | `/auth/verify-token` | — | Verify magic link token |
| POST | `/auth/forgot-password` | — | Send password reset email |
| POST | `/auth/reset-password` | — | Reset password with token |
| GET | `/content/search/movies` | — | Search movies (TMDB, cached) |
| GET | `/content/search/shows` | — | Search shows (TMDB, cached) |
| GET | `/content/search/music` | — | Search artists (Spotify, cached) |
| GET | `/content/search/books` | — | Search books (Google Books, cached) |
| POST | `/content/interests` | ✓ | Save taste profile |
| GET | `/content/interests` | ✓ | Get user's saved interests |
| POST | `/match/run` | ✓ | Run matching algorithm, assign circles |
| GET | `/circles/mine` | ✓ | Get user's circles |
| GET | `/circles/{id}/posts` | ✓ | Get circle's Common Room posts |
| POST | `/circles/posts` | ✓ | Post to Common Room |
| POST | `/circles/posts/react` | ✓ | React to a post (resonate / love / intrigued) |
| PUT | `/circles/{id}/rename` | ✓ | Rename a circle |

---

## How Matching Works

1. On dashboard load, `POST /match/run` fires for the current user
2. The algorithm fetches all active users in the same city with their interests preloaded (single query via `joinedload`)
3. For each category, it computes the set intersection of content IDs between the current user and each city user
4. Users with overlap ≥ 1 are considered matches; their score and common content are stored in the `matches` table
5. Matched users are bulk-inserted into a shared Circle per category
6. Circles have a max capacity of 40 members

---

## Database Schema

8 tables: `users`, `content_cache`, `interests`, `circles`, `circle_members`, `posts`, `reactions`, `matches`

Plus normalised lookup tables: `locations`, `categories`, `genres`, `creators`, `languages`, `content_genres`, `interest_moods`, `match_content`, `oauth_accounts`, `auth_tokens`

---

## Acknowledgements

Built by **Pritika Agarwal** (160124737023)  
Department of Information Technology, CBIT Hyderabad  
2025–2026
