import { useState } from 'react'
import { Wallet, TrendingUp, Gift, ArrowUpRight, ArrowDownLeft, Plus, Star } from 'lucide-react'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import toast from 'react-hot-toast'

const txns = [
  { id:1, type:'credit', desc:'Booking Refund — #BK4821', amount:25, date:'2026-04-30', status:'completed' },
  { id:2, type:'debit',  desc:'Booking — Civil Lines → Airport', amount:40, date:'2026-04-28', status:'completed' },
  { id:3, type:'credit', desc:'Referral Bonus', amount:50, date:'2026-04-25', status:'completed' },
  { id:4, type:'debit',  desc:'Booking — Sangam → Civil Lines', amount:15, date:'2026-04-20', status:'completed' },
  { id:5, type:'credit', desc:'Top-up via UPI', amount:200, date:'2026-04-15', status:'completed' },
  { id:6, type:'debit',  desc:'Booking — Naini → Phaphamau', amount:20, date:'2026-04-10', status:'completed' },
]

const rewards = [
  { label:'Journey Points', value:'1,240', icon:'🌟', color:'bg-amber-50 text-amber-700' },
  { label:'Trips Completed', value:'18', icon:'🚌', color:'bg-primary-50 text-primary-700' },
  { label:'Saved This Month', value:'₹85', icon:'💰', color:'bg-emerald-50 text-emerald-700' },
  { label:'Referrals', value:'3', icon:'👥', color:'bg-purple-50 text-purple-700' },
]

export default function WalletPage() {
  const [balance] = useState(285)
  const [points] = useState(1240)
  const [addAmount, setAddAmount] = useState('')
  const [adding, setAdding] = useState(false)

  const handleAdd = async () => {
    if (!addAmount || Number(addAmount) < 10) return toast.error('Minimum top-up amount is ₹10')
    setAdding(true)
    await new Promise(r => setTimeout(r, 800))
    toast.success(`₹${addAmount} added to wallet! (Demo)`)
    setAddAmount('')
    setAdding(false)
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">Wallet & Rewards</h1>
        <p className="text-slate-500 text-sm mt-1">Manage your balance, rewards, and transaction history</p>
      </div>

      {/* Balance cards */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="bg-hero-grad rounded-2xl p-6 text-white">
          <div className="flex items-center gap-2 mb-4">
            <Wallet className="w-5 h-5 text-white/70" />
            <p className="text-white/70 text-sm font-semibold">Wallet Balance</p>
          </div>
          <p className="text-4xl font-black mb-1">₹{balance}</p>
          <p className="text-white/60 text-xs">Available for instant booking</p>
          <div className="mt-5 flex gap-3">
            <div className="flex-1">
              <label className="text-white/60 text-xs font-medium">Add money</label>
              <input value={addAmount} onChange={e => setAddAmount(e.target.value)}
                type="number" placeholder="₹ Amount"
                className="mt-1 w-full bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-white placeholder-white/40 text-sm font-semibold focus:outline-none focus:border-white/40" />
            </div>
            <div className="flex items-end">
              <Button onClick={handleAdd} loading={adding} variant="white" size="sm">
                <Plus className="w-4 h-4" /> Add
              </Button>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl p-6 text-white">
          <div className="flex items-center gap-2 mb-4">
            <Star className="w-5 h-5 text-white/70" />
            <p className="text-white/70 text-sm font-semibold">Reward Points</p>
          </div>
          <p className="text-4xl font-black mb-1">{points.toLocaleString()}</p>
          <p className="text-white/60 text-xs">≈ ₹{Math.floor(points / 10)} cashback value</p>
          <button onClick={() => toast.success('Redeem feature coming soon!')}
            className="mt-5 w-full bg-white/20 hover:bg-white/30 transition-colors text-white font-bold text-sm py-2.5 rounded-xl">
            Redeem Points
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {rewards.map(r => (
          <div key={r.label} className="bg-white rounded-2xl border border-slate-100 shadow-card p-4 text-center">
            <span className="text-2xl">{r.icon}</span>
            <p className="font-extrabold text-slate-900 text-lg mt-1">{r.value}</p>
            <p className="text-xs text-slate-500 mt-0.5">{r.label}</p>
          </div>
        ))}
      </div>

      {/* Quick top-up amounts */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-card p-5">
        <h3 className="font-extrabold text-slate-900 mb-4">Quick Top-up</h3>
        <div className="flex flex-wrap gap-2">
          {[50, 100, 200, 500, 1000].map(amt => (
            <button key={amt} onClick={() => setAddAmount(String(amt))}
              className="px-5 py-2 border-2 border-slate-200 hover:border-primary-400 hover:bg-primary-50 hover:text-primary-700 rounded-xl text-sm font-bold text-slate-700 transition-colors">
              ₹{amt}
            </button>
          ))}
        </div>
        <p className="text-xs text-slate-400 mt-3">Payments via UPI, Debit Card, Net Banking • Instant credit</p>
      </div>

      {/* Transactions */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-card p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-extrabold text-slate-900">Transaction History</h3>
          <button className="text-xs font-semibold text-primary-600 hover:underline">Download PDF</button>
        </div>
        <div className="space-y-3">
          {txns.map(t => (
            <div key={t.id} className="flex items-center justify-between py-3 border-b border-slate-50 last:border-0">
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center ${t.type === 'credit' ? 'bg-emerald-100' : 'bg-red-100'}`}>
                  {t.type === 'credit'
                    ? <ArrowDownLeft className="w-4 h-4 text-emerald-600" />
                    : <ArrowUpRight className="w-4 h-4 text-red-500" />}
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-800">{t.desc}</p>
                  <p className="text-xs text-slate-400">{t.date}</p>
                </div>
              </div>
              <span className={`font-extrabold text-sm ${t.type === 'credit' ? 'text-emerald-600' : 'text-red-500'}`}>
                {t.type === 'credit' ? '+' : '-'}₹{t.amount}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
