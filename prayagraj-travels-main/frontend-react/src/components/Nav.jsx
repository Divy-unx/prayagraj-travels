import React from 'react'
import { useApp } from '../context/AppContext'

export default function Nav() {
  const { userId, view, showHome, showTickets, showToast, setLoginModalOpen, doLogout } = useApp()

  return (
    <nav className="nav">
      <div className="nav-i">
        <div className="logo" onClick={showHome}>prayagraj<b>travels</b></div>

        <div className="nav-tabs">
          <button className={`n-tab${view === 'home' ? ' act' : ''}`} onClick={showHome}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h11a2 2 0 012 2v3m-2 0h6a2 2 0 012 2v6a2 2 0 01-2 2h-1"/>
              <circle cx="10" cy="17" r="2"/>
              <circle cx="18" cy="17" r="2"/>
            </svg>
            Search Buses
          </button>
          <button className={`n-tab${view === 'tickets' ? ' act' : ''}`} onClick={showTickets}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
            </svg>
            My Tickets
          </button>
        </div>

        <div className="nav-r">
          <a onClick={() => showToast('ℹ️', 'Offers', 'Offers section coming soon!')}>Offers</a>
          <a onClick={showTickets}>Track Ticket</a>
          <a onClick={() => showToast('ℹ️', 'Help', 'Help section coming soon!')}>Need Help?</a>
          {userId && (
            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--green)' }}>
              👋 Hi, {userId}
            </span>
          )}
          {!userId && (
            <button className="sign-btn" onClick={() => setLoginModalOpen(true)}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="8" r="4"/>
                <path d="M4 20c0-4 3.58-7 8-7s8 3 8 7"/>
              </svg>
              Login/SignUp
            </button>
          )}
          {userId && (
            <button className="sign-btn" onClick={doLogout} style={{ color: 'var(--red)' }}>
              Logout
            </button>
          )}
        </div>
      </div>
    </nav>
  )
}
