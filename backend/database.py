from sqlalchemy import create_engine, Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.orm import sessionmaker, declarative_base, Session
from sqlalchemy.sql import func


# Database Connection URL
DATABASE_URL = "postgresql://postgres@localhost:5432/hangman_db"

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# ==========================================
# TABLE MODELS
# ==========================================
class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    created_at = Column(DateTime, server_default=func.now())

class Score(Base):
    __tablename__ = "scores"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    score = Column(Integer, nullable=False)
    created_at = Column(DateTime, server_default=func.now())

# Automatically create tables in PostgreSQL if they don't exist
Base.metadata.create_all(bind=engine)


# ==========================================
# DATABASE HELPER FUNCTIONS
# ==========================================
def get_db():
    """Generates a database session for API routes."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def save_game_score(db: Session, user_id: int, score_value: int):
    """Inserts a new score record into PostgreSQL."""
    new_score = Score(user_id=user_id, score=score_value)
    db.add(new_score)
    db.commit()
    db.refresh(new_score)
    return new_score

def fetch_leaderboard(db: Session, limit: int = 10):
    """Queries top scores joined with usernames."""
    results = (
        db.query(User.username, Score.score, Score.created_at)
        .join(Score, User.id == Score.user_id)
        .order_by(Score.score.desc())
        .limit(limit)
        .all()
    )
    return [
        {"username": row[0], "score": row[1], "date": row[2].strftime("%Y-%m-%d %H:%M")}
        for row in results
    ]
