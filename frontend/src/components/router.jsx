import React, { useState } from 'react'
import { Routes, Route, useNavigate } from 'react-router-dom'
import LoginPage from './loginPage.jsx'
import GamePage from './gamePage.jsx'
import GameLeaderboard from './leaderboardsPage.jsx'
import '../stylesheets/app.css'


function HomePage() {
  const navigate = useNavigate();
  const [showDragons, setShowDragons] = useState(false);

  const handlePlay = () => {
    setShowDragons(true);

    // Wait 1.5s for dragons to float across before navigating
    setTimeout(() => {
      navigate('/game');
    }, 1500);
  };

  return (
    <div className="home-container" style={{ position: 'relative', overflow: 'hidden' }}>
      {/* Inline Keyframes for Flying Animation */}
      <style>
        {`
          @keyframes flyAcross {
            0% {
              transform: translateX(-15vw) translateY(0px) scale(1);
              opacity: 0;
            }
            10% {
              opacity: 1;
            }
            50% {
              transform: translateX(50vw) translateY(-30px) scale(1.3);
            }
            90% {
              opacity: 1;
            }
            100% {
              transform: translateX(115vw) translateY(-10px) scale(1);
              opacity: 0;
            }
          }
        `}
      </style>

      <h1 className="playHeader">Play Logic Gate</h1>

      <button className="playBtn" onClick={handlePlay}>
        play /&gt;
      </button>

      {/* Floating Dragons Overlay */}
      {showDragons && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            pointerEvents: 'none',
            zIndex: 9999,
            overflow: 'hidden',
          }}
        >
          {/* Dragon 1 - Top Left to Right */}
          <div
            style={{
              position: 'absolute',
              top: '25%',
              left: 0,
              fontSize: '4rem',
              filter: 'drop-shadow(0 0 10px #00ff66)',
              animation: 'flyAcross 1.4s ease-in-out forwards',
            }}
          >
            🐉
          </div>

          {/* Dragon 2 - Middle Left to Right (Slightly Delayed & Lower) */}
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: 0,
              fontSize: '5rem',
              filter: 'drop-shadow(0 0 12px #ff0055)',
              animation: 'flyAcross 1.5s ease-in-out 0.15s forwards',
            }}
          >
            🐉
          </div>

          {/* Dragon 3 - Bottom Left to Right */}
          <div
            style={{
              position: 'absolute',
              top: '70%',
              left: 0,
              fontSize: '3.5rem',
              filter: 'drop-shadow(0 0 8px #00e5ff)',
              animation: 'flyAcross 1.3s ease-in-out 0.05s forwards',
            }}
          >
            🐉
          </div>
        </div>
      )}
    </div>
  )
}

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/leaderboards" element={<GameLeaderboard />} />
      <Route path="/game" element={<GamePage />} />
    </Routes>
  )
}
