import React, { useEffect, useState } from 'react';
import '../stylesheets/app.css';



// Dynamic avatar assignments based on rank
const AVATARS = ["👑", "🚀", "⚡", "🎯", "🔥", "⭐", "🎮", "🏆"];


const API_BASE_URL = "";

export default function GameLeaderboard() {
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/leaderboard`)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data)) {
          // Format backend payload to fit frontend podium and table layout
          const formattedData = data.map((item, index) => ({
            rank: index + 1,
            username: item.username || "Anonymous",
            score: item.score ?? 0,
            gamesPlayed: "-", 
            avatar: AVATARS[index] || "🎮"
          }));
          setLeaderboardData(formattedData);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching leaderboard:", err);
        setError("Unable to load leaderboard. Please make sure the backend is running.");
        setLoading(false);
      });
  }, []);

  const topThree = leaderboardData.slice(0, 3);

  if (loading) {
    return (
      <div className="page-container">
        <p style={{ color: "white", textAlign: "center", marginTop: "2rem" }}>
          Loading Wall of Fame...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container">
        <p style={{ color: "#ff6b6b", textAlign: "center", marginTop: "2rem" }}>
          {error}
        </p>
      </div>
    );
  }

  
  return (
    <div className="page-container">
      <div className="leaderBox">
        
        {/* Header */}
        <div className="leader-header-container">
          <h2 className="leaderHeader">Wall of Fame 🏆</h2>
          <p className="leaderSubtext">Top players ranked by high score</p>
        </div>

        {/* --- TOP 3 PODIUM CARDS --- */}
        {leaderboardData.length > 0 && (
          <div className="podium-container">
            {/* Silver - Rank 2 */}
            <div className="p2">
              <div className="podium-badge">2</div>
              <div className="podium-avatar">{topThree[1]?.avatar || "🚀"}</div>
              <div className="podium-name">{topThree[1]?.username || "---"}</div>
              <div className="podium-score">{topThree[1]?.score ?? 0} pts</div>
            </div>

            {/* Gold - Rank 1 */}
            <div className="p1">
              <div className="crown-icon">👑</div>
              <div className="podium-badge">1</div>
              <div className="podium-avatar">{topThree[0]?.avatar || "👑"}</div>
              <div className="podium-name">{topThree[0]?.username || "---"}</div>
              <div className="podium-score">{topThree[0]?.score ?? 0} pts</div>
            </div>

            {/* Bronze - Rank 3 */}
            <div className="p3">
              <div className="podium-badge">3</div>
              <div className="podium-avatar">{topThree[2]?.avatar || "⚡"}</div>
              <div className="podium-name">{topThree[2]?.username || "---"}</div>
              <div className="podium-score">{topThree[2]?.score ?? 0} pts</div>
            </div>
          </div>
        )}

        {/* --- FULL RANKINGS TABLE --- */}
        <div className="table-wrapper">
          <table className="leaderboard-table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Player</th>
                <th>Games Played</th>
                <th>High Score</th>
              </tr>
            </thead>
            <tbody>
              {leaderboardData.length === 0 ? (
                <tr>
                  <td colSpan="4" style={{ textAlign: "center" }}>
                    No high scores recorded yet!
                  </td>
                </tr>
              ) : (
                leaderboardData.map((player) => (
                  <tr key={player.rank} className={`rank-row rank-${player.rank}`}>
                    <td>
                      <span className={`rank-pill pill-${player.rank}`}>
                        #{player.rank}
                      </span>
                    </td>
                    <td>
                      <div className="player-cell">
                        <span className="player-avatar">{player.avatar}</span>
                        <span className="player-name">{player.username}</span>
                      </div>
                    </td>
                    <td className="games-cell">{player.gamesPlayed}</td>
                    <td className="score-cell">{player.score.toLocaleString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}
