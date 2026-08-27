import os
import sys
import random
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from pydantic import BaseModel

# Ensure Python can locate backend modules in serverless context
sys.path.append(os.path.dirname(__file__))

from database import get_db, save_game_score, fetch_leaderboard, User, Score
from gameApp import game_instance, get_daily_question, check_daily_answer

app = FastAPI(title="Hangman API")

# Enable CORS for React frontend cross-origin requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
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

class ScoreSubmitRequest(BaseModel):
    user_id: int
    score: int

# ------------------------------------------------------------------
# 0. Base API Health Check
# ------------------------------------------------------------------
@app.get("/api")
def api_root():
    return {"status": "ok", "message": "Hangman API Server Running"}

# ------------------------------------------------------------------
# 1. User Endpoints
# ------------------------------------------------------------------
@app.post("/api/users/register")
def register_user(payload: UserCreateRequest, db: Session = Depends(get_db)):
    try:
        existing = db.query(User).filter(User.username == payload.username).first()
        if existing:
            raise HTTPException(status_code=400, detail="Username already taken")
        
        new_user = User(username=payload.username, password_hash=payload.password)
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        return {"id": new_user.id, "username": new_user.username}
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

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
        try:
            score_val = game_instance.calculate_score()
            save_game_score(db, payload.user_id, score_val)
        except Exception as e:
            print(f"Failed to record score: {e}")
            
    return state

# ------------------------------------------------------------------
# 3. Leaderboard, Daily Question & Puzzles
# ------------------------------------------------------------------
@app.get("/api/leaderboard")
def get_leaderboard(db: Session = Depends(get_db)):
    try:
        return fetch_leaderboard(db)
    except Exception as e:
        print(f"Leaderboard fetch error: {e}")
        # Return fallback list rather than throwing HTML 500
        return []

@app.get("/api/daily-question")
def daily_question():
    return get_daily_question()

@app.post("/api/daily-question/answer")
def answer_daily_question(payload: DailyAnswerRequest):
    return check_daily_answer(payload.question_id, payload.user_choice)

@app.post("/api/scores/submit")
def submit_score(payload: ScoreSubmitRequest, db: Session = Depends(get_db)):
    try:
        new_score = Score(
            user_id=payload.user_id,
            score=payload.score
        )
        db.add(new_score)
        db.commit()
        db.refresh(new_score)
        return {"message": "Score submitted successfully!", "score_id": new_score.id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to submit score: {str(e)}")

WORD_BANK = [
    {"word": "PHOTOSYNTHESIS", "category": "Science", "hint": "The process plants use to convert light energy into chemical energy."},
    {"word": "GRAVITY", "category": "Physics", "hint": "The fundamental force attracting a body toward the center of the earth."},
    {"word": "OXYGEN", "category": "Chemistry", "hint": "An essential chemical element for human respiration with atomic number 8."},
    {"word": "JAVASCRIPT", "category": "Programming", "hint": "The primary scripting language used to build dynamic web applications."}
]

@app.get("/api/puzzles/random")
def get_random_puzzle():
    return random.choice(WORD_BANK)
    
