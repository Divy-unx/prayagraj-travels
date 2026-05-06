import { useEffect, useState, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeftRight, MapPin, Calendar, Search, AlertCircle } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { STOPS } from '../../utils/constants'
import { today } from '../../utils/helpers'
import { validateSearchInput, validateTravelDate } from '../../utils/validators'
import Button from '../ui/Button'
import { busService } from '../../services/api'
import toast from 'react-hot-toast'
import logger from '../../utils/logger'

function AutocompleteField({ label, value, onChange, placeholder, accent = 'primary', error }) {
  const [suggestions, setSuggestions] = useState([])
  const debounceRef = useRef(null)
  const abortRef = useRef(null)

  useEffect(() => {
    // Debounce the suggestion fetch (250ms)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (abortRef.current) abortRef.current.abort()

    debounceRef.current = setTimeout(async () => {
      const query = value?.trim() || ''
      if (!query) {
        setSuggestions(STOPS)
        return
      }

      try {
        abortRef.current = new AbortController()
        const serverSuggestions = await busService.suggestLocations(query, abortRef.current.signal)
        setSuggestions(
          Array.from(
            new Set([
              ...(serverSuggestions || []),
              ...STOPS.filter(stop => stop.toLowerCase().includes(query.toLowerCase())),
            ])
          ).slice(0, 8)
        )
      } catch (err) {
        if (err.name === 'AbortError' || err.name === 'CanceledError') return
        logger.warn('Autocomplete', 'Server suggestions failed, using local', { query })
        setSuggestions(
          STOPS.filter(stop => stop.toLowerCase().includes(query.toLowerCase())).slice(0, 8)
        )
      }
    }, 250)

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
      if (abortRef.current) abortRef.current.abort()
    }
  }, [value])

  return (
    <div className="relative flex-1 min-w-0">
      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{label}</p>
      <input
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className={`form-input mt-1 ${accent === 'accent' ? 'focus:ring-accent-500' : ''} ${error ? 'border-red-400 focus:ring-red-500' : ''}`}
        list={`${label.toLowerCase()}-options`}
      />
      <datalist id={`${label.toLowerCase()}-options`}>
        {suggestions.map(item => <option key={item} value={item} />)}
      </datalist>
      {error && (
        <p className="flex items-center gap-1 text-red-500 text-xs mt-1 font-medium">
          <AlertCircle className="w-3 h-3 flex-shrink-0" /> {error}
        </p>
      )}
    </div>
  )
}

