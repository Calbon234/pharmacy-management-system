import { useState, useEffect } from "react";
import { getPatients, addPatient, updatePatient, deletePatient } from "../services/patientService";

const empty = { name: "", gender: "Male", dob: "", phone: "", email: "", blood_type: "", conditions: "", allergies: "" };
const BLOOD_TYPES = ["A+","A-","B+","B-","AB+","AB-","O+","O-"];

export default function Patients() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [genderFilter, setGenderFilter] = useState("All");
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(empty);
  const [editId, setEditId] = useState(null);
  const [viewTarget, setViewTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await getPatients();
      setPatients(res.data.data || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const thisMonth = new Date().getMonth();

  const filtered = patients.filter(p => {
    const ms = p.name.toLowerCase().includes(search.toLowerCase()) || (p.patient_no||"").toLowerCase().includes(search.toLowerCase());
    const mg = genderFilter === "All" || p.gender === genderFilter;
    return ms && mg;
  });

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (!form.phone.trim()) e.phone = "Phone is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const openAdd = () => { setForm(empty); setErrors({}); setEditId(null); setModal("form"); };
  const openEdit = (p) => { setForm({ name:p.name, gender:p.gender||"Male", dob:p.dob||"", phone:p.phone||"", email:p.email||"", blood_type:p.blood_type||"", conditions:p.conditions||"", allergies:p.allergies||"" }); setEditId(p.id); setErrors({}); setModal("form"); };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      if (editId) { await updatePatient(editId, form); }
      else { await addPatient(form); }
      await fetchData();
      setModal(null);
    } catch (e) { alert(e.response?.data?.message || "Failed to save."); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    try {
      await deletePatient(deleteTarget.id);
      await fetchData();
      setModal(null);
    } catch { alert("Failed to delete."); }
  };

  const f = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const avatarColors = ["#00e5c0","#6366f1","#f59e0b","#f43f5e","#0080ff","#10b981"];

  const S = {
    pg: { padding: "28px 32px", fontFamily: "'Plus Jakarta Sans',sans-serif", background: "#f4f7fb", minHeight: "100vh" },
    card: { background: "#fff", borderRadius: 16, border: "1px solid #e8eef5", boxShadow: "0 1px 6px rgba(0,0,0,0.04)" },
    inp: (err) => ({ width: "100%", padding: "10px 13px", borderRadius: 10, fontSize: 13, fontFamily: "inherit", border: `1.5px solid ${err ? "#fca5a5" : "#e3eaf2"}`, outline: "none", color: "#0d1b2a", background: err ? "#fff8f8" : "#fff", boxSizing: "border-box" }),
    btn: (v) => ({ display: "inline-flex", alignItems: "center", gap: 6, padding: "9px 16px", borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", border: "none", background: v === "primary" ? "linear-gradient(135deg,#00e5c0,#0080ff)" : v === "danger" ? "#fee2e2" : "#fff", color: v === "primary" ? "#fff" : v === "danger" ? "#dc2626" : "#0d1b2a", ...(v === "outline" ? { border: "1.5px solid #e3eaf2" } : {}) }),
  };

  const kpis = [
    { icon: "👥", label: "Total Patients", val: patients.length, color: "#00e5c0", filter: "All" },
    { icon: "👨", label: "Male", val: patients.filter(p => p.gender === "Male").length, color: "#6366f1", filter: "Male" },
    { icon: "👩", label: "Female", val: patients.filter(p => p.gender === "Female").length, color: "#f43f5e", filter: "Female" },
    { icon: "📅", label: "This Month", val: patients.filter(p => new Date(p.created_at).getMonth() === thisMonth).length, color: "#f59e0b", filter: "All" },
  ];

  return (
    <div style={S.pg}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap'); @keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}`}</style>

      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 24 }}>
        <div>
          <div style={{ fontSize: 24, fontWeight: 800, color: "#0d1b2a", letterSpacing: "-0.6px" }}>Patients</div>
          <div style={{ fontSize: 13, color: "#8a9ab5", marginTop: 4 }}>{patients.length} registered patients</div>
        </div>
        <button style={S.btn("primary")} onClick={openAdd}>＋ Register Patient</button>
      </div>

      {/* KPI Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 20 }}>
        {kpis.map((k, i) => (
          <div key={i}
            onClick={() => setGenderFilter(k.filter)}
            style={{
              borderRadius: 16, padding: 20, cursor: "pointer", transition: "all 0.2s",
              background: genderFilter === k.filter && k.filter !== "All" ? `rgba(${k.color === "#6366f1" ? "99,102,241" : k.color === "#f43f5e" ? "244,63,94" : "0,229,192"},0.08)` : "#fff",
              border: genderFilter === k.filter && k.filter !== "All" ? `1.5px solid ${k.color}` : "1px solid #e8eef5",
              boxShadow: genderFilter === k.filter && k.filter !== "All" ? `0 8px 24px ${k.color}30` : "0 1px 6px rgba(0,0,0,0.04)",
              transform: genderFilter === k.filter && k.filter !== "All" ? "translateY(-2px)" : "none",
            }}>
            <div style={{ fontSize: 22, marginBottom: 10 }}>{k.icon}</div>
            <div style={{ fontSize: 26, fontWeight: 800, color: "#0d1b2a", letterSpacing: "-0.7px", lineHeight: 1, marginBottom: 4 }}>{loading ? "…" : k.val}</div>
            <div style={{ fontSize: 11, color: "#8a9ab5", fontWeight: 600, textTransform: "uppercase" }}>{k.label}</div>
            {k.filter !== "All" && <div style={{ fontSize: 11, color: k.color, fontWeight: 600, marginTop: 6 }}>Click to filter →</div>}
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
        <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
          <span style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", fontSize: 13 }}>🔍</span>
          <input style={{ ...S.inp(false), paddingLeft: 34 }} placeholder="Search by name or patient no..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        {["All", "Male", "Female", "Other"].map(g => (
          <button key={g} onClick={() => setGenderFilter(g)} style={{ ...S.btn(genderFilter === g ? "primary" : "outline"), padding: "9px 14px" }}>{g}</button>
        ))}
      </div>

      {/* Patient Cards Grid */}
      {loading ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))", gap: 14 }}>
          {[1,2,3,4,5,6].map(i => (
            <div key={i} style={{ ...S.card, padding: 20 }}>
              <div style={{ height: 120, background: "linear-gradient(90deg,#f0f4f8 25%,#e8eef5 50%,#f0f4f8 75%)", backgroundSize: "200% 100%", animation: "shimmer 1.2s infinite", borderRadius: 10 }} />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ ...S.card, padding: 48, textAlign: "center", color: "#8a9ab5" }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>👥</div>
          <div style={{ fontSize: 15, fontWeight: 700 }}>No patients found</div>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))", gap: 14 }}>
          {filtered.map((p, idx) => (
            <div key={p.id} style={{ ...S.card, padding: 20, transition: "transform 0.2s, box-shadow 0.2s" }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 10px 30px rgba(0,0,0,0.08)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 1px 6px rgba(0,0,0,0.04)"; }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
                <div style={{ width: 44, height: 44, borderRadius: 13, background: avatarColors[idx % avatarColors.length], display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, color: "#fff", fontWeight: 800, flexShrink: 0 }}>
                  {p.name.charAt(0)}
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: "#0d1b2a" }}>{p.name}</div>
                  <div style={{ fontSize: 11, color: "#8a9ab5", fontWeight: 600 }}>{p.patient_no}</div>
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 14 }}>
                {[
                  { icon: "⚧", val: `${p.gender || "—"} · ${p.blood_type || "Unknown"}` },
                  { icon: "📞", val: p.phone || "—" },
                  { icon: "🏥", val: p.conditions || "No conditions recorded" },
                ].map((r, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "#374151" }}>
                    <span style={{ fontSize: 13 }}>{r.icon}</span>
                    <span style={{ fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.val}</span>
                  </div>
                ))}
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => { setViewTarget(p); setModal("view"); }} style={{ ...S.btn("outline"), flex: 1, justifyContent: "center", padding: "8px" }}>👁 View</button>
                <button onClick={() => openEdit(p)} style={{ ...S.btn("outline"), padding: "8px 12px" }}>✏️</button>
                <button onClick={() => { setDeleteTarget(p); setModal("delete"); }} style={{ ...S.btn("danger"), padding: "8px 12px" }}>🗑</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {modal === "form" && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(13,27,42,0.5)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200, padding: 20 }}>
          <div style={{ background: "#fff", borderRadius: 20, width: "100%", maxWidth: 520, boxShadow: "0 24px 64px rgba(0,0,0,0.15)", maxHeight: "90vh", overflowY: "auto" }}>
            <div style={{ padding: "22px 24px", borderBottom: "1px solid #f0f4f8", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, background: "#fff", zIndex: 1 }}>
              <div style={{ fontSize: 17, fontWeight: 800, color: "#0d1b2a" }}>{editId ? "✏️ Edit Patient" : "➕ Register Patient"}</div>
              <button onClick={() => setModal(null)} style={{ background: "none", border: "none", fontSize: 18, cursor: "pointer", color: "#8a9ab5" }}>✕</button>
            </div>
            <div style={{ padding: "22px 24px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div style={{ gridColumn: "1/-1" }}>
                <label style={{ fontSize: 12, fontWeight: 700, color: "#374151", display: "block", marginBottom: 6 }}>Full Name</label>
                <input style={S.inp(errors.name)} placeholder="e.g. Mary Wanjiku" value={form.name} onChange={e => f("name", e.target.value)} />
                {errors.name && <div style={{ fontSize: 11, color: "#dc2626", marginTop: 3 }}>{errors.name}</div>}
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: "#374151", display: "block", marginBottom: 6 }}>Gender</label>
                <select style={S.inp(false)} value={form.gender} onChange={e => f("gender", e.target.value)}>
                  <option>Male</option><option>Female</option><option>Other</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: "#374151", display: "block", marginBottom: 6 }}>Date of Birth</label>
                <input type="date" style={S.inp(false)} value={form.dob} onChange={e => f("dob", e.target.value)} />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: "#374151", display: "block", marginBottom: 6 }}>Phone</label>
                <input style={S.inp(errors.phone)} placeholder="e.g. +254 712 345 678" value={form.phone} onChange={e => f("phone", e.target.value)} />
                {errors.phone && <div style={{ fontSize: 11, color: "#dc2626", marginTop: 3 }}>{errors.phone}</div>}
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: "#374151", display: "block", marginBottom: 6 }}>Email</label>
                <input style={S.inp(false)} placeholder="e.g. patient@email.com" value={form.email} onChange={e => f("email", e.target.value)} />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: "#374151", display: "block", marginBottom: 6 }}>Blood Type</label>
                <select style={S.inp(false)} value={form.blood_type} onChange={e => f("blood_type", e.target.value)}>
                  <option value="">Unknown</option>
                  {BLOOD_TYPES.map(b => <option key={b}>{b}</option>)}
                </select>
              </div>
              <div style={{ gridColumn: "1/-1" }}>
                <label style={{ fontSize: 12, fontWeight: 700, color: "#374151", display: "block", marginBottom: 6 }}>Medical Conditions</label>
                <textarea style={{ ...S.inp(false), resize: "vertical", minHeight: 60 }} placeholder="e.g. Diabetes Type 2, Hypertension" value={form.conditions} onChange={e => f("conditions", e.target.value)} />
              </div>
              <div style={{ gridColumn: "1/-1" }}>
                <label style={{ fontSize: 12, fontWeight: 700, color: "#374151", display: "block", marginBottom: 6 }}>Allergies</label>
                <textarea style={{ ...S.inp(false), resize: "vertical", minHeight: 60 }} placeholder="e.g. Penicillin, Aspirin" value={form.allergies} onChange={e => f("allergies", e.target.value)} />
              </div>
            </div>
            <div style={{ padding: "16px 24px", borderTop: "1px solid #f0f4f8", display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button style={S.btn("outline")} onClick={() => setModal(null)}>Cancel</button>
              <button style={S.btn("primary")} onClick={handleSave} disabled={saving}>{saving ? "Saving..." : editId ? "Save Changes" : "Register Patient"}</button>
            </div>
          </div>
        </div>
      )}

      {/* View Modal */}
      {modal === "view" && viewTarget && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(13,27,42,0.5)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200, padding: 20 }}>
          <div style={{ background: "#fff", borderRadius: 20, width: "100%", maxWidth: 420, boxShadow: "0 24px 64px rgba(0,0,0,0.15)" }}>
            <div style={{ background: "linear-gradient(135deg,#0d1b2a,#1a2a40)", borderRadius: "20px 20px 0 0", padding: "28px 24px", textAlign: "center" }}>
              <div style={{ width: 60, height: 60, borderRadius: 16, background: "linear-gradient(135deg,#00e5c0,#0080ff)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, fontWeight: 800, color: "#fff", margin: "0 auto 12px" }}>{viewTarget.name.charAt(0)}</div>
              <div style={{ fontSize: 18, fontWeight: 800, color: "#fff" }}>{viewTarget.name}</div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginTop: 4 }}>{viewTarget.patient_no}</div>
            </div>
            <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 8 }}>
              {[
                { icon: "⚧", label: "Gender", val: viewTarget.gender || "—" },
                { icon: "🩸", label: "Blood Type", val: viewTarget.blood_type || "Unknown" },
                { icon: "📞", label: "Phone", val: viewTarget.phone || "—" },
                { icon: "📧", label: "Email", val: viewTarget.email || "—" },
                { icon: "🏥", label: "Conditions", val: viewTarget.conditions || "None" },
                { icon: "⚠️", label: "Allergies", val: viewTarget.allergies || "None" },
              ].map((r, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "9px 14px", background: "#f8fafc", borderRadius: 10 }}>
                  <span style={{ fontSize: 16 }}>{r.icon}</span>
                  <div>
                    <div style={{ fontSize: 10, color: "#8a9ab5", fontWeight: 700, textTransform: "uppercase" }}>{r.label}</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#0d1b2a", marginTop: 1 }}>{r.val}</div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ padding: "0 24px 22px", display: "flex", gap: 10 }}>
              <button style={{ ...S.btn("outline"), flex: 1 }} onClick={() => setModal(null)}>Close</button>
              <button style={{ ...S.btn("primary"), flex: 1 }} onClick={() => { setModal(null); openEdit(viewTarget); }}>Edit Patient</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {modal === "delete" && deleteTarget && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(13,27,42,0.5)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200, padding: 20 }}>
          <div style={{ background: "#fff", borderRadius: 20, width: "100%", maxWidth: 380, padding: 28, boxShadow: "0 24px 64px rgba(0,0,0,0.15)", textAlign: "center" }}>
            <div style={{ fontSize: 44, marginBottom: 14 }}>🗑️</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: "#0d1b2a", marginBottom: 8 }}>Delete Patient?</div>
            <div style={{ fontSize: 13, color: "#8a9ab5", marginBottom: 22 }}>Are you sure you want to delete <strong style={{ color: "#0d1b2a" }}>{deleteTarget.name}</strong>?</div>
            <div style={{ display: "flex", gap: 10 }}>
              <button style={{ ...S.btn("outline"), flex: 1 }} onClick={() => setModal(null)}>Cancel</button>
              <button style={{ flex: 1, padding: "10px 16px", borderRadius: 10, border: "none", background: "linear-gradient(135deg,#f43f5e,#e11d48)", color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }} onClick={handleDelete}>Yes, Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}