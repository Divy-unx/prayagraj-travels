import { useState } from 'react'
import { Bell, BellOff, CheckCheck, Trash2 } from 'lucide-react'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import toast from 'react-hot-toast'

const INITIAL = [
  { id:1, type:'booking', icon:'🎟️', title:'Booking Confirmed!', desc:'Your seat on Bus #PT-1042 (Civil Lines → Airport) is confirmed for 28 Apr.', time:'2 hours ago', read:false },
  { id:2, type:'offer',   icon:'🏷️', title:'Exclusive Offer for You', desc:'Use code WEEKEND10 this Saturday for flat 10% off on all routes. Valid for 48 hours.', time:'5 hours ago', read:false },
  { id:3, type:'system',  icon:'🚌', title:'Your Bus is On Time', desc:'Bus PT-1042 is running on schedule. Estimated departure: 8:30 AM from Civil Lines.', time:'Yesterday', read:true },
  { id:4, type:'booking', icon:'✅', title:'Payment Successful', desc:'₹40 paid successfully for your booking #BK7821. Receipt has been emailed.', time:'2 days ago', read:true },
  { id:5, type:'offer',   icon:'⭐', title:'Rate Your Last Journey', desc:'How was your trip from Naini to Civil Lines on 20 Apr? Your feedback helps us improve.', time:'3 days ago', read:true },
  { id:6, type:'system',  icon:'🔐', title:'Security Alert', desc:'A new sign-in was detected from Prayagraj, UP. If this was you, no action needed.', time:'5 days ago', read:true },
  { id:7, type:'booking', icon:'💰', title:'Refund Processed', desc:'₹25 refund for booking #BK6190 has been credited to your wallet.', time:'1 week ago', read:true },
]

const typeColor = { booking: 'bg-primary-50', offer: 'bg-amber-50', system: 'bg-slate-100' }

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState(INITIAL)
  const [filter, setFilter] = useState('all')

  const markAllRead = () => {
    setNotifications(n => n.map(x => ({ ...x, read: true })))
    toast.success('All notifications marked as read')
  }

  const deleteNotif = (id) => setNotifications(n => n.filter(x => x.id !== id))

  const clearAll = () => { setNotifications([]); toast.success('All notifications cleared') }

  const unread = notifications.filter(n => !n.read).length
  const filtered = notifications.filter(n => filter === 'all' || n.type === filter || (filter === 'unread' && !n.read))

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
            Notifications
            {unread > 0 && (
              <span className="bg-primary-600 text-white text-xs font-black px-2 py-0.5 rounded-full">{unread}</span>
            )}
          </h1>
          <p className="text-slate-500 text-sm mt-1">{unread} unread notifications</p>
        </div>
        <div className="flex gap-2">
          {unread > 0 && (
            <Button onClick={markAllRead} variant="outline" size="sm">
              <CheckCheck className="w-3.5 h-3.5" /> Mark all read
            </Button>
          )}
          <Button onClick={clearAll} variant="ghost" size="sm" className="text-slate-400 hover:text-red-500">
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {[
          { val:'all',     label:'All' },
          { val:'unread',  label:'Unread' },
          { val:'booking', label:'Bookings' },
          { val:'offer',   label:'Offers' },
          { val:'system',  label:'System' },
        ].map(f => (
          <button key={f.val} onClick={() => setFilter(f.val)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
              filter === f.val ? 'bg-primary-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}>
            {f.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-card py-20 text-center">
          <BellOff className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="font-bold text-slate-600">No notifications</p>
          <p className="text-slate-400 text-sm mt-1">You're all caught up!</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(n => (
            <div key={n.id}
              className={`bg-white rounded-2xl border shadow-card p-4 flex items-start gap-4 transition-all ${n.read ? 'border-slate-100' : 'border-primary-200 bg-primary-50/30'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xl flex-shrink-0 ${typeColor[n.type]}`}>
                {n.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p className={`text-sm font-bold ${n.read ? 'text-slate-700' : 'text-slate-900'}`}>{n.title}</p>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {!n.read && <span className="w-2 h-2 bg-primary-600 rounded-full" />}
                    <button onClick={() => deleteNotif(n.id)} className="text-slate-300 hover:text-red-400 transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{n.desc}</p>
                <p className="text-xs text-slate-400 mt-1.5 font-medium">{n.time}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
