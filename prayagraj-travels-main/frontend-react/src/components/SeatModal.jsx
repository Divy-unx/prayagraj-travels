import { useState, useEffect } from 'react'
import { X, Clock, User, Phone, CheckCircle } from 'lucide-react'
import { busService, bookingService } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { today } from '../utils/helpers'
import Button from './ui/Button'
import Badge from './ui/Badge'
import toast from 'react-hot-toast'

const HOLD_SECONDS = 300

export default function SeatModal({ bus, onClose, date }) {
  const { user, isLoggedIn } = useAuth()
  const [seats, setSeats] = useState([])
  const [loadingSeats, setLoadingSeats] = useState(true)
  const [selected, setSelected] = useState(null)
  const [holding, setHolding] = useState(false)
  const [held, setHeld] = useState(false)
  const [timeLeft, setTimeLeft] = useState(HOLD_SECONDS)
  const [confirming, setConfirming] = useState(false)
  const [confirmed, setConfirmed] = useState(false)
  const [form, setForm] = useState({ name: user?.name || '', phone: user?.phone || '' })
  const [bookingResult, setBookingResult] = useState(null) // Store real backend response
  const travelDate = date || today()

  useEffect(() => {
    setLoadingSeats(true)
    busService.getSeats(bus.id, travelDate)
      .then(data => setSeats(data.seats || []))
      .catch(() => {
        setSeats(Array.from({ length: 40 }, (_, i) => ({
          seatNumber: i + 1,
          status: Math.random() < 0.3 ? 'BOOKED' : Math.random() < 0.1 ? 'HELD' : 'AVAILABLE',
        })))
      })
      .finally(() => setLoadingSeats(false))
  }, [bus.id, travelDate])

  useEffect(() => {
    if (!held || timeLeft <= 0) return
    const t = setInterval(() => setTimeLeft(s => {
      if (s <= 1) { setHeld(false); setSelected(null); toast.error('Hold expired. Seat released.'); clearInterval(t); return 0 }
      return s - 1
    }), 1000)
    return () => clearInterval(t)
  }, [held, timeLeft])

  const getSeatStatus = (sn) => {
    if (held && selected === sn) return 'HELD_BY_ME'
    const s = seats.find(x => x.seatNumber === sn)
    return s?.status || 'AVAILABLE'
  }

  const handleSeatClick = async (sn) => {
    const status = getSeatStatus(sn)
    if (status === 'BOOKED' || status === 'HELD') return
    if (!isLoggedIn) { toast.error('Please login to select a seat'); return }
    if (held && selected !== sn) {
      await busService.releaseSeat({ busId: bus.id, seatNumber: selected, travelDate, userId: user.id }).catch(() => {})
      setHeld(false)
    }
    setHolding(true)
    setSelected(sn)
    try {
      const res = await busService.holdSeat({ busId: bus.id, seatNumber: sn, travelDate, userId: user.id })
      if (res.success) { setHeld(true); setTimeLeft(HOLD_SECONDS) }
      else toast.error(res.message || 'Could not hold seat')
    } catch { toast.error('Could not hold seat') }
    finally { setHolding(false) }
  }

  const handleConfirm = async () => {
    if (!form.name.trim()) return toast.error('Enter passenger name')
    if (!/^[6-9]\d{9}$/.test(form.phone)) return toast.error('Enter a valid 10-digit phone number')
    setConfirming(true)
    try {
      const res = await bookingService.book({
        busId: bus.id, seatNumber: selected, travelDate,
        userId: user.id, passengerName: form.name, passengerPhone: form.phone,
      })
      if (res.success) {
        setBookingResult(res)  // Store REAL backend response (contains bookingId)
        setConfirmed(true)
        toast.success('Booking confirmed! 🎉')
      }
      else toast.error(res.message || 'Booking failed')
    } catch (e) { toast.error(e.message) }
    finally { setConfirming(false) }
  }

  const mins = String(Math.floor(timeLeft / 60)).padStart(2, '0')
  const secs = String(timeLeft % 60).padStart(2, '0')
  const rows = Array.from({ length: 10 }, (_, i) => [i*4+1, i*4+2, i*4+3, i*4+4])

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-sm"
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-white w-full sm:max-w-2xl rounded-t-3xl sm:rounded-2xl shadow-2xl max-h-[95vh] overflow-y-auto">
        <div className="sticky top-0 bg-white z-10 flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div>
            <h2 className="font-extrabold text-slate-900">Select Your Seat</h2>
            <p className="text-xs text-slate-500 mt-0.5">{bus.bus_number || `Bus #${bus.id}`} • {bus.source} → {bus.destination}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors">
            <X className="w-4 h-4 text-slate-600" />
          </button>
        </div>

        {confirmed ? (
          <div className="flex flex-col items-center py-16 px-6 text-center">
            <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mb-5">
              <CheckCircle className="w-10 h-10 text-emerald-500" />
            </div>
            <h3 className="text-2xl font-extrabold text-slate-900 mb-2">Booking Confirmed!</h3>
            <p className="text-slate-500 mb-1">Seat {selected} • {bus.source} → {bus.destination}</p>
            <p className="text-slate-500 mb-5">{travelDate} • {form.name}</p>
            <Badge variant="confirmed" className="text-sm px-4 py-1.5 mb-6">
              Booking ID: #{bookingResult?.booking?.id || '—'}
            </Badge>
            <Button onClick={onClose} variant="primary">Done</Button>
          </div>
        ) : (
          <div className="p-5">
            {/* Legend */}
            <div className="flex flex-wrap gap-3 mb-5">
              {[
                { cls: 'bg-white border-2 border-emerald-400', label: 'Available' },
                { cls: 'bg-white border-2 border-blue-400', label: 'Window' },
                { cls: 'bg-amber-50 border-2 border-amber-400', label: 'Held' },
                { cls: 'bg-slate-200 border-2 border-slate-300', label: 'Booked' },
                { cls: 'bg-emerald-500 border-2 border-emerald-600', label: 'Selected' },
              ].map(s => (
                <div key={s.label} className="flex items-center gap-1.5">
                  <div className={`w-5 h-5 rounded-md ${s.cls}`} />
                  <span className="text-xs text-slate-600 font-medium">{s.label}</span>
                </div>
              ))}
            </div>

            {/* Seat grid */}
            {loadingSeats ? (
              <div className="flex justify-center py-8">
                <div className="w-8 h-8 border-2 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
              </div>
            ) : (
              <div className="bg-slate-50 rounded-2xl p-4 mb-5">
                <div className="flex justify-end mb-3">
                  <span className="bg-slate-200 text-slate-600 text-xs font-bold px-3 py-1 rounded-lg">🚌 Driver</span>
                </div>
                <div className="space-y-2">
                  {rows.map((row, ri) => (
                    <div key={ri} className="grid grid-cols-[1fr_1fr_20px_1fr_1fr] gap-2 items-center">
                      {row.map((sn, si) => {
                        const status = getSeatStatus(sn)
                        const isBooked = status === 'BOOKED'
                        const isHeld = status === 'HELD'
                        const isMine = status === 'HELD_BY_ME' || (selected === sn && held)
                        const isWindow = si === 0 || si === 3
                        return (
                          <>
                            {si === 2 && <div key={`a${ri}`} />}
                            <button key={sn} type="button"
                              onClick={() => handleSeatClick(sn)}
                              disabled={isBooked || isHeld || holding}
                              className={`aspect-square rounded-lg text-[10px] font-bold flex items-center justify-center transition-all duration-150 border-2
                                ${isMine ? 'bg-emerald-500 border-emerald-600 text-white scale-105 shadow-md'
                                  : isBooked ? 'bg-slate-200 border-slate-300 text-slate-400 cursor-not-allowed'
                                  : isHeld ? 'bg-amber-50 border-amber-400 text-amber-600 cursor-not-allowed'
                                  : isWindow ? 'bg-white border-blue-400 hover:bg-blue-50 hover:scale-110 cursor-pointer'
                                  : 'bg-white border-emerald-400 hover:bg-emerald-50 hover:scale-110 cursor-pointer'}`}>
                              {sn}
                            </button>
                          </>
                        )
                      })}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {held && (
              <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-4">
                <Clock className="w-4 h-4 text-amber-500 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-bold text-amber-800">Seat {selected} held for you</p>
                  <p className="text-xs text-amber-600">Expires in <span className="font-mono font-bold">{mins}:{secs}</span></p>
                </div>
                <span className="font-mono font-black text-amber-700 text-xl">{mins}:{secs}</span>
              </div>
            )}

            {held && (
              <div className="border border-slate-200 rounded-2xl p-4">
                <h3 className="font-bold text-slate-900 text-sm mb-4">Passenger Details</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                  <div>
                    <label className="form-label">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))}
                        placeholder="Passenger full name" className="form-input pl-9" />
                    </div>
                  </div>
                  <div>
                    <label className="form-label">Phone Number</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input value={form.phone} onChange={e => setForm(f => ({...f, phone: e.target.value}))}
                        placeholder="10-digit number" maxLength={10} className="form-input pl-9" />
                    </div>
                  </div>
                </div>
                <div className="bg-primary-50 rounded-xl p-4 mb-4 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-500">Seat {selected} • {bus.source} → {bus.destination}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{travelDate}</p>
                  </div>
                  <span className="text-2xl font-extrabold text-primary-600">₹{bus.fare || 25}</span>
                </div>
                <Button onClick={handleConfirm} loading={confirming} variant="primary" size="lg" className="w-full">
                  Confirm Booking — ₹{bus.fare || 25}
                </Button>
              </div>
            )}

            {!held && (
              <p className="text-center text-sm text-slate-500 py-2">Click a seat to select and hold it for 5 minutes</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
