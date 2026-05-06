import React from 'react'
import { useApp } from '../context/AppContext'

export default function FilterPanel() {
  const {
    activeTypes, setActiveTypes,
    activeTimes, setActiveTimes,
    maxPrice, setMaxPrice,
  } = useApp()

  const toggleType = (type) => {
    setActiveTypes(prev =>
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    )
  }

  const toggleTime = (time) => {
    setActiveTimes(prev =>
      prev.includes(time) ? prev.filter(t => t !== time) : [...prev, time]
    )
  }

  const clearAll = () => {
    setActiveTypes([])
    setActiveTimes([])
    setMaxPrice(300)
  }

  const sliderStyle = {
    background: `linear-gradient(to right, var(--red) 0%, var(--red) ${((maxPrice - 10) / 290) * 100}%, var(--border) ${((maxPrice - 10) / 290) * 100}%)`
  }

  return (
    <aside className="fpanel">
      <div className="fcard">
        <div className="fhdr">
          <h3>Filters</h3>
          <button className="clr-btn" onClick={clearAll}>Clear All</button>
        </div>
        <div className="fbody">
          <div className="fsec">Bus Type</div>
          <div className="bt-grid">
            <button
              className={`bt-chip${activeTypes.includes('ac') ? ' on' : ''}`}
              onClick={() => toggleType('ac')}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="3" y="10" width="18" height="10" rx="2"/>
                <path d="M7 10V7a5 5 0 0110 0v3"/>
                <path d="M10 14h4"/>
              </svg>
              AC
            </button>
            <button
              className={`bt-chip${activeTypes.includes('seater') ? ' on' : ''}`}
              onClick={() => toggleType('seater')}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M20 9v11a2 2 0 01-2 2H6a2 2 0 01-2-2V9M9 22V12h6v10"/>
                <path d="M3 9l9-7 9 7"/>
              </svg>
              Seater
            </button>
            <button
              className={`bt-chip${activeTypes.includes('nonac') ? ' on' : ''}`}
              onClick={() => toggleType('nonac')}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="3" y="8" width="18" height="10" rx="2"/>
                <path d="M7 8V6a5 5 0 0110 0v2"/>
              </svg>
              Non AC
            </button>
            <button
              className={`bt-chip${activeTypes.includes('sleeper') ? ' on' : ''}`}
              onClick={() => toggleType('sleeper')}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M3 12h18M3 18h18M3 6h18"/>
              </svg>
              Sleeper
            </button>
          </div>

          <div className="fsec">Price Range</div>
          <input
            type="range"
            className="pr-slider"
            min="10"
            max="300"
            value={maxPrice}
            style={sliderStyle}
            onChange={e => setMaxPrice(parseInt(e.target.value))}
          />
          <div className="pr-lbls">
            <span>₹10</span>
            <span>₹{maxPrice}</span>
          </div>

          <div className="fsec" style={{ marginTop: '14px' }}>Departure Time</div>
          <div className="dt-grid">
            <button
              className={`dt-chip${activeTimes.includes('morning') ? ' on' : ''}`}
              onClick={() => toggleTime('morning')}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="12" cy="12" r="10"/>
                <path d="M12 6v6l4 2"/>
              </svg>
              <span className="dlbl">Before 10 AM</span>
            </button>
            <button
              className={`dt-chip${activeTimes.includes('afternoon') ? ' on' : ''}`}
              onClick={() => toggleTime('afternoon')}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4"/>
              </svg>
              <span className="dlbl">10 AM - 5 PM</span>
            </button>
          </div>
        </div>
      </div>
    </aside>
  )
}
