import { useMemo } from 'react'
import { useApi } from '../hooks/useApi.js'
import Loader from './Loader.jsx'
import ProductCard from './ProductCard.jsx'
import RequestCard from './RequestCard.jsx'
import TransportCard from './TransportCard.jsx'

const AGAINST_LABELS = { product: 'Your produce', request: 'Your request', transport: 'Your route' }

function MatchCard({ match }) {
    const listing = match.listing
    if (match.kind === 'product') return <ProductCard product={listing} />
    if (match.kind === 'request') return <RequestCard request={listing} />
    return <TransportCard transport={listing} />
}

export default function MatchesTab() {
    const matches = useApi('/matches/')

    // Group matches by the user's own listing they relate to.
    const groups = useMemo(() => {
        const map = new Map()
        for (const m of matches.data?.matches ?? []) {
            const key = `${m.against.kind}-${m.against.id}`
            if (!map.has(key)) map.set(key, { against: m.against, matches: [] })
            map.get(key).matches.push(m)
        }
        return [...map.values()]
    }, [matches.data])

    return (
        <section>
            <p className="muted">
                These matches are generated from your own listings, your county, your prices and the
                routes you drive. The reasons under each card explain why it matched.
            </p>
            {matches.loading ? (
                <Loader />
            ) : matches.error ? (
                <div className="alert alert-error">
                    {matches.error.message} <button className="link-btn" onClick={matches.reload}>Try again</button>
                </div>
            ) : groups.length === 0 ? (
                <div className="empty">
                    <p>No matches yet. Post a listing and check back — matches update automatically as new listings appear.</p>
                </div>
            ) : (
                groups.map((g) => (
                    <div key={`${g.against.kind}-${g.against.id}`} className="match-group">
                        <h3 className="match-group-title">{AGAINST_LABELS[g.against.kind]}: {g.against.label}</h3>
                        <div className="card-grid">
                            {g.matches.map((m) => (
                                <div key={m.key} className="match-wrap">
                                    <MatchCard match={m} />
                                    <ul className="match-reasons">
                                        {m.reasons.map((r) => <li key={r}>{r}</li>)}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    </div>
                ))
            )}
        </section>
    )
}