import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'
import Spinner from './components/ui/Spinner'
import ScrollToTop from './components/ScrollToTop'
import { useAuth } from './context/AuthContext'

const HomePage        = lazy(() => import('./pages/HomePage'))
const SearchPage      = lazy(() => import('./pages/SearchResultsPage'))
const BusDetailsPage  = lazy(() => import('./pages/BusDetailsPage'))
const AboutPage       = lazy(() => import('./pages/AboutPage'))
const RoutesPage      = lazy(() => import('./pages/RoutesPage'))
const ContactPage     = lazy(() => import('./pages/ContactPage'))
const FAQPage         = lazy(() => import('./pages/FAQPage'))
const OffersPage      = lazy(() => import('./pages/OffersPage'))
const LoginPage       = lazy(() => import('./pages/auth/LoginPage'))
const RegisterPage    = lazy(() => import('./pages/auth/RegisterPage'))
const ForgotPage      = lazy(() => import('./pages/auth/ForgotPasswordPage'))
const VerifyEmailPage = lazy(() => import('./pages/auth/VerifyEmailPage'))
const ResetPasswordPage = lazy(() => import('./pages/auth/ResetPasswordPage'))
const DashboardLayout = lazy(() => import('./pages/dashboard/DashboardLayout'))
const ProfilePage     = lazy(() => import('./pages/dashboard/ProfilePage'))
const BookingsPage    = lazy(() => import('./pages/dashboard/BookingsPage'))
const FavoritesPage   = lazy(() => import('./pages/dashboard/FavoritesPage'))
const ActiveTripsPage = lazy(() => import('./pages/dashboard/ActiveTripsPage'))
const WalletPage      = lazy(() => import('./pages/dashboard/WalletPage'))
const NotifPage       = lazy(() => import('./pages/dashboard/NotificationsPage'))
const AdminPage       = lazy(() => import('./pages/dashboard/AdminPage'))

function ProtectedRoute({ children }) {
  const { isLoggedIn, isEmailVerified, loading } = useAuth()
  if (loading) return null
  if (!isLoggedIn) return <Navigate to="/login" replace />
  if (!isEmailVerified) return <Navigate to="/verify-email" replace />
  return children
}

const PageLoader = () => (
  <div className="min-h-[60vh] flex items-center justify-center">
    <Spinner size="lg" />
  </div>
)

export default function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <ScrollToTop />
      <Navbar />
      <main className="flex-1">
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/bus/:id" element={<BusDetailsPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/routes" element={<RoutesPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/faq" element={<FAQPage />} />
            <Route path="/offers" element={<OffersPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPage />} />
            <Route path="/verify-email" element={<VerifyEmailPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/dashboard" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
              <Route index element={<Navigate to="profile" replace />} />
              <Route path="profile" element={<ProfilePage />} />
              <Route path="bookings" element={<BookingsPage />} />
              <Route path="favorites" element={<FavoritesPage />} />
              <Route path="active" element={<ActiveTripsPage />} />
              <Route path="wallet" element={<WalletPage />} />
              <Route path="notifications" element={<NotifPage />} />
              <Route path="admin" element={<AdminPage />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </main>
      <Footer />
    </div>
  )
}
