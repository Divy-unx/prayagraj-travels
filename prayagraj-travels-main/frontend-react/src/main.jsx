import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { GoogleOAuthProvider } from '@react-oauth/google'
import App from './App'
import { AppProvider } from './context/AppContext'
import { AuthProvider } from './context/AuthContext'
import './index.css'

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || ''

const AppTree = (
  <BrowserRouter>
    <AuthProvider>
      <AppProvider>
        <App />
        <Toaster
          position="bottom-right"
          toastOptions={{
            duration: 4000,
            style: { background: '#1e293b', color: '#f8fafc', fontWeight: 600, borderRadius: '12px', padding: '14px 18px' },
            success: { iconTheme: { primary: '#10b981', secondary: '#f8fafc' } },
            error: { iconTheme: { primary: '#ef4444', secondary: '#f8fafc' } },
          }}
        />
      </AppProvider>
    </AuthProvider>
  </BrowserRouter>
)

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {GOOGLE_CLIENT_ID
      ? <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>{AppTree}</GoogleOAuthProvider>
      : AppTree
    }
  </React.StrictMode>
)
