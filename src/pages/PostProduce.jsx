import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api, fieldErrors } from '../api/client.js'
import { useAuth } from '../hooks/useAuth.js'
import FormField from '../components/FormField.jsx'
import { CATEGORIES, COMMON_PRODUCE, COUNTIES } from '../constants.js'

const localPhone = (p) => (p?.startsWith('254') ? `0${p.slice(3)}` : (p ?? ''))

export default function PostProduce() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    name: '', category: 'cereals', price_per_kg: '', quantity_kg: '', description: '',
    phone: localPhone(user.phone), county: user.county || 'kisii', location: user.location || '',
  })
  const [error, setError] = useState(null)
  const [saving, setSaving] = useState(false)
  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))
  const fe = fieldErrors(error)
  const general = fe.detail ?? fe.non_field_errors ?? (error && !Object.keys(fe).length ? error.message : null)

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      await api.post('/products/', form)
      navigate('/dashboard?tab=produce')
    } catch (err) {
      setError(err)
      setSaving(false)
    }
  }

  return (
    <div className="container narrow">
      <div className="form-card">
        <h1>Post your produce</h1>
        <p className="muted">Buyers will see these details together with your name and phone number.</p>
        {general && <div className="alert alert-error">{general}</div>}

        <form onSubmit={handleSubmit} className="form-grid">
          <FormField label="Product name" htmlFor="name" error={fe.name}>
            <input id="name" list="produce-list" required maxLength={100} value={form.name} onChange={set('name')} placeholder="e.g. Maize" />
            <datalist id="produce-list">{COMMON_PRODUCE.map((p) => <option key={p} value={p} />)}</datalist>
          </FormField>
          <FormField label="Category" htmlFor="category" error={fe.category}>
            <select id="category" value={form.category} onChange={set('category')}>
              {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </FormField>
          <FormField label="Price per kg (KSh)" htmlFor="price" error={fe.price_per_kg}>
            <input id="price" type="number" min="0.01" step="0.01" required value={form.price_per_kg} onChange={set('price_per_kg')} />
          </FormField>
          <FormField label="Quantity available (kg)" htmlFor="qty" error={fe.quantity_kg}>
            <input id="qty" type="number" min="0.01" step="0.01" required value={form.quantity_kg} onChange={set('quantity_kg')} />
          </FormField>
          <FormField label="County" htmlFor="county" error={fe.county}>
            <select id="county" value={form.county} onChange={set('county')}>
              {COUNTIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </FormField>
          <FormField label="Town / village" htmlFor="location" error={fe.location}>
            <input id="location" required maxLength={120} value={form.location} onChange={set('location')} placeholder="e.g. Nyamache" />
          </FormField>
          <FormField label="Contact phone" htmlFor="phone" error={fe.phone} hint="Safaricom or Airtel, e.g. 0712345678">
            <input id="phone" type="tel" required value={form.phone} onChange={set('phone')} />
          </FormField>
          <div className="span-2">
            <FormField label="Description" htmlFor="description" error={fe.description} hint="Variety, quality, how it is stored, delivery options…">
              <textarea id="description" rows="4" value={form.description} onChange={set('description')} />
            </FormField>
          </div>
          <div className="span-2 form-actions">
            <button type="button" className="btn btn-outline" onClick={() => navigate('/dashboard')}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Posting…' : 'Post produce'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}
