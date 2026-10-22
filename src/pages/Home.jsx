import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.js'
import './Home.css'

const FEATURES = [
  { icon: '🌽', title: 'Sell your produce', text: 'List what you harvested with price, quantity, photos and location. Buyers contact you directly by call or WhatsApp.' },
  { icon: '🛒', title: 'Advertise what you need', text: 'Buyers post the produce and quantity they want so farmers can come to them.' },
  { icon: '🚚', title: 'Fill empty trucks', text: 'Transporters post routes, departure dates and free cargo space so produce moves at a lower cost on return legs.' },
  { icon: '🎯', title: 'Get matched', text: 'We match farmers, buyers and trucks by crop, county, price and route — and show you exactly why it matched.' },
  { icon: '📈', title: 'Know the market price', text: 'Compare commodity prices across markets in all six Nyanza counties before you sell or buy.' },
]

const STEPS = [
  'Create a free account as a farmer, buyer or transporter',
  'Post your produce, buying request or truck availability',
  'Get matched, connect with the other side and agree the deal',
]
export default function Home() {
  const { user } = useAuth()
  return (
    <>
      <section className="hero">
        <div className="hero-inner">
          <h1>Smarter farming trade<br />across Nyanza</h1>
          <p>AgriGenius connects farmers and buyers and shows you the latest market prices, so you sell and buy at a fair price.</p>
          <div className="hero-actions">
            {user ? (
              <Link to="/dashboard" className="btn btn-light btn-lg">Open dashboard</Link>
            ) : (
              <>
                <Link to="/signup" className="btn btn-light btn-lg">Get started</Link>
                <Link to="/login" className="btn btn-ghost btn-lg">Log in</Link>
              </>
            )}
          </div>
        </div>
      </section>

      <section className="container section">
        <h2 className="section-title">Everything in one place</h2>
        <div className="feature-grid">
          {FEATURES.map((f) => (
            <div key={f.title} className="feature">
              <span className="feature-icon" aria-hidden="true">{f.icon}</span>
              <h3>{f.title}</h3>
              <p>{f.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="steps-band">
        <div className="container">
          <h2 className="section-title">How it works</h2>
          <ol className="steps">
            {STEPS.map((s, i) => <li key={s}><span>{i + 1}</span>{s}</li>)}
          </ol>
        </div>
      </section>
    </>
  )
}
