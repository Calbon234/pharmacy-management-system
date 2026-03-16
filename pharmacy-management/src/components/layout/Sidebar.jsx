/** Navigation sidebar with links and active state */
import { NavLink } from 'react-router-dom'

const NAV_ITEMS = [
  { to: '/dashboard',     label: 'Dashboard',      icon: '📊' },
  { to: '/inventory',     label: 'Inventory',       icon: '💊' },
  { to: '/prescriptions', label: 'Prescriptions',   icon: '📋' },
  { to: '/patients',      label: 'Patients',        icon: '🧑‍⚕️' },
  { to: '/billing',       label: 'Billing / POS',   icon: '🧾' },
  { to: '/reports',       label: 'Reports',         icon: '📈' },
  { to: '/settings',      label: 'Settings',        icon: '⚙️' },
]

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar__brand">💊 PharmaCare</div>
      <nav className="sidebar__nav">
        {NAV_ITEMS.map(item => (
          <NavLink key={item.to} to={item.to} className={({ isActive }) =>
            `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`}>
            <span className="sidebar__icon">{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
