import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api/client.js'
import { useApi } from '../hooks/useApi.js'
import { useAuth } from '../hooks/useAuth.js'
import { filterListings } from '../utils.js'
import Loader from './Loader.jsx'
import Toolbar from './Toolbar.jsx'
import { EMPTY_FILTERS } from '../constants.js'

/**
 * Generic list tab used for farm produce, buyer requests and transport availability.
 * `state` is the shared list fetched by the dashboard; "only my listings"
 * fetches `?mine=1` so closed (sold/fulfilled/booked) items stay visible to their owner.
 * Pass `customFilter(item, filters)` to replace the default search/county/category logic.
 */
export default function ListingsTab({
  endpoint, state, onChanged, nameKey, closeField, posterRole, postPath, postLabel,
  searchPlaceholder, mineLabel, emptyText, renderCard, customFilter, hideCategory,
}) {
  const { user } = useAuth()
  const [filters, setFilters] = useState(EMPTY_FILTERS)
  const [actionError, setActionError] = useState('')
  const mine = useApi(filters.mine ? `${endpoint}?mine=1` : null)
  const active = filters.mine ? mine : state
  const canPost = user.role === posterRole

  const items = useMemo(() => {
    const list = active.data ?? []
    return customFilter
      ? list.filter((item) => customFilter(item, filters))
      : filterListings(list, filters, nameKey)
  }, [active.data, filters, nameKey, customFilter])

  async function run(action) {
    setActionError('')
    try {
      await action()
      onChanged()
      mine.reload()
    } catch (error) {
      setActionError(error.message)
    }
  }
  const remove = (item) => window.confirm('Delete this listing permanently?') && run(() => api.delete(`${endpoint}${item.id}/`))
  const close = (item) => run(() => api.patch(`${endpoint}${item.id}/`, { [closeField]: false }))

  return (
    <section>
      <Toolbar filters={filters} onChange={setFilters} searchPlaceholder={searchPlaceholder} mineLabel={canPost ? mineLabel : null} hideCategory={hideCategory} />
      {actionError && <div className="alert alert-error">{actionError}</div>}

      {active.loading ? (
        <Loader />
      ) : active.error ? (
        <div className="alert alert-error">
          {active.error.message} <button className="link-btn" onClick={active.reload}>Try again</button>
        </div>
      ) : items.length === 0 ? (
        <div className="empty">
          <p>{emptyText}</p>
          {canPost && <Link className="btn btn-primary" to={postPath}>{postLabel}</Link>}
        </div>
      ) : (
        <div className="card-grid">
          {items.map((item) => (
            <div key={item.id}>{renderCard(item, { onDelete: remove, onClose: close })}</div>
          ))}
        </div>
      )}
    </section>
  )
}