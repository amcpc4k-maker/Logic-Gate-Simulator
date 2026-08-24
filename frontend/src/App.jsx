import React from 'react'
import { BrowserRouter as Router } from 'react-router-dom'
import Navbar from './components/navbar.jsx'
import AppRouter from './components/router.jsx'
import './stylesheets/app.css'


export default function App() {
  return (
    <Router>
      <div className="app-container">
        <Navbar />
        <main className="main-content">
          <AppRouter />
        </main>
      </div>
    </Router>
  )
}
