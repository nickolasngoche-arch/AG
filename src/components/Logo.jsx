export default function Logo({ size = 28 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
      <rect width="64" height="64" rx="14" fill="currentColor" />
      <path d="M46 14C28 14 16 24 16 38c0 3 .6 5.6 1.6 8C20 40 26 34 34 30c-6 5-11 11-13 18 2 1 4.4 1.6 7 1.6C42 49.600 48 34 46 14z" fill="#f0fdf4" />
    </svg>
  )
}
