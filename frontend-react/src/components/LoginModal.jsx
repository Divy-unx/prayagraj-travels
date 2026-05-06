import React, { useState } from 'react'
import { useApp } from '../context/AppContext'

export default function LoginModal() {
  const { loginModalOpen, setLoginModalOpen, loginSuccess, showToast } = useApp()
  const [phoneValue, setPhoneValue] = useState('')

  const handleClose = () => {
    setLoginModalOpen(false)
    setPhoneValue('')
  }

  const simGoogleLogin = () => {
    showToast('🔄', 'Connecting...', 'Contacting Google Auth')
    setTimeout(() => {
      loginSuccess('GoogleUser_' + Math.floor(Math.random() * 9999))
      setPhoneValue('')
    }, 1200)
  }

  const simPhoneLogin = () => {
    if (!/^\d{10}$/.test(phoneValue.trim())) {
      showToast('⚠️', 'Invalid Phone', 'Enter a valid 10-digit number.')
      return
    }
    showToast('🔄', 'Sending OTP...', 'Please wait')
    setTimeout(() => {
      loginSuccess(phoneValue.trim())
      setPhoneValue('')
    }, 800)
  }

  return (
    <div className={`ov${loginModalOpen ? ' open' : ''}`} id="loginOv">
      <div className="sm" style={{ maxWidth: '400px', padding: '20px' }}>
        <div className="sm-hdr" style={{ padding: '0 0 15px 0', border: 'none' }}>
          <div className="sm-hdr-txt">
            <h2 style={{ fontSize: '1.4rem' }}>Login / Sign Up</h2>
          </div>
          <button className="sm-x" onClick={handleClose}>✕</button>
        </div>

        <div style={{ textAlign: 'center', padding: '10px 0' }}>
          <p style={{ color: 'var(--txt2)', fontSize: '0.9rem', marginBottom: '20px' }}>
            Welcome to Prayagraj Travels
          </p>

          <button
            onClick={simGoogleLogin}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '8px',
              border: '1px solid #ccc',
              background: '#fff',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              cursor: 'pointer',
              marginBottom: '15px',
              transition: '0.2s',
              color: 'var(--txt)',
              fontFamily: 'var(--fb)'
            }}
          >
            <svg width="20" height="20" viewBox="0 0 48 48">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
            </svg>
            Continue with Google
          </button>

          <div style={{ margin: '15px 0', color: '#8F92A1', fontSize: '0.85rem' }}>OR</div>

          <input
            type="tel"
            placeholder="Enter Mobile Number"
            maxLength="10"
            value={phoneValue}
            onChange={e => setPhoneValue(e.target.value)}
            style={{
              width: '100%',
              padding: '12px',
              border: '1.5px solid var(--border)',
              borderRadius: '8px',
              outline: 'none',
              fontFamily: 'var(--fb)',
              marginBottom: '15px'
            }}
          />

          <button
            onClick={simPhoneLogin}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '8px',
              border: 'none',
              background: 'var(--green)',
              color: '#fff',
              fontWeight: 'bold',
              cursor: 'pointer',
              fontFamily: 'var(--fb)',
              fontSize: '1rem'
            }}
          >
            Continue with Mobile
          </button>
        </div>
      </div>
    </div>
  )
}
