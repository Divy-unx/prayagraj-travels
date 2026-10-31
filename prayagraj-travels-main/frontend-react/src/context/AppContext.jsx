import { createContext, useContext, useMemo, useRef, useState, useCallback } from 'react'
import { today } from '../utils/helpers'
import logger from '../utils/logger'

const AppContext = createContext()

/** Cache TTL: 5 minutes in milliseconds */
const CACHE_TTL = 5 * 60 * 1000

export function AppProvider({ children }) {
  const [origin, setOrigin] = useState('Civil Lines')
  const [dest, setDest] = useState('Jhunsi')
  const [travelDate, setTravelDate] = useState(today())
  const [buses, setBuses] = useState([])
  const [searching, setSearching] = useState(false)
  const [searchMessage, setSearchMessage] = useState('')
  const [seatModalBus, setSeatModalBus] = useState(null)
  const [trackBusId, setTrackBusId] = useState(null)
  const [toast, setToast] = useState({ visible: false, type: 'success', message: '' })
  const toastTimer = useRef(null)
  const searchCacheRef = useRef(new Map())

  const showToast = (message, type = 'success') => {
    clearTimeout(toastTimer.current)
    setToast({ visible: true, type, message })
    toastTimer.current = setTimeout(() => setToast(t => ({ ...t, visible: false })), 4000)
  }

  const openSeatModal = (bus) => {
    setSeatModalBus(bus)
    document.body.style.overflow = 'hidden'
  }
  const closeSeatModal = () => {
    setSeatModalBus(null)
    document.body.style.overflow = ''
  }

  /**
   * TTL-based search cache.
   * Each entry stores { data, timestamp }.
   * Expired entries are evicted on read.
   */
  const searchCache = useMemo(() => ({
    get: (key) => {
      const entry = searchCacheRef.current.get(key)
      if (!entry) return undefined

      const age = Date.now() - entry.timestamp
      if (age > CACHE_TTL) {
        searchCacheRef.current.delete(key)
        logger.debug('Cache', 'Entry expired', { key, ageMs: age })
        return undefined
      }

      logger.debug('Cache', 'Cache hit', { key, ageMs: age })
      return entry.data
    },

    set: (key, value) => {
      searchCacheRef.current.set(key, { data: value, timestamp: Date.now() })
      logger.debug('Cache', 'Entry stored', { key })

      // Evict old entries if cache grows too large (max 50 entries)
      if (searchCacheRef.current.size > 50) {
        const oldestKey = searchCacheRef.current.keys().next().value
        searchCacheRef.current.delete(oldestKey)
        logger.debug('Cache', 'Evicted oldest entry', { evictedKey: oldestKey })
      }
    },

    has: (key) => {
      const entry = searchCacheRef.current.get(key)
      if (!entry) return false
      if (Date.now() - entry.timestamp > CACHE_TTL) {
        searchCacheRef.current.delete(key)
        return false
      }
      return true
    },

    remove: (key) => {
      searchCacheRef.current.delete(key)
      logger.debug('Cache', 'Entry removed', { key })
    },

    clear: () => {
      searchCacheRef.current.clear()
      logger.info('Cache', 'Cache cleared')
    },
  }), [])

  // Stable setters wrapped in useCallback to prevent unnecessary re-renders
  const stableSetOrigin = useCallback((v) => setOrigin(typeof v === 'string' ? v : v), [])
  const stableSetDest = useCallback((v) => setDest(typeof v === 'string' ? v : v), [])
  const stableSetTravelDate = useCallback((v) => setTravelDate(v), [])
  const stableSetSearching = useCallback((v) => setSearching(v), [])
  const stableSetSearchMessage = useCallback((v) => setSearchMessage(v), [])
  const stableSetBuses = useCallback((v) => setBuses(v), [])

  return (
    <AppContext.Provider value={{
      origin, setOrigin: stableSetOrigin,
      dest, setDest: stableSetDest,
      travelDate, setTravelDate: stableSetTravelDate,
      buses, setBuses: stableSetBuses,
      searching, setSearching: stableSetSearching,
      searchMessage, setSearchMessage: stableSetSearchMessage,
      searchCache,
      seatModalBus, openSeatModal, closeSeatModal,
      trackBusId, setTrackBusId,
      toast, showToast,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export const useApp = () => useContext(AppContext)
