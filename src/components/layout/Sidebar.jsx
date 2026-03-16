import { NavLink } from 'react-router-dom';

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

  .sidebar {
    width: 240px;
    min-height: 100vh;
    background: #0b0f1a;
    display: flex;
    flex-direction: column;
    padding: 0;
    border-right: 1px solid #1a2235;
    font-family: 'Plus Jakarta Sans', sans-serif;
    flex-shrink: 0;
  }

  .sidebar-brand {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 24px 20px 20px;
    border-bottom: 1px solid #1a2235;
    margin-bottom: 10px;
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

  .sidebar-section-label {
    font-size: 10px;
    font-weight: 700;
    color: #2a3a55;
    text-transform: uppercase;
    letter-spacing: 1.2px;
    padding: 8px 20px 6px;
  }

  .sidebar-nav {
    display: flex;
    flex-direction: column;
    gap: 2px;
    padding: 0 10px;
    flex: 1;
  }

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

  .nav-link .nav-icon { font-size: 16px; width: 20px; text-align: center; flex-shrink: 0; }

  .sidebar-divider {
    height: 1px;
    background: #1a2235;
    margin: 12px 20px;
  }

  .sidebar-bottom {
    padding: 14px 10px 20px;
    border-top: 1px solid #1a2235;
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
    flex-shrink: 0;
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

const links = [
  { to: '/dashboard', icon: '📊', label: 'Dashboard' },
  { to: '/inventory', icon: '💊', label: 'Inventory' },
  { to: '/prescriptions', icon: '📋', label: 'Prescriptions' },
  { to: '/sales', icon: '🛒', label: 'Sales / POS' },
  { to: '/sales-history', icon: '🧾', label: 'Sales History' },
  { to: '/patients', icon: '👤', label: 'Patients' },
  { to: '/suppliers', icon: '🏭', label: 'Suppliers' },
  { to: '/expired', icon: '⚠️', label: 'Expiry Alerts' },
  { to: '/reports', icon: '📈', label: 'Reports' },
  { to: '/settings', icon: '⚙️', label: 'Settings' },
];

export default function Sidebar() {
  return (
    <>
      <style>{styles}</style>
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="sidebar-brand-icon">💊</div>
          <div className="sidebar-brand-name">Pharma<span>Sys</span></div>
        </div>

        <div className="sidebar-section-label">Main Menu</div>

        <nav className="sidebar-nav">
          {links.map(l => (
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

        <div className="sidebar-bottom">
          <div className="sidebar-user">
            <div className="sidebar-avatar">👩‍⚕️</div>
            <div className="sidebar-user-info">
              <div className="sidebar-user-name">Pharmacist</div>
              <div className="sidebar-user-role">Licensed</div>
            </div>
            <button className="sidebar-logout" title="Logout">🚪</button>
          </div>
        </div>
      </aside>
    </>
  );
}