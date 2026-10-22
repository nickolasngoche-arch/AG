import { useCallback } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useApi } from '../hooks/useApi.js'
import { useAuth } from '../hooks/useAuth.js'
import ListingsTab from '../components/ListingsTab.jsx'
import MarketPrices from '../components/MarketPrices.jsx'
import MatchesTab from '../components/MatchesTab.jsx'
import ProductCard from '../components/ProductCard.jsx'
import RequestCard from '../components/RequestCard.jsx'
import TransportCard from '../components/TransportCard.jsx'
import { roleMeta } from '../constants.js'
import './Dashboard.css'

const TABS = [
  { id: 'produce', label: 'Farm produce' },
  { id: 'requests', label: 'Buyer requests' },
  { id: 'transports', label: 'Transport' },
  { id: 'matches', label: 'My matches' },
  { id: 'prices', label: 'Market prices' },
]

export default function Dashboard() {
  const { user } = useAuth()
  const meta = roleMeta(user.role)
  const [params, setParams] = useSearchParams()
  const tab = TABS.some((t) => t.id === params.get('tab')) ? params.get('tab') : 'produce'

  const products = useApi('/products/')
  const requests = useApi('/requests/')
  const transports = useApi('/transports/')
  const prices = useApi('/market-prices/', { auth: false })

  const count = (state) => (state.data ? state.data.length : '–')
  const marketCount = prices.data ? new Set(prices.data.map((p) => p.market)).size : '–'

  // Transport cards have two counties; the county filter matches either end of the route.
  const transportFilter = useCallback((t, filters) => {
    const needle = filters.search.trim().toLowerCase()
    const route = `${t.origin_location} ${t.destination_location}`.toLowerCase()
    return (
      (!needle || route.includes(needle)) &&
      (!filters.county || t.origin_county === filters.county || t.destination_county === filters.county)
    )
  }, [])

  return (
    <div className="container">
      <div className="page-header">
        <div>
          <h1>Welcome, {user.full_name.split(' ')[0]}</h1>
          <p className="muted">{meta.description}</p>
        </div>
        <Link className="btn btn-primary" to={meta.postPath}>+ {meta.postLabel}</Link>
      </div>

      <div className="stats">
        <div className="stat"><strong>{count(products)}</strong><span>Produce listings</span></div>
        <div className="stat"><strong>{count(requests)}</strong><span>Buyer requests</span></div>
        <div className="stat"><strong>{count(transports)}</strong><span>Trucks available</span></div>
        <div className="stat"><strong>{marketCount}</strong><span>Nyanza markets tracked</span></div>
      </div>

      <div className="tabs" role="tablist">
        {TABS.map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={tab === t.id}
            className={tab === t.id ? 'tab active' : 'tab'}
            onClick={() => setParams({ tab: t.id })}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'produce' && (
        <ListingsTab
          endpoint="/products/" state={products} onChanged={products.reload}
          nameKey="name" closeField="is_available" posterRole="farmer"
          postPath="/post-produce" postLabel="Post your produce"
          searchPlaceholder="Search produce (e.g. maize)…" mineLabel="Only my listings"
          emptyText="No produce listings match your filters yet."
          renderCard={(item, { onDelete, onClose }) => <ProductCard product={item} onDelete={onDelete} onSold={onClose} />}
        />
      )}
      {tab === 'requests' && (
        <ListingsTab
          endpoint="/requests/" state={requests} onChanged={requests.reload}
          nameKey="product_name" closeField="is_open" posterRole="buyer"
          postPath="/post-request" postLabel="Post a buying request"
          searchPlaceholder="Search what buyers want…" mineLabel="Only my requests"
          emptyText="No buyer requests match your filters yet."
          renderCard={(item, { onDelete, onClose }) => <RequestCard request={item} onDelete={onDelete} onClosed={onClose} />}
        />
      )}
      {tab === 'transports' && (
        <ListingsTab
          endpoint="/transports/" state={transports} onChanged={transports.reload}
          nameKey="route" closeField="is_active" posterRole="transporter"
          postPath="/post-transport" postLabel="Post your availability"
          searchPlaceholder="Search routes (e.g. Eldoret)…" mineLabel="Only my trucks"
          emptyText="No transport availability matches your filters yet."
          customFilter={transportFilter} hideCategory
          renderCard={(item, { onDelete, onClose }) => <TransportCard transport={item} onDelete={onDelete} onBooked={onClose} />}
        />
      )}
      {tab === 'matches' && <MatchesTab />}
      {tab === 'prices' && <MarketPrices state={prices} />}
    </div>
  )
}