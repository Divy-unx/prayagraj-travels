export default function Spinner({ size = 'md', color = 'primary' }) {
  const sizes = { sm: 'w-5 h-5 border-2', md: 'w-8 h-8 border-2', lg: 'w-12 h-12 border-3' }
  const colors = { primary: 'border-primary-200 border-t-primary-600', white: 'border-white/30 border-t-white' }
  return (
    <div className={`${sizes[size]} ${colors[color]} rounded-full animate-spin`} />
  )
}
