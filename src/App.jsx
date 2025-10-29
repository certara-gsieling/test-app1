import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { increment } from './store'

export default function App() {
  const value = useSelector(state => state.counter.value)
  const dispatch = useDispatch()
  const [me, setMe] = useState(null)
  const [claims, setClaims] = useState(null)

  useEffect(() => {
    async function loadMe() {
      try {
        const res = await fetch('/api/me', { credentials: 'include' })
        const json = await res.json()
        setMe(json)
        if (json && json.token && typeof json.token === 'string' && json.token.split('.').length >= 2) {
          try {
            const payload = json.token.split('.')[1]
            const b64 = payload.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(payload.length / 4) * 4, '=')
            const decoded = JSON.parse(atob(b64))
            setClaims(decoded)
          } catch {
            setClaims(null)
          }
        } else {
          setClaims(null)
        }
      } catch (e) {
        setMe(null)
        setClaims(null)
      }
    }
    loadMe()
  }, [])
  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', padding: 16 }}>
      <h1>Hello World (React + Vite + Redux Toolkit)</h1>
      {me?.loggedIn ? (
        <div style={{ marginBottom: 12 }}>
          <strong>Logged in as:</strong> {me.email || claims?.email || claims?.preferred_username || claims?.sub}
          {claims ? (
            <>
              <summary>JWT claims</summary>
              <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>{JSON.stringify(claims, null, 2)}</pre>
            </>
          ) : null}
        </div>
      ) : (
        <div style={{ marginBottom: 12 }}>
          <em>Not logged in.</em>
        </div>
      )}
      <p>Counter: {value}</p>
      <button onClick={() => dispatch(increment())}>Increment</button>
    </div>
  )
}


