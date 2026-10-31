import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Star, MapPin, Clock, Users, Shield, Zap, CheckCircle, Navigation } from 'lucide-react'
import { busService } from '../services/api'
import { useApp } from '../context/AppContext'
import SeatModal from '../components/SeatModal'
import RouteMap from '../components/RouteMap'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
import Spinner from '../components/ui/Spinner'
import { OPERATORS, STOPS, AMENITIES } from '../utils/constants'
import { getBusType, getDep, getArr, getOperatorColor, today } from '../utils/helpers'
import toast from 'react-hot-toast'

function LiveLocationMap({ busId }) {
  const [location, setLocation] = useState(null)
  useEffect(() => {
    let mounted = true

    const fetchLocation = () => {
      busService.getLiveLocation(busId)
        .then(data => mounted && setLocation(data))
        .catch(() => mounted && setLocation({ latitude: 25.4358, longitude: 81.8463, speed_kmh: 32, next_stop: 'Civil Lines', status: 'ON_TIME' }))
    }

    fetchLocation()
    const timer = setInterval(fetchLocation, 30000)
    return () => {
      mounted = false
      clearInterval(timer)
    }
  }, [busId])

  return (
    <div className="bg-slate-900 rounded-2xl overflow-hidden h-48 flex items-center justify-center relative">
      <div className="absolute inset-0 opacity-20"
        style={{ backgroundImage: 'radial-gradient(circle at 50% 50%, #2563eb 0%, transparent 70%)' }} />
      <div className="text-center text-white relative z-10">
        <div className="w-12 h-12 bg-primary-600 rounded-full flex items-center justify-center mx-auto mb-3 animate-pulse">
          <Navigation className="w-6 h-6 text-white" />
        </div>
        {location ? (
          <>
            <p className="font-bold text-sm">Live Location</p>
            <p className="text-white/70 text-xs mt-1">Near {location.next_stop || location.stopName || 'Civil Lines'}</p>
            <p className="text-white/50 text-xs">{location.speed_kmh || location.speed || 32} km/h • {location.latitude?.toFixed(4)}, {location.longitude?.toFixed(4)}</p>
          </>
        ) : (
          <Spinner color="white" />
        )}
      </div>
    </div>
  )
}

