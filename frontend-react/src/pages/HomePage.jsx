import { Link } from 'react-router-dom'
import { ArrowRight, Star, Shield, Zap, MapPin, Clock, CreditCard, Smartphone, ChevronDown, CheckCircle } from 'lucide-react'
import SearchPanel from '../components/sections/SearchPanel'
import { POPULAR_ROUTES, STATS, TESTIMONIALS, FAQS, OPERATORS } from '../utils/constants'
import Button from '../components/ui/Button'
import { useState } from 'react'

function HeroSection() {
  return (
    <section className="relative bg-hero-grad min-h-[88vh] flex items-center overflow-hidden">
      {/* Decorative circles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/5 rounded-full" />
        <div className="absolute top-1/3 -left-20 w-64 h-64 bg-white/5 rounded-full" />
        <div className="absolute bottom-10 right-1/4 w-48 h-48 bg-accent-500/10 rounded-full" />
        <div className="absolute top-1/4 right-1/3 w-3 h-3 bg-white/30 rounded-full animate-float" />
        <div className="absolute top-2/3 left-1/4 w-2 h-2 bg-accent-300/50 rounded-full animate-float" style={{animationDelay:'2s'}} />
        <div className="absolute top-1/2 right-1/5 w-4 h-4 bg-primary-300/40 rounded-full animate-float" style={{animationDelay:'4s'}} />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full">
        <div className="max-w-4xl mx-auto text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 text-white/90 text-xs font-bold tracking-widest uppercase px-4 py-2 rounded-full mb-6">
            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
            100+ Buses Live • Prayagraj City Network
          </div>
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-black text-white leading-tight mb-6 tracking-tight">
            Travel Smart<br />
            <span className="bg-gradient-to-r from-amber-300 to-orange-300 bg-clip-text text-transparent">Across Prayagraj</span>
          </h1>
          <p className="text-lg sm:text-xl text-white/70 max-w-2xl mx-auto font-medium leading-relaxed">
            Book city bus tickets in seconds. Live GPS tracking, guaranteed seats, and the best fares across all 14 city stops.
          </p>
        </div>

        {/* Search panel */}
        <div className="max-w-4xl mx-auto">
          <SearchPanel />
        </div>

        {/* Trust signals */}
        <div className="max-w-3xl mx-auto mt-10 grid grid-cols-2 sm:grid-cols-4 gap-4">
          {STATS.map(s => (
            <div key={s.label} className="text-center">
              <p className="text-2xl font-black text-white">{s.value}</p>
              <p className="text-xs text-white/60 font-medium mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      <a href="#routes" className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/50 hover:text-white/80 transition-colors animate-bounce-slow">
        <ChevronDown className="w-6 h-6" />
      </a>
    </section>
  )
}

function PopularRoutes() {
  return (
    <section id="routes" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <span className="section-tag">🗺️ Popular Routes</span>
          <h2 className="section-title">Most Travelled Routes</h2>
          <p className="section-sub mx-auto">Frequent routes across Prayagraj's key destinations with best fares</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {POPULAR_ROUTES.map((r, i) => (
            <Link key={i} to={`/search?source=${encodeURIComponent(r.from)}&destination=${encodeURIComponent(r.to)}&date=${new Date().toISOString().split('T')[0]}`}
              className="group bg-white border border-slate-100 rounded-2xl p-5 hover:shadow-card-hover hover:-translate-y-1 transition-all duration-200 cursor-pointer">
              <div className="text-3xl mb-3">{r.icon}</div>
              <div className="flex items-center gap-2 text-sm font-bold text-slate-800 mb-1">
                <span>{r.from}</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-primary-500 transition-colors" />
                <span>{r.to}</span>
              </div>
              <div className="flex items-center justify-between mt-3">
                <span className="text-primary-600 font-extrabold text-base">{r.fare}</span>
                <div className="flex items-center gap-1 text-slate-400 text-xs font-medium">
                  <Clock className="w-3 h-3" />
                  {r.duration}
                </div>
              </div>
            </Link>
          ))}
        </div>
        <div className="text-center mt-8">
          <Link to="/routes">
            <Button variant="outline">View All Routes <ArrowRight className="w-4 h-4" /></Button>
          </Link>
        </div>
      </div>
    </section>
  )
}

