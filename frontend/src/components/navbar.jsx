import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import myProfile from './profilePage.jsx';
import '../stylesheets/app.css'



export default function Navbar() {
  const { user, isAuthenticated } = useAuth0();

  return (
    <header className="navbar">
      <div className="navbar-title">
        <Link to="/">Logic Gate Challenge</Link>
      </div>

      <nav className="navbar-links" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <Link to="/">Home</Link>
        <Link to="/leaderboards">Leaderboards</Link>
        
        {isAuthenticated ? (
          <div className="user-profile-nav" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Link to="/login" title="Account Settings">
              {user?.picture ? (
                <img 
                  src={user.picture} 
                  alt={user.nickname || "User Avatar"} 
                  style={{ 
                    width: '32px', 
                    height: '32px', 
                    borderRadius: '50%', 
                    border: '2px solid #00ffcc',
                    objectFit: 'cover' 
                  }} 
                />
              ) : (
                <span style={{ fontSize: '1.2rem' }}>👤</span>
              )}
            </Link>
          </div>
        ) : (
          <Link to="/login">Login</Link>
        )}
      </nav>
    </header>
  );
}
