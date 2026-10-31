import React from 'react'

export default function LandingFeatures() {
  return (
    <div className="features-sec">
      <h2>Why choose Prayagraj Travels?</h2>
      <div className="feat-grid">
        <div className="f-card">
          <div className="f-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4"/>
            </svg>
          </div>
          <h3>Live GPS Tracking</h3>
          <p>Track your bus in real-time. Know exactly when it arrives at your stop.</p>
        </div>
        <div className="f-card">
          <div className="f-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/>
              <path d="M22 4L12 14.01l-3-3"/>
            </svg>
          </div>
          <h3>100% Seat Guarantee</h3>
          <p>Reserve your preferred seat instantly. No overbooking, guaranteed boarding.</p>
        </div>
        <div className="f-card">
          <div className="f-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 4H8l-7 8 7 8h13a2 2 0 002-2V6a2 2 0 00-2-2z"/>
              <path d="M18 9l-6 6M12 9l6 6"/>
            </svg>
          </div>
          <h3>Instant Cancellation</h3>
          <p>Plans changed? Cancel your ticket with one click and get an instant refund.</p>
        </div>
      </div>
    </div>
  )
}
