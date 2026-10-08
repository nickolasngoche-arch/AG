import { CATEGORIES, COUNTIES } from '../constants.js'



export default function Toolbar({ filters, onChange, searchPlaceholder, mineLabel }) {
  const set = (key) => (e) => onChange({ ...filters, [key]: e.target.type === 'checkbox' ? e.target.checked : e.target.value })
  return (
    <div className="toolbar">
      <input type="search" placeholder={searchPlaceholder} value={filters.search} onChange={set('search')} aria-label="Search" />
      <select value={filters.county} onChange={set('county')} aria-label="Filter by county">
        <option value="">All counties</option>
        {COUNTIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
      </select>
      <select value={filters.category} onChange={set('category')} aria-label="Filter by category">
        <option value="">All categories</option>
        {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
      </select>
      {mineLabel && (
        <label className="check">
          <input type="checkbox" checked={filters.mine} onChange={set('mine')} /> {mineLabel}
        </label>
      )}
    </div>
  )
}
