import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { User, Mail, Lock, Phone, Bus, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { authService } from '../../services/api'
import Button from '../../components/ui/Button'
import toast from 'react-hot-toast'

export default function RegisterPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name:'', email:'', phone:'', password:'' })
  const [showPwd, setShowPwd] = useState(false)
  const [agreed, setAgreed] = useState(false)
  const [loading, setLoading] = useState(false)

  const set = (k, v) => setForm(f => ({...f, [k]: v}))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!agreed) return toast.error('Please accept terms and conditions')
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters')
    if (!/^[6-9]\d{9}$/.test(form.phone)) return toast.error('Enter a valid 10-digit phone number')
    setLoading(true)
    try {
      const result = await authService.register(form)
      const user = result.user || result
      if (result.token) {
        // Persisted by authService.register; sync context now.
        await login({ ...user, token: result.token })
      } else {
        await login(user)
      }
      toast.success(`Account created for ${user.name}!`)
      navigate('/dashboard/profile')
    } catch (error) {
      toast.error(error.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <div className="hidden lg:flex flex-1 bg-hero-grad items-center justify-center p-12">
        <div className="max-w-sm text-center text-white">
          <div className="w-20 h-20 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-8">
            <Bus className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-3xl font-extrabold mb-4">Join PrayagTravels</h2>
          <p className="text-white/70 text-lg mb-8">Create your free account and start travelling smarter across Prayagraj.</p>
          <div className="bg-white/10 rounded-2xl p-5 text-left space-y-3">
            <p className="text-white font-bold text-sm mb-2">🎁 New Member Benefits</p>
            {['₹50 off on first booking', 'Live bus tracking', 'Easy cancellations', 'Exclusive member deals'].map(b => (
              <div key={b} className="flex items-center gap-2 text-white/80 text-sm">
                <span className="text-emerald-300 font-bold">✓</span> {b}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <Link to="/" className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <Bus className="w-4 h-4 text-white" />
            </div>
            <span className="font-extrabold text-slate-900">PrayagTravels</span>
          </Link>

          <h1 className="text-2xl font-extrabold text-slate-900 mb-1">Create your account</h1>
          <p className="text-slate-500 text-sm mb-8">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-600 font-semibold hover:underline">Sign in</Link>
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="form-label">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input type="text" value={form.name} onChange={e => set('name', e.target.value)}
                  placeholder="Your full name" className="form-input pl-10" required />
              </div>
            </div>
            <div>
              <label className="form-label">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input type="email" value={form.email} onChange={e => set('email', e.target.value)}
                  placeholder="you@example.com" className="form-input pl-10" required />
              </div>
            </div>
            <div>
              <label className="form-label">Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input type="tel" value={form.phone} onChange={e => set('phone', e.target.value)}
                  placeholder="10-digit mobile number" maxLength={10} className="form-input pl-10" required />
              </div>
            </div>
            <div>
              <label className="form-label">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input type={showPwd ? 'text' : 'password'} value={form.password}
                  onChange={e => set('password', e.target.value)}
                  placeholder="Minimum 6 characters" className="form-input pl-10 pr-10" required />
                <button type="button" onClick={() => setShowPwd(s => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <label className="flex items-start gap-3 cursor-pointer">
              <input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)}
                className="mt-0.5 rounded accent-primary-600 w-4 h-4" />
              <span className="text-sm text-slate-600">
                I agree to the{' '}
                <a href="#" className="text-primary-600 hover:underline font-semibold">Terms of Service</a>
                {' '}and{' '}
                <a href="#" className="text-primary-600 hover:underline font-semibold">Privacy Policy</a>
              </span>
            </label>

            <Button type="submit" variant="primary" size="lg" loading={loading} className="w-full">
              Create Account — It's Free
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
