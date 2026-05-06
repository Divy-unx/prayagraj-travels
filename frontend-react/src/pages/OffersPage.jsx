import { useState } from 'react'
import { Tag, Copy, Check, Star, Gift, Users, Zap } from 'lucide-react'
import { OFFERS } from '../utils/constants'
import { Link } from 'react-router-dom'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
import toast from 'react-hot-toast'

const membershipTiers = [
  { name:'Explorer', icon:'🚌', color:'from-slate-500 to-slate-700', trips:0, perks:['5% off all bookings','Priority support','Early access to deals'] },
  { name:'Voyager', icon:'⭐', color:'from-primary-500 to-primary-700', trips:10, perks:['10% off all bookings','Free cancellation','Wallet cashback 2%', 'Birthday bonus'] },
  { name:'Elite', icon:'💎', color:'from-amber-500 to-orange-600', trips:25, perks:['15% off all bookings','Dedicated support line','Wallet cashback 5%','Free seat upgrade','Lounge access'] },
]

function OfferCard({ offer }) {
  const [copied, setCopied] = useState(false)
  const copy = () => {
    navigator.clipboard.writeText(offer.code).catch(() => {})
    setCopied(true)
    toast.success(`Code ${offer.code} copied!`)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-card overflow-hidden hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200">
      <div className={`bg-gradient-to-r ${offer.color} p-5 text-white`}>
        <div className="flex items-start justify-between mb-3">
          <Badge variant="default" className="bg-white/20 text-white border-0 text-xs">{offer.type}</Badge>
          <span className="text-2xl font-black">{offer.discount}</span>
        </div>
        <h3 className="font-extrabold text-lg leading-tight">{offer.title}</h3>
      </div>
      <div className="p-5">
        <p className="text-sm text-slate-600 leading-relaxed mb-4">{offer.desc}</p>
        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl px-4 py-2.5 text-center">
            <span className="font-black text-slate-900 tracking-widest text-sm">{offer.code}</span>
          </div>
          <button onClick={copy}
            className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
              copied ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-700 hover:bg-primary-50 hover:text-primary-700'
            }`}>
            {copied ? <><Check className="w-4 h-4" /> Copied!</> : <><Copy className="w-4 h-4" /> Copy</>}
          </button>
        </div>
        <p className="text-xs text-slate-400 flex items-center gap-1">
          <Zap className="w-3 h-3" /> Valid till: {offer.validTill}
        </p>
      </div>
    </div>
  )
}

export default function OffersPage() {
  const [referralCopied, setReferralCopied] = useState(false)
  const refCode = 'PRAYAG' + Math.random().toString(36).slice(2, 6).toUpperCase()

  const copyRef = () => {
    navigator.clipboard.writeText(refCode).catch(() => {})
    setReferralCopied(true)
    toast.success('Referral code copied!')
    setTimeout(() => setReferralCopied(false), 2000)
  }

  return (
    <>
      {/* Hero */}
      <section className="bg-hero-grad py-14 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full translate-x-1/2 -translate-y-1/2" />
        </div>
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <span className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-white/80 text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full mb-5">
            🏷️ Offers & Deals
          </span>
          <h1 className="text-4xl font-black mb-3">Save on Every Ride</h1>
          <p className="text-white/70 text-lg">Exclusive coupons, seasonal discounts, and loyalty rewards — all in one place.</p>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Active offers */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div>
              <span className="section-tag">🎁 Active Offers</span>
              <h2 className="text-2xl font-extrabold text-slate-900 mt-1">Live Deals Right Now</h2>
            </div>
            <span className="text-xs text-slate-500">{OFFERS.length} active offers</span>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {OFFERS.map((offer, i) => <OfferCard key={i} offer={offer} />)}
          </div>
        </div>

        {/* Membership */}
        <div className="mb-12">
          <div className="text-center mb-8">
            <span className="section-tag">⭐ Loyalty Program</span>
            <h2 className="text-2xl font-extrabold text-slate-900 mt-1">PrayagTravels Membership</h2>
            <p className="text-slate-500 mt-2 text-sm">Every trip earns you points. Reach higher tiers for bigger rewards.</p>
          </div>
          <div className="grid sm:grid-cols-3 gap-5">
            {membershipTiers.map((tier, i) => (
              <div key={tier.name} className={`rounded-2xl overflow-hidden border ${i === 2 ? 'border-amber-200' : 'border-slate-100'} shadow-card`}>
                <div className={`bg-gradient-to-br ${tier.color} p-5 text-white text-center`}>
                  <span className="text-4xl">{tier.icon}</span>
                  <h3 className="font-black text-xl mt-2">{tier.name}</h3>
                  <p className="text-white/70 text-sm mt-1">{tier.trips === 0 ? 'Starting tier' : `${tier.trips}+ trips`}</p>
                </div>
                <div className="bg-white p-5">
                  <ul className="space-y-2.5">
                    {tier.perks.map(p => (
                      <li key={p} className="flex items-center gap-2 text-sm text-slate-700">
                        <span className="text-emerald-500 font-bold text-xs">✓</span> {p}
                      </li>
                    ))}
                  </ul>
                  <Link to="/register" className="block mt-5">
                    <Button variant={i === 2 ? 'secondary' : 'outline'} size="sm" className="w-full">
                      {i === 0 ? 'Current Tier' : 'Upgrade'}
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Referral */}
        <div className="bg-gradient-to-br from-primary-600 to-primary-800 rounded-2xl p-8 text-white text-center">
          <Users className="w-10 h-10 mx-auto mb-4 text-primary-200" />
          <h2 className="text-2xl font-extrabold mb-2">Refer a Friend, Earn ₹50</h2>
          <p className="text-primary-200 text-sm mb-6 max-w-md mx-auto">
            Share your referral code with friends. When they complete their first trip, you both get ₹50 wallet credit.
          </p>
          <div className="flex items-center justify-center gap-3 max-w-xs mx-auto">
            <div className="flex-1 bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-center">
              <span className="font-black tracking-widest text-sm">{refCode}</span>
            </div>
            <button onClick={copyRef}
              className={`flex items-center gap-1.5 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                referralCopied ? 'bg-emerald-500' : 'bg-white text-primary-700 hover:bg-primary-50'
              }`}>
              {referralCopied ? <><Check className="w-4 h-4" /> Copied!</> : <><Copy className="w-4 h-4" /> Copy</>}
            </button>
          </div>
          <p className="text-primary-300 text-xs mt-4">Valid for new users only. Reward credited after first trip completion.</p>
        </div>
      </div>
    </>
  )
}
