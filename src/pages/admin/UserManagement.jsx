import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import api from "../../services/api";

const empty = { name: "", email: "", password: "", role: "pharmacist" };

export default function UserManagement() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(empty);
  const [editId, setEditId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [search, setSearch] = useState("");

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get("/auth/users.php");
      setUsers(res.data.data || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchUsers(); }, []);

  const filtered = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (!form.email.trim()) e.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Invalid email";
    if (!editId && !form.password.trim()) e.password = "Password is required";
    if (!editId && form.password.length < 6) e.password = "Minimum 6 characters";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const openAdd = () => { setForm(empty); setErrors({}); setEditId(null); setModal("form"); };
  const openEdit = (u) => { setForm({ name: u.name, email: u.email, password: "", role: u.role }); setEditId(u.id); setErrors({}); setModal("form"); };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      if (editId) {
        await api.put(`/auth/users.php?id=${editId}`, { name: form.name, email: form.email, role: form.role });
      } else {
        await api.post("/auth/users.php", form);
      }
      await fetchUsers();
      setModal(null);
    } catch (e) { alert(e.response?.data?.message || "Failed to save."); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (deleteTarget.id === user?.id) return alert("You cannot delete your own account.");
    try {
      await api.delete(`/auth/users.php?id=${deleteTarget.id}`);
      await fetchUsers();
      setModal(null);
    } catch { alert("Failed to delete user."); }
  };

  const f = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const roleColors = {
    admin: { bg: "#ede9fe", color: "#5b21b6" },
    pharmacist: { bg: "#d1fae5", color: "#065f46" },
  };

  const S = {
    pg: { padding: "28px 32px", fontFamily: "'Plus Jakarta Sans',sans-serif", background: "#f4f7fb", minHeight: "100vh" },
    card: { background: "#fff", borderRadius: 16, border: "1px solid #e8eef5", boxShadow: "0 1px 6px rgba(0,0,0,0.04)" },
    inp: (err) => ({ width: "100%", padding: "10px 13px", borderRadius: 10, fontSize: 13, fontFamily: "inherit", border: `1.5px solid ${err ? "#fca5a5" : "#e3eaf2"}`, outline: "none", color: "#0d1b2a", background: err ? "#fff8f8" : "#fff", boxSizing: "border-box" }),
    btn: (v) => ({ display: "inline-flex", alignItems: "center", gap: 6, padding: "9px 16px", borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", border: "none", background: v === "primary" ? "linear-gradient(135deg,#6366f1,#4f46e5)" : v === "danger" ? "#fee2e2" : "#fff", color: v === "primary" ? "#fff" : v === "danger" ? "#dc2626" : "#0d1b2a", ...(v === "outline" ? { border: "1.5px solid #e3eaf2" } : {}) }),
  };

  const kpis = [
    { icon: "👥", label: "Total Users", val: users.length, color: "#6366f1" },
    { icon: "💊", label: "Pharmacists", val: users.filter(u => u.role === "pharmacist").length, color: "#00e5c0" },
    { icon: "🔐", label: "Admins", val: users.filter(u => u.role === "admin").length, color: "#f59e0b" },
    { icon: "📅", label: "Latest Added", val: users.length > 0 ? new Date(users[0]?.created_at).toLocaleDateString("en-KE") : "—", color: "#f43f5e" },
  ];

  return (
    <div style={S.pg}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap'); @keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}`}</style>

      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 24 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <button onClick={() => navigate("/admin/dashboard")} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 13, color: "#8a9ab5", fontFamily: "inherit", fontWeight: 600 }}>← Dashboard</button>
          </div>
          <div style={{ fontSize: 24, fontWeight: 800, color: "#0d1b2a", letterSpacing: "-0.6px", marginTop: 4 }}>👥 User Management</div>
          <div style={{ fontSize: 13, color: "#8a9ab5", marginTop: 4 }}>Manage system users and their roles</div>
        </div>
        <button style={S.btn("primary")} onClick={openAdd}>＋ Add User</button>
      </div>

      {/* KPI Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 20 }}>
        {kpis.map((k, i) => (
          <div key={i} style={{ ...S.card, padding: 20 }}>
            <div style={{ fontSize: 22, marginBottom: 10 }}>{k.icon}</div>
            <div style={{ fontSize: 24, fontWeight: 800, color: "#0d1b2a", letterSpacing: "-0.7px", lineHeight: 1, marginBottom: 4 }}>{loading ? "…" : k.val}</div>
            <div style={{ fontSize: 11, color: "#8a9ab5", fontWeight: 600, textTransform: "uppercase" }}>{k.label}</div>
          </div>
        ))}
      </div>

      <div style={S.card}>
        <div style={{ display: "flex", gap: 10, padding: "16px 20px", borderBottom: "1px solid #f0f4f8" }}>
          <div style={{ position: "relative", flex: 1 }}>
            <span style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", fontSize: 13 }}>🔍</span>
            <input style={{ ...S.inp(false), paddingLeft: 34 }} placeholder="Search users..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#f8fafc" }}>
                {["User", "Email", "Role", "Created", "Actions"].map(h => (
                  <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#8a9ab5", textTransform: "uppercase", letterSpacing: "0.6px" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? [1, 2, 3].map(i => (
                <tr key={i}><td colSpan={5} style={{ padding: "12px 16px" }}><div style={{ height: 20, background: "linear-gradient(90deg,#f0f4f8 25%,#e8eef5 50%,#f0f4f8 75%)", backgroundSize: "200% 100%", animation: "shimmer 1.2s infinite", borderRadius: 8 }} /></td></tr>
              )) : filtered.map(u => {
                const rc = roleColors[u.role] || { bg: "#f1f5f9", color: "#64748b" };
                const isMe = u.id === user?.id;
                return (
                  <tr key={u.id} style={{ borderTop: "1px solid #f0f4f8" }}
                    onMouseEnter={e => e.currentTarget.style.background = "#fafcff"}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                    <td style={{ padding: "13px 16px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ width: 36, height: 36, borderRadius: 10, background: u.role === "admin" ? "linear-gradient(135deg,#6366f1,#4f46e5)" : "linear-gradient(135deg,#00e5c0,#0080ff)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800, fontSize: 14 }}>
                          {u.name.charAt(0)}
                        </div>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 700, color: "#0d1b2a" }}>{u.name} {isMe && <span style={{ fontSize: 10, color: "#6366f1", fontWeight: 700 }}>(You)</span>}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: "13px 16px", fontSize: 13, color: "#374151" }}>{u.email}</td>
                    <td style={{ padding: "13px 16px" }}>
                      <span style={{ fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 20, background: rc.bg, color: rc.color }}>{u.role}</span>
                    </td>
                    <td style={{ padding: "13px 16px", fontSize: 12, color: "#374151" }}>{new Date(u.created_at).toLocaleDateString("en-KE")}</td>
                    <td style={{ padding: "13px 16px" }}>
                      <div style={{ display: "flex", gap: 6 }}>
                        <button onClick={() => openEdit(u)} style={{ ...S.btn("outline"), padding: "6px 10px", fontSize: 12 }}>✏️</button>
                        {!isMe && <button onClick={() => { setDeleteTarget(u); setModal("delete"); }} style={{ ...S.btn("danger"), padding: "6px 10px", fontSize: 12 }}>🗑</button>}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div style={{ padding: "13px 20px", borderTop: "1px solid #f0f4f8", fontSize: 12, color: "#8a9ab5", fontWeight: 600 }}>
          {filtered.length} users
        </div>
      </div>

      {/* Add/Edit Modal */}
      {modal === "form" && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(13,27,42,0.5)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200, padding: 20 }}>
          <div style={{ background: "#fff", borderRadius: 20, width: "100%", maxWidth: 460, boxShadow: "0 24px 64px rgba(0,0,0,0.15)" }}>
            <div style={{ padding: "22px 24px", borderBottom: "1px solid #f0f4f8", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ fontSize: 17, fontWeight: 800, color: "#0d1b2a" }}>{editId ? "✏️ Edit User" : "➕ Add User"}</div>
              <button onClick={() => setModal(null)} style={{ background: "none", border: "none", fontSize: 18, cursor: "pointer", color: "#8a9ab5" }}>✕</button>
            </div>
            <div style={{ padding: "22px 24px", display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: "#374151", display: "block", marginBottom: 6 }}>Full Name</label>
                <input style={S.inp(errors.name)} placeholder="e.g. John Doe" value={form.name} onChange={e => f("name", e.target.value)} />
                {errors.name && <div style={{ fontSize: 11, color: "#dc2626", marginTop: 3 }}>{errors.name}</div>}
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: "#374151", display: "block", marginBottom: 6 }}>Email Address</label>
                <input style={S.inp(errors.email)} placeholder="e.g. john@pharma.com" value={form.email} onChange={e => f("email", e.target.value)} />
                {errors.email && <div style={{ fontSize: 11, color: "#dc2626", marginTop: 3 }}>{errors.email}</div>}
              </div>
              {!editId && (
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: "#374151", display: "block", marginBottom: 6 }}>Password</label>
                  <input type="password" style={S.inp(errors.password)} placeholder="Minimum 6 characters" value={form.password} onChange={e => f("password", e.target.value)} />
                  {errors.password && <div style={{ fontSize: 11, color: "#dc2626", marginTop: 3 }}>{errors.password}</div>}
                </div>
              )}
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: "#374151", display: "block", marginBottom: 6 }}>Role</label>
                <select style={S.inp(false)} value={form.role} onChange={e => f("role", e.target.value)}>
                  <option value="pharmacist">💊 Pharmacist</option>
                  <option value="admin">🔐 Admin</option>
                </select>
              </div>
            </div>
            <div style={{ padding: "16px 24px", borderTop: "1px solid #f0f4f8", display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button style={S.btn("outline")} onClick={() => setModal(null)}>Cancel</button>
              <button style={S.btn("primary")} onClick={handleSave} disabled={saving}>{saving ? "Saving..." : editId ? "Save Changes" : "Add User"}</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {modal === "delete" && deleteTarget && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(13,27,42,0.5)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200, padding: 20 }}>
          <div style={{ background: "#fff", borderRadius: 20, width: "100%", maxWidth: 380, padding: 28, boxShadow: "0 24px 64px rgba(0,0,0,0.15)", textAlign: "center" }}>
            <div style={{ fontSize: 44, marginBottom: 14 }}>🗑️</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: "#0d1b2a", marginBottom: 8 }}>Delete User?</div>
            <div style={{ fontSize: 13, color: "#8a9ab5", marginBottom: 22 }}>Are you sure you want to delete <strong style={{ color: "#0d1b2a" }}>{deleteTarget.name}</strong>? This action cannot be undone.</div>
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