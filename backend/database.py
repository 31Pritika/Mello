from sqlalchemy import create_engine #connects python to the database
from sqlalchemy.orm import declarative_base, sessionmaker #declarative_base is used to create the base class for the ORM #sessionmaker is used to db session factory
from dotenv import load_dotenv
import os

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False) #bind is basically connecting session to db, autocommit has to be done manually, autoflush is false because we want to control when to flush the changes to the db
Base = declarative_base()

def get_db(): #create a new db session for each request and close it after the request is done
    db = SessionLocal()
    try:
        yield db #pause here and give it to the route
    finally:
        db.close()