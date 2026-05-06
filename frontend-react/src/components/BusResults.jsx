import React, { useMemo } from 'react'
import { useApp } from '../context/AppContext'
import OperatorGroup from './OperatorGroup'

export default function BusResults() {
  const { filteredAndSortedBuses, buses, showResults, sortKey, setSortKey } = useApp()

  const isLoading = showResults && buses.length === 0

  const grouped = useMemo(() => {
    const byOp = {}
    filteredAndSortedBuses.forEach(b => {
      if (!byOp[b.op.n]) byOp[b.op.n] = []
      byOp[b.op.n].push(b)
    })
    return Object.entries(byOp)
  }, [filteredAndSortedBuses])

  const handleSort = (key) => {
    setSortKey(key)
  }

  return (
    <>
      {/* Sort Bar */}
      <div className="srt-bar">
        <div className="srt-row">
          <span className="srt-lbl">Sort by</span>
          <div className="srt-opts">
            <button
              className={`srt-o${sortKey === 'price' ? ' act' : ''}`}
              onClick={() => handleSort('price')}
            >
              Price <span>↑</span>
            </button>
            <button
              className={`srt-o${sortKey === 'seats' ? ' act' : ''}`}
              onClick={() => handleSort('seats')}
            >
              Seats <span>↑</span>
            </button>
            <button
              className={`srt-o${sortKey === 'rating' ? ' act' : ''}`}
              onClick={() => handleSort('rating')}
            >
              Ratings <span>↑</span>
            </button>
          </div>
          <span className="srt-showing">
            🚌 Showing <span>{filteredAndSortedBuses.length}</span> Buses on this route
          </span>
        </div>
      </div>

      {/* Loader */}
      {isLoading && (
        <div className="ldr show">
          <div className="spin"></div>
          <p>Searching buses for you…</p>
        </div>
      )}

      {/* Results */}
      {!isLoading && filteredAndSortedBuses.length === 0 && showResults && (
        <div className="no-res">🚌 No buses found for this route.</div>
      )}

      {grouped.map(([opName, opBuses], idx) => (
        <OperatorGroup
          key={opName}
          op={opBuses[0].op}
          buses={opBuses}
          initialExpanded={idx === 0}
        />
      ))}
    </>
  )
}
