// Keep these in sync with accounts/constants.py and marketplace/models.py.
export const COUNTIES = [
  { value: 'kisii', label: 'Kisii' },
  { value: 'nyamira', label: 'Nyamira' },
  { value: 'kisumu', label: 'Kisumu' },
  { value: 'siaya', label: 'Siaya' },
  { value: 'homa_bay', label: 'Homa Bay' },
  { value: 'migori', label: 'Migori' },
]

export const CATEGORIES = [
  { value: 'cereals', label: 'Cereals' },
  { value: 'legumes', label: 'Legumes' },
  { value: 'vegetables', label: 'Vegetables' },
  { value: 'fruits', label: 'Fruits' },
  { value: 'tubers', label: 'Roots & tubers' },
  { value: 'other', label: 'Other' },
]

export const COMMON_PRODUCE = [
  'Maize', 'Beans', 'Sorghum', 'Finger millet', 'Green grams', 'Tomatoes', 'Onions',
  'Kales (sukuma wiki)', 'Cabbage', 'Bananas', 'Irish potatoes', 'Sweet potatoes', 'Cassava',
]

export const EMPTY_FILTERS = { search: '', county: '', category: '', mine: false }
