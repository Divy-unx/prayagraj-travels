import React from 'react'
import { useApp } from '../context/AppContext'

export default function BusCard({ bus, show }) {
  const { openSeatModal, showToast } = useApp()

  return (
    <div className={`bc${show ? ' show' : ''}`}>
      <div className="bc-inner">
        <div className="bc-l">
          <div className="bc-bus-name">{bus.name}</div>
          <div className="bc-bus-type">{bus.tp}</div>
          <div className="bc-timing">
            <div className="bc-t-blk">
              <div className="bc-t-val">{bus.dep}</div>
              <div className="bc-t-city">{bus.source}</div>
            </div>
            <div className="bc-dur">
              <div className="bc-dur-line"></div>
              <div className="bc-dur-pill">{bus.dur}</div>
            </div>
            <div className="bc-t-blk">
              <div className="bc-t-val">{bus.arr}</div>
              <div className="bc-t-city">{bus.destination}</div>
            </div>
          </div>
          <div className="bc-footer">
            <span className="bc-rating">★ {bus.op.rt}</span>
            <span className="bc-age">🚌 City Bus</span>
          </div>
        </div>
        <div className="bc-r">
          <div className="bc-fare">From <strong>₹{bus.fare}</strong></div>
          <button
            className="sel-seats-btn"
            onClick={() => openSeatModal(bus)}
          >
            Select Seats
          </button>
          <div className="seats-left" style={{ color: 'var(--green)' }}>
            🪑 {bus.capacity} Capacity
          </div>
        </div>
      </div>
    </div>
  )
}