export default function BusDetailsPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { openSeatModal, seatModalBus, closeSeatModal } = useApp()
  const [bus, setBus] = useState(null)
  const [loading, setLoading] = useState(true)
  const [travelDate, setTravelDate] = useState(today())

  useEffect(() => {
    busService.getById(id)
      .then(setBus)
      .catch(() => {
        setBus({ id, bus_number: `PT-${1000 + Number(id)}`, source: 'Civil Lines', destination: 'Naini', fare: 25, capacity: 40, available_seats: 22 })
      })
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <Spinner size="lg" />
    </div>
  )

  const op = OPERATORS[Number(id) % OPERATORS.length]
  const busType = getBusType(Number(id))
  const dep = getDep(Number(id))
  const arr = getArr(Number(id))

  const stops = [bus?.source || 'Civil Lines', 'High Court', 'Zero Road', 'Chowk', bus?.destination || 'Naini']

  return (
    <>
      <div className="bg-hero-grad py-6">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-white/70 hover:text-white transition-colors text-sm font-semibold mb-4">
            <ArrowLeft className="w-4 h-4" /> Back to Results
          </button>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white text-sm font-black flex-shrink-0" style={{ background: op.color }}>
              {op.name.slice(0,2)}
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-white">{bus?.bus_number || `PT-${1000 + Number(id)}`}</h1>
              <p className="text-white/70 text-sm">{op.name} • {busType}</p>
            </div>
            <div className="ml-auto hidden sm:flex items-center gap-2">
              <span className="bg-emerald-500 text-white text-sm font-bold px-3 py-1.5 rounded-xl flex items-center gap-1">
                <Star className="w-4 h-4 fill-current" /> {op.rating}
              </span>
              <span className="text-white/60 text-sm">{op.reviews} reviews</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main */}
          <div className="lg:col-span-2 space-y-5">
            {/* Journey summary */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-card p-6">
              <h2 className="font-extrabold text-slate-900 mb-5">Journey Details</h2>
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <p className="text-3xl font-black text-slate-900 tabular-nums">{dep}</p>
                  <p className="text-sm font-bold text-slate-700 mt-1">{bus?.source}</p>
                  <p className="text-xs text-slate-400">Boarding Point</p>
                </div>
                <div className="flex-1 flex flex-col items-center gap-2">
                  <div className="flex items-center gap-1 text-xs text-slate-400 font-medium">
                    <Clock className="w-3 h-3" /> 1h 15m direct
                  </div>
                  <div className="w-full flex items-center">
                    <div className="w-3 h-3 rounded-full border-2 border-primary-400 bg-white" />
                    <div className="flex-1 h-0.5 bg-gradient-to-r from-primary-400 to-accent-400" />
                    <ArrowRight className="w-4 h-4 text-accent-400 -mx-1" />
                    <div className="flex-1 h-0.5 bg-accent-400" />
                    <div className="w-3 h-3 rounded-full bg-accent-400" />
                  </div>
                  <Badge variant="primary" className="text-xs">Non-Stop</Badge>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-black text-slate-900 tabular-nums">{arr}</p>
                  <p className="text-sm font-bold text-slate-700 mt-1">{bus?.destination}</p>
                  <p className="text-xs text-slate-400">Drop-off Point</p>
                </div>
              </div>
            </div>

            {/* Route timeline */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-card p-6">
              <h2 className="font-extrabold text-slate-900 mb-5">Route Stops</h2>
              <div className="relative pl-6">
                <div className="absolute left-2 top-2 bottom-2 w-0.5 bg-slate-200" />
                {stops.map((stop, i) => (
                  <div key={i} className="relative mb-5 last:mb-0">
                    <div className={`absolute -left-4 top-0.5 w-3 h-3 rounded-full border-2 ${i === 0 ? 'bg-primary-500 border-primary-500' : i === stops.length - 1 ? 'bg-accent-500 border-accent-500' : 'bg-white border-slate-300'}`} />
                    <div className="flex items-center justify-between">
                      <div>
                        <p className={`font-bold text-sm ${i === 0 || i === stops.length - 1 ? 'text-slate-900' : 'text-slate-600'}`}>{stop}</p>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {i === 0 ? `Departure: ${dep}` : i === stops.length - 1 ? `Arrival: ${arr}` : `~${dep.split(':')[0]}:${String(parseInt(dep.split(':')[1]) + i * 12).padStart(2,'0')}`}
                        </p>
                      </div>
                      {i === 0 && <Badge variant="primary">Boarding</Badge>}
                      {i === stops.length - 1 && <Badge variant="success">Drop-off</Badge>}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Amenities */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-card p-6">
              <h2 className="font-extrabold text-slate-900 mb-5">Amenities</h2>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-4">
                {AMENITIES.map(a => (
                  <div key={a.label} className="flex flex-col items-center gap-2 p-3 bg-slate-50 rounded-xl">
                    <span className="text-2xl">{a.icon}</span>
                    <span className="text-xs font-medium text-slate-600 text-center">{a.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Live location */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-card p-6">
              <h2 className="font-extrabold text-slate-900 mb-4">Live Bus Location</h2>
              <LiveLocationMap busId={id} />
            </div>

            <RouteMap source={bus?.source} destination={bus?.destination} />

            {/* Policies */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-card p-6">
              <h2 className="font-extrabold text-slate-900 mb-4">Policies</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {[
                  { icon: '💰', title: 'Cancellation', desc: 'Free cancellation up to 2 hours before departure. 50% refund within 2 hours.' },
                  { icon: '🎒', title: 'Luggage', desc: 'One bag up to 15 kg allowed per passenger. Overhead storage available.' },
                  { icon: '🚭', title: 'Smoking Policy', desc: 'Strictly no smoking on board. Violations will result in disembarkation.' },
                  { icon: '🐾', title: 'Pets', desc: 'Pets are not allowed on city buses as per UPSRTC regulations.' },
                ].map(p => (
                  <div key={p.title} className="flex items-start gap-3 p-4 bg-slate-50 rounded-xl">
                    <span className="text-xl flex-shrink-0">{p.icon}</span>
                    <div>
                      <p className="font-bold text-slate-900 text-sm">{p.title}</p>
                      <p className="text-xs text-slate-500 mt-1">{p.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar booking card */}
          <div>
            <div className="bg-white rounded-2xl border border-slate-100 shadow-card p-6 sticky top-20">
              <div className="flex items-baseline justify-between mb-5">
                <div>
                  <p className="text-xs text-slate-400 line-through">₹{(bus?.fare || 25) + 15}</p>
                  <p className="text-3xl font-black text-slate-900">₹{bus?.fare || 25}</p>
                  <p className="text-xs text-slate-500 mt-0.5">per person</p>
                </div>
                <Badge variant="success">Save ₹15</Badge>
              </div>

              <div className="space-y-3 mb-5">
                {[
                  { icon: Users, label: `${bus?.available_seats ?? 22} seats available` },
                  { icon: Shield, label: 'Fully sanitised bus' },
                  { icon: Zap, label: 'Instant confirmation' },
                  { icon: CheckCircle, label: 'Free cancellation' },
                ].map(item => (
                  <div key={item.label} className="flex items-center gap-2.5 text-sm text-slate-600">
                    <item.icon className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    {item.label}
                  </div>
                ))}
              </div>

              <div className="mb-4">
                <label className="form-label">Travel Date</label>
                <input type="date" value={travelDate} min={today()}
                  onChange={e => setTravelDate(e.target.value)}
                  className="form-input" />
              </div>

              <Button onClick={() => openSeatModal({ ...bus, source: bus?.source, destination: bus?.destination })}
                variant="primary" size="lg" className="w-full mb-3">
                Select Seats
              </Button>
              <p className="text-center text-xs text-slate-400">No hidden charges • Secure booking</p>

              <div className="mt-4 pt-4 border-t border-slate-100">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Operator</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-black" style={{ background: op.color }}>
                    {op.name.slice(0,2)}
                  </div>
                  <div>
                    <p className="font-bold text-sm text-slate-900">{op.name}</p>
                    <p className="text-xs text-slate-500">{op.full}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {seatModalBus && <SeatModal bus={seatModalBus} onClose={closeSeatModal} date={travelDate} />}
    </>
  )
}
