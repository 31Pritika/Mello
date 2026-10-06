from sqlalchemy import create_engine, text #connects python to the database
from sqlalchemy.orm import declarative_base, sessionmaker #declarative_base is used to create the base class for the ORM #sessionmaker is used to db session factory
from dotenv import load_dotenv
import os

load_dotenv(os.path.join(os.path.dirname(__file__), ".env"))

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise RuntimeError("DATABASE_URL is not set. Check backend/.env or your environment configuration.")

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False) #bind is basically connecting session to db, autocommit has to be done manually, autoflush is false because we want to control when to flush the changes to the db
Base = declarative_base() #parent of all models


def ensure_required_columns():
    """Backfill columns expected by the ORM against the live database schema."""
    statements = [
        # users
        "ALTER TABLE IF EXISTS users ADD COLUMN IF NOT EXISTS city TEXT;",
        "ALTER TABLE IF EXISTS users ADD COLUMN IF NOT EXISTS state TEXT;",
        "ALTER TABLE IF EXISTS users ADD COLUMN IF NOT EXISTS country TEXT;",
        # circles
        "ALTER TABLE IF EXISTS circles ADD COLUMN IF NOT EXISTS city TEXT;",
        "ALTER TABLE IF EXISTS circles ADD COLUMN IF NOT EXISTS state TEXT;",
        "ALTER TABLE IF EXISTS circles ADD COLUMN IF NOT EXISTS country TEXT;",
        "ALTER TABLE IF EXISTS circles ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'general';",
        "ALTER TABLE IF EXISTS circles ADD COLUMN IF NOT EXISTS name TEXT;",
        "ALTER TABLE IF EXISTS circles ADD COLUMN IF NOT EXISTS description TEXT;",
        "ALTER TABLE IF EXISTS circles ADD COLUMN IF NOT EXISTS max_members INTEGER DEFAULT 40;",
        "ALTER TABLE IF EXISTS circles ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;",
        # matches
        "ALTER TABLE IF EXISTS matches ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'general';",
        "ALTER TABLE IF EXISTS matches ADD COLUMN IF NOT EXISTS common_content JSONB DEFAULT '[]'::jsonb;",
        # content_cache & interests
        "ALTER TABLE IF EXISTS content_cache ADD COLUMN IF NOT EXISTS extra_data JSONB DEFAULT '{}'::jsonb;",
        "ALTER TABLE IF EXISTS interests ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'general';",
    ]
    with engine.begin() as conn:
        for statement in statements:
            conn.execute(text(statement))


def get_db(): #create a new db session for each request and close it after the request is done
    db = SessionLocal()
    try:
        yield db #pause here and give it to the route
    finally:
        db.close()