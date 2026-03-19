import { useState, useEffect } from "react";
import { getSales } from "../services/salesService";

const payColors = {
  Cash:     { bg: "#d1fae5", color: "#065f46" },
  "M-Pesa": { bg: "#ede9fe", color: "#5b21b6" },
  Card:     { bg: "#dbeafe", color: "#1d4ed8" },
};

export default function SalesHistory() {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [payFilter, setPayFilter] = useState("All");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [expanded, setExpanded] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = {};
      if (from) params.from = from;
      if (to) params.to = to;
      if (payFilter !== "All") params.payment = payFilter;
      const res = await getSales(params);
      setSales(res.data.data || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [from, to, payFilter]);

  const filtered = sales.filter(s =>
    s.sale_number?.toLowerCase().includes(search.toLowerCase()) ||
    s.customer_name?.toLowerCase().includes(search.toLowerCase())
  );

  const totalRevenue = filtered.reduce((s, x) => s + parseFloat(x.total || 0), 0);

  const S = {
    pg: { padding: "28px 32px", fontFamily: "'Plus Jakarta Sans',sans-serif", background: "#f4f7fb", minHeight: "100vh" },
    card: { background: "#fff", borderRadius: 16, border: "1px solid #e8eef5", boxShadow: "0 1px 6px rgba(0,0,0,0.04)" },
    inp: { padding: "9px 13px", borderRadius: 10, fontSize: 13, fontFamily: "inherit", border: "1.5px solid #e3eaf2", outline: "none", color: "#0d1b2a", background: "#fff" },
  };

  const kpis = [
    { icon: "🧾", label: "Transactions", val: filtered.length, color: "#00e5c0", filter: "All" },
    { icon: "💰", label: "Total Revenue", val: `KES ${totalRevenue.toLocaleString()}`, color: "#6366f1", filter: "All" },
    { icon: "💵", label: "Cash Sales", val: filtered.filter(s => s.payment_method === "Cash").length, color: "#f59e0b", filter: "Cash" },
    { icon: "📱", label: "M-Pesa Sales", val: filtered.filter(s => s.payment_method === "M-Pesa").length, color: "#f43f5e", filter: "M-Pesa" },
  ];

  return (
    <div style={S.pg}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap'); @keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}`}</style>

      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 24 }}>
        <div>
          <div style={{ fontSize: 24, fontWeight: 800, color: "#0d1b2a", letterSpacing: "-0.6px" }}>Sales History</div>
          <div style={{ fontSize: 13, color: "#8a9ab5", marginTop: 4 }}>{filtered.length} transactions · KES {totalRevenue.toLocaleString()} total</div>
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 20 }}>
        {kpis.map((k, i) => (
          <div key={i}
            onClick={() => setPayFilter(k.filter)}
            style={{
              borderRadius: 16, padding: 20, cursor: "pointer", transition: "all 0.2s",
              background: payFilter === k.filter && k.filter !== "All" ? `${k.color}15` : "#fff",
              border: payFilter === k.filter && k.filter !== "All" ? `1.5px solid ${k.color}` : "1px solid #e8eef5",
              boxShadow: payFilter === k.filter && k.filter !== "All" ? `0 8px 24px ${k.color}30` : "0 1px 6px rgba(0,0,0,0.04)",
              transform: payFilter === k.filter && k.filter !== "All" ? "translateY(-2px)" : "none",
            }}>
            <div style={{ fontSize: 22, marginBottom: 10 }}>{k.icon}</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: "#0d1b2a", letterSpacing: "-0.6px", lineHeight: 1, marginBottom: 4 }}>{loading ? "…" : k.val}</div>
            <div style={{ fontSize: 11, color: "#8a9ab5", fontWeight: 600, textTransform: "uppercase" }}>{k.label}</div>
          </div>
        ))}
      </div>

      <div style={S.card}>
        <div style={{ display: "flex", gap: 10, padding: "16px 20px", borderBottom: "1px solid #f0f4f8", flexWrap: "wrap", alignItems: "center" }}>
          <div style={{ position: "relative", flex: 1, minWidth: 180 }}>
            <span style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", fontSize: 13 }}>🔍</span>
            <input style={{ ...S.inp, paddingLeft: 34, width: "100%", boxSizing: "border-box" }} placeholder="Search by sale # or customer..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <input type="date" style={S.inp} value={from} onChange={e => setFrom(e.target.value)} />
          <input type="date" style={S.inp} value={to} onChange={e => setTo(e.target.value)} />
          {["All", "Cash", "M-Pesa", "Card"].map(p => (
            <button key={p} onClick={() => setPayFilter(p)} style={{ padding: "9px 14px", borderRadius: 10, border: payFilter === p ? "none" : "1.5px solid #e3eaf2", background: payFilter === p ? "linear-gradient(135deg,#00e5c0,#0080ff)" : "#fff", color: payFilter === p ? "#fff" : "#0d1b2a", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>{p}</button>
          ))}
          {(from || to || payFilter !== "All") && (
            <button onClick={() => { setFrom(""); setTo(""); setPayFilter("All"); }} style={{ padding: "9px 14px", borderRadius: 10, border: "1.5px solid #e3eaf2", background: "#fff", color: "#f43f5e", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>✕ Clear</button>
          )}
        </div>

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#f8fafc" }}>
                {["", "Sale #", "Customer", "Items", "Subtotal", "Tax", "Total", "Payment", "Date"].map(h => (
                  <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#8a9ab5", textTransform: "uppercase", letterSpacing: "0.6px" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? [1, 2, 3, 4].map(i => (
                <tr key={i}><td colSpan={9} style={{ padding: "12px 16px" }}><div style={{ height: 20, background: "linear-gradient(90deg,#f0f4f8 25%,#e8eef5 50%,#f0f4f8 75%)", backgroundSize: "200% 100%", animation: "shimmer 1.2s infinite", borderRadius: 8 }} /></td></tr>
              )) : filtered.length === 0 ? (
                <tr><td colSpan={9} style={{ textAlign: "center", padding: 40, color: "#8a9ab5" }}>
                  <div style={{ fontSize: 36, marginBottom: 8 }}>🧾</div>
                  No sales found
                </td></tr>
              ) : filtered.map(s => {
                const pc = payColors[s.payment_method] || { bg: "#f1f5f9", color: "#64748b" };
                const isOpen = expanded === s.id;
                return (
                  <>
                    <tr key={s.id} style={{ borderTop: "1px solid #f0f4f8", background: isOpen ? "#fafcff" : "transparent" }}>
                      <td style={{ padding: "13px 16px" }}>
                        <button onClick={() => setExpanded(isOpen ? null : s.id)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 14, color: "#8a9ab5" }}>{isOpen ? "▼" : "▶"}</button>
                      </td>
                      <td style={{ padding: "13px 16px", fontWeight: 700, color: "#6366f1", fontSize: 13 }}>{s.sale_number}</td>
                      <td style={{ padding: "13px 16px", fontSize: 13, color: "#0d1b2a", fontWeight: 600 }}>{s.customer_name}</td>
                      <td style={{ padding: "13px 16px", fontSize: 13, color: "#374151" }}>{s.items?.length || 0}</td>
                      <td style={{ padding: "13px 16px", fontSize: 13, color: "#374151" }}>KES {parseFloat(s.subtotal || 0).toLocaleString()}</td>
                      <td style={{ padding: "13px 16px", fontSize: 13, color: "#374151" }}>KES {parseFloat(s.tax || 0).toLocaleString()}</td>
                      <td style={{ padding: "13px 16px", fontWeight: 800, color: "#00b89c", fontSize: 13 }}>KES {parseFloat(s.total || 0).toLocaleString()}</td>
                      <td style={{ padding: "13px 16px" }}>
                        <span style={{ fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 20, background: pc.bg, color: pc.color }}>{s.payment_method}</span>
                      </td>
                      <td style={{ padding: "13px 16px", fontSize: 12, color: "#374151" }}>{s.created_at?.split(" ")[0]}</td>
                    </tr>
                    {isOpen && (
                      <tr key={`${s.id}-exp`} style={{ background: "#f8fafc", borderTop: "1px solid #f0f4f8" }}>
                        <td colSpan={9} style={{ padding: "12px 32px 16px" }}>
                          <div style={{ fontSize: 11, fontWeight: 700, color: "#8a9ab5", textTransform: "uppercase", marginBottom: 8 }}>Items</div>
                          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                            {s.items?.map((item, i) => (
                              <div key={i} style={{ padding: "7px 14px", background: "#fff", borderRadius: 9, border: "1px solid #e8eef5", fontSize: 12, fontWeight: 600, color: "#0d1b2a" }}>
                                {item.medicine_name} <span style={{ color: "#6366f1" }}>×{item.quantity}</span> <span style={{ color: "#8a9ab5" }}>@ KES {parseFloat(item.unit_price).toFixed(2)}</span>
                              </div>
                            ))}
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                );
              })}
            </tbody>
          </table>
        </div>
        <div style={{ padding: "13px 20px", borderTop: "1px solid #f0f4f8", fontSize: 12, color: "#8a9ab5", fontWeight: 600 }}>
          Showing {filtered.length} transactions
        </div>
      </div>
    </div>
  );
}