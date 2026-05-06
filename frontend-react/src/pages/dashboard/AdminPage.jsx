import { useEffect, useState } from 'react'
import { Plus, Trash2, Save } from 'lucide-react'
import { adminService } from '../../services/api'
import Spinner from '../../components/ui/Spinner'
import Button from '../../components/ui/Button'
import toast from 'react-hot-toast'

const emptyForm = { id: '', name: '', source: '', destination: '', capacity: 40, fare: 25 }

export default function AdminPage() {
  const [routes, setRoutes] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState(emptyForm)

  const load = async () => {
    try {
      const data = await adminService.getRoutes()
      setRoutes(Array.isArray(data) ? data : [])
    } catch (error) {
      toast.error(error.message || 'Unable to load routes')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const save = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      if (form.id) await adminService.updateRoute(form.id, form)
      else await adminService.createRoute(form)
      toast.success('Route saved')
      setForm(emptyForm)
      await load()
    } catch (error) {
      toast.error(error.message || 'Unable to save route')
    } finally {
      setSaving(false)
    }
  }

  const remove = async (id) => {
    if (!window.confirm('Delete this route?')) return
    try {
      await adminService.deleteRoute(id)
      toast.success('Route deleted')
      await load()
    } catch (error) {
      toast.error(error.message || 'Unable to delete route')
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">Admin Panel</h1>
        <p className="text-slate-500 text-sm mt-1">Manage routes, capacity, and pricing</p>
      </div>

      <form onSubmit={save} className="bg-white rounded-2xl border border-slate-100 shadow-card p-5 grid gap-3 md:grid-cols-5">
        <input className="form-input md:col-span-2" placeholder="Route name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
        <input className="form-input" placeholder="Source" value={form.source} onChange={e => setForm(f => ({ ...f, source: e.target.value }))} />
        <input className="form-input" placeholder="Destination" value={form.destination} onChange={e => setForm(f => ({ ...f, destination: e.target.value }))} />
        <input className="form-input" type="number" placeholder="Fare" value={form.fare} onChange={e => setForm(f => ({ ...f, fare: Number(e.target.value) }))} />
        <input className="form-input" type="number" placeholder="Capacity" value={form.capacity} onChange={e => setForm(f => ({ ...f, capacity: Number(e.target.value) }))} />
        <div className="md:col-span-5 flex gap-2">
          <Button type="submit" variant="primary" loading={saving} className="gap-2">
            {form.id ? <Save className="w-4 h-4" /> : <Plus className="w-4 h-4" />} {form.id ? 'Update Route' : 'Add Route'}
          </Button>
          {form.id && <Button type="button" variant="outline" onClick={() => setForm(emptyForm)}>Cancel Edit</Button>}
        </div>
      </form>

      {loading ? (
        <div className="flex justify-center py-16"><Spinner size="lg" /></div>
      ) : (
        <div className="grid gap-3">
          {routes.map(route => (
            <div key={route.id} className="bg-white rounded-2xl border border-slate-100 shadow-card p-5 flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-extrabold text-slate-900">{route.name}</p>
                <p className="text-xs text-slate-500">{route.source} → {route.destination}</p>
                <p className="text-xs text-slate-500 mt-1">₹{route.fare} • {route.capacity} seats</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setForm(route)}>Edit</Button>
                <Button variant="danger" size="sm" onClick={() => remove(route.id)} className="gap-2">
                  <Trash2 className="w-4 h-4" /> Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}