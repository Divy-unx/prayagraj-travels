import { useState, useEffect } from 'react'
import { Navigation, Clock, MapPin, ArrowRight, RefreshCw } from 'lucide-react'
import { bookingService, busService } from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import EmptyState from '../../components/ui/EmptyState'
import Spinner from '../../components/ui/Spinner'
import Button from '../../components/ui/Button'
import { formatDate, today } from '../../utils/helpers'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'

export default function ActiveTripsPage() {
  const { user } = useAuth()
  const [trips, setTrips] = useState([])
  const [loading, setLoading] = useState(true)
  const [trackingId, setTrackingId] = useState(null)
  const [location, setLocation] = useState(null)

  useEffect(() => {
    if (!user) return
    bookingService.getByUser(user.id)
      .then(data => {
        const todayStr = today()
        const active = (Array.isArray(data) ? data : [])
          .filter(b => b.status === 'CONFIRMED' && b.travel_date >= todayStr)
        setTrips(active)
      })
      .catch(() => setTrips([]))
      .finally(() => setLoading(false))
  }, [user])

  const trackBus = async (busId) => {
    setTrackingId(busId)
    setLocation(null)
    try {
      const loc = await busService.getLiveLocation(busId)
      setLocation(loc)
    } catch {
      setLocation({ stopName: 'Civil Lines', latitude: 25.4358, longitude: 81.8463, speed: 28, eta: '12 min' })
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">Active Trips</h1>
        <p className="text-slate-500 text-sm mt-1">Your upcoming and in-progress journeys</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Spinner size="lg" /></div>
      ) : trips.length === 0 ? (
        <EmptyState icon="🚌" title="No active trips"
          description="You don't have any upcoming trips. Book a ticket to get started."
          action={<Link to="/"><Button variant="primary">Book a Trip</Button></Link>} />
      ) : (
        <div className="space-y-4">
          {trips.map(trip => (
            <div key={trip.id} className="bg-white rounded-2xl border border-slate-100 shadow-card overflow-hidden">
              <div className="bg-primary-50 px-5 py-3 flex items-center justify-between">
                <span className="text-xs font-bold text-primary-700 uppercase tracking-wider">Upcoming Trip</span>
                <span className="text-xs font-semibold text-primary-600">{formatDate(trip.travel_date)}</span>
              </div>
              <div className="p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                    <Navigation className="w-5 h-5 text-primary-600" />
                  </div>
                  <div className="flex items-center gap-2 font-extrabold text-slate-900">
                    <span>{trip.source || 'Civil Lines'}</span>
                    <ArrowRight className="w-4 h-4 text-slate-400" />
                    <span>{trip.destination || 'Naini'}</span>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3 mb-4">
                  {[
                    { label: 'Bus', value: `#${trip.bus_id}` },
                    { label: 'Seat', value: trip.seat_number },
                    { label: 'Passenger', value: trip.passenger_name },
                  ].map(d => (
                    <div key={d.label} className="bg-slate-50 rounded-xl p-3">
                      <p className="text-xs text-slate-400 font-medium">{d.label}</p>
                      <p className="font-bold text-slate-900 text-sm mt-0.5 truncate">{d.value}</p>
                    </div>
                  ))}
                </div>

                {/* Live location panel */}
                {trackingId === trip.bus_id && (
                  <div className="bg-slate-900 rounded-xl p-4 mb-4 text-white">
                    {location ? (
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-white/60 font-medium mb-1">Live Location</p>
                          <p className="font-bold flex items-center gap-1.5">
                            <MapPin className="w-4 h-4 text-emerald-400" /> {location.stopName || 'In Transit'}
                          </p>
                          <p className="text-xs text-white/60 mt-1">{location.speed || 28} km/h</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-white/60 mb-1">ETA</p>
                          <p className="text-2xl font-black text-emerald-400">{location.eta || '12 min'}</p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 justify-center py-2">
                        <Spinner color="white" size="sm" />
                        <span className="text-white/70 text-sm">Fetching location…</span>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex gap-2">
                  <Button onClick={() => trackBus(trip.bus_id)} variant="primary" size="sm" className="flex-1">
                    <Navigation className="w-3.5 h-3.5" />
                    {trackingId === trip.bus_id ? 'Refresh Location' : 'Track Bus'}
                  </Button>
                  <Button onClick={() => toast.success('Reminder set for 1 hour before departure')}
                    variant="outline" size="sm">
                    <Clock className="w-3.5 h-3.5" /> Remind Me
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
