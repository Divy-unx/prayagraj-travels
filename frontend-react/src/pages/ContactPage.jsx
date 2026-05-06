import { useState } from 'react'
import { Phone, Mail, MapPin, Clock, Send, MessageSquare, AlertCircle, CheckCircle } from 'lucide-react'
import Button from '../components/ui/Button'
import toast from 'react-hot-toast'

export default function ContactPage() {
  const [form, setForm] = useState({ name:'', email:'', phone:'', subject:'General Enquiry', message:'' })
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const set = (k, v) => setForm(f => ({...f, [k]: v}))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name || !form.email || !form.message) return toast.error('Please fill in all required fields')
    setSending(true)
    await new Promise(r => setTimeout(r, 900))
    setSent(true)
    setSending(false)
  }

  const contacts = [
    { icon: Phone, color: 'bg-primary-50 text-primary-600', label: 'Customer Care', value: '+91 0532 246 0000', sub: '7 AM – 9 PM, Mon–Sat', href: 'tel:+915322460000' },
    { icon: Phone, color: 'bg-red-50 text-red-600', label: 'Emergency Helpline', value: '+91 0532 246 9999', sub: '24/7 for emergencies', href: 'tel:+915322469999' },
    { icon: Mail, color: 'bg-amber-50 text-amber-600', label: 'Email Support', value: 'support@prayagtravels.in', sub: 'Reply within 4 hours', href: 'mailto:support@prayagtravels.in' },
    { icon: MessageSquare, color: 'bg-emerald-50 text-emerald-600', label: 'Live Chat', value: 'Chat with us now', sub: 'Avg response: 2 min', href: '#' },
  ]

  return (
    <>
      {/* Hero */}
      <section className="bg-hero-grad py-14">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <span className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-white/80 text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full mb-5">
            📬 Contact Us
          </span>
          <h1 className="text-4xl font-black mb-3">We're Here to Help</h1>
          <p className="text-white/70 text-lg">Got a question, complaint, or just want to say hello? Reach out and we'll respond quickly.</p>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-5 gap-8">
          {/* Left: contact cards + info */}
          <div className="lg:col-span-2 space-y-5">
            <h2 className="text-xl font-extrabold text-slate-900">Get in Touch</h2>
            <div className="space-y-3">
              {contacts.map(c => (
                <a key={c.label} href={c.href}
                  className="flex items-center gap-4 bg-white rounded-2xl border border-slate-100 shadow-card p-4 hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${c.color}`}>
                    <c.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">{c.label}</p>
                    <p className="font-bold text-slate-900 text-sm">{c.value}</p>
                    <p className="text-xs text-slate-500">{c.sub}</p>
                  </div>
                </a>
              ))}
            </div>

            {/* Office */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-card p-5">
              <h3 className="font-extrabold text-slate-900 mb-4 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-primary-500" /> Our Office
              </h3>
              <p className="text-sm text-slate-700 font-semibold">PrayagTravels Headquarters</p>
              <p className="text-sm text-slate-500 mt-1 leading-relaxed">
                Civil Lines Bus Terminal, Near Allahabad High Court,<br />
                Prayagraj, Uttar Pradesh – 211001
              </p>
              <div className="mt-3 flex items-center gap-2 text-sm text-slate-500">
                <Clock className="w-4 h-4 text-slate-400" />
                Mon–Sat: 8 AM – 7 PM
              </div>
            </div>

            {/* Emergency box */}
            <div className="bg-red-50 rounded-2xl border border-red-200 p-5">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-extrabold text-red-800 text-sm">Emergency on Bus?</p>
                  <p className="text-xs text-red-700 mt-1 leading-relaxed">
                    If you're experiencing an emergency on a bus, call our 24/7 helpline immediately: <strong>+91 0532 246 9999</strong>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right: form */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl border border-slate-100 shadow-card p-6">
              {sent ? (
                <div className="flex flex-col items-center py-12 text-center">
                  <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mb-4">
                    <CheckCircle className="w-8 h-8 text-emerald-500" />
                  </div>
                  <h3 className="text-xl font-extrabold text-slate-900 mb-2">Message Sent!</h3>
                  <p className="text-slate-500 text-sm max-w-xs">
                    Thank you for reaching out. Our team will get back to you within 4 hours.
                  </p>
                  <button onClick={() => { setSent(false); setForm({ name:'', email:'', phone:'', subject:'General Enquiry', message:'' }) }}
                    className="mt-6 text-sm font-semibold text-primary-600 hover:underline">
                    Send another message
                  </button>
                </div>
              ) : (
                <>
                  <h2 className="text-xl font-extrabold text-slate-900 mb-1">Send us a Message</h2>
                  <p className="text-slate-500 text-sm mb-6">Fill in the form and we'll get back to you within 4 hours.</p>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="form-label">Full Name <span className="text-red-400">*</span></label>
                        <input value={form.name} onChange={e => set('name', e.target.value)}
                          placeholder="Your name" className="form-input" required />
                      </div>
                      <div>
                        <label className="form-label">Email Address <span className="text-red-400">*</span></label>
                        <input type="email" value={form.email} onChange={e => set('email', e.target.value)}
                          placeholder="you@example.com" className="form-input" required />
                      </div>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="form-label">Phone Number</label>
                        <input value={form.phone} onChange={e => set('phone', e.target.value)}
                          placeholder="Optional" className="form-input" />
                      </div>
                      <div>
                        <label className="form-label">Subject</label>
                        <select value={form.subject} onChange={e => set('subject', e.target.value)} className="form-input">
                          {['General Enquiry','Booking Issue','Refund Request','Complaint','Feedback','Partnership'].map(s => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="form-label">Message <span className="text-red-400">*</span></label>
                      <textarea value={form.message} onChange={e => set('message', e.target.value)}
                        placeholder="Describe your issue or question in detail…"
                        rows={5} className="form-input resize-none" required />
                    </div>
                    <Button type="submit" variant="primary" size="lg" loading={sending} className="w-full">
                      <Send className="w-4 h-4" /> Send Message
                    </Button>
                    <p className="text-xs text-slate-400 text-center">We respect your privacy and will never share your information.</p>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
