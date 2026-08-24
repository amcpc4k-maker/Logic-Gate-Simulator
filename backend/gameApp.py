import random
from datetime import date
from database import save_game_score, get_db


# Words pool for the Hangman game
HANGMAN_WORDS = ["Quidbits", "Tech", "bytes", "database", "FASTAPI", "PYTHON", "Data"]


class HangmanGame:
    def __init__(self):
        self.reset()

    def reset(self):
        # Always convert chosen word to UPPERCASE so user guesses match reliably
        self.word = random.choice(HANGMAN_WORDS).upper()
        self.guessed_letters = set()
        self.max_attempts = 6
        self.wrong_guesses = 0
        self.game_over = False
        self.won = False
        return self.get_state()

    def guess(self, letter: str):
        letter = letter.upper()
        if self.game_over or letter in self.guessed_letters:
            return self.get_state()

        self.guessed_letters.add(letter)

        if letter not in self.word:
            self.wrong_guesses += 1
            if self.wrong_guesses >= self.max_attempts:
                self.game_over = True
                self.won = False
        else:
            if all(char in self.guessed_letters for char in self.word):
                self.game_over = True
                self.won = True

        return self.get_state()

    def get_state(self):
        display_word = [char if char in self.guessed_letters else "_" for char in self.word]
        return {
            "display_word": " ".join(display_word),
            "attempts_remaining": self.max_attempts - self.wrong_guesses,
            "guessed_letters": list(self.guessed_letters),
            "game_over": self.game_over,
            "won": self.won,
            "secret_word": self.word if self.game_over else None,
            "wrong_guesses": self.wrong_guesses  # Pass to React for stick figure rendering
        }


# Global single-player instance
game_instance = HangmanGame()


# --- Daily Questions Data ---
DAILY_QUESTIONS = [
    {
        "id": 1,
        "question": "Which term best describes cloud computing?",
        "options": ["Mobile", "Software", "Data"],
        "answer": "Mobile"
    },
    {
        "id": 2,
        "question": "What term best describes a collection of data that is organized?",
        "options": ["Information", "Hardware", "Protocol", "Syntax"],
        "answer": "Information"
    },
    {
        "id": 3,
        "question": "Which term best describes how Quantum Computing data is measured?",
        "options": ["Qubits", "Bytes", "Gates", "Nodes"],
        "answer": "Qubits"
    },
    {
        "id": 4,
        "question": "What is the term used when checking for positive input validation?",
        "options": ["Boolean", "String", "Integer", "Float"],
        "answer": "Boolean"
    }
]


def get_daily_question():
    day_of_year = date.today().timetuple().tm_yday
    question_index = day_of_year % len(DAILY_QUESTIONS)
    
    question_data = DAILY_QUESTIONS[question_index].copy()
    question_data.pop("answer")  # Omit answer from frontend payload
    
    return question_data


def check_daily_answer(question_id: int, user_choice: str):
    for q in DAILY_QUESTIONS:
        if q["id"] == question_id:
            # Case-insensitive check to prevent false negatives
            is_correct = (q["answer"].strip().lower() == user_choice.strip().lower())
            return {
                "correct": is_correct,
                "message": "Correct! Great job." if is_correct else f"Incorrect. The right answer was: {q['answer']}"
            }
    return {"correct": False, "message": "Question not found."}


def calculate_score(self):
    """Calculates points based on attempts left."""
    if self.won:
        return 50 + (self.max_attempts - self.wrong_guesses) * 20
    return 0

def guess(self, letter: str, user_id: int = None, db = None):
  
    # Save to DB when game ends
    if self.game_over and self.won and user_id and db:
        final_score = self.calculate_score()
        save_game_score(db, user_id, final_score)

    return self.get_state()
