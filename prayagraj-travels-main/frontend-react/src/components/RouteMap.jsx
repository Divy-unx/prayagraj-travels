export default function RouteMap({ source, destination, className = '' }) {
  const mapsBaseUrl = import.meta.env.VITE_MAPS_BASE_URL
  const query = `${encodeURIComponent(source || '')}+to+${encodeURIComponent(destination || '')}`
  const mapsUrl = mapsBaseUrl
    ? new URL(mapsBaseUrl)
    : null

  if (mapsUrl) {
    mapsUrl.searchParams.set('q', query)
    mapsUrl.searchParams.set('output', 'embed')
  }

  const directionsUrl = mapsBaseUrl
    ? `${mapsBaseUrl.replace(/\/$/, '')}/dir/${encodeURIComponent(source || '')}/${encodeURIComponent(destination || '')}`
    : null

  return (
    <div className={`overflow-hidden rounded-2xl border border-slate-200 bg-white ${className}`}>
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Route Map</p>
          <p className="text-sm font-semibold text-slate-900">{source || 'Origin'} → {destination || 'Destination'}</p>
        </div>
        <a
          href={directionsUrl || '#'}
          aria-disabled={!directionsUrl}
          target="_blank"
          rel="noreferrer"
          className="text-xs font-semibold text-primary-600 hover:underline"
        >
          Open Maps
        </a>
      </div>
      {mapsUrl ? <iframe
        title="Route map"
        src={mapsUrl.toString()}
        className="h-72 w-full"
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      /> : (
        <div className="flex h-72 items-center justify-center px-6 text-center text-sm text-slate-500">
          Map preview is unavailable. Configure the maps base URL to enable it.
        </div>
      )}
    </div>
  )
}