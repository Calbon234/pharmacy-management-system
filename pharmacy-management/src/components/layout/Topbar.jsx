/** Top header: page title, notifications, user menu */
import { useAuth } from '@context/AuthContext'

export default function Topbar() {
  const { user, logout } = useAuth()
  return (
    <header className="topbar">
      <div className="topbar__title">Pharmacy Management System</div>
      <div className="topbar__actions">
        <button className="topbar__notify">🔔</button>
        <span className="topbar__user">{user?.name || 'Admin'}</span>
        <button className="topbar__logout" onClick={logout}>Logout</button>
      </div>
    </header>
  )
}
