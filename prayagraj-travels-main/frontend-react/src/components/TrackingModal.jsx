import React, { useState, useEffect, useRef } from 'react'
import { useApp } from '../context/AppContext'
import { busService } from '../services/api'

export default function TrackingModal() {
  const { trackBusId, closeTrackModal } = useApp()
  const [trackData, setTrackData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)
  const intervalRef = useRef(null)

  const isOpen = trackBusId !== null

  const fetchLocation = async (busId) => {
    try {
      const data = await busService.getLiveLocation(busId)
      if (!data) {
        setError(true)
        setTrackData(null)
        clearInterval(intervalRef.current)
        return
      }
      setTrackData(data)
      setError(false)
    } catch (err) {
      setError(true)
      clearInterval(intervalRef.current)
    }
  }

  useEffect(() => {
    if (trackBusId === null) {
      clearInterval(intervalRef.current)
      setTrackData(null)
      setError(false)
      setLoading(false)
      return
    }

    setLoading(true)
    setError(false)
    setTrackData(null)

    fetchLocation(trackBusId).finally(() => setLoading(false))

    clearInterval(intervalRef.current)
    intervalRef.current = setInterval(() => fetchLocation(trackBusId), 5000)

    return () => clearInterval(intervalRef.current)
  }, [trackBusId])

  const handleClose = () => {
    clearInterval(intervalRef.current)
    closeTrackModal()
  }

  return (
    <div className={`ov${isOpen ? ' open' : ''}`} id="trackOv">
      <div className="sm" style={{ maxWidth: '400px', padding: '20px' }}>
        <div className="sm-hdr" style={{ padding: '0 0 15px 0', border: 'none' }}>
          <div className="sm-hdr-txt">
            <h2 style={{ fontSize: '1.4rem' }}>Live Bus Tracking</h2>
          </div>
          <button className="sm-x" onClick={handleClose}>✕</button>
        </div>

        <div style={{ textAlign: 'center', padding: '10px 0' }}>
          {loading && (
            <>
              <div className="spin" style={{ margin: '20px auto' }}></div>
              <p>Fetching Live Location...</p>
            </>
          )}

          {error && !loading && (
            <p style={{ color: 'var(--red)' }}>Live location not available for this bus yet.</p>
          )}

          {trackData && !loading && (
            <>
              <div style={{
                background: '#EBF5FF',
                border: '1px solid #1A56DB',
                padding: '15px',
                borderRadius: '12px',
                textAlign: 'left'
              }}>
                <h3 style={{ color: '#1A56DB', marginBottom: '10px', fontSize: '1.1rem' }}>
                  {trackData.bus_name || 'Bus'} is {trackData.status}
                </h3>
                <div style={{ fontSize: '0.9rem', lineHeight: '1.6', color: 'var(--txt)' }}>
                  <b>Next Stop:</b> {trackData.next_stop}<br />
                  <b>Speed:</b> {trackData.speed_kmh} km/h<br />
                  <b>Coordinates:</b> {trackData.latitude?.toFixed(4)}, {trackData.longitude?.toFixed(4)}<br />
                  <div style={{ marginTop: '10px', fontSize: '0.75rem', color: 'var(--txt3)' }}>
                    Last updated: {new Date(trackData.last_updated).toLocaleTimeString()}
                  </div>
                </div>
              </div>
              <div style={{
                marginTop: '15px',
                width: '100%',
                height: '120px',
                background: '#f2f2f2',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                overflow: 'hidden'
              }}>
                <div style={{
                  position: 'absolute',
                  width: '100%',
                  height: '100%',
                  background: 'radial-gradient(circle, rgba(26,86,219,0.15) 10%, transparent 11%)',
                  backgroundSize: '20px 20px'
                }}></div>
                <div style={{
                  background: 'var(--green)',
                  color: '#fff',
                  padding: '6px 12px',
                  borderRadius: '99px',
                  fontWeight: 'bold',
                  fontSize: '0.8rem',
                  zIndex: 2,
                  boxShadow: '0 4px 10px rgba(0,181,98,0.4)',
                  animation: 'pulse 2s infinite'
                }}>
                  📍 Live GPS Active
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
