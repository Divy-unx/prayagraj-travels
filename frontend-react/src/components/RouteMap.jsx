export default function RouteMap({ source, destination, className = '' }) {
  const query = `${encodeURIComponent(source || '')}+to+${encodeURIComponent(destination || '')}`
  const src = `https://www.google.com/maps?q=${query}&output=embed`

  return (
    <div className={`overflow-hidden rounded-2xl border border-slate-200 bg-white ${className}`}>
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Route Map</p>
          <p className="text-sm font-semibold text-slate-900">{source || 'Origin'} → {destination || 'Destination'}</p>
        </div>
        <a
          href={`https://www.google.com/maps/dir/${encodeURIComponent(source || '')}/${encodeURIComponent(destination || '')}`}
          target="_blank"
          rel="noreferrer"
          className="text-xs font-semibold text-primary-600 hover:underline"
        >
          Open Maps
        </a>
      </div>
      <iframe
        title="Route map"
        src={src}
        className="h-72 w-full"
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      />
    </div>
  )
}