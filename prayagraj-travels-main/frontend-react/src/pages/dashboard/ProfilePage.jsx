import { useState } from 'react'
import { User, Mail, Phone, Save, Camera, Shield, Bell, Globe } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { getInitials } from '../../utils/helpers'
import Button from '../../components/ui/Button'
import toast from 'react-hot-toast'

export default function ProfilePage() {
  const { user, updateProfile } = useAuth()
  const [form, setForm] = useState({ name: user?.name || '', email: user?.email || '', phone: user?.phone || '' })
  const [saving, setSaving] = useState(false)

  const save = async (e) => {
    e.preventDefault()
    if (!form.name.trim()) return toast.error('Name is required')
    setSaving(true)
    await new Promise(r => setTimeout(r, 600))
    updateProfile(form)
    toast.success('Profile updated successfully')
    setSaving(false)
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">My Profile</h1>
        <p className="text-slate-500 text-sm mt-1">Manage your personal information and preferences</p>
      </div>

      {/* Avatar card */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-card p-6">
        <div className="flex items-center gap-5">
          <div className="relative">
            <div className="w-20 h-20 bg-primary-600 rounded-full flex items-center justify-center text-white text-2xl font-extrabold">
              {getInitials(user?.name)}
            </div>
            <button className="absolute -bottom-1 -right-1 w-7 h-7 bg-white border border-slate-200 rounded-full flex items-center justify-center shadow-sm hover:bg-slate-50 transition-colors">
              <Camera className="w-3.5 h-3.5 text-slate-600" />
            </button>
          </div>
          <div>
            <h2 className="font-extrabold text-slate-900 text-lg">{user?.name}</h2>
            <p className="text-slate-500 text-sm">{user?.email}</p>
            <div className="flex items-center gap-1.5 mt-1.5">
              <Shield className="w-3.5 h-3.5 text-emerald-500" />
              <span className="text-xs text-emerald-600 font-semibold">Verified Member</span>
            </div>
          </div>
        </div>
      </div>

      {/* Edit form */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-card p-6">
        <h3 className="font-extrabold text-slate-900 mb-5">Personal Information</h3>
        <form onSubmit={save} className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="form-label">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))}
                  className="form-input pl-10" placeholder="Your full name" />
              </div>
            </div>
            <div>
              <label className="form-label">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input type="email" value={form.email} onChange={e => setForm(f => ({...f, email: e.target.value}))}
                  className="form-input pl-10" placeholder="you@example.com" />
              </div>
            </div>
            <div>
              <label className="form-label">Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input value={form.phone} onChange={e => setForm(f => ({...f, phone: e.target.value}))}
                  className="form-input pl-10" placeholder="10-digit number" maxLength={10} />
              </div>
            </div>
            <div>
              <label className="form-label">City</label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input defaultValue="Prayagraj" className="form-input pl-10" placeholder="Your city" />
              </div>
            </div>
          </div>
          <div className="pt-2">
            <Button type="submit" variant="primary" loading={saving} className="gap-2">
              <Save className="w-4 h-4" /> Save Changes
            </Button>
          </div>
        </form>
      </div>

      {/* Preferences */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-card p-6">
        <h3 className="font-extrabold text-slate-900 mb-5 flex items-center gap-2">
          <Bell className="w-5 h-5 text-primary-500" /> Notification Preferences
        </h3>
        <div className="space-y-4">
          {[
            { label: 'Booking Confirmations', desc: 'Get notified when a booking is confirmed', enabled: true },
            { label: 'Bus Delays', desc: 'Receive alerts if your bus is delayed', enabled: true },
            { label: 'Promotional Offers', desc: 'Exclusive deals and seasonal discounts', enabled: false },
            { label: 'Journey Reminders', desc: 'Reminders 1 hour before departure', enabled: true },
          ].map(pref => (
            <div key={pref.label} className="flex items-center justify-between py-3 border-b border-slate-50 last:border-0">
              <div>
                <p className="text-sm font-semibold text-slate-800">{pref.label}</p>
                <p className="text-xs text-slate-500 mt-0.5">{pref.desc}</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" defaultChecked={pref.enabled} className="sr-only peer" />
                <div className="w-11 h-6 bg-slate-200 rounded-full peer peer-checked:bg-primary-600 peer-checked:after:translate-x-5 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all" />
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Danger zone */}
      <div className="bg-white rounded-2xl border border-red-100 shadow-card p-6">
        <h3 className="font-extrabold text-slate-900 mb-2">Account Management</h3>
        <p className="text-sm text-slate-500 mb-4">These actions are permanent and cannot be undone.</p>
        <div className="flex flex-wrap gap-3">
          <button onClick={() => toast.success('Password reset link sent to your email')}
            className="px-4 py-2 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors">
            Change Password
          </button>
          <button onClick={() => toast.error('Account deletion requires customer support')}
            className="px-4 py-2 border border-red-200 rounded-xl text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors">
            Delete Account
          </button>
        </div>
      </div>
    </div>
  )
}
