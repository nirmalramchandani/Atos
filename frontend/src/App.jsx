import { BrowserRouter, Routes, Route, NavLink, useNavigate } from 'react-router-dom'
import Home from './pages/Home.jsx'
import HowItWorks from './pages/HowItWorks.jsx'
import LiveDetection from './pages/LiveDetection.jsx'
import DataPrep from './pages/DataPrep.jsx'
import Results from './pages/Results.jsx'

const NAV = [
  { path: '/how',     label: 'How It Works' },
  { path: '/detect',  label: 'Live Detection' },
  { path: '/data',    label: 'Data Prep' },
  { path: '/results', label: 'Results' },
]

function Navbar() {
  const navigate = useNavigate()
  return (
    <nav className="navbar">
      <div className="navbar-logo" onClick={() => navigate('/')}>
        <div className="logo-icon-wrap">🧠</div>
        <span className="logo-text">Log<span>LLM</span></span>
      </div>
      <ul className="navbar-links">
        {NAV.map(({ path, label }) => (
          <li key={path}>
            <NavLink to={path} className={({ isActive }) => isActive ? 'active' : ''}>
              {label}
            </NavLink>
          </li>
        ))}
        <li>
          <NavLink to="/detect" className="nav-cta">Try It Live →</NavLink>
        </li>
      </ul>
    </nav>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <div className="page-wrapper">
        <Routes>
          <Route path="/"        element={<Home />} />
          <Route path="/how"     element={<HowItWorks />} />
          <Route path="/detect"  element={<LiveDetection />} />
          <Route path="/data"    element={<DataPrep />} />
          <Route path="/results" element={<Results />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}
