import { useState, useContext, useRef } from "react";
import { AuthContext } from "../context/AuthContext";

export default function Settings() {
  const { user, logout, login } = useContext(AuthContext);
  const [tab, setTab] = useState("profile");
  const [saved, setSaved] = useState(false);
  const [photo, setPhoto] = useState(user?.photo || null);
  const fileRef = useRef();

  const [profile, setProfile] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: "",
    pharmacy_name: "PharmaSys Pharmacy",
    address: "Nairobi, Kenya",
  });

  const [passwords, setPasswords] = useState({
    current: "", newPass: "", confirm: ""
  });

  const [prefs, setPrefs] = useState({
    low_stock_alert: true,
    expiry_alert: true,
    vat_rate: "16",
    currency: "KES",
  });

  const [passError, setPassError] = useState("");

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const photoData = ev.target.result;
      setPhoto(photoData);
      try {
        await fetch("http://localhost/pharmasys-backend/api/auth/update-photo.php", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + user.token
          },
          body: JSON.stringify({ id: user.id, photo: photoData })
        });
        const stored = JSON.parse(localStorage.getItem("pharma_user") || "{}");
        stored.photo = photoData;
        localStorage.setItem("pharma_user", JSON.stringify(stored));
        login({ ...stored });
      } catch (e) { console.error(e); }
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = async () => {
    setPhoto(null);
    try {
      await fetch("http://localhost/pharmasys-backend/api/auth/update-photo.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + user.token
        },
        body: JSON.stringify({ id: user.id, photo: null })
      });
      const stored = JSON.parse(localStorage.getItem("pharma_user") || "{}");
      stored.photo = null;
      localStorage.setItem("pharma_user", JSON.stringify(stored));
      login({ ...stored });
    } catch (e) { console.error(e); }
  };

  const handleSaveProfile = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleSavePassword = async () => {
    setPassError("");
    if (!passwords.current) return setPassError("Enter your current password.");
    if (passwords.newPass.length < 6) return setPassError("New password must be at least 6 characters.");
    if (passwords.newPass !== passwords.confirm) return setPassError("Passwords do not match.");
    try {
      const res = await fetch("http://localhost/pharmasys-backend/api/auth/change-password.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + user.token
        },
        body: JSON.stringify({
          id: user.id,
          current_password: passwords.current,
          new_password: passwords.newPass,
        })
      });
      const data = await res.json();
      if (!data.success) return setPassError(data.message);
      setSaved(true);
      setPasswords({ current: "", newPass: "", confirm: "" });
      setTimeout(() => setSaved(false), 2500);
    } catch (e) {
      setPassError("Failed to connect to server.");
    }
  };

  const handleSavePrefs = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const S = {
    pg: { padding: "28px 32px", fontFamily: "'Plus Jakarta Sans',sans-serif", background: "#f4f7fb", minHeight: "100vh" },
    card: { background: "#fff", borderRadius: 16, border: "1px solid #e8eef5", boxShadow: "0 1px 6px rgba(0,0,0,0.04)" },
    inp: { width: "100%", padding: "10px 13px", borderRadius: 10, fontSize: 13, fontFamily: "inherit", border: "1.5px solid #e3eaf2", outline: "none", color: "#0d1b2a", background: "#fff", boxSizing: "border-box" },
    label: { fontSize: 12, fontWeight: 700, color: "#374151", display: "block", marginBottom: 6 },
    btn: (v) => ({ display: "inline-flex", alignItems: "center", gap: 6, padding: "10px 20px", borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", border: "none", background: v === "primary" ? "linear-gradient(135deg,#00e5c0,#0080ff)" : v === "danger" ? "linear-gradient(135deg,#f43f5e,#e11d48)" : "#fff", color: v === "primary" || v === "danger" ? "#fff" : "#0d1b2a", ...(v === "outline" ? { border: "1.5px solid #e3eaf2" } : {}) }),
  };

  const tabs = [
    { key: "profile", icon: "👤", label: "Profile" },
    { key: "password", icon: "🔒", label: "Password" },
    { key: "preferences", icon: "⚙️", label: "Preferences" },
    { key: "danger", icon: "🚨", label: "Danger Zone" },
  ];

  return (
    <div style={S.pg}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');`}</style>

      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 24, fontWeight: 800, color: "#0d1b2a", letterSpacing: "-0.6px" }}>Settings</div>
        <div style={{ fontSize: 13, color: "#8a9ab5", marginTop: 4 }}>Manage your account and preferences</div>
      </div>

      {saved && (
        <div style={{ position: "fixed", top: 24, right: 24, background: "#0d1b2a", color: "#fff", padding: "12px 20px", borderRadius: 12, fontSize: 13, fontWeight: 700, zIndex: 999, display: "flex", alignItems: "center", gap: 8, boxShadow: "0 8px 24px rgba(0,0,0,0.2)" }}>
          ✅ Changes saved successfully
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "220px 1fr", gap: 20 }}>

        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <div style={{ ...S.card, padding: 20, textAlign: "center", marginBottom: 8 }}>
            <div style={{ position: "relative", width: 80, height: 80, margin: "0 auto 12px" }}>
              {photo ? (
                <img src={photo} alt="Profile" style={{ width: 80, height: 80, borderRadius: 20, objectFit: "cover", border: "3px solid #e8eef5" }} />
              ) : (
                <div style={{ width: 80, height: 80, borderRadius: 20, background: "linear-gradient(135deg,#00e5c0,#0080ff)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, fontWeight: 800, color: "#fff" }}>
                  {(user?.name || "P").charAt(0)}
                </div>
              )}
              <button onClick={() => fileRef.current.click()} style={{ position: "absolute", bottom: -6, right: -6, width: 26, height: 26, borderRadius: "50%", background: "#0d1b2a", border: "2px solid #fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12 }}>
                📷
              </button>
              <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handlePhotoChange} />
            </div>
            <div style={{ fontSize: 14, fontWeight: 800, color: "#0d1b2a" }}>{user?.name || "Pharmacist"}</div>
            <div style={{ fontSize: 11, color: "#8a9ab5", marginTop: 3 }}>{user?.email || ""}</div>
            <div style={{ fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 20, background: "rgba(0,229,192,0.1)", color: "#00b89c", marginTop: 8, display: "inline-block" }}>{user?.role || "pharmacist"}</div>
            {photo && (
              <div style={{ marginTop: 10 }}>
                <button onClick={handleRemovePhoto} style={{ fontSize: 11, color: "#f43f5e", background: "none", border: "none", cursor: "pointer", fontFamily: "inherit", fontWeight: 600 }}>
                  Remove photo
                </button>
              </div>
            )}
          </div>

          {tabs.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)} style={{ display: "flex", alignItems: "center", gap: 10, padding: "11px 14px", borderRadius: 12, border: tab === t.key ? "none" : "1px solid #e8eef5", background: tab === t.key ? "#0d1b2a" : "#fff", color: tab === t.key ? "#fff" : "#374151", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", textAlign: "left", boxShadow: tab === t.key ? "0 4px 14px rgba(13,27,42,0.15)" : "0 1px 4px rgba(0,0,0,0.04)" }}>
              <span>{t.icon}</span> {t.label}
            </button>
          ))}
        </div>

        <div style={S.card}>

          {tab === "profile" && (
            <div>
              <div style={{ padding: "22px 24px", borderBottom: "1px solid #f0f4f8" }}>
                <div style={{ fontSize: 17, fontWeight: 800, color: "#0d1b2a" }}>👤 Profile Information</div>
                <div style={{ fontSize: 12, color: "#8a9ab5", marginTop: 3 }}>Update your personal and pharmacy details</div>
              </div>
              <div style={{ padding: "24px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
                <div>
                  <label style={S.label}>Full Name</label>
                  <input style={S.inp} value={profile.name} onChange={e => setProfile(p => ({ ...p, name: e.target.value }))} />
                </div>
                <div>
                  <label style={S.label}>Email Address</label>
                  <input style={S.inp} value={profile.email} onChange={e => setProfile(p => ({ ...p, email: e.target.value }))} />
                </div>
                <div>
                  <label style={S.label}>Phone Number</label>
                  <input style={S.inp} placeholder="+254 700 000 000" value={profile.phone} onChange={e => setProfile(p => ({ ...p, phone: e.target.value }))} />
                </div>
                <div>
                  <label style={S.label}>Pharmacy Name</label>
                  <input style={S.inp} value={profile.pharmacy_name} onChange={e => setProfile(p => ({ ...p, pharmacy_name: e.target.value }))} />
                </div>
                <div style={{ gridColumn: "1/-1" }}>
                  <label style={S.label}>Address</label>
                  <input style={S.inp} value={profile.address} onChange={e => setProfile(p => ({ ...p, address: e.target.value }))} />
                </div>
              </div>
              <div style={{ padding: "16px 24px", borderTop: "1px solid #f0f4f8", display: "flex", justifyContent: "flex-end" }}>
                <button style={S.btn("primary")} onClick={handleSaveProfile}>Save Changes</button>
              </div>
            </div>
          )}

          {tab === "password" && (
            <div>
              <div style={{ padding: "22px 24px", borderBottom: "1px solid #f0f4f8" }}>
                <div style={{ fontSize: 17, fontWeight: 800, color: "#0d1b2a" }}>🔒 Change Password</div>
                <div style={{ fontSize: 12, color: "#8a9ab5", marginTop: 3 }}>Keep your account secure</div>
              </div>
              <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: 18, maxWidth: 400 }}>
                {passError && (
                  <div style={{ background: "#fee2e2", border: "1px solid #fecaca", borderRadius: 10, padding: "10px 14px", fontSize: 13, color: "#dc2626", fontWeight: 600 }}>⚠️ {passError}</div>
                )}
                {[
                  { key: "current", label: "Current Password" },
                  { key: "newPass", label: "New Password" },
                  { key: "confirm", label: "Confirm New Password" },
                ].map(({ key, label }) => (
                  <div key={key}>
                    <label style={S.label}>{label}</label>
                    <input type="password" style={S.inp} value={passwords[key]} onChange={e => setPasswords(p => ({ ...p, [key]: e.target.value }))} />
                  </div>
                ))}
              </div>
              <div style={{ padding: "16px 24px", borderTop: "1px solid #f0f4f8", display: "flex", justifyContent: "flex-end" }}>
                <button style={S.btn("primary")} onClick={handleSavePassword}>Update Password</button>
              </div>
            </div>
          )}

          {tab === "preferences" && (
            <div>
              <div style={{ padding: "22px 24px", borderBottom: "1px solid #f0f4f8" }}>
                <div style={{ fontSize: 17, fontWeight: 800, color: "#0d1b2a" }}>⚙️ Preferences</div>
                <div style={{ fontSize: 12, color: "#8a9ab5", marginTop: 3 }}>Customize system behaviour</div>
              </div>
              <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: 20 }}>
                {[
                  { key: "low_stock_alert", label: "Low Stock Alerts", desc: "Get notified when medicines fall below minimum stock" },
                  { key: "expiry_alert", label: "Expiry Alerts", desc: "Get notified when medicines are expiring within 30 days" },
                ].map(({ key, label, desc }) => (
                  <div key={key} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px", background: "#f8fafc", borderRadius: 12, border: "1px solid #edf2f7" }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: "#0d1b2a" }}>{label}</div>
                      <div style={{ fontSize: 11, color: "#8a9ab5", marginTop: 2 }}>{desc}</div>
                    </div>
                    <div onClick={() => setPrefs(p => ({ ...p, [key]: !p[key] }))} style={{ width: 44, height: 24, borderRadius: 12, background: prefs[key] ? "#00e5c0" : "#e3eaf2", cursor: "pointer", position: "relative", transition: "background 0.2s" }}>
                      <div style={{ width: 18, height: 18, borderRadius: "50%", background: "#fff", position: "absolute", top: 3, left: prefs[key] ? 23 : 3, transition: "left 0.2s", boxShadow: "0 1px 4px rgba(0,0,0,0.15)" }} />
                    </div>
                  </div>
                ))}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  <div>
                    <label style={S.label}>VAT Rate (%)</label>
                    <input style={S.inp} value={prefs.vat_rate} onChange={e => setPrefs(p => ({ ...p, vat_rate: e.target.value }))} />
                  </div>
                  <div>
                    <label style={S.label}>Currency</label>
                    <select style={S.inp} value={prefs.currency} onChange={e => setPrefs(p => ({ ...p, currency: e.target.value }))}>
                      <option>KES</option>
                      <option>USD</option>
                      <option>EUR</option>
                      <option>GBP</option>
                    </select>
                  </div>
                </div>
              </div>
              <div style={{ padding: "16px 24px", borderTop: "1px solid #f0f4f8", display: "flex", justifyContent: "flex-end" }}>
                <button style={S.btn("primary")} onClick={handleSavePrefs}>Save Preferences</button>
              </div>
            </div>
          )}

          {tab === "danger" && (
            <div>
              <div style={{ padding: "22px 24px", borderBottom: "1px solid #f0f4f8" }}>
                <div style={{ fontSize: 17, fontWeight: 800, color: "#dc2626" }}>🚨 Danger Zone</div>
                <div style={{ fontSize: 12, color: "#8a9ab5", marginTop: 3 }}>Irreversible actions — proceed with caution</div>
              </div>
              <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: 14 }}>
                {[
                  { icon: "🚪", title: "Log Out", desc: "Sign out of your current session", action: logout, label: "Log Out", style: "outline" },
                  { icon: "🗑️", title: "Clear All Sales History", desc: "Permanently delete all sales records from the database", action: () => alert("This feature requires backend implementation."), label: "Clear Sales", style: "danger" },
                ].map((item, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 18px", background: "#f8fafc", borderRadius: 12, border: `1px solid ${item.style === "danger" ? "#fecaca" : "#edf2f7"}` }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <span style={{ fontSize: 22 }}>{item.icon}</span>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: "#0d1b2a" }}>{item.title}</div>
                        <div style={{ fontSize: 11, color: "#8a9ab5", marginTop: 2 }}>{item.desc}</div>
                      </div>
                    </div>
                    <button style={S.btn(item.style)} onClick={item.action}>{item.label}</button>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}