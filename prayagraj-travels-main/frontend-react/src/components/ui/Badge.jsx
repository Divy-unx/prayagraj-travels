export default function Badge({ children, variant = 'default', className = '' }) {
  const variants = {
    default:   'bg-slate-100 text-slate-700',
    primary:   'bg-primary-50 text-primary-700 border border-primary-200',
    success:   'bg-emerald-50 text-emerald-700 border border-emerald-200',
    warning:   'bg-amber-50 text-amber-700 border border-amber-200',
    error:     'bg-red-50 text-red-700 border border-red-200',
    info:      'bg-blue-50 text-blue-700 border border-blue-200',
    confirmed: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    cancelled: 'bg-red-50 text-red-600 border border-red-200',
    held:      'bg-amber-50 text-amber-700 border border-amber-200',
  }
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${variants[variant] || variants.default} ${className}`}>
      {children}
    </span>
  )
}
