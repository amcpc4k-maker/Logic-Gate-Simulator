import React from 'react'
import ReactDOM from 'react-dom/client'
import { Auth0Provider } from '@auth0/auth0-react'
import App from './App.jsx'

// Callback handler to send user to main page after login
const onRedirectCallback = (appState) => {
  window.location.href = appState?.returnTo || window.location.origin;
};

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Auth0Provider
      domain="dev-8dpv2d63rhqa1gun.us.auth0.com"
      clientId="rofKiD5C6QTWm86w0cvyjZL9JlJMLgts"
      authorizationParams={{
        redirect_uri: window.location.origin
      }}
      onRedirectCallback={onRedirectCallback}
    >
      <App />
    </Auth0Provider>
  </React.StrictMode>,
)
