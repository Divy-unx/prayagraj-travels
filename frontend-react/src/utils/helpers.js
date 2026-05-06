export const formatDate = (dateStr) => {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-IN', { weekday:'short', day:'numeric', month:'short', year:'numeric' })
}

export const formatShortDate = (dateStr) => {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-IN', { day:'numeric', month:'short' })
}

export const today = () => new Date().toISOString().split('T')[0]

export const getInitials = (name = '') =>
  name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)

export const formatCurrency = (amount) =>
  `₹${Number(amount).toLocaleString('en-IN')}`

export const getOperatorColor = (opName) => {
  if (!opName) return '#6366f1'
  const n = opName.toLowerCase()
  if (n.includes('upsrtc')) return '#1A56DB'
  if (n.includes('city')) return '#00B562'
  if (n.includes('triveni')) return '#D97706'
  return '#6366f1'
}

export const getBusType = (index) => {
  const types = ['AC Sleeper','AC Seater','Non AC Seater','Deluxe','AC Seater','Non AC Seater']
  return types[index % types.length]
}

export const getDep = (index) =>
  `${String(8 + (index % 6)).padStart(2,'0')}:30`

export const getArr = (index) =>
  `${String(9 + (index % 6)).padStart(2,'0')}:45`

export const getDur = () => '1h 15m'

export const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
export const validatePhone = (phone) => /^[6-9]\d{9}$/.test(phone)
