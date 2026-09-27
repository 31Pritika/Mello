# AGENTS.md — Developer & AI Agent Guide for Mello

## Project Overview

**Mello** ("Taste Collective") is a cultural taste-matching and micro-community web application. Users build personal taste profiles by saving movies, TV shows, music, and books they love. Mello clusters users located in the same geographic locality (city) who share overlapping cultural tastes, placing them into intimate, curated community groups called **Circles** (capped at ~40 members). Inside Circles, members share thoughts/posts and react with resonance-based emotional reactions (`resonate`, `love`, `intrigued`).

---

## Tech Stack & Architecture

### Frontend
- **Framework**: React 19 (`react` 19.2.5, `react-dom` 19.2.5)
- **Bundler & Tooling**: Vite 8 (`@vitejs/plugin-react`)
- **Styling**: Tailwind CSS v4 (`@tailwindcss/vite`, `tailwindcss` 4.2.4) + custom dark theme CSS variables in `src/index.css`
- **Routing**: React Router DOM v7 (`react-router-dom` 7.14.2)
- **Animations**: Framer Motion 12 (`framer-motion` 12.38.0)
- **External UI Services**: Geoapify API for city autocomplete during onboarding

### Backend
- **Framework**: FastAPI (0.138.0) running on Starlette / Uvicorn (0.49.0)
- **Database & ORM**: PostgreSQL via SQLAlchemy 2.0 (`psycopg2-binary` 2.9.12)
- **Validation**: Pydantic v2 (2.13.4)
- **Authentication**: JWT bearer tokens (`python-jose`), bcrypt password hashing (`passlib`), Google OAuth 2.0 (`Authlib` / HTTPX), and one-time magic login / password reset links
- **Email**: `aiosmtplib` for asynchronous SMTP email delivery
- **External Metadata APIs**:
  - The Movie Database (TMDB) API for movies & TV shows
  - Spotify Web API (Client Credentials flow) for music artists
  - Google Books API for books

### Research / Data Science
- **Notebooks**: `backend/notebooks/mello_train.ipynb` and `backend/notebooks/mello.py` exploring SVD matrix factorization (collaborative filtering) and cosine similarity for taste-based recommendations on MovieLens and TMDB datasets.

---

## Directory Structure

```
Mello/
├── .env                       # Frontend environment variables (VITE_*)
├── .gitignore                 # Root gitignore
├── AGENTS.md                  # This documentation file
├── eslint.config.js           # Flat ESLint configuration
├── index.html                 # Vite HTML entrypoint
├── package.json               # Frontend dependencies & npm scripts
├── vite.config.js             # Vite config with React & Tailwind plugins
│
├── src/                       # Frontend React Application
│   ├── main.jsx               # React DOM entry point
│   ├── App.jsx                # Route definitions (/ , /auth, /onboarding, /dashboard, etc.)
│   ├── index.css              # Global styles, color tokens, scrollbars
│   ├── App.css                # Component styles
│   ├── SupabaseClient.js      # Supabase JS client helper (legacy)
│   ├── assets/                # Static images and hero media
│   ├── pages/
│   │   ├── Landing.jsx        # Landing page with ambient glow, cursor, philosophy
│   │   ├── Auth.jsx           # Sign-in, sign-up, magic link, forgot password
│   │   ├── AuthCallback.jsx   # OAuth redirect handler & magic link verification
│   │   ├── ResetPassword.jsx  # Password reset form
│   │   ├── Onboarding.jsx     # Step 1: City geocoding; Step 2: Media taste curation
│   │   └── Dashboard.jsx      # Circle feeds, member sidebar, posting, reacting, circle rename
│   ├── ui/
│   │   ├── CustomCursor.jsx   # Interactive fluid blob cursor
│   │   └── LocationInput.jsx  # Legacy / unused Mapbox search component
│   └── utils/
│       ├── api.js             # Centralized fetch client for all backend endpoints
│       ├── circles.js         # Circle-related API helpers
│       └── matching.js        # Matching invocation helper
│
└── backend/                   # Python FastAPI Backend
    ├── .env                   # Backend secrets (DATABASE_URL, SMTP_*, API keys)
    ├── main.py                # FastAPI app creation, middleware, exception handlers, router mounts
    ├── database.py            # SQLAlchemy engine, session maker, DB dependency, column migrations
    ├── models.py              # SQLAlchemy ORM models (User, Circle, Post, Interest, ContentCache, etc.)
    ├── schemas.py             # Pydantic request/response schemas and validators
    ├── auth.py                # JWT creation/verification, password hashing, get_current_user dependency
    ├── exceptions.py          # Custom HTTP exceptions and global handlers
    ├── email_utils.py         # Low-level async email sending utility
    ├── matching.py            # Legacy / prototype matching function
    ├── notebooks/             # ML / collaborative filtering experiments
    ├── repositories/          # Data Access Layer (Repository Pattern)
    │   ├── base.py            # Generic BaseRepository[ModelType]
    │   ├── user_repo.py       # User queries, location updates, preloaded interests
    │   ├── content_repo.py    # ContentCache queries, external content caching
    │   ├── interest_repo.py   # User interest queries and bulk creation
    │   ├── circle_repo.py     # Circle enrichment, bulk membership, posts, reactions
    │   └── match_repo.py      # Match score upserting and retrieval
    ├── routes/                # FastAPI APIRouter endpoints
    │   ├── auth_routes.py     # /auth/register, /auth/login, /auth/me
    │   ├── oauth_routes.py    # Re-exports router from services.oauth_routes
    │   ├── content_routes.py  # /content/search/* (TMDB, Spotify, Books), /content/interests
    │   ├── circle_routes.py   # /circles/mine, /circles/{id}/posts, /circles/posts/react, rename
    │   └── matching_routes.py # /match/run (city-based interest overlap matching algorithm)
    └── services/
        ├── google_oauth.py    # Google OAuth 2.0 authorization URL & token exchange
        ├── email_services.py  # HTML email templating for magic links and password reset
        └── oauth_routes.py    # OAuth, magic link, and password reset route handlers
```

