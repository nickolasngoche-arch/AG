import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api, fieldErrors } from '../api/client.js'
import { useAuth } from '../hooks/useAuth.js'
import FormField from '../components/FormField.jsx'
import { CATEGORIES, COMMON_PRODUCE, COUNTIES } from '../constants.js'

const localPhone = (p) => (p?.startsWith('254') ? `0${p.slice(3)}` : (p ?? ''))

export default function PostRequest() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [today] = useState(() => new Date().toISOString().slice(0, 10))
  const [form, setForm] = useState({
    product_name: '', category: 'cereals', quantity_kg: '', max_price_per_kg: '', needed_by: '',
    description: '', phone: localPhone(user.phone), county: user.county || 'kisii', location: user.location || '',
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
      await api.post('/requests/', {
        ...form,
        max_price_per_kg: form.max_price_per_kg || null,
        needed_by: form.needed_by || null,
      })
      navigate('/dashboard?tab=requests')
    } catch (err) {
      setError(err)
      setSaving(false)
    }
  }

  return (
    <div className="container narrow">
      <div className="form-card">
        <h1>Post a buying request</h1>
        <p className="muted">Tell farmers what you want to buy. Interested farmers will contact you directly.</p>
        {general && <div className="alert alert-error">{general}</div>}

        <form onSubmit={handleSubmit} className="form-grid">
          <FormField label="What do you want to buy?" htmlFor="product_name" error={fe.product_name}>
            <input id="product_name" list="produce-list" required maxLength={100} value={form.product_name} onChange={set('product_name')} placeholder="e.g. Beans" />
            <datalist id="produce-list">{COMMON_PRODUCE.map((p) => <option key={p} value={p} />)}</datalist>
          </FormField>
          <FormField label="Category" htmlFor="category" error={fe.category}>
            <select id="category" value={form.category} onChange={set('category')}>
              {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </FormField>
          <FormField label="Quantity needed (kg)" htmlFor="qty" error={fe.quantity_kg}>
            <input id="qty" type="number" min="0.01" step="0.01" required value={form.quantity_kg} onChange={set('quantity_kg')} />
          </FormField>
          <FormField label="Highest price per kg (KSh)" htmlFor="price" error={fe.max_price_per_kg} hint="Optional – leave blank if negotiable">
            <input id="price" type="number" min="0.01" step="0.01" value={form.max_price_per_kg} onChange={set('max_price_per_kg')} />
          </FormField>
          <FormField label="County" htmlFor="county" error={fe.county}>
            <select id="county" value={form.county} onChange={set('county')}>
              {COUNTIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </FormField>
          <FormField label="Town / delivery point" htmlFor="location" error={fe.location}>
            <input id="location" required maxLength={120} value={form.location} onChange={set('location')} />
          </FormField>
          <FormField label="Contact phone" htmlFor="phone" error={fe.phone} hint="e.g. 0712345678">
            <input id="phone" type="tel" required value={form.phone} onChange={set('phone')} />
          </FormField>
          <FormField label="Needed by" htmlFor="needed_by" error={fe.needed_by} hint="Optional">
            <input id="needed_by" type="date" min={today} value={form.needed_by} onChange={set('needed_by')} />
          </FormField>
          <div className="span-2">
            <FormField label="Details" htmlFor="description" error={fe.description} hint="Quality needed, packaging, payment terms…">
              <textarea id="description" rows="4" value={form.description} onChange={set('description')} />
            </FormField>
          </div>
          <div className="span-2 form-actions">
            <button type="button" className="btn btn-outline" onClick={() => navigate('/dashboard')}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Posting…' : 'Post request'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}
