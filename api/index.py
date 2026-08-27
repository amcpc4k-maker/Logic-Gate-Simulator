import sys
import os
import random

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

# Test route to verify api is alive
@app.get("/api/health")
def health_check():
    return {"status": "ok"}

# Puzzle Route (Matches what frontend fetches)
@app.get("/api/puzzles/random")
def get_random_puzzle():
    return {
        "word": "HANGMAN",
        "category": "Classic Game",
        "hint": "Guess the letters before running out of attempts"
    }

# Leaderboard Route (Matches what frontend fetches)
@app.get("/api/leaderboard")
def get_leaderboard():
    try:
        from database import fetch_leaderboard
        return fetch_leaderboard()
    except Exception as e:
        # Fallback empty list if DB isn't connected yet so app doesn't crash
        return []
        
