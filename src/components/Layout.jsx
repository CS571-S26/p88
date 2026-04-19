import { NavLink, Outlet } from 'react-router-dom'
import { useEffect, useState } from 'react'
import '../App.css'
import { FiMoon, FiSun } from 'react-icons/fi'

export default function Layout() {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('lifeos-theme') || 'dark'
  })

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('lifeos-theme', theme)
  }, [theme])

  return (
    <div>
      <nav className="app-nav">
        <NavLink to="/" end className="nav-item">
          Home
        </NavLink>

        <NavLink to="/scheduling" className="nav-item">
          Scheduling
        </NavLink>

        <NavLink to="/execution" className="nav-item">
          Execution
        </NavLink>

        <NavLink to="/metrics" className="nav-item">
          Metrics
        </NavLink>


        <NavLink to="/standup" className="nav-item">
          Standup
        </NavLink>

        <button
          type="button"
          title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          className="nav-item theme-toggle-icon"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        >
          {theme === 'dark' ? <FiSun /> : <FiMoon />}
        </button>
      </nav>

      <main>
        <Outlet />
      </main>
    </div>
  )
}