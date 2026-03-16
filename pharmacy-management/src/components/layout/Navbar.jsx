import { useAuth } from '../../hooks/useAuth';
export default function Navbar() {
  const { user, logout } = useAuth();
  return (
    <nav className="navbar">
      <span className="logo">💊 PharmaSys</span>
      <input type="search" placeholder="Search drugs, patients, prescriptions..." className="nav-search" />
      <div className="nav-right">
        <button className="notif-btn">🔔</button>
        <div className="user-menu">
          <span>{user?.name ?? 'Admin'}</span>
          <button onClick={logout}>Logout</button>
        </div>
      </div>
    </nav>
  );
}
