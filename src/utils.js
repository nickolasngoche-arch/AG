export const formatKsh = (n) => `KSh ${Number(n).toLocaleString('en-KE', { maximumFractionDigits: 2 })}`
export const formatNumber = (n) => Number(n).toLocaleString('en-KE', { maximumFractionDigits: 2 })

// "254712345678" -> "0712 345 678"
export function formatPhone(phone) {
  const local = phone?.startsWith('254') ? `0${phone.slice(3)}` : (phone ?? '')
  return local.replace(/^(\d{4})(\d{3})(\d{3})$/, '$1 $2 $3')
}

export const whatsappLink = (phone, text) =>
  `https://wa.me/${phone}${text ? `?text=${encodeURIComponent(text)}` : ''}`

export const formatDate = (iso) =>
  iso ? new Date(iso).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' }) : ''

export const initials = (name = '') =>
  name.split(' ').filter(Boolean).slice(0, 2).map((p) => p[0].toUpperCase()).join('') || '?'

/** Client-side search/county/category filtering for listing tabs. */
export function filterListings(items, { search, county, category }, nameKey) {
  const needle = search.trim().toLowerCase()
  return items.filter(
    (item) =>
      (!needle || item[nameKey].toLowerCase().includes(needle)) &&
      (!county || item.county === county) &&
      (!category || item.category === category),
  )
}
