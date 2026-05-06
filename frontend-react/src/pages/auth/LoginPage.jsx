import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Mail, Lock, Bus, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import Button from '../../components/ui/Button'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from || '/'
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPwd, setShowPwd] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.email || !form.password) return toast.error('Fill in all fields')
    setLoading(true)
    try {
      const user = await login({ email: form.email, password: form.password })
      toast.success(`Welcome back, ${user.name || 'traveler'}!`)
      navigate(from, { replace: true })
    } catch (error) {
      toast.error(error.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Left panel */}
      <div className="hidden lg:flex flex-1 bg-hero-grad items-center justify-center p-12">
        <div className="max-w-sm text-center text-white">
          <div className="w-20 h-20 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-8">
            <Bus className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-3xl font-extrabold mb-4">Welcome Back</h2>
          <p className="text-white/70 text-lg mb-8">Sign in to access your bookings, track buses, and enjoy exclusive member benefits.</p>
          <div className="space-y-3">
            {['Manage all your bookings', 'Exclusive member discounts', 'Faster checkout', 'Wallet & rewards'].map(f => (
              <div key={f} className="flex items-center gap-3 bg-white/10 rounded-xl px-4 py-3">
                <span className="text-emerald-300">✓</span>
                <span className="text-white/80 text-sm font-medium">{f}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <Link to="/" className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <Bus className="w-4 h-4 text-white" />
            </div>
            <span className="font-extrabold text-slate-900">PrayagTravels</span>
          </Link>

          <h1 className="text-2xl font-extrabold text-slate-900 mb-1">Sign in to your account</h1>
          <p className="text-slate-500 text-sm mb-8">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary-600 font-semibold hover:underline">Create one free</Link>
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="form-label">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input type="email" value={form.email}
                  onChange={e => setForm(f => ({...f, email: e.target.value}))}
                  placeholder="you@example.com" className="form-input pl-10" required />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="form-label mb-0">Password</label>
                <Link to="/forgot-password" className="text-xs text-primary-600 hover:underline font-semibold">Forgot password?</Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input type={showPwd ? 'text' : 'password'} value={form.password}
                  onChange={e => setForm(f => ({...f, password: e.target.value}))}
                  placeholder="Enter your password" className="form-input pl-10 pr-10" required />
                <button type="button" onClick={() => setShowPwd(s => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button type="submit" variant="primary" size="lg" loading={loading} className="w-full">
              Sign In
            </Button>
          </form>

          <div className="mt-6 relative flex items-center">
            <div className="flex-1 border-t border-slate-200" />
            <span className="px-3 text-xs text-slate-400 font-medium">or continue with</span>
            <div className="flex-1 border-t border-slate-200" />
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            {[{ label: 'Google', icon: '🇬' }, { label: 'Phone OTP', icon: '📱' }].map(p => (
              <button key={p.label}
                onClick={() => toast.success(`${p.label} login coming soon!`)}
                className="flex items-center justify-center gap-2 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors">
                <span>{p.icon}</span> {p.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
