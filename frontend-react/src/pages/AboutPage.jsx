import { Shield, Zap, Heart, Award } from 'lucide-react'
import { Link } from 'react-router-dom'
import Button from '../components/ui/Button'
import { STATS } from '../utils/constants'

const TEAM = [
  { name: 'Divyanshu Mishra', role: 'Founder & CEO', image: 'c:\\Users\\kisla\\Downloads\\divyanshu.jpeg' },
  { name: 'Desh Deepak', role: 'Head of Operations', image: 'c:\\Users\\kisla\\Downloads\\deepak.jpeg' },
  { name: 'Shivaji Singh', role: 'Lead Developer', image: 'c:\\Users\\kisla\\Downloads\\shivaji.jpeg' },
  { name: 'Kislay Sahu', role: 'Customer Success', image: 'c:\\Users\\kisla\\Downloads\\kislay.jpeg' },
]

const milestones = [
  { year: '2023', event: 'PrayagTravels founded with 10 buses on 2 routes' },
  { year: '2024', event: 'Expanded to all 14 city stops. Crossed 5,000 daily passengers' },
  { year: '2025', event: 'Launched live GPS tracking and mobile app. 50,000+ app downloads' },
  { year: '2026', event: 'Partnered with UPSRTC, PCB, and Triveni. 100+ buses now active' },
]

export default function AboutPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-hero-grad py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <span className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-white/80 text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full mb-6">
            🚌 About Us
          </span>
          <h1 className="text-4xl sm:text-5xl font-black mb-5 leading-tight">
            Reinventing City Travel<br />in Prayagraj
          </h1>
          <p className="text-lg text-white/70 max-w-2xl mx-auto leading-relaxed">
            We're on a mission to make intra-city bus travel in Prayagraj as seamless, reliable, and enjoyable as possible — for every passenger, every single day.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="py-14 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {STATS.map(s => (
              <div key={s.label} className="text-center">
                <p className="text-4xl mb-1">{s.icon}</p>
                <p className="text-3xl font-black text-slate-900">{s.value}</p>
                <p className="text-sm text-slate-500 mt-1 font-medium">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div>
              <span className="section-tag">🎯 Our Mission</span>
              <h2 className="section-title mt-1">Making Prayagraj Move Smarter</h2>
              <p className="text-slate-600 mt-4 leading-relaxed">
                Public transport is the backbone of any city. Yet booking a city bus in Prayagraj was complicated, unreliable, and frustrating. We built PrayagTravels to change that.
              </p>
              <p className="text-slate-600 mt-3 leading-relaxed">
                Our platform combines real-time GPS tracking, instant seat booking, and seamless digital payments to give every Prayagraj resident a world-class commuting experience — without the world-class price tag.
              </p>
              <div className="mt-6 space-y-3">
                {[
                  'Zero hidden charges — what you see is what you pay',
                  'Free cancellation up to 2 hours before departure',
                  'Real-time GPS tracking on every bus',
                  'Dedicated support 7 days a week',
                ].map(p => (
                  <div key={p} className="flex items-start gap-3">
                    <div className="w-5 h-5 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-emerald-600 text-xs">✓</span>
                    </div>
                    <p className="text-slate-700 text-sm font-medium">{p}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: Shield, color: 'bg-primary-50 text-primary-600', title: 'Safety First', desc: 'All buses are inspected weekly. Drivers are background-verified and trained.' },
                { icon: Zap, color: 'bg-amber-50 text-amber-600', title: 'Instant Booking', desc: 'Seat reserved in under 60 seconds. No paperwork, no queues.' },
                { icon: Heart, color: 'bg-rose-50 text-rose-600', title: 'Passenger-First', desc: 'Every decision we make starts with the question: does this help our passengers?' },
                { icon: Award, color: 'bg-emerald-50 text-emerald-600', title: 'Certified Quality', desc: 'ISO-certified operations. Award-winning platform design.' },
              ].map(c => (
                <div key={c.title} className="bg-white rounded-2xl border border-slate-100 p-5 shadow-card">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${c.color}`}>
                    <c.icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm mb-1">{c.title}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">{c.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* The Team */}
      <section className="py-16 bg-slate-50 border-t border-slate-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <span className="section-tag">👥 Our Team</span>
            <h2 className="section-title mt-1">The People Behind PrayagTravels</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
            {TEAM.map(member => (
              <div key={member.name} className="bg-white rounded-2xl shadow-card p-6 text-center border border-slate-100 hover:shadow-card-hover transition-shadow duration-300">
                <img src={member.image} alt={member.name} className="w-24 h-24 rounded-full mx-auto mb-4 border-4 border-primary-50 object-cover" />
                <h3 className="font-bold text-slate-900 text-lg">{member.name}</h3>
                <p className="text-sm text-slate-500 font-medium mt-1">{member.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Milestones */}
      <section className="py-16 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <span className="section-tag">📅 Our Story</span>
            <h2 className="section-title mt-1">How We Got Here</h2>
          </div>
          <div className="relative pl-8">
            <div className="absolute left-3 top-2 bottom-2 w-0.5 bg-slate-200" />
            {milestones.map((m, i) => (
              <div key={i} className="relative mb-8 last:mb-0">
                <div className="absolute -left-5 top-1 w-4 h-4 rounded-full bg-primary-600 border-2 border-white shadow" />
                <div className="bg-slate-50 rounded-xl p-4">
                  <span className="text-xs font-black text-primary-600 uppercase tracking-wider">{m.year}</span>
                  <p className="text-slate-800 font-semibold text-sm mt-1">{m.event}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-extrabold text-slate-900 mb-4">Ready to Travel Smarter?</h2>
          <p className="text-slate-500 mb-7">Join 50,000+ daily passengers who trust PrayagTravels for their city commute.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/"><Button variant="primary" size="lg">Book a Bus Now</Button></Link>
            <Link to="/contact"><Button variant="outline" size="lg">Contact Us</Button></Link>
          </div>
        </div>
      </section>
    </>
  )
}
