const YEAR = new Date().getFullYear()

export default function Footer() {
  return (
    <footer className="footer">
      <p>© {YEAR} AgriGenius · Connecting farmers and buyers across Nyanza, Kenya</p>
    </footer>
  )
}
