import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import api from "../../services/api";

export default function AdminDashboard() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/dashboard/index.php')
      .then(res => setStats(res.data.data))
      .catch(() => setStats(null))
      .finally(() => setLoading(false));
  }, []);

  const now = new Date();
  const dateStr = now.toLocaleDateString("en-KE", { weekday: "short", year: "numeric", month: "short", day: "numeric" });

  const S = {
    pg: { padding: "28px 32px", fontFamily: "'Plus Jakarta Sans',sans-serif", background: "#f4f7fb", minHeight: "100vh" },
    card: { background: "#fff", borderRadius: 16, border: "1px solid #e8eef5", boxShadow: "0 1px 6px rgba(0,0,0,0.04)" },
  };

  const kpis = stats ? [
    { icon: "💊", label: "Total Medicines", val: stats.total_medicines, color: "#00e5c0", path: "/inventory" },
    { icon: "👥", label: "Total Patients", val: stats.total_patients, color: "#6366f1", path: "/patients" },
    { icon: "💰", label: "Today's Revenue", val: `KES ${parseFloat(stats.today_sales).toLocaleString()}`, color: "#f59e0b", path: "/sales-history" },
    { icon: "⚠️", label: "Expiry Alerts", val: stats.expiring_soon + stats.expired, color: "#f43f5e", path: "/expired" },
    { icon: "🏭", label: "Active Suppliers", val: stats.total_suppliers, color: "#0080ff", path: "/suppliers" },
    { icon: "📋", label: "Pending RX", val: stats.pending_rx, color: "#10b981", path: "/prescriptions" },
  ] : [];

  return (
    <div style={S.pg}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap'); @keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}`}</style>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 32 }}>
        <div>
          <div style={{ fontSize: 26, fontWeight: 800, color: "#0d1b2a", letterSpacing: "-0.6px" }}>
            🔐 Admin Dashboard
          </div>
          <div style={{ fontSize: 13, color: "#8a9ab5", marginTop: 4 }}>
            Welcome back, <strong style={{ color: "#6366f1" }}>{user?.name}</strong> · {dateStr}
          </div>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={() => navigate("/admin/users")} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "10px 18px", borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", border: "none", background: "linear-gradient(135deg,#6366f1,#4f46e5)", color: "#fff" }}>
            👥 Manage Users
          </button>
          <button onClick={logout} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "10px 18px", borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", border: "1.5px solid #e3eaf2", background: "#fff", color: "#f43f5e" }}>
            🚪 Logout
          </button>
        </div>
      </div>

      {/* Admin badge */}
      <div style={{ background: "linear-gradient(135deg,#6366f1,#4f46e5)", borderRadius: 16, padding: "20px 24px", marginBottom: 24, display: "flex", alignItems: "center", gap: 16 }}>
        <div style={{ fontSize: 40 }}></div>

      </div>

      {/* KPI Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14, marginBottom: 24 }}>
        {loading ? [1,2,3,4,5,6].map(i => (
          <div key={i} style={{ ...S.card, padding: 20 }}>
            <div style={{ height: 80, background: "linear-gradient(90deg,#f0f4f8 25%,#e8eef5 50%,#f0f4f8 75%)", backgroundSize: "200% 100%", animation: "shimmer 1.2s infinite", borderRadius: 8 }} />
          </div>
        )) : kpis.map((k, i) => (
          <div key={i} onClick={() => navigate(k.path)} style={{
            ...S.card, padding: 22, cursor: "pointer", transition: "all 0.2s",
          }}
            onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = `0 8px 24px ${k.color}25`; }}
            onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 1px 6px rgba(0,0,0,0.04)"; }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
              <div style={{ width: 42, height: 42, borderRadius: 12, background: `${k.color}15`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>{k.icon}</div>
              <span style={{ fontSize: 11, color: k.color, fontWeight: 700 }}>View →</span>
            </div>
            <div style={{ fontSize: 28, fontWeight: 800, color: "#0d1b2a", letterSpacing: "-0.8px", marginBottom: 4 }}>{k.val}</div>
            <div style={{ fontSize: 12, color: "#8a9ab5", fontWeight: 600, textTransform: "uppercase" }}>{k.label}</div>
          </div>
        ))}
      </div>

      {/* Quick Links */}
      <div style={{ ...S.card, padding: 24 }}>
        <div style={{ fontSize: 16, fontWeight: 800, color: "#0d1b2a", marginBottom: 18 }}>⚡ Quick Actions</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12 }}>
          {[
            { icon: "👥", label: "User Management", path: "/admin/users", color: "#6366f1" },
            { icon: "📊", label: "View Reports", path: "/reports", color: "#00e5c0" },
            { icon: "💊", label: "Inventory", path: "/inventory", color: "#f59e0b" },
            { icon: "🔍", label: "Audit Logs", path: "/admin/audit", color: "#f43f5e" },
            { icon: "🧾", label: "Sales History", path: "/sales-history", color: "#0080ff" },
            { icon: "👤", label: "Patients", path: "/patients", color: "#10b981" },
            { icon: "🏭", label: "Suppliers", path: "/suppliers", color: "#f97316" },
            { icon: "⚙️", label: "Settings", path: "/settings", color: "#8b5cf6" },
          ].map((a, i) => (
            <button key={i} onClick={() => navigate(a.path)} style={{
              padding: "16px 12px", borderRadius: 12, border: "1px solid #e8eef5",
              background: "#fff", cursor: "pointer", textAlign: "center",
              transition: "all 0.2s", fontFamily: "inherit",
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = a.color; e.currentTarget.style.background = `${a.color}08`; e.currentTarget.style.transform = "translateY(-2px)"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "#e8eef5"; e.currentTarget.style.background = "#fff"; e.currentTarget.style.transform = "translateY(0)"; }}>
              <div style={{ fontSize: 22, marginBottom: 6 }}>{a.icon}</div>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#374151" }}>{a.label}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}