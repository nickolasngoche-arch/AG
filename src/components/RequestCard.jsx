import { formatDate, formatKsh, formatNumber } from '../utils.js'
import ContactBox from './ContactBox.jsx'
import './Cards.css'

export default function RequestCard({ request, onDelete, onClosed }) {
  const r = request
  return (
    <article className={r.is_open ? 'listing listing-request' : 'listing listing-request is-closed'}>
      <header className="listing-head">
        <div>
          <h3>Wanted: {r.product_name}</h3>
          <span className="badge badge-amber">{r.category_display}</span>
          {!r.is_open && <span className="badge badge-muted">Fulfilled</span>}
        </div>
        <div className="price">
          <strong>{r.max_price_per_kg ? formatKsh(r.max_price_per_kg) : 'Negotiable'}</strong>
          <span>{r.max_price_per_kg ? 'max per kg' : 'price'}</span>
        </div>
      </header>

      <dl className="facts">
        <div><dt>Quantity needed</dt><dd>{formatNumber(r.quantity_kg)} kg</dd></div>
        <div><dt>Delivery area</dt><dd>{r.location}, {r.county_display}</dd></div>
        <div><dt>Needed by</dt><dd>{r.needed_by ? formatDate(r.needed_by) : 'Flexible'}</dd></div>
        <div><dt>Posted</dt><dd>{formatDate(r.created_at)}</dd></div>
      </dl>

      {r.description && <p className="description">{r.description}</p>}

      <ContactBox
        label="Buyer"
        person={r.buyer}
        phone={r.phone}
        whatsappText={`Hello ${r.buyer.name}, I can supply the ${r.product_name} you posted on AgriGenius.`}
      />

      {r.is_owner && (
        <footer className="owner-actions">
          {r.is_open && <button className="btn btn-outline btn-sm" onClick={() => onClosed(r)}>Mark as fulfilled</button>}
          <button className="btn btn-danger btn-sm" onClick={() => onDelete(r)}>Delete</button>
        </footer>
      )}
    </article>
  )
}
