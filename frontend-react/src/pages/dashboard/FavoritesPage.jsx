import { useEffect, useState } from 'react'
import { Heart, Trash2 } from 'lucide-react'
import { busService } from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import Button from '../../components/ui/Button'
import EmptyState from '../../components/ui/EmptyState'
import Spinner from '../../components/ui/Spinner'
import toast from 'react-hot-toast'

export default function FavoritesPage() {
  const { user } = useAuth()
  const [routes, setRoutes] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user?.id) return
    busService.getFavorites(user.id)
      .then(data => setRoutes(Array.isArray(data) ? data : []))
      .catch(() => setRoutes([]))
      .finally(() => setLoading(false))
  }, [user?.id])

  const remove = async (route) => {
    try {
      await busService.deleteFavorite(user.id, route.source, route.destination)
      setRoutes(prev => prev.filter(item => !(item.source === route.source && item.destination === route.destination)))
      toast.success('Favorite route removed')
    } catch (error) {
      toast.error(error.message || 'Unable to remove favorite route')
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">Saved Routes</h1>
        <p className="text-slate-500 text-sm mt-1">Quick access to your frequently searched routes</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Spinner size="lg" /></div>
      ) : routes.length === 0 ? (
        <EmptyState
          icon="💙"
          title="No saved routes"
          description="Save a route from search results to access it here later."
          action={<Button variant="primary" onClick={() => window.location.assign('/routes')}>Browse routes</Button>}
        />
      ) : (
        <div className="grid gap-3">
          {routes.map(route => (
            <div key={`${route.source}-${route.destination}`} className="bg-white rounded-2xl border border-slate-100 shadow-card p-5 flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                  <Heart className="w-4 h-4 text-rose-500" /> {route.source} → {route.destination}
                </p>
                <p className="text-xs text-slate-500 mt-1">{route.notes || 'Saved route'}</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => remove(route)} className="gap-2">
                <Trash2 className="w-4 h-4" /> Remove
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}