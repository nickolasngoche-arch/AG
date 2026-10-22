// Keep these in sync with accounts/constants.py and marketplace/models.py.
export const COUNTIES = [
  { value: 'kisii', label: 'Kisii' },
  { value: 'nyamira', label: 'Nyamira' },
  { value: 'kisumu', label: 'Kisumu' },
  { value: 'siaya', label: 'Siaya' },
  { value: 'homa_bay', label: 'Homa Bay' },
  { value: 'migori', label: 'Migori' },
]

// Nyanza origins + corridor destinations (Kisii--Eldoret lane first).
export const ROUTE_COUNTIES = [
  ...COUNTIES,
  { value: 'uasin_gishu', label: 'Uasin Gishu (Eldoret)' },
  { value: 'kakamega', label: 'Kakamega' },
  { value: 'kericho', label: 'Kericho' },
  { value: 'bomet', label: 'Bomet' },
  { value: 'nakuru', label: 'Nakuru' },
  { value: 'nyandarua', label: 'Nyandarua' },
  { value: 'nairobi', label: 'Nairobi' },
  { value: 'mombasa', label: 'Mombasa' },
]

export const CATEGORIES = [
  { value: 'cereals', label: 'Cereals' },
  { value: 'legumes', label: 'Legumes' },
  { value: 'vegetables', label: 'Vegetables' },
  { value: 'fruits', label: 'Fruits' },
  { value: 'tubers', label: 'Roots & tubers' },
  { value: 'other', label: 'Other' },
]

export const VEHICLE_TYPES = [
  { value: 'pickup', label: 'Pickup / small truck' },
  { value: 'lorry_3t', label: 'Lorry (up to 3 tonnes)' },
  { value: 'lorry_7t', label: 'Lorry (up to 7 tonnes)' },
  { value: 'lorry_10t', label: 'Lorry (10+ tonnes)' },
  { value: 'trailer', label: 'Trailer / large truck' },
  { value: 'boda', label: 'Motorcycle (boda boda)' },
  { value: 'other', label: 'Other vehicle' },
]

export const COMMON_PRODUCE = [
  'Maize', 'Beans', 'Sorghum', 'Finger millet', 'Green grams', 'Tomatoes', 'Onions',
  'Kales (sukuma wiki)', 'Cabbage', 'Bananas', 'Irish potatoes', 'Sweet potatoes', 'Cassava',
]

export const EMPTY_FILTERS = { search: '', county: '', category: '', mine: false }

// Role metadata used across the app (labels, dashboard text, post links).
export const ROLES = [
  {
    value: 'farmer', label: 'Farmer', postPath: '/post-produce', postLabel: 'Post produce',
    description: 'List your produce, see what buyers are looking for, and check market prices before you sell.',
  },
  {
    value: 'buyer', label: 'Buyer', postPath: '/post-request', postLabel: 'Post a buying request',
    description: 'Find produce from farmers, advertise what you want to buy, and compare market prices.',
  },
  {
    value: 'transporter', label: 'Transporter', postPath: '/post-transport', postLabel: 'Post availability',
    description: 'Advertise your routes, departure dates and free cargo space, and get matched with loads at both ends of your corridor.',
  },
]

export const roleMeta = (role) => ROLES.find((r) => r.value === role) ?? ROLES[0]