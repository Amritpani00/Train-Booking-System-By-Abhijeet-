import { Routes, Route, Navigate, Link, useNavigate } from 'react-router-dom'
import { useEffect, useState, type ReactElement } from 'react'
import './App.css'
import axios from 'axios'

const API_BASE = 'http://localhost:8090/api'

function Protected({ children }: { children: ReactElement }) {
  const token = localStorage.getItem('token')
  if (!token) return <Navigate to="/login" replace />
  return children
}

function AdminOnly({ children }: { children: ReactElement }) {
  const role = localStorage.getItem('role')
  if (role !== 'ADMIN') return <Navigate to="/search" replace />
  return children
}

function Register() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [message, setMessage] = useState('')
  const navigate = useNavigate()

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage('')
    try {
      const res = await axios.post(`${API_BASE}/auth/register`, { email, password, fullName })
      if (res.data?.success) {
        setMessage('Registered! Please login.')
        setTimeout(() => navigate('/login'), 800)
      } else {
        setMessage(res.data?.message || 'Registration failed')
      }
    } catch (err: any) {
      setMessage(err.response?.data?.message || 'Registration error')
    }
  }
  return (
    <div className="container">
      <h2>Create account</h2>
      <form onSubmit={submit} className="form">
        <input placeholder="Full name" value={fullName} onChange={e => setFullName(e.target.value)} required />
        <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
        <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
        <button type="submit">Register</button>
      </form>
      {message && <p>{message}</p>}
      <p>Already have an account? <Link to="/login">Login</Link></p>
    </div>
  )
}

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const navigate = useNavigate()

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage('')
    try {
      const res = await axios.post(`${API_BASE}/auth/login`, { email, password })
      if (res.data?.success) {
        const token: string = res.data.data
        const payload = JSON.parse(atob(token.split('.')[1]))
        localStorage.setItem('token', token)
        if (payload.role) localStorage.setItem('role', payload.role)
        if (payload.name) localStorage.setItem('name', payload.name)
        navigate('/search')
      } else {
        setMessage(res.data?.message || 'Login failed')
      }
    } catch (err: any) {
      setMessage(err.response?.data?.message || 'Login error')
    }
  }

  return (
    <div className="container">
      <h2>Login</h2>
      <form onSubmit={submit} className="form">
        <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
        <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
        <button type="submit">Login</button>
      </form>
      {message && <p>{message}</p>}
      <p>New user? <Link to="/register">Create an account</Link></p>
    </div>
  )
}

function Navbar() {
  const [name, setName] = useState<string | null>(() => localStorage.getItem('name'))
  const role = localStorage.getItem('role')
  const navigate = useNavigate()
  useEffect(() => {
    const onStorage = () => setName(localStorage.getItem('name'))
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])
  const logout = () => { localStorage.clear(); navigate('/login') }
  return (
    <nav className="navbar">
      <Link to="/search">Search</Link>
      <Link to="/trains">Trains</Link>
      <Link to="/bookings">My Bookings</Link>
      {role === 'ADMIN' && (
        <>
          <Link to="/admin/stations">Stations</Link>
          <Link to="/admin/trains">Admin Trains</Link>
          <Link to="/admin/routes">Routes</Link>
        </>
      )}
      <div style={{ marginLeft: 'auto' }}>
        {name ? (<>
          <span style={{ marginRight: 12 }}>Hello, {name}</span>
          <button onClick={logout}>Logout</button>
        </>) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}
      </div>
    </nav>
  )
}

