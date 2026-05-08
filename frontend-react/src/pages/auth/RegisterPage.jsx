import { useState, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { User, Mail, Lock, Phone, Eye, EyeOff, ArrowRight, Bus, Check } from 'lucide-react'
import { GoogleLogin } from '@react-oauth/google'
import { useAuth } from '../../context/AuthContext'
import PasswordStrength from '../../components/ui/PasswordStrength'
import toast from 'react-hot-toast'

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || ''

function FloatingInput({ id, label, type = 'text', value, onChange, placeholder, icon: Icon, required, autoComplete, children }) {
  return (
    <div>
      <label htmlFor={id} className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider">
        {label}{required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      <div className="relative group">
        {Icon && (
          <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary-500 transition-colors" />
        )}
        {type !== 'custom' ? (
          <input
            id={id}
            type={type}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            autoComplete={autoComplete}
            required={required}
            className={`w-full ${Icon ? 'pl-10' : 'pl-4'} pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 font-medium placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400 focus:bg-white transition-all text-sm`}
          />
        ) : children}
      </div>
    </div>
  )
}

export default function RegisterPage() {
  const { register, googleLogin } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirm: '' })
  const [showPw, setShowPw] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [agreed, setAgreed] = useState(false)
  const [step, setStep] = useState(1) // 1 = personal info, 2 = password

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleNext = (e) => {
    e.preventDefault()
    if (!form.name.trim()) return toast.error('Please enter your full name')
    if (!form.email.trim()) return toast.error('Please enter your email')
    setStep(2)
  }

  const coldStartTimerRef = useRef(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!agreed) return toast.error('Please accept the terms to continue')
    if (form.password !== form.confirm) return toast.error('Passwords do not match')
    if (form.password.length < 8) return toast.error('Password must be at least 8 characters')
    setLoading(true)
    coldStartTimerRef.current = setTimeout(() => {
      toast('Server is waking up, please wait...', { icon: '⏳', id: 'cold-start', duration: 50000 })
    }, 8000)
    try {
      await register({
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        phone: form.phone.trim() || null,
        password: form.password,
      })
      toast.success('Account created! Check your email for a verification code.')
      navigate('/verify-email', { replace: true })
    } catch (err) {
      toast.error(err.message || 'Registration failed')
      setStep(1)
    } finally {
      clearTimeout(coldStartTimerRef.current)
      toast.dismiss('cold-start')
      setLoading(false)
    }
  }

  const handleGoogle = async (credentialResponse) => {
    try {
      const user = await googleLogin(credentialResponse.credential)
      toast.success(`Welcome, ${user?.name?.split(' ')[0] || 'there'}!`)
      navigate('/', { replace: true })
    } catch (err) {
      toast.error(err.message || 'Google sign-up failed')
    }
  }

  const passwordsMatch = form.confirm && form.password === form.confirm

  return (
    <div className="min-h-[calc(100vh-64px)] relative flex items-center justify-center p-4 overflow-hidden bg-[#f0f4ff]">
      {/* Background decoration */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full bg-gradient-to-bl from-primary-200/60 to-primary-300/30 blur-3xl" />
        <div className="absolute -bottom-40 -left-20 w-[450px] h-[450px] rounded-full bg-gradient-to-tr from-accent-200/50 to-primary-200/30 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full bg-white/40 blur-3xl" />
        <svg className="absolute inset-0 w-full h-full opacity-[0.03]" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid2" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1d4ed8" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid2)" />
        </svg>
      </div>

      <div className="relative w-full max-w-[440px] animate-slide-up">
        {/* Logo chip */}
        <div className="flex justify-center mb-7">
          <Link to="/" className="flex items-center gap-2.5 bg-white rounded-2xl px-5 py-3 shadow-card border border-slate-100 hover:shadow-card-hover transition-shadow">
            <div className="w-8 h-8 bg-hero-grad rounded-lg flex items-center justify-center">
              <Bus style={{ width: 18, height: 18 }} className="text-white" />
            </div>
            <span className="font-black text-lg text-slate-900 tracking-tight">PrayagTravels</span>
          </Link>
        </div>

        <div className="bg-white rounded-3xl shadow-[0_20px_60px_-10px_rgba(37,99,235,0.15),0_4px_20px_rgba(0,0,0,0.06)] border border-white/80 p-8">
          {/* Header */}
          <div className="text-center mb-6">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Create your account</h1>
            <p className="text-slate-500 text-sm mt-1.5">
              Already have one?{' '}
              <Link to="/login" className="text-primary-600 font-bold hover:text-primary-700 transition-colors">
                Sign in
              </Link>
            </p>
          </div>

          {/* Step indicator */}
          <div className="flex items-center gap-2 mb-6">
            {[1, 2].map(n => (
              <div key={n} className="flex items-center gap-2 flex-1">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                  step > n
                    ? 'bg-emerald-500 text-white'
                    : step === n
                    ? 'bg-primary-600 text-white shadow-btn'
                    : 'bg-slate-100 text-slate-400'
                }`}>
                  {step > n ? <Check className="w-3.5 h-3.5" /> : n}
                </div>
                <span className={`text-xs font-semibold transition-colors ${step >= n ? 'text-slate-700' : 'text-slate-400'}`}>
                  {n === 1 ? 'Your info' : 'Password'}
                </span>
                {n < 2 && <div className={`flex-1 h-px transition-colors ${step > n ? 'bg-emerald-400' : 'bg-slate-200'}`} />}
              </div>
            ))}
          </div>

          {/* Google OAuth — only on step 1 */}
          {step === 1 && GOOGLE_CLIENT_ID && (
            <>
              <div className="mb-4">
                <GoogleLogin
                  onSuccess={handleGoogle}
                  onError={() => toast.error('Google sign-up failed')}
                  theme="outline" size="large" width="360" text="signup_with" shape="rectangular"
                  logo_alignment="center"
                />
              </div>
              <div className="flex items-center gap-3 mb-5">
                <div className="flex-1 h-px bg-slate-100" />
                <span className="text-xs text-slate-400 font-semibold tracking-wide uppercase">or with email</span>
                <div className="flex-1 h-px bg-slate-100" />
              </div>
            </>
          )}

          {/* Step 1 — Personal info */}
          {step === 1 && (
            <form onSubmit={handleNext} className="space-y-4">
              <FloatingInput
                id="name" label="Full name" value={form.name}
                onChange={e => set('name', e.target.value)}
                placeholder="Your full name" icon={User} required
              />
              <FloatingInput
                id="email" label="Email address" type="email" value={form.email}
                onChange={e => set('email', e.target.value)}
                placeholder="you@example.com" icon={Mail} autoComplete="email" required
              />
              <FloatingInput
                id="phone" label="Phone number (optional)" type="tel" value={form.phone}
                onChange={e => set('phone', e.target.value)}
                placeholder="+91 98765 43210" icon={Phone}
              />
              <button
                type="submit"
                className="w-full mt-2 flex items-center justify-center gap-2 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-bold py-3.5 rounded-xl shadow-btn hover:shadow-lg transition-all duration-200 active:scale-[0.98] text-sm"
              >
                Continue <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* Step 2 — Password */}
          {step === 2 && (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* New password */}
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider">
                  Password <span className="text-red-400">*</span>
                </label>
                <div className="relative group">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary-500 transition-colors" />
                  <input
                    type={showPw ? 'text' : 'password'}
                    value={form.password}
                    onChange={e => set('password', e.target.value)}
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
                <PasswordStrength password={form.password} />
              </div>

              {/* Confirm password */}
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider">
                  Confirm password <span className="text-red-400">*</span>
                </label>
                <div className="relative group">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary-500 transition-colors" />
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    value={form.confirm}
                    onChange={e => set('confirm', e.target.value)}
                    placeholder="Repeat your password"
                    className={`w-full pl-10 pr-11 py-3 rounded-xl border bg-slate-50 text-slate-800 font-medium placeholder-slate-400 focus:outline-none focus:ring-2 focus:bg-white transition-all text-sm ${
                      form.confirm
                        ? passwordsMatch
                          ? 'border-emerald-400 focus:ring-emerald-500/30 focus:border-emerald-400'
                          : 'border-red-300 focus:ring-red-500/30 focus:border-red-400'
                        : 'border-slate-200 focus:ring-primary-500/30 focus:border-primary-400'
                    }`}
                    autoComplete="new-password"
                    required
                  />
                  <button type="button" onClick={() => setShowConfirm(p => !p)} tabIndex={-1}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                    {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {form.confirm && !passwordsMatch && (
                  <p className="text-red-500 text-xs mt-1.5 font-medium">Passwords do not match</p>
                )}
                {form.confirm && passwordsMatch && (
                  <p className="text-emerald-600 text-xs mt-1.5 font-medium flex items-center gap-1">
                    <Check className="w-3 h-3" /> Passwords match
                  </p>
                )}
              </div>

              {/* Terms */}
              <label className="flex items-start gap-3 cursor-pointer group">
                <div className={`mt-0.5 w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                  agreed ? 'bg-primary-600 border-primary-600' : 'border-slate-300 group-hover:border-primary-400'
                }`}
                  onClick={() => setAgreed(a => !a)}>
                  {agreed && <Check className="w-2.5 h-2.5 text-white" />}
                </div>
                <input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)} className="sr-only" />
                <span className="text-xs text-slate-500 leading-relaxed">
                  I agree to the{' '}
                  <a href="#" className="text-primary-600 font-semibold hover:underline">Terms of Service</a>{' '}
                  and{' '}
                  <a href="#" className="text-primary-600 font-semibold hover:underline">Privacy Policy</a>
                </span>
              </label>

              {/* Buttons */}
              <div className="flex gap-3 mt-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex-1 py-3.5 rounded-xl border-2 border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-50 hover:border-slate-300 transition-all"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading || !agreed}
                  className="flex-[2] flex items-center justify-center gap-2 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-bold py-3.5 rounded-xl shadow-btn hover:shadow-lg transition-all duration-200 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed text-sm"
                >
                  {loading ? (
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                    </svg>
                  ) : (
                    <>Create account <ArrowRight className="w-4 h-4" /></>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Perks row */}
        <div className="flex items-center justify-center gap-5 mt-6 flex-wrap">
          {['✓ Free to join', '✓ Live GPS tracking', '✓ Instant seat confirmation'].map(t => (
            <span key={t} className="text-xs text-slate-500 font-medium">{t}</span>
          ))}
        </div>
      </div>
    </div>
  )
}
