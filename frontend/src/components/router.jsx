import React, { useState } from 'react'
import { Routes, Route, useNavigate } from 'react-router-dom'
import LoginPage from './loginPage.jsx'
import GamePage from './gamePage.jsx'
import GameLeaderboard from './leaderboardsPage.jsx'
import '../stylesheets/app.css'



function HomePage() {
  const navigate = useNavigate();
  const [showRocket, setShowRocket] = useState(false);

  const handlePlay = () => {
    setShowRocket(true);


    setTimeout(() => {
      navigate('/game');
    }, 800);
  };


  return (
    <div className="home-container">
      <h1 className='playHeader'>Play Logic Gate</h1>


      <button className='musicBtn'>&#128266;</button>

    
      <button class="playBtn"  onClick={handlePlay}>play /&gt;</button>

      {showRocket && (
        <div className="dragonSticker" style={{ fontSize: '4rem', marginTop: '1rem' }}>
           🐲
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
