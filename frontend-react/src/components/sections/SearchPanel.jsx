import { useEffect, useState, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeftRight, MapPin, Calendar, Search, AlertCircle, Navigation } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { STOPS } from '../../utils/constants'
import { today } from '../../utils/helpers'
import { validateSearchInput, validateTravelDate } from '../../utils/validators'
import Button from '../ui/Button'
import { busService } from '../../services/api'
import toast from 'react-hot-toast'
import logger from '../../utils/logger'

// ── Modern Dropdown Autocomplete ─────────────────────────────────────────────

function LocationDropdown({ label, value, onChange, placeholder, compact = false, error }) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState(value || '')
  const [suggestions, setSuggestions] = useState(STOPS)
  const [highlighted, setHighlighted] = useState(-1)
  const wrapperRef = useRef(null)
  const inputRef = useRef(null)
  const debounceRef = useRef(null)
  const abortRef = useRef(null)
  const listRef = useRef(null)

  // Keep query in sync with external value changes (e.g., swap, quick picks)
  useEffect(() => {
    setQuery(value || '')
  }, [value])

  // Fetch suggestions on query change
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (abortRef.current) abortRef.current.abort()

    debounceRef.current = setTimeout(async () => {
      const q = query?.trim() || ''
      if (!q) {
        setSuggestions(STOPS)
        return
      }

      try {
        abortRef.current = new AbortController()
        const serverSuggestions = await busService.suggestLocations(q, abortRef.current.signal)
        setSuggestions(
          Array.from(
            new Set([
              ...(serverSuggestions || []),
              ...STOPS.filter(stop => stop.toLowerCase().includes(q.toLowerCase())),
            ])
          ).slice(0, 10)
        )
      } catch (err) {
        if (err.name === 'AbortError' || err.name === 'CanceledError') return
        logger.warn('Autocomplete', 'Server suggestions failed, using local', { query: q })
        setSuggestions(
          STOPS.filter(stop => stop.toLowerCase().includes(q.toLowerCase())).slice(0, 10)
        )
      }
    }, 200)

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
      if (abortRef.current) abortRef.current.abort()
    }
  }, [query])

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Scroll highlighted item into view
  useEffect(() => {
    if (highlighted >= 0 && listRef.current) {
      const item = listRef.current.children[highlighted]
      if (item) item.scrollIntoView({ block: 'nearest' })
    }
  }, [highlighted])

  const selectItem = (item) => {
    setQuery(item)
    onChange(item)
    setOpen(false)
    setHighlighted(-1)
  }

  const handleKeyDown = (e) => {
    if (!open) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') {
        setOpen(true)
        e.preventDefault()
      }
      return
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setHighlighted(h => (h + 1) % suggestions.length)
        break
      case 'ArrowUp':
        e.preventDefault()
        setHighlighted(h => (h - 1 + suggestions.length) % suggestions.length)
        break
      case 'Enter':
        e.preventDefault()
        if (highlighted >= 0 && suggestions[highlighted]) {
          selectItem(suggestions[highlighted])
        }
        break
      case 'Escape':
        setOpen(false)
        setHighlighted(-1)
        break
    }
  }

  // Highlight matching text
  const renderHighlightedText = (text) => {
    const q = query?.trim()
    if (!q) return text
    const idx = text.toLowerCase().indexOf(q.toLowerCase())
    if (idx === -1) return text
    return (
      <>
        {text.slice(0, idx)}
        <span className="text-primary-600 font-extrabold">{text.slice(idx, idx + q.length)}</span>
        {text.slice(idx + q.length)}
      </>
    )
  }

  const textColor = compact ? 'text-slate-800' : 'text-white'
  const placeholderColor = compact ? 'placeholder-slate-400' : 'placeholder-white/40'

  return (
    <div className="relative flex-1 min-w-0" ref={wrapperRef}>
      <p className={`text-[10px] font-bold uppercase tracking-widest ${compact ? 'text-slate-400' : 'text-white/60'}`}>
        {label}
      </p>
      <input
        ref={inputRef}
        value={query}
        onChange={(e) => {
          setQuery(e.target.value)
          onChange(e.target.value)
          setOpen(true)
          setHighlighted(-1)
        }}
        onFocus={() => { setOpen(true); setHighlighted(-1) }}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        autoComplete="off"
        className={`block w-full text-sm font-bold bg-transparent border-0 focus:ring-0 p-0 mt-1 cursor-text ${textColor} ${placeholderColor} ${error ? 'text-red-500' : ''}`}
      />
      {error && (
        <p className="flex items-center gap-1 text-red-500 text-xs mt-1 font-medium">
          <AlertCircle className="w-3 h-3 flex-shrink-0" /> {error}
        </p>
      )}

      {/* Dropdown */}
      {open && suggestions.length > 0 && (
        <div className="absolute left-0 right-0 top-full mt-2 z-50 bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden animate-fade-in">
          {/* Header */}
          <div className="px-4 py-2.5 border-b border-slate-100 bg-slate-50">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
              {query?.trim() ? `Matching stops` : 'All Prayagraj stops'}
            </p>
          </div>

          {/* List */}
          <ul
            ref={listRef}
            className="max-h-64 overflow-y-auto py-1 no-scrollbar"
            role="listbox"
          >
            {suggestions.map((item, i) => (
              <li
                key={item}
                role="option"
                aria-selected={highlighted === i}
                onMouseEnter={() => setHighlighted(i)}
                onClick={() => selectItem(item)}
                className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors duration-100 ${
                  highlighted === i
                    ? 'bg-primary-50'
                    : 'hover:bg-slate-50'
                } ${value === item ? 'bg-primary-50/60' : ''}`}
              >
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  highlighted === i
                    ? 'bg-primary-100 text-primary-600'
                    : 'bg-slate-100 text-slate-400'
                }`}>
                  <Navigation className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-semibold truncate ${
                    highlighted === i ? 'text-primary-700' : 'text-slate-800'
                  }`}>
                    {renderHighlightedText(item)}
                  </p>
                  <p className="text-[10px] text-slate-400 font-medium">Prayagraj</p>
                </div>
                {value === item && (
                  <span className="text-primary-500 text-xs font-bold">✓</span>
                )}
              </li>
            ))}
          </ul>

          {/* Footer */}
          <div className="px-4 py-2 border-t border-slate-100 bg-slate-50">
            <p className="text-[10px] text-slate-400 text-center font-medium">
              ↑↓ to navigate • Enter to select • Esc to close
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Search Panel ─────────────────────────────────────────────────────────────

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
          <LocationDropdown
            label="From"
            value={origin}
            onChange={(v) => { setOrigin(v); if (errors.origin) setErrors(e => ({ ...e, origin: '' })) }}
            placeholder="Search source stop"
            compact={compact}
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
          <LocationDropdown
            label="To"
            value={dest}
            onChange={(v) => { setDest(v); if (errors.destination) setErrors(e => ({ ...e, destination: '' })) }}
            placeholder="Search destination stop"
            compact={compact}
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
