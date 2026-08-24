import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import '../stylesheets/app.css'


// Replace with your Port 8000 URL from GitHub Codespaces
const API_BASE_URL = "https://ubiquitous-space-doodle-jjp59r77qg9rfj5xv-8000.app.github.dev";

const MAX_ATTEMPTS = 6;
const QWERTY_ROWS = [
  ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
  ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
  ["Z", "X", "C", "V", "B", "N", "M"]
];

export default function GamePage() {
  const navigate = useNavigate();
  
  // Game state
  const [currentPuzzle, setCurrentPuzzle] = useState(null);
  const [guessedLetters, setGuessedLetters] = useState([]);
  const [score, setScore] = useState(0);
  const [isHit, setIsHit] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch a random puzzle from FastAPI backend
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

  // Fetch initial puzzle on component load
  useEffect(() => {
    fetchRandomPuzzle();
  }, [fetchRandomPuzzle]);

  // Submit high score to database
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


  // Derived variables from current puzzle
  const targetLetters = currentPuzzle?.word ? currentPuzzle.word.split("") : [];
  const wrongGuesses = guessedLetters.filter(
    (letter) => !targetLetters.includes(letter)
  );
  const remainingAttempts = MAX_ATTEMPTS - wrongGuesses.length;

  const isWon = targetLetters.length > 0 && targetLetters.every((letter) => guessedLetters.includes(letter));
  const isLost = remainingAttempts <= 0;
  const isGameOver = isWon || isLost;

  // Sync score on Win condition
  useEffect(() => {
    if (isWon) {
      const updatedScore = score + 100;
      setScore(updatedScore);
      submitScoreToDatabase(updatedScore);
    }
  }, [isWon, submitScoreToDatabase]);

  // Handle Letter Guess
  const handleGuess = useCallback((letter) => {
    if (guessedLetters.includes(letter) || isGameOver || !currentPuzzle) return;

    setGuessedLetters((prev) => [...prev, letter]);

    // Trigger visual shake feedback on wrong guess
    if (!targetLetters.includes(letter)) {
      setIsHit(true);
      setTimeout(() => setIsHit(false), 400);
    }
  }, [guessedLetters, isGameOver, targetLetters, currentPuzzle]);


  // Physical Keyboard Listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      const char = e.key.toUpperCase();
      if (/^[A-Z]$/.test(char)) {
        handleGuess(char);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleGuess]);

  // Next Round
  const handleNextGame = () => {
    fetchRandomPuzzle();
  };

  if (loading || !currentPuzzle) {
    return (
      <div className="page-container">
        <p style={{ color: 'white', textAlign: 'center', marginTop: '2rem' }}>
          Loading puzzle...
        </p>
      </div>
    );
  }


  return (
    <div className="page-container">
      <div className={`game-card ${isHit ? 'shake-hit' : ''}`}>
        
        {/* --- 1. HEADER & GAME STATS --- */}
        <div className="word-display-container">
          <div className="game-stats">
            <span>Score: <strong>{score}</strong></span>
            <span>•</span>
            <span>Attempts Remaining:</span>
            <span className="attempts-pill">{remainingAttempts}</span>
          </div>
        </div>

        {/* --- 2. QUESTION & HINT DISPLAY --- */}
        <div className="question-box">
          <span className="category-badge">{currentPuzzle.category}</span>
          <h2 className="question-text">{currentPuzzle.hint}</h2>
        </div>

        {/* --- 3. STICKMAN SVG CANVAS --- */}
        <div className="stickManCanvas">
          <svg height="220" width="200" className={isLost ? "defeat-drop" : "rope-swing"}>
            {/* Gallows Base & Beam */}
            <line x1="10" y1="210" x2="150" y2="210" stroke="#0d0d0d" strokeWidth="4" />
            <line x1="40" y1="210" x2="40" y2="20" stroke="#0c0c0c" strokeWidth="4" />
            <line x1="40" y1="20" x2="140" y2="20" stroke="#0d0d0e" strokeWidth="4" />
            <line x1="140" y1="20" x2="140" y2="50" stroke="#0e0d0d" strokeWidth="3" />

            {/* Step 1: Head */}
            {wrongGuesses.length >= 1 && (
              <g className="pop-in-element">
                <circle cx="140" cy="70" r="20" stroke="#0c0c0c" strokeWidth="3" fill="transparent" />
                {/* Eyes */}
                <circle cx="133" cy="66" r="2" fill="#101011" className="eye-blink" />
                <circle cx="147" cy="66" r="2" fill="#0f0f0f" className="eye-blink" />
              </g>
            )}

            {/* Step 2: Body */}
            {wrongGuesses.length >= 2 && (
              <line x1="140" y1="90" x2="140" y2="150" stroke="#0a0a0a" strokeWidth="3" className="pop-in-element" />
            )}

            {/* Step 3: Left Arm */}
            {wrongGuesses.length >= 3 && (
              <line x1="140" y1="105" x2="110" y2="135" stroke="#0d0d0d" strokeWidth="3" className="pop-in-element arm-flail-left" />
            )}

            {/* Step 4: Right Arm */}
            {wrongGuesses.length >= 4 && (
              <line x1="140" y1="105" x2="170" y2="135" stroke="#0e0e0e" strokeWidth="3" className="pop-in-element arm-flail-right" />
            )}

            {/* Step 5: Left Leg */}
            {wrongGuesses.length >= 5 && (
              <line x1="140" y1="150" x2="115" y2="195" stroke="#0f0f0f" strokeWidth="3" className="pop-in-element" />
            )}

            {/* Step 6: Right Leg */}
            {wrongGuesses.length >= 6 && (
              <line x1="140" y1="150" x2="165" y2="195" stroke="#0f0f0f" strokeWidth="3" className="pop-in-element" />
            )}
          </svg>
        </div>

        {/* --- 4. HIDDEN WORD LETTER SLOTS --- */}
        <div className="letter-slots">
          {targetLetters.map((letter, index) => {
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

        {/* --- 5. ON-SCREEN QWERTY KEYBOARD --- */}
        <div className="keyboard-container">
          {QWERTY_ROWS.map((row, rowIndex) => (
            <div key={rowIndex} className="keyboard-row">
              {row.map((letter) => {
                const isGuessed = guessedLetters.includes(letter);
                const isCorrect = isGuessed && targetLetters.includes(letter);
                const isWrong = isGuessed && !targetLetters.includes(letter);

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


        {/* --- 6. GAME OVER / WIN MODAL OVERLAY --- */}
        {isGameOver && (
          <div className="game-over-modal modal-appear">
            <h1 className="victoryTxt" style={{ color: isWon ? '#10b981' : '#ef476f' }}>
              {isWon ? "Puzzle Solved! 🎉" : "Game Over! 💀"}
            </h1>
            <p className="secret-word-reveal">
              The secret word was: <strong>{currentPuzzle.word}</strong>
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <button className="againBtn pulse-anim" onClick={handleNextGame}>
                {isWon ? "Next Question →" : "Try Again 🔄"}
              </button>
              <button 
                className="againBtn" 
                style={{ backgroundColor: '#3b82f6' }}
                onClick={() => navigate('/leaderboards')}
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
