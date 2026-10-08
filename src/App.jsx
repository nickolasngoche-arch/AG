import { Navigate, Route, Routes } from 'react-router-dom'
import Navbar from './components/Navbar.jsx'
import Footer from './components/Footer.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import Home from './pages/Home.jsx'
import About from './pages/About.jsx'
import Login from './pages/Login.jsx'
import Signup from './pages/Signup.jsx'
import Dashboard from './pages/Dashboard.jsx'
import PostProduce from './pages/PostProduce.jsx'
import PostRequest from './pages/PostRequest.jsx'
import NotFound from './pages/NotFound.jsx'

export default function App() {
  return (
    <div className="app-shell">
      <Navbar />
      <main className="app-main">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/post-produce" element={<ProtectedRoute role="farmer"><PostProduce /></ProtectedRoute>} />
          <Route path="/post-request" element={<ProtectedRoute role="buyer"><PostRequest /></ProtectedRoute>} />
          <Route path="/upload" element={<Navigate to="/post-produce" replace />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}
