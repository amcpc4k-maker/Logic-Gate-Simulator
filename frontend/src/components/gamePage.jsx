import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import '../stylesheets/app.css';

const API_BASE_URL = "";
const MAX_ATTEMPTS = 6;

// Extended keyboard rows to support numbers for trivia answers like "8" or "1969"
const KEYBOARD_ROWS = [
  ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"],
  ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
  ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
  ["Z", "X", "C", "V", "B", "N", "M"]
];

export default function GamePage() {
  const navigate = useNavigate();

  const [currentPuzzle, setCurrentPuzzle] = useState(null);
  const [guessedLetters, setGuessedLetters] = useState([]);
  const [score, setScore] = useState(0);
  const [isHit, setIsHit] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch trivia payload from FastAPI
  const fetchRandomPuzzle = useCallback(() => {
    setLoading(true);
    setGuessedLetters([]);

    fetch(`${API_BASE_URL}/api/puzzles/random`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch puzzle");
        return res.json();
      })
      .then((data) => {
        setCurrentPuzzle(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error loading puzzle:", err);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    fetchRandomPuzzle();
  }, [fetchRandomPuzzle]);

  // Sync high scores on victory
  const submitScoreToDatabase = useCallback((newScore) => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) return;

    const dbUser = JSON.parse(storedUser);

    fetch(`${API_BASE_URL}/api/scores/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: dbUser.id,
        score: newScore,
      }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to post score");
        return res.json();
      })
      .then((data) => console.log("Score synced to Leaderboards:", data))
      .catch((err) => console.error("Error submitting score:", err));
  }, []);

  // Normalizing secret answer safely (supports secret_word, answer, or word payloads)
  const wordString = (currentPuzzle?.question_answer || currentPuzzle?.secret_word || currentPuzzle?.answer || currentPuzzle?.word || "").toUpperCase();
  const targetLetters = wordString ? wordString.split("") : [];
  
  // Filter out spaces so multi-word answers don't count space as a character to guess
  const guessableCharacters = targetLetters.filter((char) => char !== " ");

  const wrongGuesses = guessedLetters.filter(
    (letter) => guessableCharacters.length > 0 && !guessableCharacters.includes(letter)
  );
  const remainingAttempts = MAX_ATTEMPTS - wrongGuesses.length;

  const isWon = guessableCharacters.length > 0 && guessableCharacters.every((letter) => guessedLetters.includes(letter));
  const isLost = remainingAttempts <= 0;
  const isGameOver = isWon || isLost;

  useEffect(() => {
    if (isWon) {
      const updatedScore = score + 100;
      setScore(updatedScore);
      submitScoreToDatabase(updatedScore);
    }
  }, [isWon, submitScoreToDatabase]);

  const handleGuess = useCallback((letter) => {
    if (guessedLetters.includes(letter) || isGameOver || !currentPuzzle) return;

    setGuessedLetters((prev) => [...prev, letter]);

    if (guessableCharacters.length > 0 && !guessableCharacters.includes(letter)) {
      setIsHit(true);
      setTimeout(() => setIsHit(false), 400);
    }
  }, [guessedLetters, isGameOver, guessableCharacters, currentPuzzle]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      const char = e.key.toUpperCase();
      if (/^[A-Z0-9]$/.test(char)) {
        handleGuess(char);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleGuess]);

  const handleNextGame = () => {
    fetchRandomPuzzle();
  };

  if (loading || !currentPuzzle) {
    return (
      <div className="page-container">
        <p style={{ color: 'white', textAlign: 'center', marginTop: '2rem' }}>
          Loading question...
        </p>
      </div>
    );
  }

  const strokeColor = "#00ffcc";
  const strokeWidth = 3;

  return (
    <div className="page-container">
      <div className={`game-card ${isHit ? 'shake-hit' : ''}`}>

        {/* 1. Header & Stats */}
        <div className="word-display-container">
          <div className="game-stats">
            <span>Score: <strong>{score}</strong></span>
            <span>•</span>
            <span>Attempts Remaining:</span>
            <span className="attempts-pill">{remainingAttempts}</span>
          </div>
        </div>

        {/* 2. Dynamic Question & Category Display */}
        <div className="question-box" style={{ textAlign: 'center', margin: '1rem 0' }}>
          {currentPuzzle.category && (
            <span className="category-badge" style={{ background: '#3b82f6', color: '#fff', padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.8rem', textTransform: 'uppercase' }}>
              {currentPuzzle.category}
            </span>
          )}
          <h2 className="question-text" style={{ color: 'black', fontSize: '1.4rem', marginTop: '0.5rem' }}>
            {currentPuzzle.question || currentPuzzle.prompt || currentPuzzle.hint || "Guess the hidden answer!"}
          </h2>
        </div>

        {/* 3. Dragon SVG Canvas */}
        <div className="stickManCanvas">
          <svg height="220" width="200" viewBox="0 0 200 200" className={isLost ? "defeat-drop" : "rope-swing"}>
            {/* Gallows / Perch */}
            <line x1="20" y1="190" x2="180" y2="190" stroke="#444" strokeWidth="4" />
            <line x1="40" y1="190" x2="40" y2="20" stroke="#444" strokeWidth="4" />
            <line x1="40" y1="20" x2="120" y2="20" stroke="#444" strokeWidth="4" />
            <line x1="120" y1="20" x2="120" y2="40" stroke="#444" strokeWidth="2" strokeDasharray="3,3" />

            {/* 1. Head, Horns & Jaw */}
            {wrongGuesses.length >= 1 && (
              <g id="dragon-head">
                <path d="M 105 45 L 135 45 L 145 55 L 125 60 L 105 50 Z" fill="none" stroke={strokeColor} strokeWidth={strokeWidth} />
                <path d="M 105 45 L 95 35 M 110 45 L 102 32" fill="none" stroke={strokeColor} strokeWidth={strokeWidth} strokeLinecap="round" />
                <circle cx="125" cy="50" r="1.5" fill="#ff0055" />
              </g>
            )}

            {/* 2. Serpent Spine & Tail */}
            {wrongGuesses.length >= 2 && (
              <path
                d="M 110 50 C 100 80, 140 100, 110 130 C 90 150, 80 160, 60 150 C 50 145, 55 135, 65 140"
                fill="none"
                stroke={strokeColor}
                strokeWidth={strokeWidth}
                strokeLinecap="round"
              />
            )}

            {/* 3. Front Clawed Legs */}
            {wrongGuesses.length >= 3 && (
              <g id="front-legs">
                <path d="M 115 85 L 130 95 L 138 92 M 130 95 L 135 98" fill="none" stroke={strokeColor} strokeWidth={strokeWidth} strokeLinecap="round" />
              </g>
            )}

            {/* 4. Rear Legs */}
            {wrongGuesses.length >= 4 && (
              <g id="back-legs">
                <path d="M 112 125 L 125 140 L 135 138 M 125 140 L 130 145" fill="none" stroke={strokeColor} strokeWidth={strokeWidth} strokeLinecap="round" />
              </g>
            )}

            {/* 5. Wings */}
            {wrongGuesses.length >= 5 && (
              <g id="wings">
                <path d="M 112 75 L 80 50 L 70 75 L 95 82 L 75 95 L 110 85" fill="none" stroke={strokeColor} strokeWidth={strokeWidth} strokeLinejoin="round" />
                <path d="M 115 75 L 140 55 L 145 78 L 122 83" fill="none" stroke={strokeColor} strokeWidth="2" strokeDasharray="2,2" />
              </g>
            )}

            {/* 6. Fire Breath */}
            {wrongGuesses.length >= 6 && (
              <g id="fire-breath">
                <path d="M 145 55 Q 165 50 175 62 Q 160 68 140 60 Z" fill="#ff3300" opacity="0.85" />
                <path d="M 145 57 Q 160 53 168 60 Q 155 64 142 59 Z" fill="#ffcc00" />
              </g>
            )}
          </svg>
        </div>

        {/* 4. Answer Slots */}
        <div className="letter-slots">
          {targetLetters.map((letter, index) => {
            if (letter === " ") {
              return <div key={index} style={{ width: '20px' }} />;
            }

            const isRevealed = guessedLetters.includes(letter) || isLost;
            return (
              <div 
                key={index} 
                className={`letter-slot ${isRevealed ? 'revealed-letter-anim' : ''}`}
                style={{ color: !guessedLetters.includes(letter) && isLost ? '#ef476f' : '#ffffff' }}
              >
                {isRevealed ? letter : ""}
              </div>
            );
          })}
        </div>

        {/* 5. On-Screen Keypad */}
        <div className="keyboard-container">
          {KEYBOARD_ROWS.map((row, rowIndex) => (
            <div key={rowIndex} className="keyboard-row">
              {row.map((letter) => {
                const isGuessed = guessedLetters.includes(letter);
                const isCorrect = isGuessed && guessableCharacters.includes(letter);
                const isWrong = isGuessed && !guessableCharacters.includes(letter);

                let keyClass = "key-btn";
                if (isCorrect) keyClass += " key-correct";
                if (isWrong) keyClass += " key-wrong";

                return (
                  <button
                    key={letter}
                    className={keyClass}
                    onClick={() => handleGuess(letter)}
                    disabled={isGuessed || isGameOver}
                  >
                    {letter}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* 6. Game Over / Victory Modal */}
        {isGameOver && (
          <div className="game-over-modal modal-appear">
            <h1 className="victoryTxt" style={{ color: isWon ? '#10b981' : '#ef476f' }}>
              {isWon ? "Question Answered! 🎉" : "Game Over! 🐉"}
            </h1>
            <p className="secret-word-reveal">
              The answer was: <strong>{wordString}</strong>
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <button className="againBtn pulse-anim" onClick={handleNextGame}>
                {isWon ? "Next Question →" : "Try Again 🔄"}
              </button>
              <button 
                className="againBtn" 
                style={{ backgroundColor: '#3b82f6' }}
                onClick={() => navigate('/leaderboard')}
              >
                View Leaderboards 🏆
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
