import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api, fieldErrors } from '../api/client.js'
import { useAuth } from '../hooks/useAuth.js'
import FormField from '../components/FormField.jsx'
import { COUNTIES, ROUTE_COUNTIES, VEHICLE_TYPES } from '../constants.js'

const localPhone = (p) => (p?.startsWith('254') ? `0${p.slice(3)}` : (p ?? ''))

export default function PostTransport() {
    const { user } = useAuth()
    const navigate = useNavigate()
    const [today] = useState(() => new Date().toISOString().slice(0, 10))
    const [form, setForm] = useState({
        origin_county: user.county || 'kisii', origin_location: user.location || '',
        destination_county: 'uasin_gishu', destination_location: 'Eldoret',
        vehicle_type: 'lorry_7t', capacity_kg: '', price_per_trip: '',
        available_date: '', accepts_return_loads: true, description: '',
        phone: localPhone(user.phone),
    })
    const [error, setError] = useState(null)
    const [saving, setSaving] = useState(false)
    const set = (key) => (e) =>
        setForm((f) => ({ ...f, [key]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }))
    const fe = fieldErrors(error)
    const general = fe.detail ?? fe.non_field_errors ?? (error && !Object.keys(fe).length ? error.message : null)

    async function handleSubmit(e) {
        e.preventDefault()
        setSaving(true)
        setError(null)
        try {
            await api.post('/transports/', { ...form, price_per_trip: form.price_per_trip || null })
            navigate('/dashboard?tab=transports')
        } catch (err) {
            setError(err)
            setSaving(false)
        }
    }

    return (
        <div className="container narrow">
            <div className="form-card">
                <h1>Post truck availability</h1>
                <p className="muted">
                    Tell farmers and buyers where your truck is going, when it leaves and how much cargo
                    space you have. People with matching loads will contact you directly.
                </p>
                {general && <div className="alert alert-error">{general}</div>}

                <form onSubmit={handleSubmit} className="form-grid">
                    <FormField label="Origin county" htmlFor="origin_county" error={fe.origin_county}>
                        <select id="origin_county" value={form.origin_county} onChange={set('origin_county')}>
                            {COUNTIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                        </select>
                    </FormField>
                    <FormField label="Origin town / stage" htmlFor="origin_location" error={fe.origin_location}>
                        <input id="origin_location" required maxLength={120} value={form.origin_location} placeholder="e.g. Kisii Town" />
                    </FormField>
                    <FormField label="Destination county" htmlFor="destination_county" error={fe.destination_county}>
                        <select id="destination_county" value={form.destination_county} onChange={set('destination_county')}>
                            {ROUTE_COUNTIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                        </select>
                    </FormField>
                    <FormField label="Destination town" htmlFor="destination_location" error={fe.destination_location}>
                        <input id="destination_location" required maxLength={120} value={form.destination_location} onChange={set('destination_location')} placeholder="e.g. Eldoret" />
                    </FormField>
                    <FormField label="Vehicle type" htmlFor="vehicle_type" error={fe.vehicle_type}>
                        <select id="vehicle_type" value={form.vehicle_type} onChange={set('vehicle_type')}>
                            {VEHICLE_TYPES.map((v) => <option key={v.value} value={v.value}>{v.label}</option>)}
                        </select>
                    </FormField>
                    <FormField label="Free cargo capacity (kg)" htmlFor="capacity_kg" error={fe.capacity_kg} hint="e.g. 7000 for a 7-tonne lorry">
                        <input id="capacity_kg" type="number" min="0.01" step="0.01" required value={form.capacity_kg} onChange={set('capacity_kg')} />
                    </FormField>
                    <FormField label="Price per trip (KSh)" htmlFor="price_per_trip" error={fe.price_per_trip} hint="Optional – leave blank if negotiable">
                        <input id="price_per_trip" type="number" min="0.01" step="0.01" value={form.price_per_trip} onChange={set('price_per_trip')} />
                    </FormField>
                    <FormField label="Departure date" htmlFor="available_date" error={fe.available_date}>
                        <input id="available_date" type="date" min={today} required value={form.available_date} onChange={set('available_date')} />
                    </FormField>
                    <FormField label="Contact phone" htmlFor="phone" error={fe.phone} hint="e.g. 0712345678">
                        <input id="phone" type="tel" required value={form.phone} onChange={set('phone')} />
                    </FormField>
                    <div className="span-2 check">
                        <label>
                            <input type="checkbox" checked={form.accepts_return_loads} onChange={set('accepts_return_loads')} />
                            {' '}I can carry cargo on a return / empty leg at a negotiated rate
                        </label>
                    </div>
                    <div className="span-2">
                        <FormField label="Details" htmlFor="description" error={fe.description} hint="Load handling, route stops, documents, payment terms…">
                            <textarea id="description" rows="4" value={form.description} onChange={set('description')} />
                        </FormField>
                    </div>
                    <div className="span-2 form-actions">
                        <button type="button" className="btn btn-outline" onClick={() => navigate('/dashboard')}>Cancel</button>
                        <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Posting…' : 'Post availability'}</button>
                    </div>
                </form>
            </div>
        </div>
    )
}