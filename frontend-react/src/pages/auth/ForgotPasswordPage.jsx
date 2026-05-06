import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Mail, Bus, CheckCircle, ArrowLeft } from 'lucide-react'
import Button from '../../components/ui/Button'
import toast from 'react-hot-toast'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email) return toast.error('Enter your email address')
    setLoading(true)
    await new Promise(r => setTimeout(r, 800))
    setSent(true)
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <Link to="/" className="flex items-center gap-2 mb-8">
          <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
            <Bus className="w-4 h-4 text-white" />
          </div>
          <span className="font-extrabold text-slate-900">PrayagTravels</span>
        </Link>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-card p-8">
          {sent ? (
            <div className="text-center">
              <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-5">
                <CheckCircle className="w-8 h-8 text-emerald-500" />
              </div>
              <h2 className="text-xl font-extrabold text-slate-900 mb-2">Check your inbox</h2>
              <p className="text-slate-500 text-sm mb-6">
                We've sent password reset instructions to <strong className="text-slate-700">{email}</strong>.
                Check your spam folder if you don't see it.
              </p>
              <Link to="/login">
                <Button variant="primary" className="w-full">Back to Sign In</Button>
              </Link>
            </div>
          ) : (
            <>
              <div className="w-14 h-14 bg-primary-50 rounded-2xl flex items-center justify-center mb-6">
                <Mail className="w-7 h-7 text-primary-600" />
              </div>
              <h1 className="text-2xl font-extrabold text-slate-900 mb-2">Forgot your password?</h1>
              <p className="text-slate-500 text-sm mb-7">
                No worries. Enter your email address and we'll send you a link to reset your password.
              </p>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="form-label">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                      placeholder="you@example.com" className="form-input pl-10" required />
                  </div>
                </div>
                <Button type="submit" variant="primary" size="lg" loading={loading} className="w-full">
                  Send Reset Link
                </Button>
              </form>
              <Link to="/login" className="flex items-center justify-center gap-2 mt-5 text-sm text-slate-500 hover:text-primary-600 transition-colors font-medium">
                <ArrowLeft className="w-4 h-4" /> Back to Sign In
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
