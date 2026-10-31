import React, { useState } from 'react'
import BusCard from './BusCard'

export default function OperatorGroup({ op, buses, initialExpanded }) {
  const [expanded, setExpanded] = useState(initialExpanded)

  const minFare = Math.min(...buses.map(b => b.fare))
  const totalSeats = buses.reduce((a, b) => a + b.capacity, 0)

  const toggle = () => setExpanded(prev => !prev)

  return (
    <div className="op-group">
      <div className="op-hdr" onClick={toggle}>
        <div className="op-logo" style={{ background: op.col }}>
          {op.n.slice(0, 2).toUpperCase()}
        </div>
        <div className="op-info">
          <div className="op-name-row">
            {op.n}
            <span className="op-full-txt">{op.fl}</span>
          </div>
          <div className="op-meta-row">
            <span className="op-star-badge">★ {op.rt}</span>
            <span className="op-reviews">⚡{op.rv}</span>
            <span className="op-buses-count">
              {buses.length} Bus{buses.length > 1 ? 'es' : ''}, {totalSeats} Seats
            </span>
          </div>
        </div>
        <div className="op-right">
          <div className="op-from">
            <span>From</span>
            <strong>₹{minFare}</strong>
          </div>
          <button className="view-buses-btn">
            {expanded ? 'Hide Buses ▴' : 'View Buses ▾'}
          </button>
        </div>
      </div>

      {op.dc && (
        <div className="op-promo-bar">🎫 {op.dc}</div>
      )}

      <div className="buscards">
        {buses.map(b => (
          <BusCard key={b.id} bus={b} show={expanded} />
        ))}
      </div>
    </div>
  )
}
