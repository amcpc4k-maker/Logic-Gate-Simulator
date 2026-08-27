import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# Pull connection string from environment
DATABASE_URL = os.getenv("DATABASE_URL")

# Fall back to SQLite in-memory so top-level imports won't crash Vercel
if not DATABASE_URL:
    DATABASE_URL = "sqlite:///:memory:"

# Replace legacy postgres:// prefix if using Supabase / Heroku
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

connect_args = {"check_same_thread": False} if "sqlite" in DATABASE_URL else {}

engine = create_engine(DATABASE_URL, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
        
