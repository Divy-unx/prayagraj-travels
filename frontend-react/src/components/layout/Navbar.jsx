import { useState, useEffect } from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import {
  Bus,
  Menu,
  X,
  ChevronDown,
  User,
  LogOut,
  BookOpen,
  Wallet,
  Bell,
  MapPin,
  Tag,
  HelpCircle,
  Phone,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { getInitials } from "../../utils/helpers";
import toast from "react-hot-toast";

const navLinks = [
  { to: "/about", label: "About" },
  { to: "/routes", label: "Routes" },
  { to: "/offers", label: "Offers", badge: "HOT" },
  { to: "/contact", label: "Contact" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { user, isLoggedIn, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
    toast.success("Logged out successfully");
    navigate("/");
  };

  return (
    <>
      <header
        className={`sticky top-0 z-50 transition-all duration-300 ${scrolled ? "bg-white/90 backdrop-blur-lg shadow-nav border-b border-slate-100" : "bg-white border-b border-slate-100"}`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16 gap-8">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 flex-shrink-0">
              <div className="w-9 h-9 bg-primary-600 rounded-xl flex items-center justify-center shadow-sm">
                <Bus className="w-5 h-5 text-white" />
              </div>
              <div className="hidden sm:block">
                <span className="font-extrabold text-lg text-slate-900 leading-none">
                  Prayag
                </span>
                <span className="font-extrabold text-lg text-primary-600 leading-none">
                  Travels
                </span>
              </div>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center justify-center gap-1 flex-1">
              {navLinks.map((l) => (
                <NavLink
                  key={l.to}
                  to={l.to}
                  end={l.to === "/"}
                  className={({ isActive }) =>
                    `relative px-3.5 py-2 rounded-lg text-sm font-semibold transition-all duration-150 ${
                      isActive
                        ? "text-primary-600 bg-primary-50"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                    }`
                  }
                >
                  {l.label}
                  {l.badge && (
                    <span className="absolute -top-1 -right-1 bg-accent-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full leading-none">
                      {l.badge}
                    </span>
                  )}
                </NavLink>
              ))}
            </nav>

            {/* Right side */}
            <div className="flex items-center gap-3 ml-auto">
              {isLoggedIn ? (
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen((o) => !o)}
                    className="flex items-center gap-2 pl-1 pr-3 py-1 rounded-xl hover:bg-slate-50 transition-colors"
                  >
                    <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                      {getInitials(user?.name)}
                    </div>
                    <span className="hidden sm:block text-sm font-semibold text-slate-700 max-w-[100px] truncate">
                      {user?.name?.split(" ")[0]}
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 text-slate-400 transition-transform ${userMenuOpen ? "rotate-180" : ""}`}
                    />
                  </button>

                  {userMenuOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setUserMenuOpen(false)}
                      />
                      <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-glass border border-slate-100 py-1.5 z-50 animate-slide-up">
                        <div className="px-4 py-3 border-b border-slate-100">
                          <p className="text-sm font-bold text-slate-800 truncate">
                            {user?.name}
                          </p>
                          <p className="text-xs text-slate-500 truncate">
                            {user?.email}
                          </p>
                        </div>
                        {[
                          {
                            to: "/dashboard/profile",
                            icon: User,
                            label: "My Profile",
                          },
                          {
                            to: "/dashboard/bookings",
                            icon: BookOpen,
                            label: "My Bookings",
                          },
                          {
                            to: "/dashboard/wallet",
                            icon: Wallet,
                            label: "Wallet & Rewards",
                          },
                          {
                            to: "/dashboard/notifications",
                            icon: Bell,
                            label: "Notifications",
                          },
                        ].map((item) => (
                          <Link
                            key={item.to}
                            to={item.to}
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 hover:text-primary-600 transition-colors"
                          >
                            <item.icon className="w-4 h-4" />
                            {item.label}
                          </Link>
                        ))}
                        <div className="border-t border-slate-100 mt-1 pt-1">
                          <button
                            onClick={handleLogout}
                            className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                          >
                            <LogOut className="w-4 h-4" />
                            Sign Out
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <div className="hidden sm:flex items-center gap-2">
                  <Link
                    to="/login"
                    className="px-4 py-2 text-sm font-semibold text-slate-700 hover:text-primary-600 transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    className="px-4 py-2 bg-primary-600 text-white text-sm font-semibold rounded-xl hover:bg-primary-700 transition-colors shadow-btn"
                  >
                    Sign Up Free
                  </Link>
                </div>
              )}

              <button
                className="md:hidden p-2 rounded-lg hover:bg-slate-100 transition-colors"
                onClick={() => setMobileOpen((o) => !o)}
                aria-label="Toggle menu"
              >
                {mobileOpen ? (
                  <X className="w-5 h-5 text-slate-700" />
                ) : (
                  <Menu className="w-5 h-5 text-slate-700" />
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div
            className="absolute inset-0 bg-slate-900/50"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute right-0 top-0 h-full w-72 bg-white shadow-2xl animate-slide-up flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-slate-100">
              <Link
                to="/"
                className="flex items-center gap-2"
                onClick={() => setMobileOpen(false)}
              >
                <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                  <Bus className="w-4 h-4 text-white" />
                </div>
                <span className="font-extrabold text-slate-900">
                  PrayagTravels
                </span>
              </Link>
              <button
                onClick={() => setMobileOpen(false)}
                className="p-1.5 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5 text-slate-600" />
              </button>
            </div>
            <nav className="flex-1 py-3 px-3 overflow-y-auto">
              {navLinks.map((l) => (
                <NavLink
                  key={l.to}
                  to={l.to}
                  end={l.to === "/"}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold mb-1 transition-colors ${
                      isActive
                        ? "bg-primary-50 text-primary-600"
                        : "text-slate-700 hover:bg-slate-50"
                    }`
                  }
                >
                  {l.label}
                  {l.badge && (
                    <span className="ml-auto bg-accent-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full">
                      {l.badge}
                    </span>
                  )}
                </NavLink>
              ))}
              {isLoggedIn && (
                <>
                  <div className="h-px bg-slate-100 my-2" />
                  {[
                    {
                      to: "/dashboard/profile",
                      icon: User,
                      label: "My Profile",
                    },
                    {
                      to: "/dashboard/bookings",
                      icon: BookOpen,
                      label: "My Bookings",
                    },
                    { to: "/dashboard/wallet", icon: Wallet, label: "Wallet" },
                  ].map((item) => (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold mb-1 text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      <item.icon className="w-4 h-4 text-slate-400" />
                      {item.label}
                    </NavLink>
                  ))}
                </>
              )}
            </nav>
            <div className="p-4 border-t border-slate-100">
              {isLoggedIn ? (
                <div>
                  <div className="flex items-center gap-3 mb-3 px-1">
                    <div className="w-9 h-9 bg-primary-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                      {getInitials(user?.name)}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800">
                        {user?.name}
                      </p>
                      <p className="text-xs text-slate-500">{user?.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 w-full justify-center px-4 py-2.5 bg-red-50 text-red-600 text-sm font-semibold rounded-xl"
                  >
                    <LogOut className="w-4 h-4" /> Sign Out
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    to="/login"
                    onClick={() => setMobileOpen(false)}
                    className="text-center px-4 py-2.5 border-2 border-primary-600 text-primary-600 text-sm font-semibold rounded-xl hover:bg-primary-50"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileOpen(false)}
                    className="text-center px-4 py-2.5 bg-primary-600 text-white text-sm font-semibold rounded-xl hover:bg-primary-700"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
