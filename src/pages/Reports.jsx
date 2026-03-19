import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

export default function Reports() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [from, setFrom] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`;
  });
  const [to, setTo] = useState(() => new Date().toISOString().split("T")[0]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get("/reports/index.php", { params: { from, to } });
      setData(res.data.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [from, to]);

  const exportCSV = (rows, filename) => {
    if (!rows || rows.length === 0) return alert("No data to export.");
    const headers = Object.keys(rows[0]).join(",");
    const body = rows.map(r => Object.values(r).map(v => `"${v}"`).join(",")).join("\n");
    const blob = new Blob([headers + "\n" + body], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportTopMedicinesCSV = () => exportCSV(data?.top_medicines, `top-medicines-${from}-to-${to}.csv`);
  const exportMonthlyCSV = () => exportCSV(data?.monthly, `monthly-revenue-${from}-to-${to}.csv`);
  const exportPaymentCSV = () => exportCSV(data?.by_payment, `payment-breakdown-${from}-to-${to}.csv`);

  const S = {
    pg: { padding: "28px 32px", fontFamily: "'Plus Jakarta Sans',sans-serif", background: "#f4f7fb", minHeight: "100vh" },
    card: { background: "#fff", borderRadius: 16, border: "1px solid #e8eef5", boxShadow: "0 1px 6px rgba(0,0,0,0.04)" },
    inp: { padding: "9px 13px", borderRadius: 10, fontSize: 13, fontFamily: "inherit", border: "1.5px solid #e3eaf2", outline: "none", color: "#0d1b2a", background: "#fff" },
    btn: (v) => ({ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 10, fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", border: v === "primary" ? "none" : "1.5px solid #e3eaf2", background: v === "primary" ? "linear-gradient(135deg,#00e5c0,#0080ff)" : "#fff", color: v === "primary" ? "#fff" : "#0d1b2a" }),
  };

  const maxMonthly = data?.monthly?.length ? Math.max(...data.monthly.map(m => m.revenue)) : 1;
  const payColors = { Cash: "#00e5c0", "M-Pesa": "#6366f1", Card: "#f59e0b" };

  const kpis = [
    { icon: "💰", label: "Total Revenue", val: loading ? "…" : `KES ${parseFloat(data?.revenue || 0).toLocaleString()}`, color: "#00e5c0", path: "/sales-history" },
    { icon: "🧾", label: "Transactions", val: loading ? "…" : data?.transactions || 0, color: "#6366f1", path: "/sales-history" },
    { icon: "👥", label: "New Patients", val: loading ? "…" : data?.new_patients || 0, color: "#f59e0b", path: "/patients" },
    { icon: "📋", label: "RX Fulfilled", val: loading ? "…" : `${data?.rx_fulfilled || 0} / ${data?.rx_total || 0}`, color: "#f43f5e", path: "/prescriptions" },
  ];

  return (
    <div style={S.pg}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap'); @keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}`}</style>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 24 }}>
        <div>
          <div style={{ fontSize: 24, fontWeight: 800, color: "#0d1b2a", letterSpacing: "-0.6px" }}>Reports</div>
          <div style={{ fontSize: 13, color: "#8a9ab5", marginTop: 4 }}>Financial & operational overview</div>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
          <input type="date" style={S.inp} value={from} onChange={e => setFrom(e.target.value)} />
          <span style={{ fontSize: 13, color: "#8a9ab5" }}>to</span>
          <input type="date" style={S.inp} value={to} onChange={e => setTo(e.target.value)} />
          <button style={S.btn("outline")} onClick={exportMonthlyCSV}>⬇️ Monthly CSV</button>
          <button style={S.btn("primary")} onClick={exportTopMedicinesCSV}>⬇️ Top Medicines CSV</button>
        </div>
      </div>

      {/* KPIs */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 20 }}>
        {kpis.map((k, i) => (
          <div key={i}
            onClick={() => navigate(k.path)}
            style={{ ...S.card, padding: 20, cursor: "pointer", transition: "all 0.2s" }}
            onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = `0 8px 24px ${k.color}30`; }}
            onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 1px 6px rgba(0,0,0,0.04)"; }}>
            <div style={{ fontSize: 22, marginBottom: 10 }}>{k.icon}</div>
            <div style={{ fontSize: 24, fontWeight: 800, color: "#0d1b2a", letterSpacing: "-0.7px", lineHeight: 1, marginBottom: 4 }}>{k.val}</div>
            <div style={{ fontSize: 11, color: "#8a9ab5", fontWeight: 600, textTransform: "uppercase" }}>{k.label}</div>
            <div style={{ fontSize: 11, color: k.color, fontWeight: 600, marginTop: 6 }}>View details →</div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 18, marginBottom: 18 }}>

        {/* Monthly Revenue Chart */}
        <div style={S.card}>
          <div style={{ padding: "20px 24px", borderBottom: "1px solid #f0f4f8", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <div style={{ fontSize: 15, fontWeight: 800, color: "#0d1b2a" }}>Monthly Revenue</div>
              <div style={{ fontSize: 12, color: "#8a9ab5", marginTop: 3 }}>Last 8 months (KES thousands)</div>
            </div>
            <button style={S.btn("outline")} onClick={exportMonthlyCSV}>⬇️ CSV</button>
          </div>
          <div style={{ padding: "24px" }}>
            {loading ? (
              <div style={{ height: 160, background: "linear-gradient(90deg,#f0f4f8 25%,#e8eef5 50%,#f0f4f8 75%)", backgroundSize: "200% 100%", animation: "shimmer 1.2s infinite", borderRadius: 10 }} />
            ) : (
              <div style={{ display: "flex", alignItems: "flex-end", gap: 12, height: 160 }}>
                {data?.monthly?.map((m, i) => (
                  <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 8, height: "100%" }}>
                    <div style={{ flex: 1, width: "100%", display: "flex", alignItems: "flex-end" }}>
                      <div style={{ width: "100%", borderRadius: "6px 6px 0 0", background: "linear-gradient(180deg,#00e5c0,#00b89c)", minHeight: 4, height: `${(m.revenue / maxMonthly) * 140}px`, transition: "height 0.4s" }} />
                    </div>
                    <span style={{ fontSize: 10, color: "#b0bfcc", fontWeight: 700 }}>{m.month}</span>
                  </div>
                ))}
                {!data?.monthly?.length && (
                  <div style={{ flex: 1, textAlign: "center", color: "#8a9ab5", fontSize: 13 }}>No data yet</div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Payment Breakdown */}
        <div style={S.card}>
          <div style={{ padding: "20px 24px", borderBottom: "1px solid #f0f4f8", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <div style={{ fontSize: 15, fontWeight: 800, color: "#0d1b2a" }}>Payment Methods</div>
              <div style={{ fontSize: 12, color: "#8a9ab5", marginTop: 3 }}>Sales breakdown</div>
            </div>
            <button style={S.btn("outline")} onClick={exportPaymentCSV}>⬇️ CSV</button>
          </div>
          <div style={{ padding: "20px 24px" }}>
            {loading ? (
              <div style={{ height: 160, background: "linear-gradient(90deg,#f0f4f8 25%,#e8eef5 50%,#f0f4f8 75%)", backgroundSize: "200% 100%", animation: "shimmer 1.2s infinite", borderRadius: 10 }} />
            ) : data?.by_payment?.length ? (
              data.by_payment.map((p, i) => {
                const total = data.by_payment.reduce((s, x) => s + parseInt(x.cnt), 0);
                const pct = total ? Math.round((p.cnt / total) * 100) : 0;
                const color = payColors[p.payment_method] || "#8a9ab5";
                return (
                  <div key={i} style={{ marginBottom: 16 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, fontWeight: 700, color: "#0d1b2a", marginBottom: 6 }}>
                      <span>{p.payment_method}</span>
                      <span style={{ color }}>{pct}%</span>
                    </div>
                    <div style={{ height: 8, background: "#f0f4f8", borderRadius: 4, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${pct}%`, background: color, borderRadius: 4, transition: "width 0.4s" }} />
                    </div>
                    <div style={{ fontSize: 11, color: "#8a9ab5", marginTop: 3 }}>{p.cnt} transactions · KES {parseFloat(p.total).toLocaleString()}</div>
                  </div>
                );
              })
            ) : (
              <div style={{ textAlign: "center", padding: 32, color: "#8a9ab5", fontSize: 13 }}>No sales in this period</div>
            )}
          </div>
        </div>
      </div>

      {/* Top Medicines */}
      <div style={S.card}>
        <div style={{ padding: "20px 24px", borderBottom: "1px solid #f0f4f8", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 800, color: "#0d1b2a" }}>Top Selling Medicines</div>
            <div style={{ fontSize: 12, color: "#8a9ab5", marginTop: 3 }}>By units sold in selected period</div>
          </div>
          <button style={S.btn("primary")} onClick={exportTopMedicinesCSV}>⬇️ Export CSV</button>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#f8fafc" }}>
                {["#", "Medicine", "Units Sold", "Revenue", "Performance"].map(h => (
                  <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#8a9ab5", textTransform: "uppercase", letterSpacing: "0.6px" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? [1,2,3].map(i => (
                <tr key={i}><td colSpan={5} style={{ padding: "12px 16px" }}><div style={{ height: 20, background: "linear-gradient(90deg,#f0f4f8 25%,#e8eef5 50%,#f0f4f8 75%)", backgroundSize: "200% 100%", animation: "shimmer 1.2s infinite", borderRadius: 8 }} /></td></tr>
              )) : data?.top_medicines?.length ? (() => {
                const maxUnits = Math.max(...data.top_medicines.map(m => parseInt(m.units)));
                return data.top_medicines.map((m, i) => (
                  <tr key={i} style={{ borderTop: "1px solid #f0f4f8" }}
                    onMouseEnter={e => e.currentTarget.style.background = "#fafcff"}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                    <td style={{ padding: "13px 16px", fontWeight: 800, color: i < 3 ? "#00b89c" : "#8a9ab5", fontSize: 14 }}>#{i + 1}</td>
                    <td style={{ padding: "13px 16px", fontWeight: 700, color: "#0d1b2a", fontSize: 13 }}>{m.medicine_name}</td>
                    <td style={{ padding: "13px 16px", fontWeight: 700, color: "#6366f1", fontSize: 13 }}>{m.units}</td>
                    <td style={{ padding: "13px 16px", fontWeight: 700, color: "#00b89c", fontSize: 13 }}>KES {parseFloat(m.revenue).toLocaleString()}</td>
                    <td style={{ padding: "13px 16px" }}>
                      <div style={{ width: 120, height: 6, background: "#f0f4f8", borderRadius: 3, overflow: "hidden" }}>
                        <div style={{ height: "100%", width: `${(m.units / maxUnits) * 100}%`, background: "linear-gradient(90deg,#00e5c0,#0080ff)", borderRadius: 3 }} />
                      </div>
                    </td>
                  </tr>
                ));
              })() : (
                <tr><td colSpan={5} style={{ textAlign: "center", padding: 40, color: "#8a9ab5" }}>No sales data for this period</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}