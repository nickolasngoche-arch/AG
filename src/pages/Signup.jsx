import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { fieldErrors } from '../api/client.js'
import { useAuth } from '../hooks/useAuth.js'
import FormField from '../components/FormField.jsx'
import Logo from '../components/Logo.jsx'
import { COUNTIES } from '../constants.js'

const ROLES = [
  { value: 'farmer', title: 'I am a farmer', text: 'Sell my produce and see what buyers need' },
  { value: 'buyer', title: 'I am a buyer', text: 'Find produce and advertise what I want to buy' },
]

export default function Signup() {
  const { user, signup } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    role: 'farmer', full_name: '', email: '', phone: '', county: 'kisii', location: '', password: '', confirm: '',
  })
  const [error, setError] = useState(null)
  const [mismatch, setMismatch] = useState(false)
  const [saving, setSaving] = useState(false)
  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))
  const fe = fieldErrors(error)
  const general = fe.detail ?? fe.non_field_errors ?? (error && !Object.keys(fe).length ? error.message : null)

  if (user) return <Navigate to="/dashboard" replace />

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    if (form.password !== form.confirm) {
      setMismatch(true)
      return
    }
    setMismatch(false)
    setSaving(true)
    try {
      const { confirm, ...payload } = form // eslint-disable-line no-unused-vars
      await signup(payload)
      navigate('/dashboard', { replace: true })
    } catch (err) {
      setError(err)
      setSaving(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="form-card auth-card wide">
        <div className="auth-logo"><Logo size={44} /></div>
        <h1>Create your account</h1>
        <p className="muted">Join farmers and buyers across Nyanza.</p>
        {general && <div className="alert alert-error">{general}</div>}

        <form onSubmit={handleSubmit} className="form-grid">
          <div className="span-2 role-picker" role="radiogroup" aria-label="Account type">
            {ROLES.map((r) => (
              <label key={r.value} className={form.role === r.value ? 'role-option selected' : 'role-option'}>
                <input type="radio" name="role" value={r.value} checked={form.role === r.value} onChange={set('role')} />
                <strong>{r.title}</strong>
                <span>{r.text}</span>
              </label>
            ))}
          </div>

          <FormField label="Full name" htmlFor="full_name" error={fe.full_name}>
            <input id="full_name" autoComplete="name" required maxLength={120} value={form.full_name} onChange={set('full_name')} />
          </FormField>
          <FormField label="Email" htmlFor="email" error={fe.email}>
            <input id="email" type="email" autoComplete="email" required value={form.email} onChange={set('email')} />
          </FormField>
          <FormField label="Phone number" htmlFor="phone" error={fe.phone} hint="e.g. 0712345678">
            <input id="phone" type="tel" autoComplete="tel" required value={form.phone} onChange={set('phone')} />
          </FormField>
          <FormField label="County" htmlFor="county" error={fe.county}>
            <select id="county" value={form.county} onChange={set('county')}>
              {COUNTIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </FormField>
          <div className="span-2">
            <FormField label="Town / village" htmlFor="location" error={fe.location}>
              <input id="location" maxLength={120} value={form.location} onChange={set('location')} />
            </FormField>
          </div>
          <FormField label="Password" htmlFor="password" error={fe.password} hint="At least 8 characters, not too common">
            <input id="password" type="password" autoComplete="new-password" required minLength={8} value={form.password} onChange={set('password')} />
          </FormField>
          <FormField label="Confirm password" htmlFor="confirm" error={mismatch ? 'Passwords do not match.' : null}>
            <input id="confirm" type="password" autoComplete="new-password" required value={form.confirm} onChange={set('confirm')} />
          </FormField>

          <div className="span-2">
            <button type="submit" className="btn btn-primary btn-block" disabled={saving}>{saving ? 'Creating account…' : 'Sign up'}</button>
          </div>
        </form>
        <p className="auth-switch">Already registered? <Link to="/login">Log in</Link></p>
      </div>
    </div>
  )
}
