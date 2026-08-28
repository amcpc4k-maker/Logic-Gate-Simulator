import hashlib
from datetime import date
from database import save_game_score, get_db


# --- Categorized Word Pool ---
WORD_CATEGORIES = {
    "Tech": [
        {"word": "FASTAPI", "hint": "A modern, fast web framework for Python"},
        {"word": "DATABASE", "hint": "Organized collection of structured information"},
        {"word": "PYTHON", "hint": "High-level programming language known for readability"},
        {"word": "QUBITS", "hint": "Basic unit of quantum information"}
    ],
    "Education": [
        {"word": "ACADEMICS", "hint": "Relating to educational or scholastic performance"},
        {"word": "CURRICULUM", "hint": "Subjects comprising a course of study"},
        {"word": "DEGREE", "hint": "Academic title conferred upon completion of study"}
    ],
    "Finance": [
        {"word": "EQUITY", "hint": "Value of shares issued by a company"},
        {"word": "PORTFOLIO", "hint": "Range of investments held by a person or organization"},
        {"word": "DIVIDEND", "hint": "Sum paid regularly by a company to its shareholders"}
    ]
}

# --- Daily Questions Database ---
DAILY_QUESTIONS = [
    {
        "id": 1,
        "category": "Tech",
        "question": "Which term best describes cloud computing infrastructure?",
        "options": ["Distributed", "Hardware", "Protocol"],
        "answer": "Distributed"
    },
    {
        "id": 2,
        "category": "Tech",
        "question": "What term best describes an organized collection of data?",
        "options": ["Database", "Hardware", "Syntax", "Protocol"],
        "answer": "Database"
    },
    {
        "id": 3,
        "category": "Tech",
        "question": "How is quantum computing information measured?",
        "options": ["Qubits", "Bytes", "Gates", "Nodes"],
        "answer": "Qubits"
    },
    {
        "id": 4,
        "category": "Education",
        "question": "What logical data type represents a binary True or False value?",
        "options": ["Boolean", "String", "Integer", "Float"],
        "answer": "Boolean"
    }
]


class HangmanGame:
    def __init__(self):
        self.reset()

    def reset(self, category: str = None):
        """
        Pulls today's daily word pseudo-randomly using today's date hash.
        Guarantees everyone gets the same daily word, but varies daily.
        """
        # Generate a deterministic index from today's date string (YYYY-MM-DD)
        today_str = str(date.today())
        date_hash = int(hashlib.md5(today_str.encode()).hexdigest(), 16)

        # Select category
        categories = list(WORD_CATEGORIES.keys())
        selected_cat = category if category in WORD_CATEGORIES else categories[date_hash % len(categories)]
        
        # Pick word from category
        pool = WORD_CATEGORIES[selected_cat]
        selected_item = pool[(date_hash // len(categories)) % len(pool)]

        self.word = selected_item["word"].upper()
        self.hint = selected_item["hint"]
        self.category = selected_cat
        self.guessed_letters = set()
        self.max_attempts = 6
        self.wrong_guesses = 0
        self.game_over = False
        self.won = False
        
        return self.get_state()

    def calculate_score(self):
        """Calculates score based on attempts left."""
        if self.won:
            return 50 + (self.max_attempts - self.wrong_guesses) * 20
        return 0

    def guess(self, letter: str, user_id: int = None, db = None):
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

        # Save to DB when game ends successfully
        if self.game_over and self.won and user_id and db:
            final_score = self.calculate_score()
            save_game_score(db, user_id, final_score)

        return self.get_state()

    def get_state(self):
        display_word = [char if char in self.guessed_letters else "_" for char in self.word]
        return {
            "category": self.category,
            "hint": self.hint,
            "display_word": " ".join(display_word),
            "attempts_remaining": self.max_attempts - self.wrong_guesses,
            "guessed_letters": list(self.guessed_letters),
            "game_over": self.game_over,
            "won": self.won,
            "secret_word": self.word if self.game_over else None,
            "wrong_guesses": self.wrong_guesses
        }


# Global single-player instance
game_instance = HangmanGame()


# --- API Fetch Utilities ---

def get_daily_question():
    """
    Fetches the daily question pseudo-randomly using today's date hash.
    """
    today_str = str(date.today())
    date_hash = int(hashlib.md5(today_str.encode()).hexdigest(), 16)
    
    question_index = date_hash % len(DAILY_QUESTIONS)
    question_data = DAILY_QUESTIONS[question_index].copy()
    question_data.pop("answer")  # Omit correct answer from payload
    
    return question_data


def check_daily_answer(question_id: int, user_choice: str):
    for q in DAILY_QUESTIONS:
        if q["id"] == question_id:
            is_correct = (q["answer"].strip().lower() == user_choice.strip().lower())
            return {
                "correct": is_correct,
                "message": "Correct! Great job." if is_correct else f"Incorrect. The right answer was: {q['answer']}"
            }
    return {"correct": False, "message": "Question not found."}
    
