import { useMemo, useState } from 'react'
import { COUNTIES } from '../constants.js'
import { formatDate, formatKsh } from '../utils.js'
import Loader from './Loader.jsx'
import './MarketPrices.css'

export default function MarketPrices({ state }) {
  const [county, setCounty] = useState('')
  const [commodity, setCommodity] = useState('')
  const rows = state.data

  const commodities = useMemo(() => [...new Set((rows ?? []).map((r) => r.commodity))].sort(), [rows])

  const filtered = useMemo(
    () =>
      (rows ?? [])
        .filter((r) => (!county || r.county === county) && (!commodity || r.commodity === commodity))
        .sort((a, b) => a.commodity.localeCompare(b.commodity) || b.price_per_kg - a.price_per_kg),
    [rows, county, commodity],
  )

  if (state.loading) return <Loader label="Loading market prices…" />
  if (state.error) {
    return (
      <div className="alert alert-error">
        {state.error.message} <button className="link-btn" onClick={state.reload}>Try again</button>
      </div>
    )
  }

  const isSample = rows.some((r) => r.source === 'Sample data')
  const lastUpdated = rows.reduce((latest, r) => (r.updated_on > latest ? r.updated_on : latest), '')
  const prices = filtered.map((r) => r.price_per_kg)
  const best = commodity && filtered.length ? filtered[0] : null
  const cheapest = commodity && filtered.length ? filtered[filtered.length - 1] : null
  const average = prices.length ? prices.reduce((s, p) => s + p, 0) / prices.length : 0

  return (
    <section>
      {isSample && (
        <div className="alert alert-warn">
          These are <strong>sample prices</strong> for demonstration. Administrators should replace them with
          real market prices in the Django admin (Market prices).
        </div>
      )}

      <div className="toolbar">
        <select value={commodity} onChange={(e) => setCommodity(e.target.value)} aria-label="Commodity">
          <option value="">All commodities</option>
          {commodities.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <select value={county} onChange={(e) => setCounty(e.target.value)} aria-label="County">
          <option value="">All Nyanza counties</option>
          {COUNTIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
        </select>
        {lastUpdated && <span className="muted small toolbar-note">Last updated {formatDate(lastUpdated)}</span>}
      </div>

      {best && (
        <div className="price-summary">
          <div className="summary-card good">
            <span>Best market to sell</span>
            <strong>{formatKsh(best.price_per_kg)}<small>/{best.unit}</small></strong>
            <em>{best.market}, {best.county_display}</em>
          </div>
          <div className="summary-card">
            <span>Average price</span>
            <strong>{formatKsh(average.toFixed(0))}<small>/{best.unit}</small></strong>
            <em>across {filtered.length} market{filtered.length === 1 ? '' : 's'}</em>
          </div>
          <div className="summary-card low">
            <span>Cheapest market to buy</span>
            <strong>{formatKsh(cheapest.price_per_kg)}<small>/{cheapest.unit}</small></strong>
            <em>{cheapest.market}, {cheapest.county_display}</em>
          </div>
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="empty"><p>No prices match your selection.</p></div>
      ) : (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr><th>Commodity</th><th>Market</th><th>County</th><th className="num">Price</th><th>Updated</th></tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.id}>
                  <td><strong>{r.commodity}</strong> <span className="badge">{r.category_display}</span></td>
                  <td>{r.market}</td>
                  <td>{r.county_display}</td>
                  <td className="num">{formatKsh(r.price_per_kg)} <span className="muted small">/ {r.unit}</span></td>
                  <td className="muted">{formatDate(r.updated_on)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}