---

## Database Models & Relationships

Key tables defined in `backend/models.py`:
- `users`: User profiles with `email`, `hashed_password`, `name`, `bio`, `avatar_url`, `city`, `state`, `country`, `is_active`, `last_seen_at`.
- `content_cache`: Cached external media items (`external_id`, `source`, `title`, `cover_image`, `release_year`, `description`, `extra_data`).
- `interests`: Junction between `users` and `content_cache` (`category`, `rating` 1-5, `status`, `is_favorite`).
- `circles`: Micro-communities grouped by `category` ('movies', 'shows', 'music', 'books') and `city`, with `max_members` (default 40).
- `circle_members`: Join table tracking users in circles and their roles.
- `posts`: Content shared in circles (`thought` or linked to `content_id`), with soft-delete support (`is_deleted`).
- `reactions`: Reactions on posts (`resonate`, `love`, `intrigued`), unique per user per post.
- `matches`: Calculated overlap between two users in a category (`score`, `common_content`).
- `oauth_accounts`: Third-party OAuth provider mappings (e.g. Google).
- `auth_tokens`: Expiring tokens for magic links and password resets.

---

## Development Workflows

### 1. Environment Variables

#### Frontend (`.env` in repo root):
```env
VITE_GEOAPIFY_KEY=<geoapify_api_key_for_city_search>
VITE_SUPABASE_URL=<optional_legacy>
VITE_SUPABASE_ANON_KEY=<optional_legacy>
```

#### Backend (`backend/.env`):
```env
DATABASE_URL=postgresql://<user>:<password>@<host>:<port>/<dbname>
FRONTEND_URL=http://localhost:5173
SECRET_KEY=<jwt_secret_key>

# OAuth & External APIs
GOOGLE_CLIENT_ID=<google_oauth_client_id>
GOOGLE_CLIENT_SECRET=<google_oauth_client_secret>
GOOGLE_REDIRECT_URI=http://localhost:8000/auth/google/callback

TMDB_KEY=<tmdb_api_key>
SPOTIFY_CLIENT_ID=<spotify_client_id>
SPOTIFY_CLIENT_SECRET=<spotify_client_secret>
GOOGLE_BOOKS_KEY=<google_books_api_key>

# SMTP Configuration
SMTP_HOST=<smtp_host>
SMTP_PORT=587
SMTP_USERNAME=<smtp_username>
SMTP_PASSWORD=<smtp_password>
SMTP_FROM=<from_email_address>
```

### 2. Frontend Commands
From repo root:
```bash
# Install dependencies
npm install

# Start Vite dev server (defaults to port 5173)
npm run dev

# Build for production (output to dist/)
npm run build

# Preview production build
npm run preview

# Run ESLint
npm run lint
```

### 3. Backend Commands
From repo root:
```bash
# Activate virtual environment
source backend/venv/bin/activate  # or .venv/bin/activate

# IMPORTANT: Always set PYTHONPATH to backend or cd into backend/ first
cd backend
uvicorn main:app --reload --port 8000

# Syntax compilation check for backend files
python -m py_compile main.py models.py database.py schemas.py auth.py
```

---

## Core Conventions & Important Gotchas

1. **Working Directory & Python Imports**:
   Backend files rely on unqualified imports (`from database import get_db`, `from models import User`, `from repositories import ...`).
   - If invoking commands from repo root, prefix with `PYTHONPATH=backend`.
   - When running the Uvicorn server, execute inside the `backend/` directory (`cd backend && uvicorn main:app --reload`).

2. **Database Startup Behavior**:
   `backend/main.py` calls `database.ensure_required_columns()` upon import/startup. This runs raw SQL `ALTER TABLE IF EXISTS users ADD COLUMN IF NOT EXISTS city...` to ensure schema compatibility. A valid, reachable PostgreSQL connection is expected when starting the API.

3. **Repository Pattern**:
   All database operations in route handlers should go through the `repositories/` layer (`UserRepository`, `CircleRepository`, `ContentRepository`, `InterestRepository`, `MatchRepository`). Avoid writing inline ORM queries in route functions whenever a repository method exists.

4. **Matching Logic**:
   The active matching implementation lives in `backend/routes/matching_routes.py` (which uses repository methods for batch processing). Note that `backend/matching.py` is an earlier prototype script that references non-existent models (`Profile`) and should not be used.

5. **Known Project Quirks & Cleanup Notes**:
   - `src/pages/ResetPassword.py` and `src/pages/AuthCallback.py` are duplicate files with a `.py` extension containing React JSX.
   - `src/ui/LocationInput.jsx` contains duplicated code from copy-pasting and is currently not imported anywhere (the app uses Geoapify fetch in `Onboarding.jsx`).
   - `backend/__pycache__/*.pyc` files were previously committed to Git and should be untracked (`git rm --cached`).
   - `backend/gitignore` is an empty folder created by mistake.
   - `backend/routes/auth_routes.py` has a duplicate `login` handler definition (one has debug logging).
   - In `backend/main.py`, redundant magic link routes exist on lines 75-163 while `backend/services/oauth_routes.py` provides the canonical implementation for magic links and password resets.
