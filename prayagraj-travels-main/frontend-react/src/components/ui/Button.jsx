import Spinner from './Spinner'

export default function Button({ children, variant = 'primary', size = 'md', loading, className = '', ...props }) {
  const base = 'inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed'
  const variants = {
    primary: 'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500 shadow-btn active:scale-95',
    secondary: 'bg-accent-500 text-white hover:bg-accent-600 focus:ring-accent-500 shadow-sm active:scale-95',
    outline: 'border-2 border-primary-600 text-primary-600 hover:bg-primary-50 focus:ring-primary-500',
    ghost: 'text-slate-600 hover:bg-slate-100 focus:ring-slate-300',
    white: 'bg-white text-primary-700 hover:bg-primary-50 focus:ring-primary-300 shadow-sm',
    danger: 'bg-red-500 text-white hover:bg-red-600 focus:ring-red-400 active:scale-95',
  }
  const sizes = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-7 py-3.5 text-base',
    xl: 'px-8 py-4 text-lg',
  }
  return (
    <button
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading && <Spinner size="sm" color={variant === 'outline' || variant === 'ghost' ? 'primary' : 'white'} />}
      {children}
    </button>
  )
}
