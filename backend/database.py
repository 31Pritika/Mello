from sqlalchemy import create_engine, text #connects python to the database
from sqlalchemy.orm import declarative_base, sessionmaker #declarative_base is used to create the base class for the ORM #sessionmaker is used to db session factory
from dotenv import load_dotenv
import os

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise RuntimeError("DATABASE_URL is not set. Check backend/.env or your environment configuration.")

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False) #bind is basically connecting session to db, autocommit has to be done manually, autoflush is false because we want to control when to flush the changes to the db
Base = declarative_base() #parent of all models


def ensure_required_columns():
    """Backfill columns expected by the ORM against the live database schema."""
    statements = [
        "ALTER TABLE IF EXISTS users ADD COLUMN IF NOT EXISTS city TEXT;",
        "ALTER TABLE IF EXISTS users ADD COLUMN IF NOT EXISTS state TEXT;",
        "ALTER TABLE IF EXISTS users ADD COLUMN IF NOT EXISTS country TEXT;",
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