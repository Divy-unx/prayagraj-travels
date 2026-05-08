import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, ArrowLeft, ArrowRight, Bus, Send } from 'lucide-react'
import { authService } from '../../services/api'
import toast from 'react-hot-toast'

export default function ForgotPasswordPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email) return toast.error('Please enter your email')
    setLoading(true)
    try {
      await authService.forgotPassword(email.trim().toLowerCase())
      setSent(true)
    } catch (err) {
      toast.error(err.message || 'Failed to send reset code. Try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-64px)] relative flex items-center justify-center p-4 overflow-hidden bg-[#f0f4ff]">
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full bg-gradient-to-br from-primary-200/60 to-primary-300/30 blur-3xl" />
        <div className="absolute -bottom-40 -right-20 w-[450px] h-[450px] rounded-full bg-gradient-to-tl from-accent-200/50 to-primary-200/30 blur-3xl" />
        <svg className="absolute inset-0 w-full h-full opacity-[0.03]" xmlns="http://www.w3.org/2000/svg">
          <defs><pattern id="grid-fp" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1d4ed8" strokeWidth="1"/></pattern></defs>
          <rect width="100%" height="100%" fill="url(#grid-fp)" />
        </svg>
      </div>

      <div className="relative w-full max-w-[420px] animate-slide-up">
        {/* Logo */}
        <div className="flex justify-center mb-7">
          <Link to="/" className="flex items-center gap-2.5 bg-white rounded-2xl px-5 py-3 shadow-card border border-slate-100 hover:shadow-card-hover transition-shadow">
            <div className="w-8 h-8 bg-hero-grad rounded-lg flex items-center justify-center">
              <Bus style={{ width: 18, height: 18 }} className="text-white" />
            </div>
            <span className="font-black text-lg text-slate-900 tracking-tight">PrayagTravels</span>
          </Link>
        </div>

        <div className="bg-white rounded-3xl shadow-[0_20px_60px_-10px_rgba(37,99,235,0.15),0_4px_20px_rgba(0,0,0,0.06)] border border-white/80 p-8">
          {!sent ? (
            <>
              <Link to="/login" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mb-6 transition-colors font-medium">
                <ArrowLeft className="w-4 h-4" /> Back to sign in
              </Link>

              <div className="w-14 h-14 bg-primary-50 rounded-2xl flex items-center justify-center mb-5">
                <Mail className="w-7 h-7 text-primary-600" />
              </div>

              <h1 className="text-2xl font-black text-slate-900 tracking-tight mb-1.5">Forgot your password?</h1>
              <p className="text-slate-500 text-sm mb-6 leading-relaxed">
                No worries! Enter your registered email and we'll send you a 6-digit reset code.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider">
                    Email address
                  </label>
                  <div className="relative group">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary-500 transition-colors" />
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 font-medium placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400 focus:bg-white transition-all text-sm"
                      autoComplete="email"
                      required
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-bold py-3.5 rounded-xl shadow-btn hover:shadow-lg transition-all duration-200 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed text-sm"
                >
                  {loading ? (
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                    </svg>
                  ) : (
                    <><Send className="w-4 h-4" /> Send reset code</>
                  )}
                </button>
              </form>
            </>
          ) : (
            <div className="text-center py-2">
              <div className="w-16 h-16 bg-primary-50 rounded-2xl flex items-center justify-center mx-auto mb-5">
                <Mail className="w-8 h-8 text-primary-600" />
              </div>
              <h2 className="text-2xl font-black text-slate-900 mb-2">Check your inbox!</h2>
              <p className="text-slate-500 text-sm mb-1 leading-relaxed">
                We sent a 6-digit reset code to
              </p>
              <p className="font-bold text-slate-800 text-sm mb-6">{email}</p>

              <button
                onClick={() => navigate('/reset-password', { state: { email } })}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-bold py-3.5 rounded-xl shadow-btn hover:shadow-lg transition-all duration-200 active:scale-[0.98] text-sm mb-4"
              >
                Enter reset code <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => setSent(false)}
                className="text-sm text-slate-500 hover:text-slate-700 transition-colors font-medium"
              >
                Use a different email
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
