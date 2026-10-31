import { useState, useEffect, useCallback } from 'react'
import { Download, X, ArrowRight, Search, Clock, IndianRupee, AlertTriangle, CheckCircle2, XCircle, History } from 'lucide-react'
import { bookingService } from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import EmptyState from '../../components/ui/EmptyState'
import Spinner from '../../components/ui/Spinner'
import { formatDate } from '../../utils/helpers'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import logger from '../../utils/logger'

// ── Confirmation Modal ──────────────────────────────────────────────────────

function CancelConfirmModal({ booking, onConfirm, onClose, loading }) {
  const fare = booking?.fare_paid || booking?.fare || 0

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl max-w-md w-full p-6 animate-slide-up">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-6 h-6 text-red-600" />
          </div>
          <div>
            <h3 className="text-lg font-extrabold text-slate-900">Cancel Booking #{booking.id}?</h3>
            <p className="text-sm text-slate-500">This action cannot be undone</p>
          </div>
        </div>

        <div className="bg-slate-50 rounded-xl p-4 mb-5 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">Route</span>
            <span className="font-semibold text-slate-900">
              {booking?.source || '—'} → {booking?.destination || '—'}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">Travel Date</span>
            <span className="font-semibold text-slate-900">{formatDate(booking?.travel_date)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">Seat</span>
            <span className="font-semibold text-slate-900">{booking?.seat_number}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">Passenger</span>
            <span className="font-semibold text-slate-900">{booking?.passenger_name}</span>
          </div>
          <div className="flex justify-between text-sm pt-2 border-t border-slate-200">
            <span className="text-slate-500">Fare Paid</span>
            <span className="font-extrabold text-slate-900">₹{fare}</span>
          </div>
        </div>

        <div className="flex items-start gap-3 bg-emerald-50 border border-emerald-200 rounded-xl p-3 mb-5">
          <IndianRupee className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-emerald-900">Full refund of ₹{fare}</p>
            <p className="text-xs text-emerald-700 mt-0.5">Refund will be processed within 3-5 business days</p>
          </div>
        </div>

        <div className="flex gap-3">
          <Button onClick={onClose} variant="outline" className="flex-1" disabled={loading}>
            Keep Booking
          </Button>
          <Button onClick={onConfirm} variant="danger" className="flex-1" loading={loading}>
            <X className="w-4 h-4" /> Confirm Cancel
          </Button>
        </div>
      </div>
    </div>
  )
}

// ── Success Toast ───────────────────────────────────────────────────────────

function showCancelSuccess(result) {
  toast.custom((t) => (
    <div className={`${t.visible ? 'animate-slide-up' : 'opacity-0'} bg-white rounded-2xl shadow-xl border border-slate-100 p-4 max-w-sm`}>
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
        </div>
        <div>
          <p className="font-bold text-slate-900 text-sm">{result.message}</p>
          {result.refundMessage && (
            <p className="text-xs text-slate-500 mt-1">{result.refundMessage}</p>
          )}
        </div>
      </div>
    </div>
  ), { duration: 5000 })
}

// ── Main Page ───────────────────────────────────────────────────────────────

