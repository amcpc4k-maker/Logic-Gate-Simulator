import sys
import os
import random
from typing import Optional
from pydantic import BaseModel

# Force Python to locate your backend files
current_dir = os.path.dirname(os.path.abspath(__file__))
root_dir = os.path.abspath(os.path.join(current_dir, ".."))
backend_dir = os.path.join(root_dir, "backend")

if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)
if root_dir not in sys.path:
    sys.path.insert(0, root_dir)

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic Schemas
class PuzzleResponse(BaseModel):
    question: str
    answer: str
    category: str

class ScoreSubmission(BaseModel):
    user_id: int
    score: int

# Trivia Question Bank
TRIVIA_QUESTIONS = [
    {
        "question": "How many planets are in our solar system?",
        "answer": "8",
        "category": "Astronomy"
    },
    {
        "question": "What is the capital of France?",
        "answer": "PARIS",
        "category": "Geography"
    },
    {
        "question": "What chemical element does 'O' represent?",
        "answer": "OXYGEN",
        "category": "Science"
    },
    {
        "question": "In what year did Apollo 11 land on the Moon?",
        "answer": "1969",
        "category": "History"
    },
    {
        "question": "Which snake-haired monster turns people to stone in Greek myth?",
        "answer": "MEDUSA",
        "category": "Mythology"
    }
]

@app.get("/api/health")
def health_check():
    return {"status": "ok"}

# Updated Puzzle Route using Pydantic response model
@app.get("/api/puzzles/random", response_model=PuzzleResponse)
def get_random_puzzle():
    selected_puzzle = random.choice(TRIVIA_QUESTIONS)
    return selected_puzzle

# Endpoint to handle frontend score submissions
@app.post("/api/scores/submit")
def submit_score(submission: ScoreSubmission):
    try:
        from database import save_user_score
        result = save_user_score(submission.user_id, submission.score)
        return {"status": "success", "data": result}
    except Exception as e:
        # Fallback response if database function isn't created yet
        return {"status": "received", "user_id": submission.user_id, "score": submission.score}

@app.get("/api/leaderboard")
def get_leaderboard():
    try:
        from database import fetch_leaderboard
        return fetch_leaderboard()
    except Exception as e:
        return []
        
