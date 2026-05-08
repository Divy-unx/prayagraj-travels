import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Lock, Eye, EyeOff, ArrowLeft, CheckCircle, Bus, KeyRound } from 'lucide-react'
import { authService } from '../../services/api'
import OTPInput from '../../components/ui/OTPInput'
import PasswordStrength from '../../components/ui/PasswordStrength'
import toast from 'react-hot-toast'

export default function ResetPasswordPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const prefillEmail = location.state?.email || ''

  const [step, setStep] = useState('otp') // 'otp' | 'password' | 'done'
  const [email, setEmail] = useState(prefillEmail)
  const [otp, setOtp] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleVerifyOtp = () => {
    if (otp.length < 6) return toast.error('Enter the 6-digit code')
    setStep('password')
  }

  const handleReset = async (e) => {
    e.preventDefault()
    if (password !== confirm) return toast.error('Passwords do not match')
    if (password.length < 8) return toast.error('Password must be at least 8 characters')
    setLoading(true)
    try {
      await authService.resetPassword({ email: email.trim().toLowerCase(), otp, newPassword: password })
      setStep('done')
      toast.success('Password reset successfully!')
      setTimeout(() => navigate('/login', { replace: true }), 2500)
    } catch (err) {
      toast.error(err.message || 'Reset failed. The code may have expired.')
      setStep('otp')
      setOtp('')
    } finally {
      setLoading(false)
    }
  }

  const BgDecorations = () => (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full bg-gradient-to-br from-primary-200/60 to-primary-300/30 blur-3xl" />
      <div className="absolute -bottom-40 -right-20 w-[450px] h-[450px] rounded-full bg-gradient-to-tl from-accent-200/50 to-primary-200/30 blur-3xl" />
      <svg className="absolute inset-0 w-full h-full opacity-[0.03]" xmlns="http://www.w3.org/2000/svg">
        <defs><pattern id="grid-rp" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1d4ed8" strokeWidth="1"/></pattern></defs>
        <rect width="100%" height="100%" fill="url(#grid-rp)" />
      </svg>
    </div>
  )

  if (step === 'done') {
    return (
      <div className="min-h-[calc(100vh-64px)] relative flex items-center justify-center p-4 bg-[#f0f4ff]">
        <BgDecorations />
        <div className="relative text-center animate-slide-up">
          <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-5 shadow-[0_0_0_8px_rgba(16,185,129,0.1)]">
            <CheckCircle className="w-12 h-12 text-emerald-500" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 mb-2">Password reset!</h2>
          <p className="text-slate-500 text-sm">Redirecting you to sign in…</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[calc(100vh-64px)] relative flex items-center justify-center p-4 overflow-hidden bg-[#f0f4ff]">
      <BgDecorations />

      <div className="relative w-full max-w-[420px] animate-slide-up">
        <div className="flex justify-center mb-7">
          <Link to="/" className="flex items-center gap-2.5 bg-white rounded-2xl px-5 py-3 shadow-card border border-slate-100 hover:shadow-card-hover transition-shadow">
            <div className="w-8 h-8 bg-hero-grad rounded-lg flex items-center justify-center">
              <Bus style={{ width: 18, height: 18 }} className="text-white" />
            </div>
            <span className="font-black text-lg text-slate-900 tracking-tight">PrayagTravels</span>
          </Link>
        </div>

        <div className="bg-white rounded-3xl shadow-[0_20px_60px_-10px_rgba(37,99,235,0.15),0_4px_20px_rgba(0,0,0,0.06)] border border-white/80 p-8">
          <Link to="/forgot-password" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mb-6 transition-colors font-medium">
            <ArrowLeft className="w-4 h-4" /> Back
          </Link>

          {step === 'otp' && (
            <>
              <div className="w-14 h-14 bg-primary-50 rounded-2xl flex items-center justify-center mb-5">
                <KeyRound className="w-7 h-7 text-primary-600" />
              </div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight mb-1.5">Enter reset code</h1>
              <p className="text-slate-500 text-sm mb-6 leading-relaxed">
                We sent a 6-digit code to{' '}
                <span className="font-bold text-slate-800">{email || 'your email'}</span>
              </p>

              {!prefillEmail && (
                <div className="mb-5">
                  <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider">Email address</label>
                  <div className="relative group">
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 font-medium placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400 focus:bg-white transition-all text-sm"
                      required
                    />
                  </div>
                </div>
              )}

              <div className="mb-6">
                <OTPInput value={otp} onChange={setOtp} length={6} />
              </div>

              <button
                onClick={handleVerifyOtp}
                disabled={otp.length < 6}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-bold py-3.5 rounded-xl shadow-btn hover:shadow-lg transition-all duration-200 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed text-sm"
              >
                Continue
              </button>
            </>
          )}

          {step === 'password' && (
            <>
              <div className="w-14 h-14 bg-primary-50 rounded-2xl flex items-center justify-center mb-5">
                <Lock className="w-7 h-7 text-primary-600" />
              </div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight mb-1.5">Set new password</h1>
              <p className="text-slate-500 text-sm mb-6">Create a strong password for your account.</p>

              <form onSubmit={handleReset} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider">
                    New password <span className="text-red-400">*</span>
                  </label>
                  <div className="relative group">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary-500 transition-colors" />
                    <input
                      type={showPw ? 'text' : 'password'}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="Create a strong password"
                      className="w-full pl-10 pr-11 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 font-medium placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400 focus:bg-white transition-all text-sm"
                      autoComplete="new-password"
                      required
                    />
                    <button type="button" onClick={() => setShowPw(p => !p)} tabIndex={-1}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                      {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <PasswordStrength password={password} />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider">
                    Confirm password <span className="text-red-400">*</span>
                  </label>
                  <div className="relative group">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary-500 transition-colors" />
                    <input
                      type={showConfirm ? 'text' : 'password'}
                      value={confirm}
                      onChange={e => setConfirm(e.target.value)}
                      placeholder="Repeat your password"
                      className="w-full pl-10 pr-11 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 font-medium placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400 focus:bg-white transition-all text-sm"
                      autoComplete="new-password"
                      required
                    />
                    <button type="button" onClick={() => setShowConfirm(p => !p)} tabIndex={-1}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                      {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {confirm && password !== confirm && (
                    <p className="text-red-500 text-xs mt-1.5 font-medium">Passwords do not match</p>
                  )}
                </div>

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
                  ) : 'Reset password'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
