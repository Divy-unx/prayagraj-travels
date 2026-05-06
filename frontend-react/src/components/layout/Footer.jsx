import { Link } from 'react-router-dom'
import { Bus, MapPin, Phone, Mail, Globe, Share2, Video, Music, ArrowRight } from 'lucide-react'

const footerLinks = {
  Services: [
    { label: 'Book Bus Tickets', to: '/' },
    { label: 'Track Your Bus', to: '/search' },
    { label: 'View All Routes', to: '/routes' },
    { label: 'Offers & Discounts', to: '/offers' },
    { label: 'City Bus Pass', to: '/offers' },
  ],
  Support: [
    { label: 'Help Center', to: '/faq' },
    { label: 'Contact Us', to: '/contact' },
    { label: 'Cancellation Policy', to: '/faq' },
    { label: 'Refund Status', to: '/dashboard/bookings' },
    { label: 'Safety Guidelines', to: '/about' },
  ],
  Company: [
    { label: 'About Us', to: '/about' },
    { label: 'Careers', to: '/about' },
    { label: 'Press & Media', to: '/about' },
    { label: 'Partner with Us', to: '/contact' },
    { label: 'Accessibility', to: '/about' },
  ],
}

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300">
      {/* Top CTA */}
      <div className="bg-primary-600 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="text-white text-xl font-extrabold">Travel Smart with PrayagTravels</h3>
            <p className="text-primary-100 text-sm mt-1">Download our app and get ₹50 off your first booking</p>
          </div>
          <div className="flex gap-3">
            <a href="#" className="flex items-center gap-2 bg-black text-white px-4 py-2.5 rounded-xl hover:bg-slate-800 transition-colors text-sm font-semibold">
              <span className="text-lg">🍎</span> App Store
            </a>
            <a href="#" className="flex items-center gap-2 bg-black text-white px-4 py-2.5 rounded-xl hover:bg-slate-800 transition-colors text-sm font-semibold">
              <span className="text-lg">▶️</span> Google Play
            </a>
          </div>
        </div>
      </div>

      {/* Main footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-2.5 mb-5">
              <div className="w-9 h-9 bg-primary-600 rounded-xl flex items-center justify-center">
                <Bus className="w-5 h-5 text-white" />
              </div>
              <span className="font-extrabold text-lg text-white">PrayagTravels</span>
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed mb-5 max-w-xs">
              Prayagraj's most trusted intra-city bus booking platform. Safe, reliable, and affordable travel across all 14 city stops.
            </p>
            <div className="space-y-2.5">
              <div className="flex items-center gap-3 text-sm text-slate-400">
                <MapPin className="w-4 h-4 text-primary-400 flex-shrink-0" />
                <span>Civil Lines, Prayagraj, UP 211001</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-400">
                <Phone className="w-4 h-4 text-primary-400 flex-shrink-0" />
                <span>+91 0532 246 0000</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-400">
                <Mail className="w-4 h-4 text-primary-400 flex-shrink-0" />
                <span>support@prayagtravels.in</span>
              </div>
            </div>
            <div className="flex items-center gap-3 mt-6">
              {[
                { Icon: Globe, href: '#' },
                { Icon: Share2, href: '#' },
                { Icon: Video, href: '#' },
                { Icon: Music, href: '#' },
              ].map(({ Icon, href }, i) => (
                <a key={i} href={href}
                  className="w-9 h-9 bg-slate-800 hover:bg-primary-600 rounded-lg flex items-center justify-center transition-colors">
                  <Icon className="w-4 h-4 text-slate-300" />
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([heading, links]) => (
            <div key={heading}>
              <h4 className="text-white font-bold text-sm mb-4 uppercase tracking-wider">{heading}</h4>
              <ul className="space-y-2.5">
                {links.map(l => (
                  <li key={l.label}>
                    <Link to={l.to}
                      className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-primary-300 transition-colors group">
                      <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-slate-500">© 2026 PrayagTravels. All rights reserved. An initiative for smart city mobility.</p>
          <div className="flex items-center gap-5">
            {['Privacy Policy','Terms of Service','Cookie Policy'].map(t => (
              <a key={t} href="#" className="text-xs text-slate-500 hover:text-slate-300 transition-colors">{t}</a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
