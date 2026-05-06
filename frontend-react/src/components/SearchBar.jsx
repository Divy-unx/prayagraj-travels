import React, { useMemo } from 'react'
import { useApp } from '../context/AppContext'
import { STOPS } from '../utils/constants'

function isoToday() { return new Date().toISOString().split('T')[0] }
function isoTomorrow() { const d = new Date(); d.setDate(d.getDate() + 1); return d.toISOString().split('T')[0] }

function formatDate(iso) {
  const d = new Date(iso + 'T00:00:00')
  const dd = String(d.getDate()).padStart(2, '0')
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const yyyy = d.getFullYear()
  return `${dd}/${mm}/${yyyy}`
}

function getDayName(iso) {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  const d = new Date(iso + 'T00:00:00')
  return days[d.getDay()]
}

export default function SearchBar() {
  const { origin, setOrigin, dest, setDest, travelDate, setTravelDate, doSearch, showResults } = useApp()

  const todayIso = isoToday()
  const tomorrowIso = isoTomorrow()
  const isToday = travelDate === todayIso
  const isTomorrow = travelDate === tomorrowIso

  const swapCities = () => {
    const tmp = origin
    setOrigin(dest)
    setDest(tmp)
  }

  const sbarStyle = showResults
    ? { marginTop: '0px', position: 'relative', zIndex: 10 }
    : { marginTop: '-30px', position: 'relative', zIndex: 10 }

  return (
    <div className="sbar" id="mainSearchBar" style={sbarStyle}>
      <div className="sbar-i">
        <div className="sbar-box">
          {/* Origin */}
          <div className="sf">
            <div className="sf-ico">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="10" r="3"/>
                <path d="M12 2a8 8 0 00-8 8c0 5.25 8 14 8 14s8-8.75 8-14a8 8 0 00-8-8z"/>
              </svg>
            </div>
            <div className="sf-wrap">
              <div className="sf-lbl">From</div>
              <div className="sf-val">{origin}</div>
            </div>
            <select value={origin} onChange={e => setOrigin(e.target.value)}>
              {STOPS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          {/* Swap */}
          <div className="swap-zone">
            <button className="sw-btn" onClick={swapCities}>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M7 16V4m0 0L3 8m4-4l4 4M17 8v12m0 0l4-4m-4 4l-4-4"/>
              </svg>
            </button>
          </div>

          {/* Destination */}
          <div className="sf">
            <div className="sf-ico">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
              </svg>
            </div>
            <div className="sf-wrap">
              <div className="sf-lbl">To</div>
              <div className="sf-val">{dest}</div>
            </div>
            <select value={dest} onChange={e => setDest(e.target.value)}>
              {STOPS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          {/* Date */}
          <div className="sf-date">
            <div className="sf-lbl">Departure</div>
            <div className="sf-val">{formatDate(travelDate)}</div>
            <div className="sf-sub">{getDayName(travelDate)}</div>
            <input
              type="date"
              value={travelDate}
              onChange={e => setTravelDate(e.target.value)}
            />
          </div>

          {/* Quick date buttons */}
          <button
            className={`qbtn${isToday ? ' act' : ''}`}
            onClick={() => setTravelDate(todayIso)}
          >
            Today
          </button>
          <button
            className={`qbtn${isTomorrow ? ' act' : ''}`}
            onClick={() => setTravelDate(tomorrowIso)}
          >
            Tomorrow
          </button>

          {/* Search */}
          <button className="srch-btn" onClick={() => doSearch()}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="11" cy="11" r="8"/>
              <path d="m21 21-4.35-4.35"/>
            </svg>
            Search ›
          </button>
        </div>
      </div>
    </div>
  )
}