function Search() {
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [date, setDate] = useState('')
  const [routes, setRoutes] = useState<any[]>([])

  const search = async () => {
    const token = localStorage.getItem('token')
    const res = await axios.get(`${API_BASE}/search/routes`, { params: { from, to, date }, headers: { Authorization: `Bearer ${token}` } })
    setRoutes(res.data.data || [])
  }

  return (
    <div className="container">
      <h2>Find Trains</h2>
      <div className="form">
        <input placeholder="From station code" value={from} onChange={e => setFrom(e.target.value)} />
        <input placeholder="To station code" value={to} onChange={e => setTo(e.target.value)} />
        <input type="date" value={date} onChange={e => setDate(e.target.value)} />
        <button onClick={search}>Search</button>
      </div>
      <ul className="list">
        {routes.map((r) => (
          <li key={r.id} className="card">
            <div>
              <div><b>{r.train?.name}</b> ({r.train?.code})</div>
              <div>{r.fromStation?.code} → {r.toStation?.code}</div>
              <div>Departs: {r.departureTime} | Arrives: {r.arrivalTime}</div>
              <div>Fare: {r.baseFare}</div>
            </div>
            <Link to={`/book/${r.id}`}>Book</Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

function BookRoute() {
  const [seats, setSeats] = useState(1)
  const [farePerSeat, setFare] = useState(0)
  const [msg, setMsg] = useState('')
  const navigate = useNavigate()
  const routeId = location.pathname.split('/').pop()

  const book = async () => {
    const token = localStorage.getItem('token')
    try {
      const res = await axios.post(`${API_BASE}/bookings`, { routeId: Number(routeId), seats, farePerSeat }, { headers: { Authorization: `Bearer ${token}` } })
      if (res.data?.success) {
        setMsg('Booking confirmed!')
        setTimeout(() => navigate('/bookings'), 800)
      } else setMsg(res.data?.message || 'Failed')
    } catch (e: any) {
      setMsg(e.response?.data?.message || 'Error')
    }
  }

  return (
    <div className="container">
      <h2>Book Seats</h2>
      <div className="form">
        <input type="number" min={1} value={seats} onChange={e => setSeats(Number(e.target.value))} />
        <input type="number" min={0} value={farePerSeat} onChange={e => setFare(Number(e.target.value))} />
        <button onClick={book}>Pay & Book</button>
      </div>
      {msg && <p>{msg}</p>}
    </div>
  )
}

function Trains() {
  const [items, setItems] = useState<any[]>([])
  useEffect(() => {
    (async () => {
      const token = localStorage.getItem('token')
      const res = await axios.get(`${API_BASE}/trains`, { headers: { Authorization: `Bearer ${token}` } })
      setItems(res.data.data || [])
    })()
  }, [])
  return (
    <div className="container">
      <h2>Trains</h2>
      <ul className="list">
        {items.map((t) => (
          <li key={t.id} className="card">
            <div><b>{t.name}</b> ({t.code})</div>
            <div>Total seats: {t.totalSeats}</div>
          </li>
        ))}
      </ul>
    </div>
  )
}

function Bookings() {
  const [items, setItems] = useState<any[]>([])
  useEffect(() => {
    (async () => {
      const token = localStorage.getItem('token')
      const res = await axios.get(`${API_BASE}/bookings`, { headers: { Authorization: `Bearer ${token}` } })
      setItems(res.data.data || [])
    })()
  }, [])
  return (
    <div className="container">
      <h2>My Bookings</h2>
      <ul className="list">
        {items.map((b) => (
          <li key={b.id} className="card">
            <div>Route #{b.route?.id} | Seats: {b.seats} | Paid: {b.amountPaid}</div>
          </li>
        ))}
      </ul>
    </div>
  )
}

function AdminStations() {
  const [items, setItems] = useState<any[]>([])
  const [code, setCode] = useState('')
  const [name, setName] = useState('')
  const token = localStorage.getItem('token')
  const load = async () => {
    const res = await axios.get(`${API_BASE}/admin/stations`, { headers: { Authorization: `Bearer ${token}` } })
    setItems(res.data.data || [])
  }
  useEffect(() => { load() }, [])
  const add = async () => { await axios.post(`${API_BASE}/admin/stations`, { code, name }, { headers: { Authorization: `Bearer ${token}` } }); setCode(''); setName(''); load() }
  const del = async (id: number) => { await axios.delete(`${API_BASE}/admin/stations/${id}`, { headers: { Authorization: `Bearer ${token}` } }); load() }
  return (
    <div className="container">
      <h2>Stations</h2>
      <div className="form">
        <input placeholder="Code" value={code} onChange={e => setCode(e.target.value)} />
        <input placeholder="Name" value={name} onChange={e => setName(e.target.value)} />
        <button onClick={add}>Add Station</button>
      </div>
      <ul className="list">
        {items.map((s) => (
          <li key={s.id} className="card">
            <div>{s.code} - {s.name}</div>
            <button onClick={() => del(s.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  )
}

function AdminTrains() {
  const [items, setItems] = useState<any[]>([])
  const [code, setCode] = useState('')
  const [name, setName] = useState('')
  const [totalSeats, setSeats] = useState(0)
  const token = localStorage.getItem('token')
  const load = async () => { const res = await axios.get(`${API_BASE}/trains`, { headers: { Authorization: `Bearer ${token}` } }); setItems(res.data.data || []) }
  useEffect(() => { load() }, [])
  const add = async () => { await axios.post(`${API_BASE}/admin/trains`, { code, name, totalSeats }, { headers: { Authorization: `Bearer ${token}` } }); setCode(''); setName(''); setSeats(0); load() }
  return (
    <div className="container">
      <h2>Admin Trains</h2>
      <div className="form">
        <input placeholder="Code" value={code} onChange={e => setCode(e.target.value)} />
        <input placeholder="Name" value={name} onChange={e => setName(e.target.value)} />
        <input type="number" placeholder="Seats" value={totalSeats} onChange={e => setSeats(Number(e.target.value))} />
        <button onClick={add}>Add Train</button>
      </div>
      <ul className="list">
        {items.map((t) => (
          <li key={t.id} className="card">
            <div><b>{t.name}</b> ({t.code}) - seats: {t.totalSeats}</div>
          </li>
        ))}
      </ul>
    </div>
  )
}

function AdminRoutes() {
  const [items, setItems] = useState<any[]>([])
  const [trainId, setTrainId] = useState<number>(0)
  const [fromStationId, setFromId] = useState<number>(0)
  const [toStationId, setToId] = useState<number>(0)
  const [departureTime, setDep] = useState('')
  const [arrivalTime, setArr] = useState('')
  const [baseFare, setFare] = useState<number>(0)
  const token = localStorage.getItem('token')
  const load = async () => { const res = await axios.get(`${API_BASE}/admin/routes`, { headers: { Authorization: `Bearer ${token}` } }); setItems(res.data.data || []) }
  useEffect(() => { load() }, [])
  const add = async () => {
    await axios.post(`${API_BASE}/admin/routes`, { trainId, fromStationId, toStationId, departureTime, arrivalTime, baseFare }, { headers: { Authorization: `Bearer ${token}` } })
    setTrainId(0); setFromId(0); setToId(0); setDep(''); setArr(''); setFare(0); load()
  }
  const del = async (id: number) => { await axios.delete(`${API_BASE}/admin/routes/${id}`, { headers: { Authorization: `Bearer ${token}` } }); load() }
  return (
    <div className="container">
      <h2>Routes</h2>
      <div className="form" style={{ gridTemplateColumns: 'repeat(6, 1fr)' }}>
        <input type="number" placeholder="Train ID" value={trainId || ''} onChange={e => setTrainId(Number(e.target.value))} />
        <input type="number" placeholder="From Station ID" value={fromStationId || ''} onChange={e => setFromId(Number(e.target.value))} />
        <input type="number" placeholder="To Station ID" value={toStationId || ''} onChange={e => setToId(Number(e.target.value))} />
        <input type="datetime-local" placeholder="Departure" value={departureTime} onChange={e => setDep(e.target.value)} />
        <input type="datetime-local" placeholder="Arrival" value={arrivalTime} onChange={e => setArr(e.target.value)} />
        <input type="number" placeholder="Fare" value={baseFare || ''} onChange={e => setFare(Number(e.target.value))} />
        <button onClick={add}>Add Route</button>
      </div>
      <ul className="list">
        {items.map((r) => (
          <li key={r.id} className="card">
            <div>Train {r.train?.id} | {r.fromStation?.code} → {r.toStation?.code} | {r.departureTime} → {r.arrivalTime} | {r.baseFare}
            </div>
            <button onClick={() => del(r.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Navigate to="/search" replace />}/>
        <Route path="/register" element={<Register />}/>
        <Route path="/login" element={<Login />}/>
        <Route path="/search" element={<Protected><Search /></Protected>} />
        <Route path="/book/:id" element={<Protected><BookRoute /></Protected>} />
        <Route path="/trains" element={<Protected><Trains /></Protected>} />
        <Route path="/bookings" element={<Protected><Bookings /></Protected>} />
        <Route path="/admin/stations" element={<Protected><AdminOnly><AdminStations/></AdminOnly></Protected>} />
        <Route path="/admin/trains" element={<Protected><AdminOnly><AdminTrains/></AdminOnly></Protected>} />
        <Route path="/admin/routes" element={<Protected><AdminOnly><AdminRoutes/></AdminOnly></Protected>} />
        <Route path="*" element={<div className="container"><h2>Not found</h2></div>} />
      </Routes>
    </>
  )
}
