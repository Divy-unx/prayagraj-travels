import React from 'react'
import { useApp } from '../context/AppContext'

export default function Toast() {
  const { toast } = useApp()

  return (
    <div className={`toast${toast.visible ? ' show' : ''}`} id="toast">
      <div className="t-ico">{toast.ico}</div>
      <div className="t-body">
        <h4>{toast.h}</h4>
        <p>{toast.p}</p>
      </div>
    </div>
  )
}
