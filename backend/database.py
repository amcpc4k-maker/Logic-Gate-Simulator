import os
from sqlalchemy import create_engine, Column, Integer, String, ForeignKey, DateTime, func
from sqlalchemy.orm import sessionmaker, declarative_base, relationship


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

# --- DATABASE MODELS ---

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, nullable=False)
    scores = relationship("Score", back_populates="user")

class Score(Base):
    __tablename__ = "scores"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    score = Column(Integer, nullable=False, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="scores")

# Automatically create tables if they don't exist yet
Base.metadata.create_all(bind=engine)

# --- HELPER FUNCTIONS ---

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def save_user_score(user_id: int, score_value: int):
    """Saves a new score entry for a user."""
    db = SessionLocal()
    try:
        new_score = Score(user_id=user_id, score=score_value)
        db.add(new_score)
        db.commit()
        db.refresh(new_score)
        return {"id": new_score.id, "user_id": new_score.user_id, "score": new_score.score}
    except Exception as e:
        db.rollback()
        raise e
    finally:
        db.close()

def fetch_leaderboard(limit: int = 10):
    """Returns top scores joined with user details for the leaderboard."""
    db = SessionLocal()
    try:
        results = (
            db.query(User.username, Score.score, Score.created_at)
            .join(Score, User.id == Score.user_id)
            .order_by(Score.score.desc())
            .limit(limit)
            .all()
        )
        
        leaderboard = [
            {"username": row.username, "score": row.score, "created_at": str(row.created_at)}
            for row in results
        ]
        return leaderboard
    finally:
        db.close()
