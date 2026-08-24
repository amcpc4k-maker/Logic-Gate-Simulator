from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from pydantic import BaseModel
import random


from database import get_db, save_game_score, fetch_leaderboard, User
from gameApp import game_instance, get_daily_question, check_daily_answer

app = FastAPI(title="Hangman API")


# Allow React frontend to make requests (CORS setup)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust if using a specific frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ------------------------------------------------------------------
# Request Pydantic Schemas
# ------------------------------------------------------------------
class GuessRequest(BaseModel):
    letter: str
    user_id: int | None = None

class DailyAnswerRequest(BaseModel):
    question_id: int
    user_choice: str

class UserCreateRequest(BaseModel):
    username: str
    password: str

# ------------------------------------------------------------------
# 1. User Endpoints
# ------------------------------------------------------------------
@app.post("/api/users/register")
def register_user(payload: UserCreateRequest, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.username == payload.username).first()
    if existing:
        raise HTTPException(status_code=400, detail="Username already taken")
    
    # In production, hash password before saving (e.g. using passlib / bcrypt)
    new_user = User(username=payload.username, password_hash=payload.password)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return {"id": new_user.id, "username": new_user.username}


# ------------------------------------------------------------------
# 2. Hangman Game Endpoints
# ------------------------------------------------------------------
@app.get("/api/game/state")
def get_game_state():
    return game_instance.get_state()

@app.post("/api/game/reset")
def reset_game():
    return game_instance.reset()

@app.post("/api/game/guess")
def make_guess(payload: GuessRequest, db: Session = Depends(get_db)):
    state = game_instance.guess(payload.letter)
    
    # Save score if user won and provided user_id
    if state["game_over"] and state["won"] and payload.user_id:
        score_val = game_instance.calculate_score()
        save_game_score(db, payload.user_id, score_val)
        
    return state


# ------------------------------------------------------------------
# 3. Leaderboard & Daily Question Endpoints
# ------------------------------------------------------------------
@app.get("/api/leaderboard")
def get_leaderboard(db: Session = Depends(get_db)):
    return fetch_leaderboard(db)

@app.get("/api/daily-question")
def daily_question():
    return get_daily_question()

@app.post("/api/daily-question/answer")
def answer_daily_question(payload: DailyAnswerRequest):
    return check_daily_answer(payload.question_id, payload.user_choice)

class ScoreSubmitRequest(BaseModel):
    user_id: int
    score: int

@app.post("/api/scores/submit")
def submit_score(payload: ScoreSubmitRequest, db: Session = Depends(get_db)):
    # Insert new score entry tied to user_id
    new_score = Score(
        user_id=payload.user_id,
        score=payload.score
    )
    db.add(new_score)
    db.commit()
    db.refresh(new_score)
    return {"message": "Score submitted successfully!", "score_id": new_score.id}

    import random

WORD_BANK = [
    {"word": "PHOTOSYNTHESIS", "category": "Science", "hint": "The process plants use to convert light energy into chemical energy."},
    {"word": "GRAVITY", "category": "Physics", "hint": "The fundamental force attracting a body toward the center of the earth."},
    {"word": "OXYGEN", "category": "Chemistry", "hint": "An essential chemical element for human respiration with atomic number 8."},
    {"word": "JAVASCRIPT", "category": "Programming", "hint": "The primary scripting language used to build dynamic web applications."}
]

@app.get("/api/puzzles/random")
def get_random_puzzle():
    return random.choice(WORD_BANK)
