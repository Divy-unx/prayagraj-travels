import React from 'react'
import { useApp } from '../context/AppContext'

export default function LandingRoutes() {
  const { quickRoute } = useApp()

  const routes = [
    { from: 'Civil Lines', to: 'Naini' },
    { from: 'Chowk', to: 'Kareli' },
    { from: 'Phaphamau', to: 'Jhunsi' },
    { from: 'Allahabad University', to: 'Civil Lines' },
    { from: 'Bamrauli', to: 'Airport' },
    { from: 'Teliyarganj', to: 'Sangam' },
  ]

  const displayNames = {
    'Allahabad University': 'Allahabad Univ',
  }

  return (
    <div className="routes-sec">
      <h2>Popular Routes</h2>
      <div className="routes-grid">
        {routes.map(r => (
          <div
            key={`${r.from}-${r.to}`}
            className="r-chip"
            onClick={() => quickRoute(r.from, r.to)}
          >
            {displayNames[r.from] || r.from}{' '}
            <span style={{ color: '#00B562' }}>→</span>{' '}
            {displayNames[r.to] || r.to}
          </div>
        ))}
      </div>
    </div>
  )
}
