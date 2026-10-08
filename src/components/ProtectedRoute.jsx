import { Link, Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.js'
import Loader from './Loader.jsx'

export default function ProtectedRoute({ children, role }) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) return <Loader label="Checking your session…" />
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />
  if (role && user.role !== role) {
    return (
      <div className="container narrow">
        <div className="alert alert-warn">
          Only {role}s can open this page. <Link to="/dashboard">Back to the dashboard</Link>
        </div>
      </div>
    )
  }
  return children
}
