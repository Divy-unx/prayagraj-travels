import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { User, BookOpen, Navigation, Wallet, Bell, LogOut, ChevronRight, Bus, Heart, Shield } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { getInitials } from '../../utils/helpers'
import toast from 'react-hot-toast'

const navItems = [
  { to: '/dashboard/profile',       icon: User,       label: 'My Profile',        desc: 'Personal info' },
  { to: '/dashboard/bookings',      icon: BookOpen,   label: 'My Bookings',       desc: 'All bookings' },
  { to: '/dashboard/favorites',     icon: Heart,      label: 'Saved Routes',      desc: 'Favorite journeys' },
  { to: '/dashboard/active',        icon: Navigation, label: 'Active Trips',      desc: 'Upcoming trips' },
  { to: '/dashboard/wallet',        icon: Wallet,     label: 'Wallet & Rewards',  desc: 'Balance & points' },
  { to: '/dashboard/notifications', icon: Bell,       label: 'Notifications',     desc: 'Updates & alerts' },
  { to: '/dashboard/admin',         icon: Shield,     label: 'Admin Panel',       desc: 'Manage routes', admin: true },
]

export default function DashboardLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    toast.success('Logged out successfully')
    navigate('/')
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex gap-6 items-start">
        {/* Sidebar */}
        <aside className="hidden md:flex flex-col w-64 flex-shrink-0">
          {/* Profile card */}
          <div className="bg-hero-grad rounded-2xl p-5 text-white mb-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-white font-extrabold text-lg">
                {getInitials(user?.name)}
              </div>
              <div className="min-w-0">
                <p className="font-extrabold truncate">{user?.name}</p>
                <p className="text-white/70 text-xs truncate">{user?.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-white/10 rounded-xl px-3 py-2 mt-2">
              <Bus className="w-4 h-4 text-white/70" />
              <span className="text-white/80 text-xs font-medium">Member since 2026</span>
            </div>
          </div>

          {/* Nav */}
          <nav className="bg-white rounded-2xl border border-slate-100 shadow-card overflow-hidden">
            {navItems.filter(item => !item.admin || user?.role === 'ADMIN').map((item, i) => (
              <NavLink key={item.to} to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3.5 transition-colors border-b border-slate-50 last:border-0 ${
                    isActive ? 'bg-primary-50 text-primary-700' : 'text-slate-700 hover:bg-slate-50'
                  }`
                }>
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  'bg-slate-100'
                }`}>
                  <item.icon className="w-4 h-4 text-slate-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm leading-none">{item.label}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{item.desc}</p>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-300 flex-shrink-0" />
              </NavLink>
            ))}
            <button onClick={handleLogout}
              className="flex items-center gap-3 w-full px-4 py-3.5 text-red-600 hover:bg-red-50 transition-colors">
              <div className="w-8 h-8 rounded-xl bg-red-50 flex items-center justify-center flex-shrink-0">
                <LogOut className="w-4 h-4 text-red-500" />
              </div>
              <span className="font-semibold text-sm">Sign Out</span>
            </button>
          </nav>
        </aside>

        {/* Mobile bottom nav */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 z-40 flex items-center justify-around px-2 py-2 shadow-nav">
          {navItems.filter(item => !item.admin || user?.role === 'ADMIN').map(item => (
            <NavLink key={item.to} to={item.to}
              className={({ isActive }) =>
                `flex flex-col items-center gap-0.5 p-2 rounded-xl transition-colors ${
                  isActive ? 'text-primary-600' : 'text-slate-400'
                }`
              }>
              <item.icon className="w-5 h-5" />
              <span className="text-[9px] font-semibold">{item.label.split(' ')[0]}</span>
            </NavLink>
          ))}
        </div>

        {/* Content */}
        <main className="flex-1 min-w-0 pb-20 md:pb-0">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
