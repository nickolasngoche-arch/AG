import { formatDate, formatKsh, formatNumber } from '../utils.js'
import ContactBox from './ContactBox.jsx'
import './Cards.css'

export default function TransportCard({ transport, onDelete, onBooked }) {
    const t = transport
    return (
        <article className={t.is_active ? 'listing listing-transport' : 'listing listing-transport is-closed'}>
            <header className="listing-head">
                <div>
                    <h3>{t.origin_location} → {t.destination_location}</h3>
                    <span className="badge badge-blue">{t.vehicle_type_display}</span>
                    {t.accepts_return_loads && <span className="badge">Return loads OK</span>}
                    {!t.is_active && <span className="badge badge-muted">Booked</span>}
                </div>
                <div className="price">
                    <strong>{t.price_per_trip ? formatKsh(t.price_per_trip) : 'Negotiable'}</strong>
                    <span>per trip</span>
                </div>
            </header>

            <dl className="facts">
                <div><dt>Route</dt><dd>{t.origin_county_display} → {t.destination_county_display}</dd></div>
                <div><dt>Free capacity</dt><dd>{formatNumber(t.capacity_kg)} kg</dd></div>
                <div><dt>Leaves</dt><dd>{formatDate(t.available_date)}</dd></div>
                <div><dt>Posted</dt><dd>{formatDate(t.created_at)}</dd></div>
            </dl>

            {t.description && <p className="description">{t.description}</p>}

            <ContactBox
                label="Transporter"
                person={t.transporter}
                phone={t.phone}
                whatsappText={`Hello ${t.transporter.name}, I saw your ${t.origin_location} → ${t.destination_location} truck availability on AgriGenius.`}
            />

            {t.is_owner && (
                <footer className="owner-actions">
                    {t.is_active && <button className="btn btn-outline btn-sm" onClick={() => onBooked(t)}>Mark as booked</button>}
                    <button className="btn btn-danger btn-sm" onClick={() => onDelete(t)}>Delete</button>
                </footer>
            )}
        </article>
    )
}