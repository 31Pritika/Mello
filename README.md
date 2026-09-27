# mello — Taste Collective

**Mello** is a cultural taste-matching and micro-community web application. You build a personal taste profile by saving movies, TV shows, music artists, and books you love. Mello automatically finds people in your city who share overlapping tastes and places you into intimate, curated groups called **Circles** (max 40 members). Inside Circles, members post thoughts and react with resonance-based emotions: **resonate**, **love**, and **intrigued**.

---

## Features

-  **Taste profiling** — curate your favorites across Cinema, Shows, Music, and Books
-  **City-based matching** — automatically matched with people who share your tastes in your city
-  **Circles** — intimate community spaces (≤ 40 people) grouped by city + category
-  **Circle feeds** — post thoughts and react to others' posts
-  **Multiple auth options** — email/password, Google OAuth, and passwordless magic links
-  **Password reset** — secure reset via email link

---

## Tech Stack

| Layer | Technology |
|:------|:-----------|
| **Frontend** | React 19, Vite 8, Tailwind CSS v4, React Router v7, Framer Motion |
| **Backend** | FastAPI, Uvicorn, SQLAlchemy 2.0, PostgreSQL |
| **Auth** | JWT (python-jose), bcrypt (passlib), Google OAuth 2.0 (Authlib) |
| **Email** | aiosmtplib (async SMTP) |
| **External APIs** | TMDB, Spotify Web API, Google Books API, Geoapify (city search) |

---

## Prerequisites

Before starting, ensure you have the following installed:

| Software | Minimum Version | Check Command |
|:---------|:----------------|:--------------|
| **Git** | 2.x | `git --version` |
| **Node.js** | 18.x | `node --version` |
| **npm** | 9.x | `npm --version` |
| **Python** | 3.11+ | `python3 --version` |
| **PostgreSQL** | 14.x | `psql --version` |

---

## Environment Variables

You need two `.env` files — one for the frontend and one for the backend.

### Frontend — `.env` (at repo root)

```env
VITE_GEOAPIFY_KEY=your_geoapify_api_key
```

