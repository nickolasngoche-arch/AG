import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.js'
import Logo from './Logo.jsx'
import './Navbar.css'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const close = () => setOpen(false)

  async function handleLogout() {
    close()
    await logout()
    navigate('/')
  }

  const linkClass = ({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="brand" onClick={close}>
          <Logo /> <span>AgriGenius</span>
        </Link>

        <button className="nav-toggle" aria-label="Toggle menu" aria-expanded={open} onClick={() => setOpen(!open)}>
          <span /><span /><span />
        </button>

        <nav className={open ? 'nav-links open' : 'nav-links'}>
          <NavLink to="/" end className={linkClass} onClick={close}>Home</NavLink>
          {user && <NavLink to="/dashboard" className={linkClass} onClick={close}>Dashboard</NavLink>}
          {user?.role === 'farmer' && <NavLink to="/post-produce" className={linkClass} onClick={close}>Post produce</NavLink>}
          {user?.role === 'buyer' && <NavLink to="/post-request" className={linkClass} onClick={close}>Post request</NavLink>}
          <NavLink to="/about" className={linkClass} onClick={close}>About</NavLink>

          <div className="nav-auth">
            {user ? (
              <>
                <span className="nav-user">{user.full_name.split(' ')[0]} <small>({user.role})</small></span>
                <button className="btn btn-outline btn-sm" onClick={handleLogout}>Log out</button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn btn-outline btn-sm" onClick={close}>Log in</Link>
                <Link to="/signup" className="btn btn-primary btn-sm" onClick={close}>Sign up</Link>
              </>
            )}
          </div>
        </nav>
      </div>
    </header>
  )
}
