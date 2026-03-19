import { useState, useEffect } from "react";
import api from "../services/api";

export default function ExpiredMedicines() {
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("all");
  const [search, setSearch] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get("/medicines/index.php");
      setMedicines(res.data.data || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const today = new Date();

  const getDaysLeft = (expiry) => {
    if (!expiry) return null;
    return Math.ceil((new Date(expiry) - today) / (1000 * 60 * 60 * 24));
  };

  const getStatus = (days) => {
    if (days === null) return null;
    if (days < 0) return "expired";
    if (days <= 30) return "expiring";
    return "ok";
  };

  const allMeds = medicines.map(m => ({
    ...m,
    daysLeft: getDaysLeft(m.expiry_date),
    status: getStatus(getDaysLeft(m.expiry_date))
  }));

  const expiredCount  = allMeds.filter(m => m.status === "expired").length;
  const expiringCount = allMeds.filter(m => m.status === "expiring").length;
  const safeCount     = allMeds.filter(m => m.status === "ok").length;

  const filtered = allMeds
    .filter(m => {
      if (tab === "expired") return m.status === "expired";
      if (tab === "expiring") return m.status === "expiring";
      if (tab === "safe") return m.status === "ok";
      return m.status === "expired" || m.status === "expiring";
    })
    .filter(m => m.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => a.daysLeft - b.daysLeft);

  const S = {
    pg: { padding: "28px 32px", fontFamily: "'Plus Jakarta Sans',sans-serif", background: "#f4f7fb", minHeight: "100vh" },
    card: { background: "#fff", borderRadius: 16, border: "1px solid #e8eef5", boxShadow: "0 1px 6px rgba(0,0,0,0.04)" },
    inp: { width: "100%", padding: "10px 13px 10px 36px", borderRadius: 10, fontSize: 13, fontFamily: "inherit", border: "1.5px solid #e3eaf2", outline: "none", color: "#0d1b2a", background: "#fff", boxSizing: "border-box" },
  };

  const kpis = [
    { icon: "🚨", label: "Expired", val: expiredCount, color: "#f43f5e", filter: "expired" },
    { icon: "⚠️", label: "Expiring Soon", val: expiringCount, color: "#f59e0b", filter: "expiring" },
    { icon: "💊", label: "Total Monitored", val: medicines.length, color: "#6366f1", filter: "all" },
    { icon: "✅", label: "Safe Stock", val: safeCount, color: "#00e5c0", filter: "safe" },
  ];

  return (
    <div style={S.pg}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap'); @keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}`}</style>

      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 24 }}>
        <div>
          <div style={{ fontSize: 24, fontWeight: 800, color: "#0d1b2a", letterSpacing: "-0.6px" }}>Expiry Alerts</div>
          <div style={{ fontSize: 13, color: "#8a9ab5", marginTop: 4 }}>Monitor expired and expiring medicines</div>
        </div>
        <button onClick={fetchData} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "9px 16px", borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", border: "1.5px solid #e3eaf2", background: "#fff", color: "#0d1b2a" }}>
          🔄 Refresh
        </button>
      </div>

      {/* KPI Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 20 }}>
        {kpis.map((k, i) => (
          <div key={i}
            onClick={() => setTab(k.filter)}
            style={{
              borderRadius: 16, padding: 20, cursor: "pointer", transition: "all 0.2s",
              background: tab === k.filter ? `${k.color}15` : "#fff",
              border: tab === k.filter ? `1.5px solid ${k.color}` : "1px solid #e8eef5",
              boxShadow: tab === k.filter ? `0 8px 24px ${k.color}30` : "0 1px 6px rgba(0,0,0,0.04)",
              transform: tab === k.filter ? "translateY(-2px)" : "none",
            }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: `${k.color}15`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, marginBottom: 12 }}>{k.icon}</div>
            <div style={{ fontSize: 26, fontWeight: 800, color: "#0d1b2a", letterSpacing: "-0.7px", lineHeight: 1, marginBottom: 4 }}>{loading ? "…" : k.val}</div>
            <div style={{ fontSize: 11, color: "#8a9ab5", fontWeight: 600, textTransform: "uppercase" }}>{k.label}</div>
          </div>
        ))}
      </div>

      {/* Alerts banners */}
      {!loading && expiredCount > 0 && (
        <div style={{ background: "#fee2e2", border: "1px solid #fecaca", borderRadius: 12, padding: "14px 18px", marginBottom: 16, display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 22 }}>🚨</span>
          <div>
            <div style={{ fontSize: 14, fontWeight: 800, color: "#dc2626" }}>{expiredCount} medicine{expiredCount > 1 ? "s have" : " has"} expired!</div>
            <div style={{ fontSize: 12, color: "#b91c1c", marginTop: 2 }}>Remove these from shelves immediately.</div>
          </div>
        </div>
      )}

      {!loading && expiringCount > 0 && (
        <div style={{ background: "#fef3c7", border: "1px solid #fde68a", borderRadius: 12, padding: "14px 18px", marginBottom: 16, display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 22 }}>⚠️</span>
          <div>
            <div style={{ fontSize: 14, fontWeight: 800, color: "#b45309" }}>{expiringCount} medicine{expiringCount > 1 ? "s are" : " is"} expiring within 30 days</div>
            <div style={{ fontSize: 12, color: "#92400e", marginTop: 2 }}>Consider reordering or running promotions to clear stock.</div>
          </div>
        </div>
      )}

      {/* Table */}
      <div style={S.card}>
        <div style={{ display: "flex", gap: 10, padding: "16px 20px", borderBottom: "1px solid #f0f4f8", flexWrap: "wrap", alignItems: "center" }}>
          <div style={{ position: "relative", flex: 1, minWidth: 180 }}>
            <span style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", fontSize: 13 }}>🔍</span>
            <input style={S.inp} placeholder="Search medicines..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          {[
            { key: "all", label: `All Alerts (${expiredCount + expiringCount})` },
            { key: "expired", label: `Expired (${expiredCount})` },
            { key: "expiring", label: `Expiring Soon (${expiringCount})` },
            { key: "safe", label: `Safe (${safeCount})` },
          ].map(t => (
            <button key={t.key} onClick={() => setTab(t.key)} style={{ padding: "9px 14px", borderRadius: 10, border: tab === t.key ? "none" : "1.5px solid #e3eaf2", background: tab === t.key ? "linear-gradient(135deg,#00e5c0,#0080ff)" : "#fff", color: tab === t.key ? "#fff" : "#0d1b2a", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>{t.label}</button>
          ))}
        </div>

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#f8fafc" }}>
                {["Medicine", "Category", "Supplier", "Stock", "Expiry Date", "Days Left", "Status"].map(h => (
                  <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#8a9ab5", textTransform: "uppercase", letterSpacing: "0.6px" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? [1, 2, 3].map(i => (
                <tr key={i}><td colSpan={7} style={{ padding: "12px 16px" }}><div style={{ height: 20, background: "linear-gradient(90deg,#f0f4f8 25%,#e8eef5 50%,#f0f4f8 75%)", backgroundSize: "200% 100%", animation: "shimmer 1.2s infinite", borderRadius: 8 }} /></td></tr>
              )) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: "center", padding: 48, color: "#8a9ab5" }}>
                    <div style={{ fontSize: 36, marginBottom: 12 }}>✅</div>
                    <div style={{ fontSize: 14, fontWeight: 700 }}>No medicines in this category</div>
                  </td>
                </tr>
              ) : filtered.map((m, i) => {
                const isExpired  = m.status === "expired";
                const isExpiring = m.status === "expiring";
                const tagBg    = isExpired ? "#fee2e2" : isExpiring ? "#fef3c7" : "#d1fae5";
                const tagColor = isExpired ? "#dc2626" : isExpiring ? "#b45309" : "#065f46";
                const tagLabel = isExpired ? "Expired" : isExpiring ? "Expiring Soon" : "Safe";
                const daysText = isExpired ? `${Math.abs(m.daysLeft)} days ago` : `${m.daysLeft} days left`;

                return (
                  <tr key={i} style={{ borderTop: "1px solid #f0f4f8", background: isExpired ? "rgba(254,226,226,0.3)" : isExpiring ? "rgba(254,243,199,0.3)" : "transparent" }}
                    onMouseEnter={e => e.currentTarget.style.opacity = "0.85"}
                    onMouseLeave={e => e.currentTarget.style.opacity = "1"}>
                    <td style={{ padding: "13px 16px", fontWeight: 700, color: "#0d1b2a", fontSize: 13 }}>{m.name}</td>
                    <td style={{ padding: "13px 16px", fontSize: 12, color: "#374151" }}>{m.category || "—"}</td>
                    <td style={{ padding: "13px 16px", fontSize: 12, color: "#374151" }}>{m.supplier_name || "—"}</td>
                    <td style={{ padding: "13px 16px", fontSize: 13, fontWeight: 700, color: "#0d1b2a" }}>{m.stock}</td>
                    <td style={{ padding: "13px 16px", fontSize: 13, color: "#374151" }}>{m.expiry_date || "—"}</td>
                    <td style={{ padding: "13px 16px", fontSize: 13, fontWeight: 700, color: isExpired ? "#dc2626" : isExpiring ? "#b45309" : "#065f46" }}>{daysText}</td>
                    <td style={{ padding: "13px 16px" }}>
                      <span style={{ fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 20, background: tagBg, color: tagColor }}>{tagLabel}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div style={{ padding: "13px 20px", borderTop: "1px solid #f0f4f8", fontSize: 12, color: "#8a9ab5", fontWeight: 600 }}>
          Showing {filtered.length} medicines
        </div>
      </div>
    </div>
  );
}