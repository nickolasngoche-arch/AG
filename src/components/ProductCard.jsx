import { formatDate, formatKsh, formatNumber } from '../utils.js'
import ContactBox from './ContactBox.jsx'
import './Cards.css'

export default function ProductCard({ product, onDelete, onSold }) {
  const p = product
  return (
    <article className={p.is_available ? 'listing' : 'listing is-closed'}>
      <header className="listing-head">
        <div>
          <h3>{p.name}</h3>
          <span className="badge">{p.category_display}</span>
          {!p.is_available && <span className="badge badge-muted">Sold</span>}
        </div>
        <div className="price">
          <strong>{formatKsh(p.price_per_kg)}</strong>
          <span>per kg</span>
        </div>
      </header>

      <dl className="facts">
        <div><dt>Quantity</dt><dd>{formatNumber(p.quantity_kg)} kg</dd></div>
        <div><dt>Location</dt><dd>{p.location}, {p.county_display}</dd></div>
        <div><dt>Posted</dt><dd>{formatDate(p.created_at)}</dd></div>
        <div><dt>Total value</dt><dd>{formatKsh(p.price_per_kg * p.quantity_kg)}</dd></div>
      </dl>

      {p.description && <p className="description">{p.description}</p>}

      <ContactBox
        label="Farmer"
        person={p.farmer}
        phone={p.phone}
        whatsappText={`Hello ${p.farmer.name}, I saw your ${p.name} listing on AgriGenius.`}
      />

      {p.is_owner && (
        <footer className="owner-actions">
          {p.is_available && <button className="btn btn-outline btn-sm" onClick={() => onSold(p)}>Mark as sold</button>}
          <button className="btn btn-danger btn-sm" onClick={() => onDelete(p)}>Delete</button>
        </footer>
      )}
    </article>
  )
}
