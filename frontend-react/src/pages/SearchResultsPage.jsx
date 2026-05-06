import { useEffect, useMemo, useState, useRef, useCallback } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { SlidersHorizontal, ArrowRight, Star, Users, X, Filter, Heart, ChevronLeft, ChevronRight, RefreshCw, AlertTriangle, WifiOff, ServerCrash, Loader2 } from 'lucide-react'
import { busService } from '../services/api'
import { useApp } from '../context/AppContext'
import SearchPanel from '../components/sections/SearchPanel'
import SkeletonCard from '../components/ui/SkeletonCard'
import EmptyState from '../components/ui/EmptyState'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
import SeatModal from '../components/SeatModal'
import { OPERATORS, BUS_TYPES } from '../utils/constants'
import { getBusType, getDep, getArr, getDur, formatDate } from '../utils/helpers'
import { classifyError } from '../utils/validators'
import { useAuth } from '../context/AuthContext'
import RouteMap from '../components/RouteMap'
import logger from '../utils/logger'
import toast from 'react-hot-toast'

// ── BusCard (unchanged logic, kept inline) ──────────────────────────────────

function BusCard({ bus, index, onSelectSeats }) {
  const op = OPERATORS[index % OPERATORS.length]
  const busType = getBusType(index)
  const dep = getDep(index)
  const arr = getArr(index)
  const isAC = busType.includes('AC') && !busType.includes('Non')
  const seatsLeft = bus.availableSeats ?? bus.available_seats ?? Math.floor(Math.random() * 20) + 5

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200 overflow-hidden">
      {/* Operator color bar */}
      <div className="h-1" style={{ background: op.color }} />
      <div className="p-5">
        {/* Top row */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-[10px] font-black flex-shrink-0" style={{ background: op.color }}>
              {op.name.slice(0, 2)}
            </div>
            <div>
              <p className="font-bold text-slate-900 text-sm">{bus.bus_number || `PB-${1000 + index}`}</p>
              <p className="text-xs text-slate-500">{op.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="bg-emerald-500 text-white text-xs font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
              <Star className="w-3 h-3 fill-current" /> {op.rating}
            </span>
            <Badge variant={isAC ? 'primary' : 'default'}>{busType}</Badge>
          </div>
        </div>

        {/* Route & timing */}
        <div className="flex items-center gap-4 mb-4">
          <div className="text-center">
            <p className="text-2xl font-black text-slate-900 tabular-nums">{dep}</p>
            <p className="text-xs text-slate-500 font-medium mt-0.5">{bus.source || 'Civil Lines'}</p>
          </div>
          <div className="flex-1 flex flex-col items-center gap-1">
            <p className="text-xs text-slate-400 font-medium">{getDur()}</p>
            <div className="w-full flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-primary-400 flex-shrink-0" />
              <div className="flex-1 h-0.5 bg-slate-200" />
              <ArrowRight className="w-3 h-3 text-primary-400 flex-shrink-0" />
              <div className="flex-1 h-0.5 bg-slate-200" />
              <div className="w-2 h-2 rounded-full bg-accent-400 flex-shrink-0" />
            </div>
            <p className="text-xs text-slate-400">Direct</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-black text-slate-900 tabular-nums">{arr}</p>
            <p className="text-xs text-slate-500 font-medium mt-0.5">{bus.destination || 'Naini'}</p>
          </div>
        </div>

        {/* Amenities */}
        <div className="flex flex-wrap gap-2 mb-4">
          {isAC && <span className="text-xs text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full font-medium">❄️ AC</span>}
          <span className="text-xs text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full font-medium">📡 Live Tracking</span>
          <span className="text-xs text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full font-medium">🔌 Charging</span>
          {op.discount && (
            <span className="text-xs text-accent-600 bg-accent-50 px-2 py-0.5 rounded-full font-semibold">🏷️ {op.discount.split(' ').slice(0,3).join(' ')}</span>
          )}
        </div>

        {/* Bottom row */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-xs text-slate-400 line-through">₹{bus.fare + 15}</span>
              <span className="text-2xl font-black text-slate-900">₹{bus.fare || 25}</span>
            </div>
            <div className="flex items-center gap-1 mt-0.5">
              <Users className="w-3 h-3 text-slate-400" />
              <span className={`text-xs font-semibold ${seatsLeft <= 5 ? 'text-red-500' : 'text-slate-500'}`}>
                {seatsLeft} seats left
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link to={`/bus/${bus.id}`} className="text-xs font-semibold text-primary-600 hover:underline">
              Details
            </Link>
            <Button onClick={() => onSelectSeats(bus)} variant="primary" size="sm">
              Select Seats
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── FilterPanel ─────────────────────────────────────────────────────────────

function FilterPanel({ filters, onChange, onClear }) {
  return (
    <div className="space-y-5">
      {/* Price */}
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">Max Price</p>
        <input type="range" min="10" max="100" value={filters.maxPrice}
          onChange={e => onChange('maxPrice', Number(e.target.value))}
          className="w-full accent-primary-600" />
        <div className="flex justify-between mt-1">
          <span className="text-xs text-slate-500">₹10</span>
          <span className="text-xs font-bold text-primary-600">₹{filters.maxPrice}</span>
        </div>
      </div>

      {/* Bus type */}
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">Bus Type</p>
        <select value={filters.busType} onChange={e => onChange('busType', e.target.value)} className="form-input text-sm">
          <option value="">All types</option>
          {BUS_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>

      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">Timing</p>
        <div className="grid grid-cols-3 gap-2">
          {['morning', 'afternoon', 'evening'].map(slot => (
            <button key={slot} type="button" onClick={() => onChange('timing', filters.timing === slot ? '' : slot)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold capitalize transition-colors ${filters.timing === slot ? 'bg-primary-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
              {slot}
            </button>
          ))}
        </div>
      </div>

      {/* Operator */}
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">Operator</p>
        <div className="space-y-2">
          {OPERATORS.map(op => (
            <label key={op.id} className="flex items-center gap-2.5 cursor-pointer">
              <input type="checkbox"
                checked={filters.operators.includes(op.id)}
                onChange={e => {
                  const next = e.target.checked ? [...filters.operators, op.id] : filters.operators.filter(x => x !== op.id)
                  onChange('operators', next)
                }}
                className="rounded accent-primary-600 w-4 h-4" />
              <span className="text-sm text-slate-700 font-medium">{op.name}</span>
            </label>
          ))}
        </div>
      </div>

      <button onClick={onClear} className="w-full text-xs font-bold text-red-500 hover:text-red-600 py-2 border border-red-200 rounded-xl hover:bg-red-50 transition-colors">
        Clear All Filters
      </button>
    </div>
  )
}

// ── WakingServerBanner ──────────────────────────────────────────────────────

function WakingServerBanner() {
  return (
    <div className="mb-4 rounded-2xl border border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 px-5 py-4 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
          <Loader2 className="w-5 h-5 text-amber-600 animate-spin" />
        </div>
        <div>
          <p className="text-sm font-bold text-amber-900">Waking up server…</p>
          <p className="text-xs text-amber-700 mt-0.5">Our server is on a free tier and takes a moment to start. This usually takes 10–30 seconds.</p>
        </div>
      </div>
      {/* Animated progress bar */}
      <div className="mt-3 h-1 bg-amber-200 rounded-full overflow-hidden">
        <div className="h-full bg-gradient-to-r from-amber-400 to-orange-400 rounded-full animate-waking-progress" />
      </div>
    </div>
  )
}

// ── ErrorBanner ─────────────────────────────────────────────────────────────

function ErrorBanner({ error, onRetry }) {
  const classified = classifyError({ message: error })

  const Icon = classified.type === 'network' ? WifiOff
    : classified.type === 'server_error' ? ServerCrash
    : AlertTriangle

  return (
    <div className="mb-4 rounded-2xl border border-rose-200 bg-gradient-to-r from-rose-50 to-red-50 px-5 py-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center mt-0.5">
            <Icon className="w-5 h-5 text-rose-600" />
          </div>
          <div>
            <p className="text-sm font-bold text-rose-900">
              {classified.type === 'network' ? 'Connection Error' :
               classified.type === 'timeout' ? 'Request Timed Out' :
               classified.type === 'server_error' ? 'Server Error' :
               'Something went wrong'}
            </p>
            <p className="text-xs text-rose-700 mt-0.5">{classified.message}</p>
          </div>
        </div>
        {classified.retryable && (
          <Button variant="outline" size="sm" onClick={onRetry} className="flex-shrink-0">
            <RefreshCw className="w-3.5 h-3.5" /> Retry
          </Button>
        )}
      </div>
    </div>
  )
}

// ── Main Page Component ─────────────────────────────────────────────────────

export default function SearchResultsPage() {
  const [params] = useSearchParams()
  const { openSeatModal, seatModalBus, closeSeatModal, searching, setSearching, searchCache } = useApp()
  const { user } = useAuth()
  const [buses, setBuses] = useState([])
  const [loading, setLoading] = useState(true)
  const [waking, setWaking] = useState(false)
  const [error, setError] = useState('')
  const [sort, setSort] = useState('price')
  const [page, setPage] = useState(1)
  const [reloadToken, setReloadToken] = useState(0)
  const pageSize = 6
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState({ maxPrice: 100, busType: '', timing: '', operators: [] })

  // AbortController ref for cancelling in-flight requests
  const abortRef = useRef(null)

  const source = params.get('source') || ''
  const destination = params.get('destination') || ''
  const date = params.get('date') || ''
  const cacheKey = useMemo(() => JSON.stringify({ source, destination, sort, page, pageSize, maxPrice: filters.maxPrice, busType: filters.busType, timing: filters.timing }), [source, destination, sort, page, pageSize, filters.maxPrice, filters.busType, filters.timing])

  useEffect(() => {
    if (!source || !destination) {
      setLoading(false)
      setSearching(false)
      return
    }

    // Check TTL-based cache
    const cached = searchCache.get(cacheKey)
    if (cached) {
      setBuses(cached.buses)
      setTotalPages(cached.totalPages)
      setTotal(cached.total)
      setLoading(false)
      setError('')
      setWaking(false)
      setSearching(false)
      logger.info('Search', 'Served from cache', { cacheKey })
      return
    }

    // Abort previous request if still in-flight
    if (abortRef.current) {
      abortRef.current.abort()
    }
    abortRef.current = new AbortController()
    const signal = abortRef.current.signal

    const wakeTimer = setTimeout(() => {
      if (!signal.aborted) setWaking(true)
    }, 2200)

    setLoading(true)
    setSearching(true)
    setError('')

    const searchStart = performance.now()

    busService.search(source, destination, {
      sortBy: sort,
      timing: filters.timing,
      maxFare: filters.maxPrice,
      busType: filters.busType,
      page,
      size: pageSize,
    }, signal)
      .then(data => {
        if (signal.aborted) return
        const list = data.buses || []
        const nextTotalPages = data.totalPages || 1
        const nextTotal = data.total || list.length
        setBuses(list)
        setTotalPages(nextTotalPages)
        setTotal(nextTotal)
        searchCache.set(cacheKey, { buses: list, totalPages: nextTotalPages, total: nextTotal })
        logger.info('Search', `Found ${nextTotal} buses in ${Math.round(performance.now() - searchStart)}ms`, {
          source, destination, page, resultCount: list.length,
        })
      })
      .catch(err => {
        if (signal.aborted || err.name === 'AbortError' || err.name === 'CanceledError') return
        const message = err.message || 'Failed to fetch buses'
        setError(message)
        setBuses([])
        logger.error('Search', 'Search failed', { source, destination, error: message })
        toast.error(classifyError(err).message)
      })
      .finally(() => {
        if (signal.aborted) return
        clearTimeout(wakeTimer)
        setLoading(false)
        setWaking(false)
        setSearching(false)
      })

    return () => {
      if (abortRef.current) abortRef.current.abort()
      clearTimeout(wakeTimer)
    }
  }, [source, destination, sort, filters.maxPrice, filters.busType, filters.timing, page, pageSize, cacheKey, reloadToken, searchCache, setSearching])

  const updateFilter = useCallback((key, val) => {
    setPage(1)
    setFilters(f => ({ ...f, [key]: val }))
  }, [])

  const clearFilters = useCallback(() => {
    setPage(1)
    setFilters({ maxPrice: 100, busType: '', timing: '', operators: [] })
  }, [])

  const displayed = useMemo(() => buses, [buses])
  const refreshSearch = useCallback(() => {
    searchCache.remove(cacheKey)
    setReloadToken(n => n + 1)
    logger.info('Search', 'Manual refresh triggered')
  }, [cacheKey, searchCache])
  const goPrev = () => setPage(p => Math.max(1, p - 1))
  const goNext = () => setPage(p => Math.min(totalPages, p + 1))

  return (
    <>
      <div className="bg-hero-grad py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-white/70 text-xs font-semibold uppercase tracking-widest mb-3">Modify Search</p>
          <SearchPanel compact />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6">
          <div>
            <h1 className="text-xl font-extrabold text-slate-900">
              {source} → {destination}
            </h1>
            <p className="text-sm text-slate-500 mt-0.5">
              {formatDate(date)} • {loading || searching ? 'Searching for buses…' : `${total} buses found`}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {user && (
              <button onClick={() => busService.saveFavorite(user.id, { source, destination })}
                className="flex items-center gap-2 px-4 py-2 border border-rose-200 rounded-xl text-sm font-semibold text-rose-600 hover:bg-rose-50 transition-colors">
                <Heart className="w-4 h-4" /> Save Route
              </button>
            )}
            <button onClick={() => setShowFilters(s => !s)}
              className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors md:hidden">
              <Filter className="w-4 h-4" />
              Filters
            </button>
          </div>
        </div>

        <div className="mb-6">
          <RouteMap source={source} destination={destination} />
        </div>

        <div className="flex gap-6">
          {/* Filter sidebar */}
          <aside className={`${showFilters ? 'block' : 'hidden'} md:block w-full md:w-60 flex-shrink-0`}>
            <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-card sticky top-20">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4" /> Filters
                </h3>
                <button onClick={() => setShowFilters(false)} className="md:hidden p-1 rounded-lg hover:bg-slate-100">
                  <X className="w-4 h-4 text-slate-500" />
                </button>
              </div>
              <FilterPanel filters={filters} onChange={updateFilter} onClear={clearFilters} />
            </div>
          </aside>

          {/* Results */}
          <div className="flex-1 min-w-0">
            {/* Sort bar */}
            <div className="flex items-center gap-3 mb-4 bg-white rounded-xl border border-slate-100 px-4 py-3 shadow-card">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Sort:</span>
              {[
                { val: 'price', label: 'Price' },
                { val: 'time', label: 'Time' },
                { val: 'duration', label: 'Duration' },
                { val: 'seats', label: 'Seats' },
              ].map(s => (
                <button key={s.val} onClick={() => { setSort(s.val); setPage(1) }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    sort === s.val ? 'bg-primary-600 text-white' : 'text-slate-600 hover:bg-slate-100'
                  }`}>
                  {s.label}
                </button>
              ))}
              <button type="button" onClick={refreshSearch} disabled={loading}
                className="ml-auto inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-700 disabled:opacity-50">
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
              </button>
            </div>

            {waking && <WakingServerBanner />}

            {error && <ErrorBanner error={error} onRetry={refreshSearch} />}

            {loading ? (
              <div className="space-y-4">
                {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
              </div>
            ) : displayed.length === 0 ? (
              <EmptyState icon="🚌" title="No buses found" description="Try adjusting your filters or searching a different route."
                action={<Button onClick={clearFilters} variant="outline">Clear Filters</Button>} />
            ) : (
              <div className="space-y-4">
                {displayed.map((bus, i) => (
                  <BusCard key={bus.id} bus={bus} index={i} onSelectSeats={openSeatModal} />
                ))}
              </div>
            )}

            {!loading && totalPages > 1 && (
              <div className="mt-6 flex items-center justify-between gap-3 rounded-2xl border border-slate-100 bg-white px-4 py-3 shadow-card">
                <Button variant="outline" size="sm" onClick={goPrev} disabled={page === 1}>
                  <ChevronLeft className="w-4 h-4" /> Previous
                </Button>
                <span className="text-xs font-semibold text-slate-500">Page {page} of {totalPages}</span>
                <Button variant="outline" size="sm" onClick={goNext} disabled={page >= totalPages}>
                  Next <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {seatModalBus && <SeatModal bus={seatModalBus} onClose={closeSeatModal} date={date} />}
    </>
  )
}