> **Geoapify** powers the city autocomplete during onboarding. Get a free key at [geoapify.com](https://www.geoapify.com/).

### Backend — `backend/.env`

```env
# Database
DATABASE_URL=postgresql://username:password@localhost:5432/mello_db

# JWT
SECRET_KEY=your-random-secret-key-here

# Frontend URL (used in email links)
FRONTEND_URL=http://localhost:5173

# Google OAuth (optional — needed for Google sign-in)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=http://localhost:8000/auth/google/callback

# External Content APIs
TMDB_KEY=your_tmdb_api_key
SPOTIFY_CLIENT_ID=your_spotify_client_id
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
GOOGLE_BOOKS_KEY=your_google_books_api_key

# SMTP (for magic links and password reset emails)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your_email@gmail.com
SMTP_PASSWORD=your_app_password
SMTP_FROM=your_email@gmail.com
```

---

## Setup & Installation

### Clone the repository

```bash
git clone https://github.com/31Pritika/Mello.git
cd Mello
```

---

### A — Frontend Setup

#### macOS / Linux / WSL

```bash
# Install Node.js dependencies
npm install

# Create the frontend .env file
cp .env.example .env     # then edit .env and add your VITE_GEOAPIFY_KEY
# OR create it manually:
echo "VITE_GEOAPIFY_KEY=your_key_here" > .env
```

#### Windows (PowerShell)

```powershell
# Install Node.js dependencies
npm install

# Create the frontend .env file
echo "VITE_GEOAPIFY_KEY=your_key_here" | Out-File -Encoding utf8 .env
```

#### Windows (CMD)

```cmd
npm install
echo VITE_GEOAPIFY_KEY=your_key_here > .env
```

---

### B — Backend Setup

#### macOS / Linux / WSL

```bash
# Navigate to the backend directory
cd backend

# Create a Python virtual environment
python3 -m venv venv

# Activate the virtual environment
source venv/bin/activate

# Install all Python dependencies
pip install -r requirements.txt

# Create the backend .env file and fill in your values
cp .env.example .env   # then edit .env
# OR create it manually with nano/vim:
nano .env
```

#### Windows (PowerShell)

```powershell
# Navigate to the backend directory
cd backend

# Create a Python virtual environment
python -m venv venv

# Activate the virtual environment
.\venv\Scripts\Activate.ps1

# If you get an execution policy error, run this first:
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# Install all Python dependencies
pip install -r requirements.txt

# Create the backend .env file (then open and fill in your values)
New-Item -Name ".env" -ItemType File
notepad .env
```

#### Windows (CMD)

```cmd
cd backend

python -m venv venv

venv\Scripts\activate.bat

pip install -r requirements.txt

copy NUL .env
notepad .env
```

---

### C — Database Setup

Mello requires a running PostgreSQL instance. Create a database for the project:

#### macOS / Linux / WSL

```bash
# Log in to PostgreSQL
psql -U postgres

# Inside psql, create the database and exit
CREATE DATABASE mello_db;
\q

# Update DATABASE_URL in backend/.env:
# DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/mello_db
```

#### Windows (PowerShell / CMD)

```powershell
# Open psql (adjust path if needed)
& "C:\Program Files\PostgreSQL\16\bin\psql.exe" -U postgres

# Inside psql:
# CREATE DATABASE mello_db;
# \q
```

> **Note**: Table creation and schema migrations happen **automatically** on backend startup — you do not need to run any migration scripts manually.

---

## Running the Application

You need two terminal windows/tabs running simultaneously.

### Terminal 1 — Start the Backend API

#### macOS / Linux / WSL

```bash
# From the repo root, navigate to backend
cd backend

# Activate the virtual environment (if not already active)
source venv/bin/activate

# Start the FastAPI server
uvicorn main:app --reload --port 8000
```

#### Windows (PowerShell)

```powershell
cd backend
.\venv\Scripts\Activate.ps1
uvicorn main:app --reload --port 8000
```

#### Windows (CMD)

```cmd
cd backend
venv\Scripts\activate.bat
uvicorn main:app --reload --port 8000
```

The backend API will be available at: **http://localhost:8000**  
Interactive API docs (Swagger UI): **http://localhost:8000/docs**

---

### Terminal 2 — Start the Frontend Dev Server

#### macOS / Linux / WSL / Windows

```bash
# From the repo root
npm run dev
```

The frontend will be available at: **http://localhost:5173**

---

## User Flow

1. **Landing page** → `http://localhost:5173/`
2. **Sign up or log in** → `/auth`
3. **Onboarding** → Pick your city, then search & save your favorite movies, shows, music artists, and books
4. **Dashboard** → Your Circles appear automatically as matches are found in your city

---

## Project Structure

```
Mello/
│
├── .env                        # Frontend environment variables (VITE_*)
├── index.html                  # Vite HTML entrypoint
├── package.json                # Node.js dependencies and npm scripts
├── vite.config.js              # Vite + React + Tailwind configuration
├── eslint.config.js            # ESLint flat configuration
│
├── src/                        # React frontend source
│   ├── main.jsx                # React DOM entry — mounts <App />
│   ├── App.jsx                 # Client-side route definitions
│   ├── index.css               # Global styles and design tokens
│   │
│   ├── pages/
│   │   ├── Landing.jsx         # Landing page (animated glow, philosophy)
│   │   ├── Auth.jsx            # Login, register, magic link, forgot password
│   │   ├── AuthCallback.jsx    # Google OAuth & magic link redirect handler
│   │   ├── ResetPassword.jsx   # Password reset form
│   │   ├── Onboarding.jsx      # City selection + media taste curation
│   │   └── Dashboard.jsx       # Circle feeds, posting, reactions, renaming
│   │
│   ├── ui/
│   │   └── CustomCursor.jsx    # Framer Motion animated cursor blob
│   │
│   └── utils/
│       ├── api.js              # All fetch calls to the backend (JWT auth)
│       ├── circles.js          # Circle API re-exports
│       └── matching.js         # Helper to trigger circle matching
│
└── backend/                    # Python FastAPI backend
    ├── .env                    # Backend secrets and configuration
    ├── requirements.txt        # Python package dependencies
    ├── main.py                 # FastAPI app, middleware, router mounts
    ├── database.py             # SQLAlchemy engine, session, auto-migrations
    ├── models.py               # ORM models: User, Circle, Post, Interest, etc.
    ├── schemas.py              # Pydantic request/response schemas
    ├── auth.py                 # JWT utils, password hashing, auth dependency
    ├── exceptions.py           # Custom HTTP exceptions and global handlers
    ├── email_utils.py          # Low-level async SMTP send helper
    │
    ├── repositories/           # Data access layer (Repository Pattern)
    │   ├── base.py             # Generic BaseRepository with CRUD methods
    │   ├── user_repo.py        # User queries (by email, city, location update)
    │   ├── content_repo.py     # ContentCache — external media caching layer
    │   ├── interest_repo.py    # User interests (bulk create, category queries)
    │   ├── circle_repo.py      # Circles, members, posts, reactions
    │   └── match_repo.py       # Match score upsert and retrieval
    │
    ├── routes/                 # FastAPI routers (API endpoints)
    │   ├── auth_routes.py      # POST /auth/register, /auth/login, GET /auth/me
    │   ├── oauth_routes.py     # Re-exports from services/oauth_routes.py
    │   ├── content_routes.py   # GET /content/search/*, POST /content/interests
    │   ├── circle_routes.py    # GET /circles/mine, posts, reactions, rename
    │   └── matching_routes.py  # POST /match/run (city-based circle matching)
    │
    └── services/
        ├── google_oauth.py     # Google OAuth URL generation and token exchange
        ├── email_services.py   # Magic link & password reset HTML email sending
        └── oauth_routes.py     # OAuth, magic link, and password reset endpoints
```

---

## Available API Endpoints

| Method | Endpoint | Description |
|:-------|:---------|:------------|
| `GET` | `/` | Health check |
| `POST` | `/auth/register` | Register a new account |
| `POST` | `/auth/login` | Log in with email and password |
| `GET` | `/auth/me` | Get current user profile |
| `PUT` | `/auth/me` | Update profile (name, bio, city) |
| `GET` | `/auth/google` | Initiate Google OAuth flow |
| `GET` | `/auth/google/callback` | Google OAuth callback |
| `POST` | `/auth/magic-link` | Request a passwordless login link |
| `POST` | `/auth/verify-token` | Verify magic link or reset token |
| `POST` | `/auth/forgot-password` | Request password reset email |
| `POST` | `/auth/reset-password` | Set new password |
| `GET` | `/content/search/movies` | Search TMDB for movies |
| `GET` | `/content/search/shows` | Search TMDB for TV shows |
| `GET` | `/content/search/music` | Search Spotify for artists |
| `GET` | `/content/search/books` | Search Google Books |
| `POST` | `/content/interests` | Save selected interests |
| `GET` | `/content/interests` | Get current user's interests |
| `POST` | `/match/run` | Run matching and assign to circles |
| `GET` | `/circles/mine` | Get user's circles |
| `GET` | `/circles/{id}/posts` | Get posts in a circle |
| `POST` | `/circles/posts` | Create a post |
| `POST` | `/circles/posts/react` | React to a post |
| `PUT` | `/circles/{id}/rename` | Rename a circle |

---

## Useful Commands

```bash
# Frontend
npm run dev          # Start dev server
npm run build        # Production build → dist/
npm run preview      # Preview production build locally
npm run lint         # Run ESLint

# Backend (from backend/ with venv active)
uvicorn main:app --reload --port 8000    # Dev server with hot reload
python -m py_compile main.py            # Syntax check a file
```

---

## Known Quirks

- `backend/matching.py` — legacy prototype, **not used** by the running app
- `src/ui/LocationInput.jsx` — legacy Mapbox component, **not imported** anywhere
- `src/pages/ResetPassword.py` / `AuthCallback.py` — JSX files accidentally saved with `.py` extension (duplicates of the `.jsx` files; safe to ignore)
- `backend/gitignore` — an empty folder created by mistake (not a `.gitignore` file)
- `backend/__pycache__/` files are tracked in git — you may want to run `git rm --cached backend/__pycache__/` to clean this up
