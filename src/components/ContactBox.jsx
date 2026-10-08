import { formatPhone, initials, whatsappLink, formatDate } from '../utils.js'
import './Cards.css'

/** Person details (farmer or buyer) with one-tap call / WhatsApp. */
export default function ContactBox({ label, person, phone, whatsappText }) {
  return (
    <div className="contact-box">
      <div className="avatar" aria-hidden="true">{initials(person.name)}</div>
      <div className="contact-info">
        <span className="contact-label">{label}</span>
        <strong>{person.name}</strong>
        <span className="muted small">Member since {formatDate(person.member_since)}</span>
        <a href={`tel:+${phone}`} className="phone">{formatPhone(phone)}</a>
      </div>
      <div className="contact-actions">
        <a className="btn btn-outline btn-sm" href={`tel:+${phone}`}>Call</a>
        <a className="btn btn-primary btn-sm" href={whatsappLink(phone, whatsappText)} target="_blank" rel="noreferrer">WhatsApp</a>
      </div>
    </div>
  )
}