export default function SearchPanel({ compact = false }) {
  const navigate = useNavigate()
  const { origin, setOrigin, dest, setDest, travelDate, setTravelDate, searching } = useApp()
  const [errors, setErrors] = useState({})

  const clearErrors = useCallback(() => {
    setErrors({})
  }, [])

  const swap = () => {
    const tmp = origin
    setOrigin(dest)
    setDest(tmp)
    clearErrors()
  }

  const handleSearch = (e) => {
    e.preventDefault()

    // Trim inputs
    const trimmedOrigin = origin.trim()
    const trimmedDest = dest.trim()
    setOrigin(trimmedOrigin)
    setDest(trimmedDest)

    // Validate search input
    const searchValidation = validateSearchInput(trimmedOrigin, trimmedDest)
    if (!searchValidation.valid) {
      setErrors({ [searchValidation.field]: searchValidation.error })
      toast.error(searchValidation.error)
      logger.warn('Validation', 'Search validation failed', { error: searchValidation.error })
      return
    }

    // Validate date
    const dateValidation = validateTravelDate(travelDate)
    if (!dateValidation.valid) {
      setErrors({ date: dateValidation.error })
      toast.error(dateValidation.error)
      return
    }

    clearErrors()
    logger.info('Search', 'Search initiated', { origin: trimmedOrigin, destination: trimmedDest, date: travelDate })
    navigate(`/search?source=${encodeURIComponent(trimmedOrigin)}&destination=${encodeURIComponent(trimmedDest)}&date=${travelDate}`)
  }

  const base = compact
    ? 'bg-white rounded-2xl shadow-card border border-slate-100 p-4'
    : 'bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 shadow-glass'

  const labelClass = compact ? 'text-[10px] font-bold uppercase tracking-widest text-slate-400' : 'text-[10px] font-bold uppercase tracking-widest text-white/60'
  const inputClass = compact
    ? 'block w-full text-sm font-bold text-slate-800 bg-transparent border-0 focus:ring-0 p-0 cursor-pointer'
    : 'block w-full text-sm font-bold text-white bg-transparent border-0 focus:ring-0 p-0 cursor-pointer'

  const divider = compact ? 'w-px h-10 bg-slate-200' : 'w-px h-10 bg-white/20'
  const fieldHover = compact ? 'hover:bg-slate-50 rounded-xl' : 'hover:bg-white/10 rounded-xl'

  return (
    <form onSubmit={handleSearch} className={base} noValidate>
      <div className="flex flex-col lg:flex-row items-stretch gap-3 lg:gap-0">
        {/* From */}
        <div className={`flex-1 flex items-start gap-3 px-4 py-3 ${fieldHover} transition-colors rounded-xl`}>
          <MapPin className={`w-5 h-5 flex-shrink-0 mt-5 ${compact ? 'text-primary-400' : 'text-white/60'}`} />
          <AutocompleteField
            label="From"
            value={origin}
            onChange={(v) => { setOrigin(v); if (errors.origin) setErrors(e => ({ ...e, origin: '' })) }}
            placeholder="Search source stop"
            accent={compact ? 'primary' : 'accent'}
            error={errors.origin}
          />
        </div>

        {/* Swap */}
        <div className={`hidden lg:flex items-center ${divider}`} />
        <button type="button" onClick={swap}
          className={`hidden sm:flex items-center justify-center w-10 h-10 m-auto rounded-full border transition-all duration-200 ${
            compact ? 'border-slate-200 text-slate-500 hover:border-primary-400 hover:text-primary-600 hover:rotate-180'
                    : 'border-white/30 text-white/70 hover:border-white hover:text-white hover:rotate-180'
          }`}>
          <ArrowLeftRight className="w-4 h-4" />
        </button>
        <div className={`hidden lg:flex items-center ${divider}`} />

        {/* To */}
        <div className={`flex-1 flex items-start gap-3 px-4 py-3 ${fieldHover} transition-colors rounded-xl`}>
          <MapPin className={`w-5 h-5 flex-shrink-0 mt-5 ${compact ? 'text-accent-500' : 'text-white/60'}`} />
          <AutocompleteField
            label="To"
            value={dest}
            onChange={(v) => { setDest(v); if (errors.destination) setErrors(e => ({ ...e, destination: '' })) }}
            placeholder="Search destination stop"
            accent={compact ? 'primary' : 'accent'}
            error={errors.destination}
          />
        </div>

        <div className={`hidden lg:flex items-center ${divider}`} />

        {/* Date */}
        <div className={`flex items-center gap-3 px-4 py-3 ${fieldHover} transition-colors cursor-pointer min-w-[160px]`}>
          <Calendar className={`w-5 h-5 flex-shrink-0 ${compact ? 'text-primary-400' : 'text-white/60'}`} />
          <div className="flex-1 min-w-0">
            <p className={labelClass}>Date</p>
            <input type="date" value={travelDate} onChange={e => { setTravelDate(e.target.value); if (errors.date) setErrors(er => ({ ...er, date: '' })) }}
              min={today()} className={`${inputClass} ${errors.date ? 'text-red-500' : ''}`} required />
            {errors.date && (
              <p className="text-red-500 text-xs mt-0.5 font-medium">{errors.date}</p>
            )}
          </div>
        </div>

        {/* Search button */}
        <div className="px-3 py-3 flex items-center">
          <Button type="submit" variant="primary" size="lg" loading={searching}
            disabled={searching}
            className="w-full sm:w-auto rounded-xl gap-2 font-bold">
            <Search className="w-4 h-4" />
            <span className="hidden sm:inline">{searching ? 'Searching…' : 'Search'}</span>
            <span className="sm:hidden">{searching ? 'Searching…' : 'Search Buses'}</span>
          </Button>
        </div>
      </div>

      {/* Quick picks */}
      <div className={`flex items-center gap-2 mt-3 pt-3 border-t ${compact ? 'border-slate-100' : 'border-white/10'} flex-wrap`}>
        <span className={`text-[10px] font-bold uppercase tracking-widest ${compact ? 'text-slate-400' : 'text-white/50'}`}>Quick:</span>
        {[
          ['Civil Lines', 'Airport'],
          ['Sangam', 'Civil Lines'],
          ['Chowk', 'Naini'],
          ['Phaphamau', 'Allahabad University'],
        ].map(([f, t]) => (
          <button key={`${f}-${t}`} type="button"
            onClick={() => { setOrigin(f); setDest(t); clearErrors() }}
            className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-colors ${
              compact ? 'bg-slate-100 text-slate-600 hover:bg-primary-50 hover:text-primary-600'
                      : 'bg-white/10 text-white/70 hover:bg-white/20 hover:text-white'
            }`}>
            {f} → {t}
          </button>
        ))}
      </div>
    </form>
  )
}
