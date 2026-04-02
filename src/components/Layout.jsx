import { Link, Outlet } from 'react-router-dom'
import '../App.css'

export default function Layout() {
  return (
    <div>
      <nav className="m-3">
        <Link to="/" className="me-3">Home</Link>
        <Link to="/scheduling" className="me-3">Scheduling</Link>
        <Link to="/execution" className="me-3">Execution</Link>
      </nav>

      <main>
        <Outlet />
      </main>
    </div>
  )
}