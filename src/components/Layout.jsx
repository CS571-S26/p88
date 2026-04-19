import { NavLink, Outlet } from 'react-router-dom'
import '../App.css'

export default function Layout() {
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

        <NavLink to="/standup" className="nav-item">
          Standup
        </NavLink>
      </nav>

      <main>
        <Outlet />
      </main>
    </div>
  )
}