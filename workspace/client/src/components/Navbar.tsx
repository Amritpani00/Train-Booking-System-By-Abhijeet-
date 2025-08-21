import { Link, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'

export default function Navbar() {
  const [name, setName] = useState<string | null>(() => localStorage.getItem('name'))
  const [role, setRole] = useState<string | null>(() => localStorage.getItem('role'))
  const navigate = useNavigate()

  useEffect(() => {
    const onAuth = () => { setName(localStorage.getItem('name')); setRole(localStorage.getItem('role')) }
    window.addEventListener('auth', onAuth as EventListener)
    return () => window.removeEventListener('auth', onAuth as EventListener)
  }, [])

  const logout = () => {
    localStorage.clear()
    window.dispatchEvent(new Event('auth'))
    navigate('/login')
  }

  return (
    <header className="site-header">
      <div className="nav-inner">
        <div className="brand" onClick={() => navigate('/search')}>TrainBooking</div>
        <nav className="nav-links">
          <Link to="/search">Search</Link>
          <Link to="/trains">Trains</Link>
          <Link to="/bookings">My Bookings</Link>
          {role === 'ADMIN' && (
            <div className="dropdown">
              <button className="btn ghost">Admin ▾</button>
              <div className="dropdown-menu">
                <Link to="/admin/stations">Stations</Link>
                <Link to="/admin/trains">Trains</Link>
                <Link to="/admin/routes">Routes</Link>
              </div>
            </div>
          )}
        </nav>
        <div className="nav-actions">
          {name ? (
            <>
              <span className="user-chip">Hi, {name}</span>
              <button className="btn" onClick={logout}>Logout</button>
            </>
          ) : (
            <>
              <Link className="btn ghost" to="/login">Login</Link>
              <Link className="btn" to="/register">Register</Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}

