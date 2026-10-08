import { Link, useSearchParams } from 'react-router-dom'
import { useApi } from '../hooks/useApi.js'
import { useAuth } from '../hooks/useAuth.js'
import ListingsTab from '../components/ListingsTab.jsx'
import MarketPrices from '../components/MarketPrices.jsx'
import ProductCard from '../components/ProductCard.jsx'
import RequestCard from '../components/RequestCard.jsx'
import './Dashboard.css'

const TABS = [
  { id: 'produce', label: 'Farm produce' },
  { id: 'requests', label: 'Buyer requests' },
  { id: 'prices', label: 'Market prices' },
]

export default function Dashboard() {
  const { user } = useAuth()
  const [params, setParams] = useSearchParams()
  const tab = TABS.some((t) => t.id === params.get('tab')) ? params.get('tab') : 'produce'

  const products = useApi('/products/')
  const requests = useApi('/requests/')
  const prices = useApi('/market-prices/', { auth: false })

  const count = (state) => (state.data ? state.data.length : '–')
  const marketCount = prices.data ? new Set(prices.data.map((p) => p.market)).size : '–'

  return (
    <div className="container">
      <div className="page-header">
        <div>
          <h1>Welcome, {user.full_name.split(' ')[0]}</h1>
          <p className="muted">
            {user.role === 'farmer'
              ? 'List your produce, see what buyers are looking for, and check market prices before you sell.'
              : 'Find produce from farmers, advertise what you want to buy, and compare market prices.'}
          </p>
        </div>
        {user.role === 'farmer' ? (
          <Link className="btn btn-primary" to="/post-produce">+ Post produce</Link>
        ) : (
          <Link className="btn btn-primary" to="/post-request">+ Post a buying request</Link>
        )}
      </div>

      <div className="stats">
        <div className="stat"><strong>{count(products)}</strong><span>Produce listings</span></div>
        <div className="stat"><strong>{count(requests)}</strong><span>Buyer requests</span></div>
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
      {tab === 'prices' && <MarketPrices state={prices} />}
    </div>
  )
}
