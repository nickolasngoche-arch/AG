import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.js'
import FormField from '../components/FormField.jsx'
import Logo from '../components/Logo.jsx'

export default function Login() {
  const { user, login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  if (user) return <Navigate to="/dashboard" replace />

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      await login(email, password)
      navigate(location.state?.from ?? '/dashboard', { replace: true })
    } catch (err) {
      setError(err.message)
      setSaving(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="form-card auth-card">
        <div className="auth-logo"><Logo size={44} /></div>
        <h1>Welcome back</h1>
        <p className="muted">Log in to your AgriGenius account.</p>
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <FormField label="Email" htmlFor="email">
            <input id="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </FormField>
          <FormField label="Password" htmlFor="password">
            <input id="password" type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} />
          </FormField>
          <button type="submit" className="btn btn-primary btn-block" disabled={saving}>{saving ? 'Logging in…' : 'Log in'}</button>
        </form>
        <p className="auth-switch">New to AgriGenius? <Link to="/signup">Create an account</Link></p>
      </div>
    </div>
  )
}
