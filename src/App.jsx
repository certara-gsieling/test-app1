import React from 'react'
import { connect } from 'react-redux'
import { Routes, Route, NavLink } from 'react-router-dom'
import { CertaraPageHeader } from '@certara/certara-ui-react'
import { increment } from './store'
import './App.css';
import { CertaraButton } from '@certara/certara-ui-react';

class Home extends React.Component {
  constructor(props) {
    super(props)
    this.state = { me: null, claims: null }
  }

  async componentDidMount() {
    try {
      const res = await fetch('/api/me', { credentials: 'include' })
      const json = await res.json()
      let claims = null
      if (json && json.token && typeof json.token === 'string' && json.token.split('.').length >= 2) {
        try {
          const payload = json.token.split('.')[1]
          const b64 = payload.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(payload.length / 4) * 4, '=')
          claims = JSON.parse(atob(b64))
        } catch {
          claims = null
        }
      }
      this.setState({ me: json, claims })
    } catch (e) {
      this.setState({ me: null, claims: null })
    }
  }

  render() {
    const { value, increment: inc } = this.props
    const { me, claims } = this.state
    return (
      <div style={{ fontFamily: 'system-ui, sans-serif' }}>
        <CertaraPageHeader headline="Hello World" eyebrow="React + Vite + Redux Toolkit" />
        {me && me.loggedIn ? (
          <div style={{ marginBottom: 12 }}>
            <strong>Logged in as:</strong> {me.email || (claims && (claims.email || claims.preferred_username || claims.sub))}
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
        <div style={{ display: 'flex', gap: 8 }}>
            <CertaraButton color="brand" onClick={() => inc()}>>
              Increment
            </CertaraButton>
            <CertaraButton color="brand" disabled>
              Save
            </CertaraButton>
        </div>
      </div>
    )
  }
}

const mapStateToProps = state => ({ value: state.counter.value })
const mapDispatchToProps = { increment }
const ConnectedHome = connect(mapStateToProps, mapDispatchToProps)(Home)

function Page({ title }) {
  return (
    <div style={{ fontFamily: 'system-ui, sans-serif' }}>
      <h1 style={{ marginTop: 0 }}>{title}</h1>
      <p>Placeholder content for {title.toLowerCase()}.</p>
    </div>
  )
}

export default function App() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', minHeight: '100vh' }}>
      <aside style={{ borderRight: '1px solid #e5e7eb', padding: 16 }}>
        <div style={{ fontWeight: 700, marginBottom: 16 }}>Navigation</div>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <NavLink to="/" end style={({ isActive }) => ({ color: isActive ? '#111827' : '#374151', textDecoration: 'none' })}>Home</NavLink>
          <NavLink to="/page-1" style={({ isActive }) => ({ color: isActive ? '#111827' : '#374151', textDecoration: 'none' })}>Page 1</NavLink>
          <NavLink to="/page-2" style={({ isActive }) => ({ color: isActive ? '#111827' : '#374151', textDecoration: 'none' })}>Page 2</NavLink>
          <NavLink to="/page-3" style={({ isActive }) => ({ color: isActive ? '#111827' : '#374151', textDecoration: 'none' })}>Page 3</NavLink>
        </nav>
      </aside>
      <main style={{ padding: 24 }}>
        <Routes>
          <Route path="/" element={<ConnectedHome />} />
          <Route path="/page-1" element={<Page title="Page 1" />} />
          <Route path="/page-2" element={<Page title="Page 2" />} />
          <Route path="/page-3" element={<Page title="Page 3" />} />
        </Routes>
      </main>
    </div>
  )
}