function Features() {
  const features = [
    { icon: Zap, color: 'text-amber-500 bg-amber-50', title: 'Instant Booking', desc: 'Reserve your seat in under 60 seconds. No paperwork, no queue.' },
    { icon: MapPin, color: 'text-primary-500 bg-primary-50', title: 'Live GPS Tracking', desc: 'Know exactly where your bus is. Real-time updates every 30 seconds.' },
    { icon: Shield, color: 'text-emerald-500 bg-emerald-50', title: 'Secure Payments', desc: '256-bit SSL encryption. UPI, cards, and net banking supported.' },
    { icon: CreditCard, color: 'text-purple-500 bg-purple-50', title: 'Easy Cancellation', desc: 'Full refund up to 2 hours before departure. No questions asked.' },
    { icon: Star, color: 'text-rose-500 bg-rose-50', title: 'Verified Operators', desc: 'All buses are sanitised, inspected, and driven by certified drivers.' },
    { icon: Smartphone, color: 'text-cyan-500 bg-cyan-50', title: 'Mobile-First', desc: 'Optimised for your phone. Book, track, and manage on the go.' },
  ]
  return (
    <section className="py-20 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <span className="section-tag">✨ Why Choose Us</span>
          <h2 className="section-title">Everything You Need for a Great Journey</h2>
          <p className="section-sub mx-auto">We've built Prayagraj's most advanced bus booking system from the ground up</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <div key={i} className="bg-white rounded-2xl p-6 shadow-card hover:shadow-card-hover hover:-translate-y-1 transition-all duration-200">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${f.color} mb-4`}>
                <f.icon className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">{f.title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function Operators() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <span className="section-tag">🚌 Our Operators</span>
          <h2 className="section-title">Trusted Bus Operators</h2>
          <p className="section-sub mx-auto">Partnered with Prayagraj's most reliable transport corporations</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {OPERATORS.map(op => (
            <div key={op.id} className="rounded-2xl border border-slate-100 overflow-hidden hover:shadow-card-hover transition-all duration-200 hover:-translate-y-1">
              <div className="h-2" style={{ background: op.color }} />
              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center text-white text-xs font-black" style={{ background: op.color }}>
                    {op.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-900">{op.name}</h3>
                    <p className="text-xs text-slate-500">{op.full}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="bg-emerald-500 text-white text-xs font-bold px-2 py-0.5 rounded-md">★ {op.rating}</span>
                  <span className="text-xs text-slate-500">{op.reviews} reviews</span>
                </div>
                <p className="text-xs font-semibold text-accent-600 bg-accent-50 rounded-lg px-3 py-2 mb-3">{op.discount}</p>
                <div className="flex flex-wrap gap-2">
                  {op.tags.map(t => (
                    <span key={t} className="bg-slate-100 text-slate-600 text-xs font-medium px-2.5 py-1 rounded-full">{t}</span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function Testimonials() {
  const [active, setActive] = useState(0)
  return (
    <section className="py-20 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <span className="section-tag">💬 Testimonials</span>
          <h2 className="section-title">What Our Passengers Say</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TESTIMONIALS.slice(0, 3).map((t, i) => (
            <div key={i} className="bg-white rounded-2xl p-6 shadow-card">
              <div className="flex gap-1 mb-4">
                {[...Array(t.rating)].map((_, j) => <Star key={j} className="w-4 h-4 fill-amber-400 text-amber-400" />)}
              </div>
              <p className="text-sm text-slate-600 leading-relaxed mb-5 italic">"{t.text}"</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                  {t.avatar}
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">{t.name}</p>
                  <p className="text-xs text-slate-500">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function FAQPreview() {
  const [open, setOpen] = useState(null)
  const items = FAQS[0].items.slice(0, 4)
  return (
    <section className="py-20 bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <span className="section-tag">❓ FAQ</span>
          <h2 className="section-title">Common Questions</h2>
        </div>
        <div className="space-y-3">
          {items.map((item, i) => (
            <div key={i} className="border border-slate-200 rounded-2xl overflow-hidden">
              <button className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-slate-50 transition-colors"
                onClick={() => setOpen(open === i ? null : i)}>
                <span className="text-sm font-semibold text-slate-800 pr-4">{item.q}</span>
                <ChevronDown className={`w-4 h-4 text-slate-400 flex-shrink-0 transition-transform ${open === i ? 'rotate-180' : ''}`} />
              </button>
              {open === i && (
                <div className="px-5 pb-4 text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                  {item.a}
                </div>
              )}
            </div>
          ))}
        </div>
        <div className="text-center mt-8">
          <Link to="/faq"><Button variant="outline">View All FAQs <ArrowRight className="w-4 h-4" /></Button></Link>
        </div>
      </div>
    </section>
  )
}

function AppDownloadCTA() {
  return (
    <section className="py-20 bg-hero-grad relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full -translate-x-1/2 translate-y-1/2" />
      </div>
      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="text-5xl mb-5">📱</div>
        <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">Download the PrayagTravels App</h2>
        <p className="text-white/70 text-lg mb-3">Get ₹50 cashback on your first app booking. Available on iOS & Android.</p>
        <div className="flex flex-wrap items-center justify-center gap-3 mb-8">
          {['Offline Tickets', 'Instant Alerts', 'Easy Cancellation', 'Exclusive App Deals'].map(f => (
            <div key={f} className="flex items-center gap-2 bg-white/10 rounded-full px-3 py-1.5">
              <CheckCircle className="w-4 h-4 text-emerald-300" />
              <span className="text-white/80 text-sm font-medium">{f}</span>
            </div>
          ))}
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a href="#" className="flex items-center gap-3 bg-black text-white px-6 py-3 rounded-xl hover:bg-slate-900 transition-colors">
            <span className="text-2xl">🍎</span>
            <div className="text-left">
              <p className="text-[10px] text-white/60 leading-none">Download on the</p>
              <p className="text-base font-bold leading-tight">App Store</p>
            </div>
          </a>
          <a href="#" className="flex items-center gap-3 bg-black text-white px-6 py-3 rounded-xl hover:bg-slate-900 transition-colors">
            <span className="text-2xl">▶️</span>
            <div className="text-left">
              <p className="text-[10px] text-white/60 leading-none">Get it on</p>
              <p className="text-base font-bold leading-tight">Google Play</p>
            </div>
          </a>
        </div>
      </div>
    </section>
  )
}

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <PopularRoutes />
      <Features />
      <Operators />
      <Testimonials />
      <FAQPreview />
      <AppDownloadCTA />
    </>
  )
}
