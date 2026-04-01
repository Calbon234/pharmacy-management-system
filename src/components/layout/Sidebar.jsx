import { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
  .sidebar {
    width: 240px;
    height: 100vh;
    background: #0b0f1a;
    display: flex;
    flex-direction: column;
    padding: 0;
    border-right: 1px solid #1a2235;
    font-family: 'Plus Jakarta Sans', sans-serif;
    flex-shrink: 0;
    position: sticky;
    top: 0;
    overflow: hidden; /* outer container fixed, nav scrolls internally */
  }
  .sidebar-brand {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 24px 20px 20px;
    border-bottom: 1px solid #1a2235;
    margin-bottom: 10px;
    flex-shrink: 0;
  }
  .sidebar-brand-icon {
    width: 36px; height: 36px;
    background: linear-gradient(135deg, #00e5c0, #0080ff);
    border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    font-size: 18px;
    box-shadow: 0 0 16px rgba(0,229,192,0.3);
    flex-shrink: 0;
  }
  .sidebar-brand-name {
    font-size: 17px;
    font-weight: 800;
    color: #fff;
    letter-spacing: -0.4px;
  }
  .sidebar-brand-name span { color: #00e5c0; }
  .sidebar-role-badge {
    margin: 0 16px 12px;
    padding: 6px 12px;
    border-radius: 8px;
    font-size: 11px;
    font-weight: 700;
    text-align: center;
    letter-spacing: 0.5px;
    text-transform: uppercase;
    flex-shrink: 0;
  }
  .sidebar-role-badge.admin {
    background: rgba(99,102,241,0.15);
    color: #818cf8;
    border: 1px solid rgba(99,102,241,0.2);
  }
  .sidebar-role-badge.pharmacist {
    background: rgba(0,229,192,0.1);
    color: #00e5c0;
    border: 1px solid rgba(0,229,192,0.15);
  }
  .sidebar-section-label {
    font-size: 10px;
    font-weight: 700;
    color: #2a3a55;
    text-transform: uppercase;
    letter-spacing: 1.2px;
    padding: 8px 20px 6px;
    flex-shrink: 0;
  }
  .sidebar-section-divider {
    height: 1px;
    background: #1a2235;
    margin: 8px 16px;
    flex-shrink: 0;
  }
  .sidebar-nav {
    display: flex;
    flex-direction: column;
    gap: 2px;
    padding: 0 10px;
    flex: 1;
    min-height: 0; /* critical: allows flex child to shrink and scroll */
    overflow-y: auto;
    overflow-x: hidden;
    scrollbar-width: thin;
    scrollbar-color: #1e2a3a transparent;
  }
  .sidebar-nav::-webkit-scrollbar { width: 4px; }
  .sidebar-nav::-webkit-scrollbar-track { background: transparent; }
  .sidebar-nav::-webkit-scrollbar-thumb { background: #1e2a3a; border-radius: 4px; }
  .nav-link {
    display: flex;
    align-items: center;
    gap: 11px;
    padding: 11px 14px;
    border-radius: 10px;
    font-size: 13px;
    font-weight: 600;
    color: #3a5070;
    text-decoration: none;
    transition: all 0.18s;
    letter-spacing: 0.1px;
    flex-shrink: 0;
  }
  .nav-link:hover {
    background: #141d2e;
    color: #8aaac8;
  }
  .nav-link.active {
    background: linear-gradient(135deg, rgba(0,229,192,0.12), rgba(0,128,255,0.08));
    color: #00e5c0;
    border: 1px solid rgba(0,229,192,0.15);
  }
  .nav-link.admin-active {
    background: linear-gradient(135deg, rgba(99,102,241,0.15), rgba(99,102,241,0.08));
    color: #818cf8;
    border: 1px solid rgba(99,102,241,0.2);
  }
  /* Read-only raincheck links for admin */
  .nav-link.raincheck {
    opacity: 0.7;
  }
  .nav-link.raincheck:hover {
    background: #141d2e;
    color: #8aaac8;
  }
  .raincheck-badge {
    margin-left: auto;
    font-size: 9px;
    font-weight: 700;
    color: #3a5070;
    background: #1a2235;
    padding: 2px 6px;
    border-radius: 4px;
    letter-spacing: 0.5px;
    text-transform: uppercase;
  }
  .nav-link .nav-icon { font-size: 16px; width: 20px; text-align: center; flex-shrink: 0; }
  .sidebar-bottom {
    padding: 14px 10px 20px;
    border-top: 1px solid #1a2235;
    flex-shrink: 0;
  }
  .sidebar-user {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 14px;
    border-radius: 10px;
    background: #141d2e;
    border: 1px solid #1e2a3a;
  }
  .sidebar-avatar {
    width: 32px; height: 32px;
    background: linear-gradient(135deg, #00e5c0, #0080ff);
    border-radius: 8px;
    display: flex; align-items: center; justify-content: center;
    font-size: 14px;
    font-weight: 800;
    color: #fff;
    flex-shrink: 0;
    overflow: hidden;
  }
  .sidebar-user-info { flex: 1; min-width: 0; }
  .sidebar-user-name { font-size: 12px; font-weight: 700; color: #c0d0e0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .sidebar-user-role { font-size: 10px; color: #3a5070; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }
  .sidebar-logout {
    background: none; border: none; cursor: pointer;
    font-size: 14px; color: #3a5070; padding: 4px;
    border-radius: 6px; transition: color 0.2s;
    flex-shrink: 0;
  }
  .sidebar-logout:hover { color: #ef4444; }
`;

// ── PHARMACIST: full operational access ──────────────────────────
const pharmacistLinks = [
  { to: '/dashboard',     icon: '📊', label: 'Dashboard' },
  { to: '/inventory',     icon: '💊', label: 'Inventory' },
  { to: '/prescriptions', icon: '📋', label: 'Prescriptions' },
  { to: '/sales',         icon: '🛒', label: 'Sales / POS' },
  { to: '/sales-history', icon: '🧾', label: 'Sales History' },
  { to: '/patients',      icon: '👤', label: 'Patients' },
  { to: '/suppliers',     icon: '🏭', label: 'Suppliers' },
  { to: '/expired',       icon: '⚠️', label: 'Expiry Alerts' },
  { to: '/reports',       icon: '📈', label: 'Reports' },
];

// ── ADMIN: management + read-only raincheck access ───────────────
const adminManagementLinks = [
  { to: '/admin/dashboard', icon: '📊', label: 'Admin Dashboard' },
  { to: '/admin/users',     icon: '👥', label: 'User Management' },
  { to: '/admin/audit',     icon: '🔍', label: 'Audit Logs' },
];

const adminRaincheckLinks = [
  { to: '/inventory',     icon: '💊', label: 'Inventory' },
  { to: '/sales-history', icon: '🧾', label: 'Sales History' },
  { to: '/expired',       icon: '⚠️', label: 'Expiry Alerts' },
  { to: '/reports',       icon: '📈', label: 'Reports' },
];

export default function Sidebar() {
  const { user, logout } = useContext(AuthContext);
  const isAdmin = user?.role === 'admin';

  return (
    <>
      <style>{styles}</style>
      <aside className="sidebar">

        {/* Brand */}
        <div className="sidebar-brand">
          <div className="sidebar-brand-icon">💊</div>
          <div className="sidebar-brand-name">Pharma<span>Sys</span></div>
        </div>



        {isAdmin ? (
          /* ── ADMIN SIDEBAR ── */
          <nav className="sidebar-nav">
            <div className="sidebar-section-label">Management</div>
            {adminManagementLinks.map(l => (
              <NavLink
                key={l.to}
                to={l.to}
                className={({ isActive }) => isActive ? 'nav-link admin-active' : 'nav-link'}
              >
                <span className="nav-icon">{l.icon}</span>
                {l.label}
              </NavLink>
            ))}

            <div className="sidebar-section-divider" />

            {adminRaincheckLinks.map(l => (
              <NavLink
                key={l.to}
                to={l.to}
                className={({ isActive }) => isActive ? 'nav-link admin-active' : 'nav-link'}
              >
                <span className="nav-icon">{l.icon}</span>
                {l.label}
              </NavLink>
            ))}
          </nav>
        ) : (
          /* ── PHARMACIST SIDEBAR ── */
          <nav className="sidebar-nav">
            <div className="sidebar-section-label">Main Menu</div>
            {pharmacistLinks.map(l => (
              <NavLink
                key={l.to}
                to={l.to}
                className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
              >
                <span className="nav-icon">{l.icon}</span>
                {l.label}
              </NavLink>
            ))}
          </nav>
        )}

        {/* User Profile Bottom */}
        <div className="sidebar-bottom">
          <div className="sidebar-user">
            <div className="sidebar-avatar">
              {user?.photo ? (
                <img src={user.photo} alt="Profile" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                (user?.name || "P").charAt(0)
              )}
            </div>
            <div className="sidebar-user-info">
              <div className="sidebar-user-name">{user?.name || "User"}</div>
              <div className="sidebar-user-role">{user?.role || "pharmacist"}</div>
            </div>
            <button className="sidebar-logout" title="Logout" onClick={logout}>🚪</button>
          </div>
        </div>

      </aside>
    </>
  );
}