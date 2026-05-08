import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Mail, CheckCircle, RefreshCw, Bus } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { authService } from '../../services/api'
import OTPInput from '../../components/ui/OTPInput'
import toast from 'react-hot-toast'

const RESEND_COOLDOWN = 60

export default function VerifyEmailPage() {
  const { user, isLoggedIn, markEmailVerified } = useAuth()
  const navigate = useNavigate()

  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [cooldown, setCooldown] = useState(0)
  const [verified, setVerified] = useState(false)

  useEffect(() => {
    if (!isLoggedIn) navigate('/login', { replace: true })
  }, [isLoggedIn, navigate])

  useEffect(() => {
    if (cooldown <= 0) return
    const id = setTimeout(() => setCooldown(c => c - 1), 1000)
    return () => clearTimeout(id)
  }, [cooldown])

  const handleVerify = async () => {
    if (otp.length < 6) return toast.error('Enter the 6-digit code')
    setLoading(true)
    try {
      await authService.verifyEmail(otp)
      markEmailVerified()
      setVerified(true)
      toast.success('Email verified successfully!')
      setTimeout(() => navigate('/', { replace: true }), 2000)
    } catch (err) {
      toast.error(err.message || 'Invalid code. Please try again.')
      setOtp('')
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    if (cooldown > 0) return
    try {
      await authService.resendVerification()
      setCooldown(RESEND_COOLDOWN)
      toast.success('A new code has been sent to your email.')
    } catch (err) {
      toast.error(err.message || 'Could not resend code. Try again later.')
    }
  }

  if (verified) {
    return (
      <div className="min-h-[calc(100vh-64px)] relative flex items-center justify-center p-4 bg-[#f0f4ff]">
        <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full bg-gradient-to-br from-emerald-200/50 to-primary-200/30 blur-3xl" />
        </div>
        <div className="relative text-center animate-slide-up">
          <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-5 shadow-[0_0_0_8px_rgba(16,185,129,0.1)]">
            <CheckCircle className="w-12 h-12 text-emerald-500" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 mb-2">Email verified!</h2>
          <p className="text-slate-500">Taking you home…</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[calc(100vh-64px)] relative flex items-center justify-center p-4 overflow-hidden bg-[#f0f4ff]">
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full bg-gradient-to-br from-primary-200/60 to-primary-300/30 blur-3xl" />
        <div className="absolute -bottom-40 -right-20 w-[450px] h-[450px] rounded-full bg-gradient-to-tl from-accent-200/50 to-primary-200/30 blur-3xl" />
        <svg className="absolute inset-0 w-full h-full opacity-[0.03]" xmlns="http://www.w3.org/2000/svg">
          <defs><pattern id="grid-ve" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1d4ed8" strokeWidth="1"/></pattern></defs>
          <rect width="100%" height="100%" fill="url(#grid-ve)" />
        </svg>
      </div>

      <div className="relative w-full max-w-[420px] animate-slide-up">
        <div className="flex justify-center mb-7">
          <Link to="/" className="flex items-center gap-2.5 bg-white rounded-2xl px-5 py-3 shadow-card border border-slate-100 hover:shadow-card-hover transition-shadow">
            <div className="w-8 h-8 bg-hero-grad rounded-lg flex items-center justify-center">
              <Bus style={{ width: 18, height: 18 }} className="text-white" />
            </div>
            <span className="font-black text-lg text-slate-900 tracking-tight">PrayagTravels</span>
          </Link>
        </div>

        <div className="bg-white rounded-3xl shadow-[0_20px_60px_-10px_rgba(37,99,235,0.15),0_4px_20px_rgba(0,0,0,0.06)] border border-white/80 p-8 text-center">
          <div className="w-16 h-16 bg-primary-50 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <Mail className="w-8 h-8 text-primary-600" />
          </div>

          <h1 className="text-2xl font-black text-slate-900 tracking-tight mb-2">Verify your email</h1>
          <p className="text-slate-500 text-sm mb-1">We sent a 6-digit code to</p>
          <p className="font-bold text-slate-800 text-sm mb-7">
            {user?.email || 'your email address'}
          </p>

          <OTPInput value={otp} onChange={setOtp} length={6} disabled={loading} />

          <button
            onClick={handleVerify}
            disabled={loading || otp.length < 6}
            className="w-full mt-6 flex items-center justify-center gap-2 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-bold py-3.5 rounded-xl shadow-btn hover:shadow-lg transition-all duration-200 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed text-sm"
          >
            {loading ? (
              <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
            ) : 'Verify email'}
          </button>

          <div className="mt-5 flex items-center justify-center gap-2">
            <span className="text-sm text-slate-500">Didn't receive it?</span>
            <button
              onClick={handleResend}
              disabled={cooldown > 0}
              className="flex items-center gap-1 text-sm font-bold text-primary-600 hover:text-primary-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              {cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend code'}
            </button>
          </div>

          <p className="text-xs text-slate-400 mt-4 leading-relaxed">
            Code expires in 10 minutes. Check your spam folder if you don't see it.
          </p>
        </div>
      </div>
    </div>
  )
}
