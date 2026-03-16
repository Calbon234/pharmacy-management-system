import { useState, useEffect } from "react";
import { getPrescriptions, addPrescription, updatePrescription } from "../services/prescriptionService";
import { getPatients } from "../services/patientService";
import { getMedicines } from "../services/inventoryService";

const emptyForm = { patient_id: "", doctor_name: "", notes: "", items: [{ medicine_id: "", medicine_name: "", quantity: 1, dosage: "" }] };

export default function Prescriptions() {
  const [prescriptions, setPrescriptions] = useState([]);
  const [patients, setPatients] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("All");
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [viewTarget, setViewTarget] = useState(null);
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [rxRes, ptRes, medRes] = await Promise.all([getPrescriptions(), getPatients(), getMedicines()]);
      setPrescriptions(rxRes.data.data || []);
      setPatients(ptRes.data.data || []);
      setMedicines(medRes.data.data || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const filtered = prescriptions.filter(r => tab === "All" || r.status === tab);

  const addItem = () => setForm(p => ({ ...p, items: [...p.items, { medicine_id: "", medicine_name: "", quantity: 1, dosage: "" }] }));
  const removeItem = (i) => setForm(p => ({ ...p, items: p.items.filter((_, idx) => idx !== i) }));
  const updateItem = (i, k, v) => setForm(p => { const items = [...p.items]; items[i] = { ...items[i], [k]: v }; return { ...p, items }; });
  const selectMed = (i, id) => {
    const med = medicines.find(m => m.id == id);
    updateItem(i, "medicine_id", id);
    if (med) updateItem(i, "medicine_name", med.name);
  };

  const handleSave = async () => {
    if (!form.patient_id) return alert("Please select a patient.");
    if (!form.items[0].medicine_id) return alert("Please add at least one medicine.");
    setSaving(true);
    try {
      await addPrescription(form);
      await fetchData();
      setModal(null);
      setForm(emptyForm);
    } catch (e) { alert(e.response?.data?.message || "Failed to save."); }
    finally { setSaving(false); }
  };

  const updateStatus = async (id, status) => {
    try {
      await updatePrescription(id, { status });
      await fetchData();
      setModal(null);
    } catch { alert("Failed to update."); }
  };

  const statusColors = {
    Pending:   { bg: "#fef3c7", color: "#b45309" },
    Fulfilled: { bg: "#d1fae5", color: "#065f46" },
    Partial:   { bg: "#dbeafe", color: "#1d4ed8" },
    Cancelled: { bg: "#fee2e2", color: "#dc2626" },
  };

  const S = {
    pg: { padding: "28px 32px", fontFamily: "'Plus Jakarta Sans',sans-serif", background: "#f4f7fb", minHeight: "100vh" },
    card: { background: "#fff", borderRadius: 16, border: "1px solid #e8eef5", boxShadow: "0 1px 6px rgba(0,0,0,0.04)" },
    inp: { width: "100%", padding: "10px 13px", borderRadius: 10, fontSize: 13, fontFamily: "inherit", border: "1.5px solid #e3eaf2", outline: "none", color: "#0d1b2a", background: "#fff", boxSizing: "border-box" },
    btn: (v) => ({ display: "inline-flex", alignItems: "center", gap: 6, padding: "9px 16px", borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", border: "none", background: v === "primary" ? "linear-gradient(135deg,#00e5c0,#0080ff)" : v === "danger" ? "#fee2e2" : "#fff", color: v === "primary" ? "#fff" : v === "danger" ? "#dc2626" : "#0d1b2a", ...(v === "outline" ? { border: "1.5px solid #e3eaf2" } : {}) }),
  };

  return (
    <div style={S.pg}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');`}</style>

      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 24 }}>
        <div>
          <div style={{ fontSize: 24, fontWeight: 800, color: "#0d1b2a", letterSpacing: "-0.6px" }}>Prescriptions</div>
          <div style={{ fontSize: 13, color: "#8a9ab5", marginTop: 4 }}>{prescriptions.length} total · {prescriptions.filter(r => r.status === "Pending").length} pending</div>
        </div>
        <button style={S.btn("primary")} onClick={() => { setForm(emptyForm); setModal("form"); }}>＋ New Prescription</button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 20 }}>
        {[
          { icon: "📋", label: "Total", val: prescriptions.length, color: "#00e5c0" },
          { icon: "⏳", label: "Pending", val: prescriptions.filter(r => r.status === "Pending").length, color: "#f59e0b" },
          { icon: "✅", label: "Fulfilled", val: prescriptions.filter(r => r.status === "Fulfilled").length, color: "#6366f1" },
          { icon: "❌", label: "Cancelled", val: prescriptions.filter(r => r.status === "Cancelled").length, color: "#f43f5e" },
        ].map((k, i) => (
          <div key={i} style={{ ...S.card, padding: 20, position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: k.color }} />
            <div style={{ fontSize: 24, marginBottom: 10 }}>{k.icon}</div>
            <div style={{ fontSize: 26, fontWeight: 800, color: "#0d1b2a", letterSpacing: "-0.7px", lineHeight: 1, marginBottom: 4 }}>{loading ? "…" : k.val}</div>
            <div style={{ fontSize: 11, color: "#8a9ab5", fontWeight: 600, textTransform: "uppercase" }}>{k.label}</div>
          </div>
        ))}
      </div>

      <div style={S.card}>
        <div style={{ padding: "16px 20px", borderBottom: "1px solid #f0f4f8", display: "flex", gap: 6 }}>
          {["All", "Pending", "Fulfilled", "Partial", "Cancelled"].map(t => (
            <button key={t} onClick={() => setTab(t)} style={{ padding: "7px 16px", borderRadius: 9, border: "none", background: tab === t ? "#0d1b2a" : "#f4f7fb", color: tab === t ? "#fff" : "#8a9ab5", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>{t}</button>
          ))}
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#f8fafc" }}>
                {["RX Number", "Patient", "Doctor", "Items", "Status", "Date", "Actions"].map(h => (
                  <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#8a9ab5", textTransform: "uppercase", letterSpacing: "0.6px" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? [1, 2, 3].map(i => (
                <tr key={i}><td colSpan={7} style={{ padding: "12px 16px" }}><div style={{ height: 20, background: "linear-gradient(90deg,#f0f4f8 25%,#e8eef5 50%,#f0f4f8 75%)", backgroundSize: "200% 100%", borderRadius: 8 }} /></td></tr>
              )) : filtered.length === 0 ? (
                <tr><td colSpan={7} style={{ textAlign: "center", padding: 40, color: "#8a9ab5" }}>No prescriptions found</td></tr>
              ) : filtered.map(rx => {
                const sc = statusColors[rx.status] || { bg: "#f1f5f9", color: "#64748b" };
                return (
                  <tr key={rx.id} style={{ borderTop: "1px solid #f0f4f8" }}
                    onMouseEnter={e => e.currentTarget.style.background = "#fafcff"}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                    <td style={{ padding: "13px 16px", fontWeight: 700, color: "#6366f1", fontSize: 13 }}>{rx.rx_number}</td>
                    <td style={{ padding: "13px 16px", fontSize: 13, fontWeight: 600, color: "#0d1b2a" }}>{rx.patient_name || "—"}</td>
                    <td style={{ padding: "13px 16px", fontSize: 13, color: "#374151" }}>{rx.doctor_name || "—"}</td>
                    <td style={{ padding: "13px 16px", fontSize: 12, color: "#374151" }}>{rx.items?.length || 0} item(s)</td>
                    <td style={{ padding: "13px 16px" }}>
                      <span style={{ fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 20, background: sc.bg, color: sc.color }}>{rx.status}</span>
                    </td>
                    <td style={{ padding: "13px 16px", fontSize: 12, color: "#374151" }}>{rx.created_at?.split(" ")[0]}</td>
                    <td style={{ padding: "13px 16px" }}>
                      <div style={{ display: "flex", gap: 6 }}>
                        <button onClick={() => { setViewTarget(rx); setModal("view"); }} style={{ ...S.btn("outline"), padding: "6px 10px", fontSize: 12 }}>👁</button>
                        {rx.status === "Pending" && (
                          <button onClick={() => updateStatus(rx.id, "Fulfilled")} style={{ ...S.btn("outline"), padding: "6px 10px", fontSize: 12, color: "#065f46" }}>✅</button>
                        )}
                        {rx.status === "Pending" && (
                          <button onClick={() => updateStatus(rx.id, "Cancelled")} style={{ ...S.btn("danger"), padding: "6px 10px", fontSize: 12 }}>✕</button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div style={{ padding: "13px 20px", borderTop: "1px solid #f0f4f8", fontSize: 12, color: "#8a9ab5", fontWeight: 600 }}>
          Showing {filtered.length} of {prescriptions.length} prescriptions
        </div>
      </div>

      {modal === "form" && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(13,27,42,0.5)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200, padding: 20 }}>
          <div style={{ background: "#fff", borderRadius: 20, width: "100%", maxWidth: 560, boxShadow: "0 24px 64px rgba(0,0,0,0.15)", maxHeight: "90vh", overflowY: "auto" }}>
            <div style={{ padding: "22px 24px", borderBottom: "1px solid #f0f4f8", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, background: "#fff", zIndex: 1 }}>
              <div style={{ fontSize: 17, fontWeight: 800, color: "#0d1b2a" }}>📋 New Prescription</div>
              <button onClick={() => setModal(null)} style={{ background: "none", border: "none", fontSize: 18, cursor: "pointer", color: "#8a9ab5" }}>✕</button>
            </div>
            <div style={{ padding: "22px 24px", display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: "#374151", display: "block", marginBottom: 6 }}>Patient</label>
                <select style={S.inp} value={form.patient_id} onChange={e => setForm(p => ({ ...p, patient_id: e.target.value }))}>
                  <option value="">Select patient</option>
                  {patients.map(p => <option key={p.id} value={p.id}>{p.name} ({p.patient_no})</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: "#374151", display: "block", marginBottom: 6 }}>Doctor Name</label>
                <input style={S.inp} placeholder="e.g. Dr. John Doe" value={form.doctor_name} onChange={e => setForm(p => ({ ...p, doctor_name: e.target.value }))} />
              </div>
              <div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                  <label style={{ fontSize: 12, fontWeight: 700, color: "#374151" }}>Medicines</label>
                  <button onClick={addItem} style={{ ...S.btn("outline"), padding: "5px 12px", fontSize: 12 }}>＋ Add</button>
                </div>
                {form.items.map((item, i) => (
                  <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 80px 1fr auto", gap: 8, marginBottom: 10, alignItems: "center" }}>
                    <select style={S.inp} value={item.medicine_id} onChange={e => selectMed(i, e.target.value)}>
                      <option value="">Select medicine</option>
                      {medicines.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                    </select>
                    <input style={S.inp} type="number" min="1" placeholder="Qty" value={item.quantity} onChange={e => updateItem(i, "quantity", e.target.value)} />
                    <input style={S.inp} placeholder="Dosage e.g. 1 tab × 3/day" value={item.dosage} onChange={e => updateItem(i, "dosage", e.target.value)} />
                    {form.items.length > 1 && <button onClick={() => removeItem(i)} style={{ ...S.btn("danger"), padding: "8px 10px" }}>✕</button>}
                  </div>
                ))}
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: "#374151", display: "block", marginBottom: 6 }}>Notes</label>
                <textarea style={{ ...S.inp, resize: "vertical", minHeight: 70 }} placeholder="Additional notes..." value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} />
              </div>
            </div>
            <div style={{ padding: "16px 24px", borderTop: "1px solid #f0f4f8", display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button style={S.btn("outline")} onClick={() => setModal(null)}>Cancel</button>
              <button style={S.btn("primary")} onClick={handleSave} disabled={saving}>{saving ? "Saving..." : "Create Prescription"}</button>
            </div>
          </div>
        </div>
      )}

      {modal === "view" && viewTarget && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(13,27,42,0.5)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200, padding: 20 }}>
          <div style={{ background: "#fff", borderRadius: 20, width: "100%", maxWidth: 480, boxShadow: "0 24px 64px rgba(0,0,0,0.15)", maxHeight: "90vh", overflowY: "auto" }}>
            <div style={{ background: "linear-gradient(135deg,#0d1b2a,#1a2a40)", borderRadius: "20px 20px 0 0", padding: "24px", textAlign: "center" }}>
              <div style={{ fontSize: 36, marginBottom: 8 }}>📋</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: "#fff" }}>{viewTarget.rx_number}</div>
              <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", marginTop: 4 }}>{viewTarget.patient_name}</div>
              <span style={{ fontSize: 11, fontWeight: 700, padding: "4px 12px", borderRadius: 20, background: "rgba(255,255,255,0.1)", color: "#fff", marginTop: 8, display: "inline-block" }}>{viewTarget.status}</span>
            </div>
            <div style={{ padding: "20px 24px" }}>
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#8a9ab5", textTransform: "uppercase", marginBottom: 8 }}>Details</div>
                {[
                  { label: "Doctor", val: viewTarget.doctor_name || "—" },
                  { label: "Date", val: viewTarget.created_at?.split(" ")[0] },
                  { label: "Notes", val: viewTarget.notes || "—" },
                ].map((r, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #f0f4f8", fontSize: 13 }}>
                    <span style={{ color: "#8a9ab5", fontWeight: 600 }}>{r.label}</span>
                    <span style={{ fontWeight: 700, color: "#0d1b2a" }}>{r.val}</span>
                  </div>
                ))}
              </div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#8a9ab5", textTransform: "uppercase", marginBottom: 8 }}>Medicines</div>
                {viewTarget.items?.map((item, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "10px 14px", background: "#f8fafc", borderRadius: 10, marginBottom: 8, fontSize: 13 }}>
                    <div>
                      <div style={{ fontWeight: 700, color: "#0d1b2a" }}>{item.medicine_name}</div>
                      <div style={{ fontSize: 11, color: "#8a9ab5", marginTop: 2 }}>{item.dosage || "—"}</div>
                    </div>
                    <div style={{ fontWeight: 700, color: "#6366f1" }}>×{item.quantity}</div>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ padding: "0 24px 22px", display: "flex", gap: 10 }}>
              <button style={{ ...S.btn("outline"), flex: 1 }} onClick={() => setModal(null)}>Close</button>
              {viewTarget.status === "Pending" && (
                <button style={{ ...S.btn("primary"), flex: 1 }} onClick={() => updateStatus(viewTarget.id, "Fulfilled")}>✅ Fulfill</button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}