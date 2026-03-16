import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

  .navbar {
    height: 62px;
    background: #0b0f1a;
    border-bottom: 1px solid #1a2235;
    display: flex;
    align-items: center;
    padding: 0 28px;
    gap: 16px;
    font-family: 'Plus Jakarta Sans', sans-serif;
    position: sticky;
    top: 0;
    z-index: 100;
  }

  .navbar-search-wrap {
    flex: 1;
    max-width: 420px;
    position: relative;
  }

  .navbar-search-icon {
    position: absolute;
    left: 13px;
    top: 50%;
    transform: translateY(-50%);
    font-size: 14px;
    pointer-events: none;
  }

  .navbar-search {
    width: 100%;
    padding: 9px 14px 9px 38px;
    background: #141d2e;
    border: 1px solid #1e2a3a;
    border-radius: 10px;
    font-size: 13px;
    font-family: 'Plus Jakarta Sans', sans-serif;
    color: #8aaac8;
    outline: none;
    transition: all 0.2s;
  }

  .navbar-search::placeholder { color: #2a3a55; }
  .navbar-search:focus { border-color: #00e5c040; background: #1a2538; color: #c0d0e0; }

  .navbar-right {
    margin-left: auto;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .navbar-icon-btn {
    width: 36px; height: 36px;
    background: #141d2e;
    border: 1px solid #1e2a3a;
    border-radius: 9px;
    display: flex; align-items: center; justify-content: center;
    font-size: 16px;
    cursor: pointer;
    transition: all 0.2s;
    position: relative;
  }
  .navbar-icon-btn:hover { background: #1e2a3a; border-color: #2a3a50; }

  .notif-badge {
    position: absolute;
    top: -3px; right: -3px;
    width: 14px; height: 14px;
    background: #ef4444;
    border-radius: 50%;
    font-size: 8px;
    font-weight: 800;
    color: #fff;
    display: flex; align-items: center; justify-content: center;
    border: 2px solid #0b0f1a;
  }

  .navbar-divider {
    width: 1px; height: 24px;
    background: #1e2a3a;
    margin: 0 4px;
  }

  .navbar-user {
    display: flex;
    align-items: center;
    gap: 9px;
    padding: 6px 12px 6px 6px;
    background: #141d2e;
    border: 1px solid #1e2a3a;
    border-radius: 10px;
    cursor: pointer;
    transition: all 0.2s;
  }
  .navbar-user:hover { background: #1e2a3a; }

  .navbar-avatar {
    width: 28px; height: 28px;
    background: linear-gradient(135deg, #00e5c0, #0080ff);
    border-radius: 7px;
    display: flex; align-items: center; justify-content: center;
    font-size: 13px;
    font-weight: 800;
    color: #fff;
    overflow: hidden;
    flex-shrink: 0;
  }

  .navbar-user-name { font-size: 12px; font-weight: 700; color: #8aaac8; }
  .navbar-chevron { font-size: 10px; color: #2a3a55; }
`;

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  return (
    <>
      <style>{styles}</style>
      <nav className="navbar">
        <div className="navbar-search-wrap">
          <span className="navbar-search-icon">🔍</span>
          <input
            className="navbar-search"
            type="search"
            placeholder="Search drugs, patients, prescriptions..."
          />
        </div>

        <div className="navbar-right">
          <button className="navbar-icon-btn" title="Notifications">
            🔔
            <span className="notif-badge">3</span>
          </button>
          <button className="navbar-icon-btn" title="Settings" onClick={() => navigate('/settings')}>
            ⚙️
          </button>

          <div className="navbar-divider" />

          <div className="navbar-user" onClick={() => navigate('/settings')}>
            <div className="navbar-avatar">
              {user?.photo ? (
                <img src={user.photo} alt="Profile" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                (user?.name || "P").charAt(0)
              )}
            </div>
            <span className="navbar-user-name">{user?.name || "Pharmacist"}</span>
            <span className="navbar-chevron">▾</span>
          </div>
        </div>
      </nav>
    </>
  );
}