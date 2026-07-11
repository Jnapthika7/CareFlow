import { useState } from 'react'

export default function AuthForm({ onSubmit, mode }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('user')

  const handleSubmit = (event) => {
    event.preventDefault()
    onSubmit({ email, password, name: mode === 'register' ? name : undefined, role })
  }

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      <h2>{mode === 'login' ? 'Login' : 'Register'}</h2>
      {mode === 'login' && role === 'admin' && (
        <div className="admin-warning">
          <strong>Restricted mode:</strong> Admin access requires the administrator credentials.
        </div>
      )}
      {mode === 'register' && (
        <label>
          Full Name
          <input
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
            placeholder="Your name"
          />
        </label>
      )}
      <label>
        Email
        <input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
          placeholder="your@email.com"
        />
      </label>
      <label>
        Password
        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
          placeholder="Password"
        />
      </label>
      <label>
        Role
        <select value={role} onChange={(event) => setRole(event.target.value)}>
          <option value="user">User</option>
          {mode === 'login' && <option value="admin">Admin</option>}
        </select>
      </label>
      <button type="submit" className="primary-button">
        {mode === 'login' ? 'Login' : 'Register'}
      </button>
    </form>
  )
}
