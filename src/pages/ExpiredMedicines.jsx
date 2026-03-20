import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import api from "../services/api";

export default function ExpiredMedicines() {
  const { user } = useContext(AuthContext);
  const [medicines, setMedicines] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("all");
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(null);
  const [target, setTarget] = useState(null);
  const [form, setForm] = useState({ action: "disposed", quantity: "", supplier_id: "", reason: "" });
  const [saving, setSaving] = useState(false);
  const [logs, setLogs] = useState([]);
  const [showLogs, setShowLogs] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [medRes, supRes] = await Promise.all([
        api.get("/medicines/index.php"),
        api.get("/suppliers/index.php")
      ]);
      setMedicines(medRes.data.data || []);
      setSuppliers(supRes.data.data || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const fetchLogs = async () => {
    try {
      const res = await api.get("/medicines/dispose.php");
      setLogs(res.data.data || []);
    } catch (e) { console.error(e); }
  };

  useEffect(() => { fetchData(); fetchLogs(); }, []);

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
    ...m, daysLeft: getDaysLeft(m.expiry_date), status: getStatus(getDaysLeft(m.expiry_date))
  }));

  const expiredCount  = allMeds.filter(m => m.status === "expired" && m.stock > 0).length;
  const expiringCount = allMeds.filter(m => m.status === "expiring" && m.stock > 0).length;
  const safeCount     = allMeds.filter(m => m.status === "ok" && m.stock > 0).length;

  const filtered = allMeds
    .filter(m => {
      if (tab === "expired") return m.status === "expired";
      if (tab === "expiring") return m.status === "expiring";
      if (tab === "safe") return m.status === "ok";
      return m.status === "expired" || m.status === "expiring";
    })
    .filter(m => m.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => a.daysLeft - b.daysLeft);

  const openDispose = (m) => {
    setTarget(m);
    setForm({ action: "disposed", quantity: m.stock, supplier_id: m.supplier_id || "", reason: "" });
    setModal("dispose");
  };

  const handleDispose = async () => {
    if (!form.quantity || form.quantity <= 0) return alert("Enter a valid quantity.");
    if (form.action === "returned" && !form.supplier_id) return alert("Select a supplier for return.");
    setSaving(true);
    try {
      await api.post("/medicines/dispose.php", {
        medicine_id: target.id,
        quantity: parseInt(form.quantity),
        action: form.action,
        supplier_id: form.supplier_id || null,
        reason: form.reason,
        disposed_by: user?.id || 1,
      });
      await fetchData();
      await fetchLogs();
      setModal(null);
    } catch (e) { alert(e.response?.data?.message || "Failed to record."); }
    finally { setSaving(false); }
  };

  const S = {
    pg: { padding: "28px 32px", fontFamily: "'Plus Jakarta Sans',sans-serif", background: "#f4f7fb", minHeight: "100vh" },
    card: { background: "#fff", borderRadius: 16, border: "1px solid #e8eef5", boxShadow: "0 1px 6px rgba(0,0,0,0.04)" },
    inp: { width: "100%", padding: "10px 13px", borderRadius: 10, fontSize: 13, fontFamily: "inherit", border: "1.5px solid #e3eaf2", outline: "none", color: "#0d1b2a", background: "#fff", boxSizing: "border-box" },
    btn: (v) => ({ display: "inline-flex", alignItems: "center", gap: 6, padding: "9px 16px", borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", border: "none", background: v === "primary" ? "linear-gradient(135deg,#00e5c0,#0080ff)" : v === "danger" ? "linear-gradient(135deg,#f43f5e,#e11d48)" : "#fff", color: v === "primary" || v === "danger" ? "#fff" : "#0d1b2a", ...(v === "outline" ? { border: "1.5px solid #e3eaf2" } : {}) }),
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
          <div style={{ fontSize: 13, color: "#8a9ab5", marginTop: 4 }}>Monitor and manage expired medicines</div>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={() => setShowLogs(!showLogs)} style={S.btn("outline")}>📋 Disposal Log ({logs.length})</button>
          <button onClick={fetchData} style={S.btn("outline")}>🔄 Refresh</button>
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 20 }}>
        {kpis.map((k, i) => (
          <div key={i} onClick={() => setTab(k.filter)} style={{
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

      {/* Alert banner */}
      {!loading && expiredCount > 0 && (
        <div style={{ background: "#fee2e2", border: "1px solid #fecaca", borderRadius: 12, padding: "14px 18px", marginBottom: 16, display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 22 }}>🚨</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 800, color: "#dc2626" }}>{expiredCount} medicine{expiredCount > 1 ? "s have" : " has"} expired!</div>
            <div style={{ fontSize: 12, color: "#b91c1c", marginTop: 2 }}>Use the Dispose or Return buttons to handle them.</div>
          </div>
        </div>
      )}

      {/* Disposal Log */}
      {showLogs && (
        <div style={{ ...S.card, marginBottom: 20 }}>
          <div style={{ padding: "16px 20px", borderBottom: "1px solid #f0f4f8", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ fontSize: 15, fontWeight: 800, color: "#0d1b2a" }}>📋 Disposal Log</div>
            <button onClick={() => setShowLogs(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "#8a9ab5", fontSize: 16 }}>✕</button>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#f8fafc" }}>
                  {["Medicine", "Batch", "Qty", "Action", "Supplier", "Reason", "By", "Date"].map(h => (
                    <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#8a9ab5", textTransform: "uppercase" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {logs.length === 0 ? (
                  <tr><td colSpan={8} style={{ textAlign: "center", padding: 24, color: "#8a9ab5" }}>No disposal records yet</td></tr>
                ) : logs.map((log, i) => (
                  <tr key={i} style={{ borderTop: "1px solid #f0f4f8" }}>
                    <td style={{ padding: "12px 16px", fontWeight: 700, color: "#0d1b2a", fontSize: 13 }}>{log.medicine_name}</td>
                    <td style={{ padding: "12px 16px", fontSize: 12, color: "#6366f1" }}>{log.batch_number || "—"}</td>
                    <td style={{ padding: "12px 16px", fontSize: 13, fontWeight: 700 }}>{log.quantity}</td>
                    <td style={{ padding: "12px 16px" }}>
                      <span style={{ fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 20, background: log.action === "disposed" ? "#fee2e2" : "#d1fae5", color: log.action === "disposed" ? "#dc2626" : "#065f46" }}>
                        {log.action === "disposed" ? "🗑 Disposed" : "↩ Returned"}
                      </span>
                    </td>
                    <td style={{ padding: "12px 16px", fontSize: 12, color: "#374151" }}>{log.supplier_name || "—"}</td>
                    <td style={{ padding: "12px 16px", fontSize: 12, color: "#374151" }}>{log.reason || "—"}</td>
                    <td style={{ padding: "12px 16px", fontSize: 12, color: "#374151" }}>{log.disposed_by_name || "—"}</td>
                    <td style={{ padding: "12px 16px", fontSize: 12, color: "#374151" }}>{log.created_at?.split(" ")[0]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Table */}
      <div style={S.card}>
        <div style={{ display: "flex", gap: 10, padding: "16px 20px", borderBottom: "1px solid #f0f4f8", flexWrap: "wrap", alignItems: "center" }}>
          <div style={{ position: "relative", flex: 1, minWidth: 180 }}>
            <span style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", fontSize: 13 }}>🔍</span>
            <input style={{ ...S.inp, paddingLeft: 34 }} placeholder="Search medicines..." value={search} onChange={e => setSearch(e.target.value)} />
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
                {["Medicine", "Batch", "Category", "Supplier", "Stock", "Expiry Date", "Days Left", "Status", "Actions"].map(h => (
                  <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#8a9ab5", textTransform: "uppercase", letterSpacing: "0.6px" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? [1, 2, 3].map(i => (
                <tr key={i}><td colSpan={9} style={{ padding: "12px 16px" }}><div style={{ height: 20, background: "linear-gradient(90deg,#f0f4f8 25%,#e8eef5 50%,#f0f4f8 75%)", backgroundSize: "200% 100%", animation: "shimmer 1.2s infinite", borderRadius: 8 }} /></td></tr>
              )) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ textAlign: "center", padding: 48, color: "#8a9ab5" }}>
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
                  <tr key={i} style={{ borderTop: "1px solid #f0f4f8", background: isExpired ? "rgba(254,226,226,0.3)" : isExpiring ? "rgba(254,243,199,0.3)" : "transparent" }}>
                    <td style={{ padding: "13px 16px", fontWeight: 700, color: "#0d1b2a", fontSize: 13 }}>{m.name}</td>
                    <td style={{ padding: "13px 16px", fontSize: 12, color: "#6366f1", fontWeight: 600 }}>{m.batch_number || "—"}</td>
                    <td style={{ padding: "13px 16px", fontSize: 12, color: "#374151" }}>{m.category || "—"}</td>
                    <td style={{ padding: "13px 16px", fontSize: 12, color: "#374151" }}>{m.supplier_name || "—"}</td>
                    <td style={{ padding: "13px 16px", fontSize: 13, fontWeight: 700 }}>{m.stock}</td>
                    <td style={{ padding: "13px 16px", fontSize: 13, color: "#374151" }}>{m.expiry_date || "—"}</td>
                    <td style={{ padding: "13px 16px", fontSize: 13, fontWeight: 700, color: isExpired ? "#dc2626" : isExpiring ? "#b45309" : "#065f46" }}>{daysText}</td>
                    <td style={{ padding: "13px 16px" }}>
                      <span style={{ fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 20, background: tagBg, color: tagColor }}>{tagLabel}</span>
                    </td>
                    <td style={{ padding: "13px 16px" }}>
                      {m.stock > 0 ? (
                        <button onClick={() => openDispose(m)} style={{ ...S.btn("danger"), padding: "6px 12px", fontSize: 12 }}>
                          🗑 Dispose / Return
                        </button>
                      ) : (
                        <span style={{ fontSize: 11, color: "#8a9ab5", fontWeight: 600 }}>Already cleared ✅</span>
                      )}
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

      {/* Dispose/Return Modal */}
      {modal === "dispose" && target && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(13,27,42,0.5)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200, padding: 20 }}>
          <div style={{ background: "#fff", borderRadius: 20, width: "100%", maxWidth: 480, boxShadow: "0 24px 64px rgba(0,0,0,0.15)" }}>
            <div style={{ padding: "22px 24px", borderBottom: "1px solid #f0f4f8", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ fontSize: 17, fontWeight: 800, color: "#0d1b2a" }}>🗑 Dispose / Return Medicine</div>
              <button onClick={() => setModal(null)} style={{ background: "none", border: "none", fontSize: 18, cursor: "pointer", color: "#8a9ab5" }}>✕</button>
            </div>
            <div style={{ padding: "22px 24px", display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ background: "#f8fafc", borderRadius: 12, padding: "14px 16px" }}>
                <div style={{ fontSize: 14, fontWeight: 800, color: "#0d1b2a" }}>{target.name}</div>
                <div style={{ fontSize: 12, color: "#8a9ab5", marginTop: 4 }}>
                  Batch: {target.batch_number || "—"} · Stock: {target.stock} units · Expiry: {target.expiry_date}
                </div>
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: "#374151", display: "block", marginBottom: 8 }}>Action</label>
                <div style={{ display: "flex", gap: 10 }}>
                  {[
                    { val: "disposed", label: "🗑 Dispose", desc: "Write off as loss" },
                    { val: "returned", label: "↩ Return to Supplier", desc: "Send back to supplier" },
                  ].map(a => (
                    <div key={a.val} onClick={() => setForm(p => ({ ...p, action: a.val }))} style={{ flex: 1, padding: "12px 14px", borderRadius: 12, border: `1.5px solid ${form.action === a.val ? (a.val === "disposed" ? "#f43f5e" : "#00e5c0") : "#e3eaf2"}`, cursor: "pointer", background: form.action === a.val ? (a.val === "disposed" ? "#fff5f5" : "#f0fdf9") : "#fff" }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: "#0d1b2a" }}>{a.label}</div>
                      <div style={{ fontSize: 11, color: "#8a9ab5", marginTop: 2 }}>{a.desc}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: "#374151", display: "block", marginBottom: 6 }}>Quantity to {form.action === "disposed" ? "Dispose" : "Return"}</label>
                <input style={S.inp} type="number" min="1" max={target.stock} value={form.quantity} onChange={e => setForm(p => ({ ...p, quantity: e.target.value }))} />
              </div>

              {form.action === "returned" && (
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: "#374151", display: "block", marginBottom: 6 }}>Supplier</label>
                  <select style={S.inp} value={form.supplier_id} onChange={e => setForm(p => ({ ...p, supplier_id: e.target.value }))}>
                    <option value="">Select supplier</option>
                    {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
              )}

              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: "#374151", display: "block", marginBottom: 6 }}>Reason (optional)</label>
                <textarea style={{ ...S.inp, resize: "vertical", minHeight: 70 }} placeholder="e.g. Expired batch, damaged packaging..." value={form.reason} onChange={e => setForm(p => ({ ...p, reason: e.target.value }))} />
              </div>
            </div>
            <div style={{ padding: "16px 24px", borderTop: "1px solid #f0f4f8", display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button style={S.btn("outline")} onClick={() => setModal(null)}>Cancel</button>
              <button style={S.btn(form.action === "disposed" ? "danger" : "primary")} onClick={handleDispose} disabled={saving}>
                {saving ? "Saving..." : form.action === "disposed" ? "🗑 Confirm Dispose" : "↩ Confirm Return"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}