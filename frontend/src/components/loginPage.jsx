import React, { useEffect, useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useNavigate } from 'react-router-dom';
import '../stylesheets/app.css';




// Replace with your Port 8000 URL from GitHub Codespaces
const API_BASE_URL = "https://ubiquitous-space-doodle-jjp59r77qg9rfj5xv-8000.app.github.dev";

export default function LoginPage({ onUserAuthenticated }) {
  const { loginWithRedirect, logout, user, isAuthenticated, isLoading } = useAuth0();
  const navigate = useNavigate();

  // Local account form state
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Automatically sync Auth0 identity to PostgreSQL and redirect Home
  useEffect(() => {
    if (isAuthenticated && user) {
      fetch(`${API_BASE_URL}/api/users/auth0-sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          auth0_id: user.sub,
          username: user.nickname || user.email?.split('@')[0] || "player",
        }),
      })
        .then((res) => {
          if (!res.ok) throw new Error("Sync failed");
          return res.json();
        })
        .then((dbUser) => {
          // Save session locally & trigger state update
          localStorage.setItem('user', JSON.stringify(dbUser));
          if (onUserAuthenticated) onUserAuthenticated(dbUser);
          
          // Redirect to the main home page (where Play lives)
          navigate('/');
        })
        .catch((err) => console.error("Error syncing Auth0 user to DB:", err));
    }
  }, [isAuthenticated, user, onUserAuthenticated, navigate]);

  // Handle direct local user creation
  const handleCreateAccount = (e) => {
    e.preventDefault();
    if (!usernameInput || !passwordInput) {
      setErrorMessage("Please fill out both username and password.");
      return;
    }

    fetch(`${API_BASE_URL}/api/users/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: usernameInput, password: passwordInput })
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to register user");
        return res.json();
      })
      .then((dbUser) => {
        localStorage.setItem('user', JSON.stringify(dbUser));
        if (onUserAuthenticated) onUserAuthenticated(dbUser);
        navigate('/'); // Redirect to main home page
      })
      .catch((err) => {
        console.error("Registration error:", err);
        setErrorMessage("User already exists or backend error.");
      });
  };



  if (isLoading) {
    return (
      <div className="page-container">
        <p style={{ color: 'white', textAlign: 'center', marginTop: '2rem' }}>
          signing-in...
        </p>
      </div>
    );
  }


  return (
    <div className="page-container">
      <h2 className="accHeader">Account Sign-in</h2>

      <div>
        <div className="form">
          <h2 className="loginHeader">
            {isAuthenticated ? `Welcome, ${user.nickname}!` : "Sign-In"}
          </h2>

          {errorMessage && (
            <p style={{ color: "#ff6b6b", textAlign: "center" }}>{errorMessage}</p>
          )}

          {!isAuthenticated ? (
            <>
              {/* Primary Auth0 Login Button */}
              <button 
                type="button"
                className="altBtn" 
                style={{ width: "100%", padding: "12px", marginBottom: "1rem", cursor: "pointer" }}
                onClick={() => loginWithRedirect({ appState: { returnTo: "/" } })}
              >
                SIGN-IN 
              </button>

              <div className="alt-Signup">
                <p className="or-txt">OR</p>
                <p className="createHeader">If you do not have an account, you can create one here.</p>
                
                <form onSubmit={handleCreateAccount}>
                  <label>Username</label><br />
                  <input 
                    type="text" 
                    value={usernameInput}
                    onChange={(e) => setUsernameInput(e.target.value)}
                  /><br />
                  
                  <label>Password</label><br />
                  <input 
                    type="password"
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                  /><br />

                  <button type="submit" className="createBtn">create</button>
                </form>
              </div>
            </>
          ) : (
            <>
              <p style={{ color: 'white', textAlign: 'center', margin: '1rem 0' }}>
                You are currently signed in as <strong>{user.email || user.nickname}</strong>.
              </p>
              
              <button 
                type="button" 
                className="altBtn"
                style={{ width: "100%", backgroundColor: "#e74c3c" }}
                onClick={() => {
                  localStorage.removeItem('user');
                  logout({ logoutParams: { returnTo: window.location.origin } });
                }}
              >
                LOG OUT
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