export default function BookingsPage() {
  const { user } = useAuth()
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [cancelling, setCancelling] = useState(null)
  const [cancelModal, setCancelModal] = useState(null)
  const [showHistory, setShowHistory] = useState(false)
  const [cancellations, setCancellations] = useState([])
  const [historyLoading, setHistoryLoading] = useState(false)

  // Fetch bookings — normalizeBookingList is applied in the API layer
  useEffect(() => {
    if (!user) return
    bookingService.getByUser(user.id)
      .then(data => {
        setBookings(data)
        logger.debug('Bookings', `Loaded ${data.length} bookings`, { ids: data.map(b => b.id) })
      })
      .catch(err => {
        logger.error('Bookings', 'Failed to fetch bookings', { error: err.message })
        setBookings([])
      })
      .finally(() => setLoading(false))
  }, [user])

  // Fetch cancellation history
  const loadCancellationHistory = useCallback(async () => {
    if (!user) return
    setHistoryLoading(true)
    try {
      const data = await bookingService.getCancellationHistory(user.id)
      setCancellations(Array.isArray(data) ? data : [])
    } catch (err) {
      logger.error('Bookings', 'Failed to load cancellation history', { error: err.message })
      toast.error('Failed to load cancellation history')
    } finally {
      setHistoryLoading(false)
    }
  }, [user])

  // Open cancel confirmation — now just uses booking.id (stable, normalized)
  const openCancelModal = useCallback((bk) => {
    if (!bk.id) {
      toast.error('Invalid booking — missing booking ID')
      logger.error('Bookings', 'Cannot cancel: id is undefined', { booking: bk })
      return
    }
    logger.debug('Bookings', 'Opening cancel modal', { id: bk.id })
    setCancelModal(bk)
  }, [])

  // Execute cancellation — uses booking.id directly
  const handleCancel = useCallback(async () => {
    if (!cancelModal || !user) return

    const { id } = cancelModal
    if (!id) {
      toast.error('Invalid booking ID')
      return
    }

    setCancelling(id)
    logger.info('Bookings', 'Cancelling booking', { id, userId: user.id })

    try {
      const result = await bookingService.cancel(id, user.id)

      if (result.success) {
        // Optimistic UI update
        setBookings(prev => prev.map(b =>
          b.id === id
            ? { ...b, status: 'CANCELLED', refund_status: result.refundStatus, refund_amount: result.refundAmount }
            : b
        ))
        showCancelSuccess(result)
        logger.info('Bookings', 'Cancellation successful', { id, refund: result.refundAmount })
      } else {
        toast.error(result.message || 'Cancellation failed')
        logger.warn('Bookings', 'Cancellation rejected', { id, errorCode: result.errorCode })
      }
    } catch (err) {
      const message = err.message || 'Cancellation failed. Please try again.'
      toast.error(message)
      logger.error('Bookings', 'Cancellation error', { id, error: message })
    } finally {
      setCancelling(null)
      setCancelModal(null)
    }
  }, [cancelModal, user])

  // Filter logic — uses booking.id for search
  const filtered = bookings.filter(b => {
    const matchFilter = filter === 'all' || b.status?.toLowerCase() === filter
    const matchSearch = !search ||
      b.passenger_name?.toLowerCase().includes(search.toLowerCase()) ||
      String(b.bus_id).includes(search) ||
      String(b.id).includes(search)
    return matchFilter && matchSearch
  })

  const statusVariant = { CONFIRMED: 'confirmed', CANCELLED: 'cancelled', PENDING: 'warning' }
  const refundVariant = { PENDING: 'warning', PROCESSED: 'success', FAILED: 'error', NONE: 'default' }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">My Bookings</h1>
          <p className="text-slate-500 text-sm mt-1">{bookings.length} total bookings</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => { setShowHistory(!showHistory); if (!showHistory) loadCancellationHistory() }}>
          <History className="w-4 h-4" /> {showHistory ? 'Hide' : 'Show'} Cancellations
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-card p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search by name, bus ID…" className="form-input pl-9 py-2 text-sm" />
          </div>
          <div className="flex gap-1">
            {[
              { val: 'all', label: 'All' },
              { val: 'confirmed', label: 'Confirmed' },
              { val: 'cancelled', label: 'Cancelled' },
            ].map(f => (
              <button key={f.val} onClick={() => setFilter(f.val)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
                  filter === f.val ? 'bg-primary-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}>
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Cancellation History Panel */}
      {showHistory && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-card p-5">
          <h2 className="text-lg font-extrabold text-slate-900 mb-4 flex items-center gap-2">
            <History className="w-5 h-5 text-slate-400" /> Cancellation History
          </h2>
          {historyLoading ? (
            <div className="flex justify-center py-8"><Spinner size="md" /></div>
          ) : cancellations.length === 0 ? (
            <p className="text-sm text-slate-500 text-center py-6">No cancellations yet.</p>
          ) : (
            <div className="space-y-3">
              {cancellations.map((c, i) => (
                <div key={c.id || i} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                  <div>
                    <p className="text-sm font-bold text-slate-900">
                      Booking #{c.booking_id} — {c.bus_name || 'Bus'}
                    </p>
                    <p className="text-xs text-slate-500">
                      {c.source} → {c.destination} • {formatDate(c.travel_date)} • Seat {c.seat_number}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">{c.reason}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-slate-900">₹{c.refund_amount}</p>
                    <Badge variant={refundVariant[c.refund_status] || 'default'}>
                      Refund: {c.refund_status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Booking cards */}
      {loading ? (
        <div className="flex justify-center py-16"><Spinner size="lg" /></div>
      ) : filtered.length === 0 ? (
        <EmptyState icon="🎟️" title="No bookings yet"
          description="You haven't booked any tickets yet. Start by searching for buses."
          action={<Link to="/"><Button variant="primary">Search Buses</Button></Link>} />
      ) : (
        <div className="space-y-3">
          {filtered.map(bk => {
            const isCancelled = bk.status === 'CANCELLED'
            const fare = bk.fare_paid || bk.fare || 0

            return (
            <div key={bk.id} className={`bg-white rounded-2xl border shadow-card overflow-hidden transition-all ${
              isCancelled ? 'border-red-100 opacity-75' : 'border-slate-100'
            }`}>
              <div className="p-5">
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-extrabold text-slate-900 text-sm">Booking #{bk.id}</span>
                      <Badge variant={statusVariant[bk.status] || 'default'}>{bk.status}</Badge>
                      {bk.refund_status && bk.refund_status !== 'NONE' && (
                        <Badge variant={refundVariant[bk.refund_status] || 'default'}>
                          Refund: {bk.refund_status}
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-slate-500">Bus #{bk.bus_id} • Seat {bk.seat_number}</p>
                  </div>
                  <span className={`text-xl font-extrabold ${isCancelled ? 'text-slate-400 line-through' : 'text-primary-600'}`}>
                    ₹{fare}
                  </span>
                </div>

                <div className="flex items-center gap-3 py-3 border-y border-slate-100 mb-4">
                  <div className="text-center">
                    <p className="font-extrabold text-slate-900 text-sm">{bk.source || 'Civil Lines'}</p>
                    <p className="text-xs text-slate-400">From</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-300 flex-shrink-0" />
                  <div className="text-center">
                    <p className="font-extrabold text-slate-900 text-sm">{bk.destination || 'Naini'}</p>
                    <p className="text-xs text-slate-400">To</p>
                  </div>
                  <div className="ml-auto text-right">
                    <p className="font-bold text-slate-700 text-sm">{formatDate(bk.travel_date)}</p>
                    <p className="text-xs text-slate-400">{bk.passenger_name}</p>
                  </div>
                </div>

                {isCancelled && bk.refund_amount > 0 && (
                  <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl p-3 mb-4">
                    <Clock className="w-4 h-4 text-amber-600 flex-shrink-0" />
                    <p className="text-xs text-amber-800">
                      Refund of <strong>₹{bk.refund_amount}</strong> is {bk.refund_status?.toLowerCase() || 'pending'}.
                      Processing takes 3-5 business days.
                    </p>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <button onClick={() => toast.success('Ticket download coming soon!')}
                    className="flex items-center gap-1.5 text-xs font-semibold text-primary-600 hover:text-primary-700 transition-colors">
                    <Download className="w-3.5 h-3.5" /> Download Ticket
                  </button>
                  {bk.status === 'CONFIRMED' && (
                    <Button
                      onClick={() => openCancelModal(bk)}
                      variant="danger"
                      size="sm"
                      loading={cancelling === bk.id}
                      disabled={cancelling === bk.id}
                    >
                      <X className="w-3.5 h-3.5" /> Cancel Booking
                    </Button>
                  )}
                  {isCancelled && (
                    <span className="flex items-center gap-1.5 text-xs font-semibold text-red-400">
                      <XCircle className="w-3.5 h-3.5" /> Cancelled
                    </span>
                  )}
                </div>
              </div>
            </div>
            )
          })}
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      {cancelModal && (
        <CancelConfirmModal
          booking={cancelModal}
          onConfirm={handleCancel}
          onClose={() => setCancelModal(null)}
          loading={cancelling != null}
        />
      )}
    </div>
  )
}
