import { useEffect, useMemo, useState } from 'react'
import AuthForm from './components/AuthForm.jsx'
import Dashboard from './components/Dashboard.jsx'
import CustomerRegistry from './components/CustomerRegistry.jsx'
import Landing from './components/Landing.jsx'
import Toast from './components/Toast.jsx'
import './style.css'

const apiBase = 'http://localhost:5000/api'

function getToken() {
  return localStorage.getItem('registry_token')
}

function saveToken(token) {
  localStorage.setItem('registry_token', token)
}

function clearToken() {
  localStorage.removeItem('registry_token')
  localStorage.removeItem('registry_email')
  localStorage.removeItem('registry_name')
  localStorage.removeItem('registry_role')
}

function getSavedEmail() {
  return localStorage.getItem('registry_email') || ''
}

function getSavedName() {
  return localStorage.getItem('registry_name') || ''
}

function getSavedRole() {
  return localStorage.getItem('registry_role') || 'user'
}

function saveUserProfile(user) {
  localStorage.setItem('registry_email', user.email)
  localStorage.setItem('registry_name', user.name || user.email)
  localStorage.setItem('registry_role', user.role || 'user')
}

export default function App() {
  const [route, setRoute] = useState('landing')
  const [authMode, setAuthMode] = useState('login')
  const [userEmail, setUserEmail] = useState(getSavedEmail())
  const [userName, setUserName] = useState(getSavedName())
  const [userRole, setUserRole] = useState(getSavedRole())
  const [tickets, setTickets] = useState([])
  const [error, setError] = useState('')
  const [infoMessage, setInfoMessage] = useState('')

  const fetchTickets = async (token) => {
    try {
      const response = await fetch(`${apiBase}/customers`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (!response.ok) {
        throw new Error('Could not load support tickets')
      }
      const data = await response.json()
      setTickets(data)
    } catch (err) {
      setError(err.message)
    }
  }

  useEffect(() => {
    const token = getToken()
    if (token) {
      setRoute('home')
      setUserRole(getSavedRole())
      fetchTickets(token)
    }
  }, [])

  useEffect(() => {
    if (!infoMessage) return undefined
    const timeout = setTimeout(() => setInfoMessage(''), 3200)
    return () => clearTimeout(timeout)
  }, [infoMessage])

  const handleAuth = async ({ email, password, name, role }, mode) => {
    setError('')
    setInfoMessage('')
    try {
      const response = await fetch(`${apiBase}/auth/${mode}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name, role })
      })
      const result = await response.json()
      if (!response.ok) {
        throw new Error(result.message || 'Authentication failed')
      }
      saveToken(result.token)
      saveUserProfile(result)
      setUserEmail(result.email)
      setUserName(result.name || result.email)
      setUserRole(result.role || 'user')
      setRoute('home')
      setInfoMessage('Login successful')
      fetchTickets(result.token)
    } catch (err) {
      setError(err.message)
    }
  }

  const handleLogout = () => {
    clearToken()
    setRoute('landing')
    setAuthMode('login')
    setUserEmail('')
    setUserName('')
    setUserRole('user')
    setTickets([])
    setError('')
    setInfoMessage('')
  }

  const handleAddTicket = async (ticket) => {
    setError('')
    setInfoMessage('')
    const token = getToken()
    if (!token) return

    try {
      const response = await fetch(`${apiBase}/customers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(ticket)
      })
      if (!response.ok) {
        const result = await response.json()
        throw new Error(result.message || 'Could not raise support ticket')
      }
      const result = await response.json()
      setTickets((current) => [result.ticket, ...current])
      setError('')
      setInfoMessage(result.emailSent
        ? 'Ticket submitted successfully and email notification sent.'
        : 'Ticket submitted successfully. Email notification was not sent.')
    } catch (err) {
      setInfoMessage('')
      setError(err.message)
    }
  }

  const handleAcceptTicket = async (ticketId) => {
    setError('')
    setInfoMessage('')
    const token = getToken()
    if (!token) return

    try {
      const response = await fetch(`${apiBase}/customers/${ticketId}/accept`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` }
      })
      if (!response.ok) {
        const result = await response.json()
        throw new Error(result.message || 'Could not accept ticket')
      }
      const result = await response.json()
      setTickets((current) => current.map((ticket) => (
        ticket.id === (result.ticket?.id ?? ticketId) ? result.ticket : ticket
      )))
      setError('')
      setInfoMessage(result.emailSent
        ? 'Ticket accepted and email notification sent.'
        : 'Ticket accepted, but email notification failed.')
    } catch (err) {
      setInfoMessage('')
      setError(err.message)
    }
  }

  const handleRejectTicket = async (ticketId) => {
    setError('')
    setInfoMessage('')
    const token = getToken()
    if (!token) return

    try {
      const response = await fetch(`${apiBase}/customers/${ticketId}/reject`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` }
      })
      if (!response.ok) {
        const result = await response.json()
        throw new Error(result.message || 'Could not reject ticket')
      }
      const result = await response.json()
      setTickets((current) => current.map((ticket) => (
        ticket.id === (result.ticket?.id ?? ticketId) ? result.ticket : ticket
      )))
      setError('')
      setInfoMessage(result.emailSent
        ? 'Ticket rejected and email notification sent.'
        : 'Ticket rejected, but email notification failed.')
    } catch (err) {
      setInfoMessage('')
      setError(err.message)
    }
  }

  const handleDeleteTicket = async (ticketId) => {
    setError('')
    setInfoMessage('')
    const token = getToken()
    if (!token) return

    try {
      const response = await fetch(`${apiBase}/customers/${ticketId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      })
      if (!response.ok) {
        const result = await response.json()
        throw new Error(result.message || 'Could not delete ticket')
      }
      const result = await response.json()
      if (result && result.success) {
        setTickets((current) => current.filter((t) => t.id !== result.id))
        setInfoMessage('Ticket deleted')
      }
    } catch (err) {
      setInfoMessage('')
      setError(err.message)
    }
  }

  const userTickets = useMemo(
    () => tickets.filter((ticket) => ticket.submittedBy === userEmail),
    [tickets, userEmail]
  )

  const acceptedCount = useMemo(
    () => (userRole === 'admin'
      ? tickets.filter((ticket) => ticket.status === 'Accepted').length
      : userTickets.filter((ticket) => ticket.status === 'Accepted').length),
    [tickets, userRole, userTickets]
  )

  if (route === 'landing') {
    return (
      <Landing
        onLogin={() => {
          setRoute('auth')
          setAuthMode('login')
          setError('')
        }}
        onSignUp={() => {
          setRoute('auth')
          setAuthMode('register')
          setError('')
        }}
      />
    )
  }

  if (route === 'home') {
    return (
      <div className="page-shell">
        <Toast message={error || infoMessage} type={error ? 'error' : 'info'} />
        <Dashboard
          userName={userName}
          userRole={userRole}
          ticketCount={tickets.length}
          openCount={tickets.filter((ticket) => ticket.status === 'Open').length}
          userTicketCount={userTickets.length}
          acceptedCount={acceptedCount}
          onLogout={handleLogout}
        />
        <CustomerRegistry
          customers={tickets}
          userRole={userRole}
          currentUserEmail={userEmail}
          onAdd={handleAddTicket}
          onAccept={handleAcceptTicket}
          onReject={handleRejectTicket}
          onDelete={handleDeleteTicket}
        />
      </div>
    )
  }

  return (
    <div className="page-shell auth-shell">
      <div className="auth-card">
        <div className="auth-header">
          <h1>Care Flow</h1>
          <p>Login or register as a user or admin from the same portal.</p>
        </div>

        <div className="auth-tabs">
          <button
            type="button"
            className={authMode === 'login' ? 'tab active' : 'tab'}
            onClick={() => { setAuthMode('login'); setError('') }}
          >
            Login
          </button>
          <button
            type="button"
            className={authMode === 'register' ? 'tab active' : 'tab'}
            onClick={() => { setAuthMode('register'); setError('') }}
          >
            Register
          </button>
        </div>

        <AuthForm onSubmit={(form) => handleAuth(form, authMode)} mode={authMode} />

        {error && <p className="error-message">{error}</p>}
      </div>
    </div>
  )
}
