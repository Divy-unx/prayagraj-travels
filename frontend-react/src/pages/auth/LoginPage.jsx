import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Mail, Lock, Eye, EyeOff, ArrowRight, Bus } from 'lucide-react'
import { GoogleLogin } from '@react-oauth/google'
import { useAuth } from '../../context/AuthContext'
import Button from '../../components/ui/Button'
import toast from 'react-hot-toast'

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || ''

export default function LoginPage() {
  const { login, googleLogin } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname || '/'

  const [form, setForm] = useState({ email: '', password: '' })
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.email || !form.password) return toast.error('Please fill in all fields')
    setLoading(true)
    try {
      const user = await login({ email: form.email.trim().toLowerCase(), password: form.password })
      if (user?.isEmailVerified === false || user?.is_email_verified === false) {
        toast('Please verify your email to continue.', { icon: '📧' })
        navigate('/verify-email', { replace: true })
      } else {
        toast.success(`Welcome back, ${user?.name?.split(' ')[0] || 'there'}!`)
        navigate(from, { replace: true })
      }
    } catch (err) {
      toast.error(err.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogle = async (credentialResponse) => {
    try {
      const user = await googleLogin(credentialResponse.credential)
      toast.success(`Welcome, ${user?.name?.split(' ')[0] || 'there'}!`)
      navigate(from, { replace: true })
    } catch (err) {
      toast.error(err.message || 'Google sign-in failed')
    }
  }

  return (
    <div className="min-h-[calc(100vh-64px)] relative flex items-center justify-center p-4 overflow-hidden bg-[#f0f4ff]">
      {/* Background decoration */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full bg-gradient-to-br from-primary-200/60 to-primary-300/30 blur-3xl" />
        <div className="absolute -bottom-40 -right-20 w-[450px] h-[450px] rounded-full bg-gradient-to-tl from-accent-200/50 to-primary-200/30 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full bg-white/40 blur-3xl" />
        {/* Grid pattern */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.03]" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1d4ed8" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      {/* Card */}
      <div className="relative w-full max-w-[420px] animate-slide-up">
        {/* Logo chip */}
        <div className="flex justify-center mb-7">
          <Link to="/" className="flex items-center gap-2.5 bg-white rounded-2xl px-5 py-3 shadow-card border border-slate-100 hover:shadow-card-hover transition-shadow">
            <div className="w-8 h-8 bg-hero-grad rounded-lg flex items-center justify-center">
              <Bus className="w-4.5 h-4.5 text-white" style={{ width: 18, height: 18 }} />
            </div>
            <span className="font-black text-lg text-slate-900 tracking-tight">PrayagTravels</span>
          </Link>
        </div>

        <div className="bg-white rounded-3xl shadow-[0_20px_60px_-10px_rgba(37,99,235,0.15),0_4px_20px_rgba(0,0,0,0.06)] border border-white/80 p-8">
          {/* Header */}
          <div className="text-center mb-7">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Sign in to your account</h1>
            <p className="text-slate-500 text-sm mt-1.5">
              New here?{' '}
              <Link to="/register" className="text-primary-600 font-bold hover:text-primary-700 transition-colors">
                Create a free account
              </Link>
            </p>
          </div>

          {/* Google OAuth */}
          {GOOGLE_CLIENT_ID && (
            <>
              <div className="mb-4">
                <GoogleLogin
                  onSuccess={handleGoogle}
                  onError={() => toast.error('Google sign-in failed')}
                  theme="outline" size="large" width="360" text="signin_with" shape="rectangular"
                  logo_alignment="center"
                />
              </div>
              <div className="flex items-center gap-3 mb-5">
                <div className="flex-1 h-px bg-slate-100" />
                <span className="text-xs text-slate-400 font-semibold tracking-wide uppercase">or</span>
                <div className="flex-1 h-px bg-slate-100" />
              </div>
            </>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider">
                Email address
              </label>
              <div className="relative group">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary-500 transition-colors" />
                <input
                  type="email"
                  value={form.email}
                  onChange={e => set('email', e.target.value)}
                  placeholder="you@example.com"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 font-medium placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400 focus:bg-white transition-all text-sm"
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider">
                  Password
                </label>
                <Link to="/forgot-password" className="text-xs text-primary-600 font-semibold hover:text-primary-700 transition-colors">
                  Forgot password?
                </Link>
              </div>
              <div className="relative group">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary-500 transition-colors" />
                <input
                  type={showPw ? 'text' : 'password'}
                  value={form.password}
                  onChange={e => set('password', e.target.value)}
                  placeholder="Enter your password"
                  className="w-full pl-10 pr-11 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 font-medium placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400 focus:bg-white transition-all text-sm"
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPw(p => !p)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  tabIndex={-1}
                >
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 flex items-center justify-center gap-2 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-bold py-3.5 rounded-xl shadow-btn hover:shadow-lg transition-all duration-200 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed text-sm"
            >
              {loading ? (
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
              ) : (
                <>Sign in <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </form>

          {/* Footer note */}
          <p className="text-center text-xs text-slate-400 mt-5">
            By signing in you agree to our{' '}
            <a href="#" className="underline hover:text-slate-600 transition-colors">Terms</a>{' '}
            &{' '}
            <a href="#" className="underline hover:text-slate-600 transition-colors">Privacy Policy</a>
          </p>
        </div>

        {/* Trust badges */}
        <div className="flex items-center justify-center gap-6 mt-6">
          {['🔒 Secure login', '🚌 100+ buses', '⚡ Instant booking'].map(t => (
            <span key={t} className="text-xs text-slate-500 font-medium">{t}</span>
          ))}
        </div>
      </div>
    </div>
  )
}
