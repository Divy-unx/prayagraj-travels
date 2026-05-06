import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Search, Clock, MapPin, Bus } from 'lucide-react'
import { STOPS, POPULAR_ROUTES, OPERATORS } from '../utils/constants'
import { today } from '../utils/helpers'
import Button from '../components/ui/Button'

function generateAllRoutes() {
  const routes = []
  for (let i = 0; i < STOPS.length; i++) {
    for (let j = i + 1; j < STOPS.length; j++) {
      const fare = 10 + Math.floor(Math.abs(i - j) * 3.5)
      const duration = 15 + Math.abs(i - j) * 8
      routes.push({
        from: STOPS[i], to: STOPS[j],
        fare: `₹${fare}–₹${fare + 15}`,
        duration: duration >= 60 ? `${Math.floor(duration/60)}h ${duration%60}m` : `${duration} min`,
        operator: OPERATORS[Math.abs(i + j) % OPERATORS.length].name,
        operatorColor: OPERATORS[Math.abs(i + j) % OPERATORS.length].color,
        freq: ['Every 15 min','Every 20 min','Every 30 min'][Math.abs(i+j) % 3],
        popular: POPULAR_ROUTES.some(r => r.from === STOPS[i] && r.to === STOPS[j]),
      })
    }
  }
  return routes
}

const ALL_ROUTES = generateAllRoutes()

export default function RoutesPage() {
  const [search, setSearch] = useState('')
  const [fromFilter, setFromFilter] = useState('')
  const [toFilter, setToFilter] = useState('')
  const [showPopular, setShowPopular] = useState(false)

  const filtered = ALL_ROUTES.filter(r => {
    const q = search.toLowerCase()
    const matchSearch = !q || r.from.toLowerCase().includes(q) || r.to.toLowerCase().includes(q)
    const matchFrom = !fromFilter || r.from === fromFilter
    const matchTo = !toFilter || r.to === toFilter
    const matchPop = !showPopular || r.popular
    return matchSearch && matchFrom && matchTo && matchPop
  })

  return (
    <>
      {/* Hero */}
      <section className="bg-hero-grad py-14">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <span className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-white/80 text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full mb-5">
            🗺️ All Routes
          </span>
          <h1 className="text-4xl font-black mb-3">Explore Every Route</h1>
          <p className="text-white/70 text-lg">Complete bus route directory across Prayagraj's 14 city stops</p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Filters */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-card p-5 mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="relative lg:col-span-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search any stop…" className="form-input pl-10 text-sm" />
            </div>
            <select value={fromFilter} onChange={e => setFromFilter(e.target.value)} className="form-input text-sm">
              <option value="">All Origins</option>
              {STOPS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <select value={toFilter} onChange={e => setToFilter(e.target.value)} className="form-input text-sm">
              <option value="">All Destinations</option>
              {STOPS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-4 mt-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={showPopular} onChange={e => setShowPopular(e.target.checked)} className="rounded accent-primary-600" />
              <span className="text-sm font-medium text-slate-700">Popular routes only</span>
            </label>
            <span className="text-xs text-slate-400 ml-auto">{filtered.length} routes found</span>
            {(search || fromFilter || toFilter || showPopular) && (
              <button onClick={() => { setSearch(''); setFromFilter(''); setToFilter(''); setShowPopular(false) }}
                className="text-xs font-semibold text-red-500 hover:text-red-600">Clear filters</button>
            )}
          </div>
        </div>

        {/* Stop network */}
        <div className="mb-8">
          <h2 className="text-lg font-extrabold text-slate-900 mb-4">All City Stops</h2>
          <div className="flex flex-wrap gap-2">
            {STOPS.map((s, i) => (
              <button key={s} onClick={() => setFromFilter(fromFilter === s ? '' : s)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold transition-all ${
                  fromFilter === s ? 'bg-primary-600 border-primary-600 text-white' : 'bg-white border-slate-200 text-slate-700 hover:border-primary-400 hover:text-primary-600'
                }`}>
                <MapPin className="w-3 h-3" />
                {s}
                <span className="opacity-50">#{i+1}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Routes grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((r, i) => (
            <div key={i} className={`bg-white rounded-2xl border shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200 overflow-hidden ${r.popular ? 'border-primary-200' : 'border-slate-100'}`}>
              {r.popular && (
                <div className="bg-primary-600 px-4 py-1.5">
                  <span className="text-white text-[10px] font-extrabold uppercase tracking-wider">⭐ Popular Route</span>
                </div>
              )}
              <div className="p-5">
                <div className="flex items-center gap-2 font-bold text-slate-900 mb-3">
                  <span className="text-sm">{r.from}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                  <span className="text-sm">{r.to}</span>
                </div>
                <div className="grid grid-cols-2 gap-2 mb-4">
                  <div className="bg-slate-50 rounded-xl p-2.5">
                    <p className="text-[10px] text-slate-400 font-medium">Fare Range</p>
                    <p className="font-extrabold text-primary-600 text-sm">{r.fare}</p>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-2.5">
                    <p className="text-[10px] text-slate-400 font-medium">Duration</p>
                    <p className="font-extrabold text-slate-900 text-sm flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" /> {r.duration}
                    </p>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-2.5">
                    <p className="text-[10px] text-slate-400 font-medium">Operator</p>
                    <p className="font-semibold text-slate-700 text-xs truncate">{r.operator}</p>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-2.5">
                    <p className="text-[10px] text-slate-400 font-medium">Frequency</p>
                    <p className="font-semibold text-slate-700 text-xs">{r.freq}</p>
                  </div>
                </div>
                <Link to={`/search?source=${encodeURIComponent(r.from)}&destination=${encodeURIComponent(r.to)}&date=${today()}`}>
                  <Button variant="primary" size="sm" className="w-full">
                    <Bus className="w-3.5 h-3.5" /> Book Now
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16">
            <p className="text-5xl mb-4">🔍</p>
            <p className="font-bold text-slate-700">No routes found</p>
            <p className="text-slate-500 text-sm mt-1">Try different stop names or clear your filters</p>
          </div>
        )}
      </div>
    </>
  )
}
