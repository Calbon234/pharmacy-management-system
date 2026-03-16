import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

export default function Login() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!email) return setError("Please enter your email address.");
    if (!password) return setError("Please enter your password.");
    setLoading(true);
    try {
      const response = await fetch("http://localhost/pharmasys-backend/api/auth/login.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (!data.success) return setError(data.message || "Invalid email or password.");
      login({ ...data.data.user, token: data.data.token });
      setSuccess(true);
      setTimeout(() => navigate("/dashboard"), 1000);
    } catch (err) {
      setError("Cannot connect to server. Make sure XAMPP is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "#f0f4f8",
      fontFamily: "'Plus Jakarta Sans', sans-serif",
      padding: 20,
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .login-input:focus { border-color: #2196f3 !important; box-shadow: 0 0 0 3px rgba(33,150,243,0.1) !important; }
        .login-btn:hover { background: #1976d2 !important; }
        .login-card { animation: fadeIn 0.4s ease both; }
      `}</style>

      <div className="login-card" style={{
        background: "#fff",
        borderRadius: 24,
        overflow: "hidden",
        width: "100%",
        maxWidth: 900,
        display: "flex",
        boxShadow: "0 20px 60px rgba(0,0,0,0.12)",
        minHeight: 540,
      }}>

        {/* LEFT — Form */}
        <div style={{
          flex: 1,
          padding: "48px 52px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }}>

          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 36 }}>
            <div style={{
              width: 38, height: 38,
              background: "#2196f3",
              borderRadius: 10,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 20, color: "#fff", fontWeight: 800,
            }}>+</div>
            <span style={{ fontSize: 20, fontWeight: 800, color: "#1a1a2e" }}>PharmaSys</span>
          </div>

          {!success ? (
            <>
              <div style={{ marginBottom: 32 }}>
                <h1 style={{ fontSize: 28, fontWeight: 800, color: "#1a1a2e", margin: 0, marginBottom: 8 }}>Welcome back</h1>
                <p style={{ fontSize: 14, color: "#9aa5b4", margin: 0 }}>Sign in to your pharmacy dashboard</p>
              </div>

              {error && (
                <div style={{
                  background: "#fff5f5", border: "1px solid #fecaca",
                  borderRadius: 10, padding: "10px 14px",
                  fontSize: 13, color: "#dc2626", marginBottom: 20,
                  display: "flex", alignItems: "center", gap: 8,
                }}>
                  ⚠️ {error}
                </div>
              )}

              <form onSubmit={handleSubmit} noValidate>
                {/* Email */}
                <div style={{ marginBottom: 20 }}>
                  <label style={{ fontSize: 13, fontWeight: 600, color: "#374151", display: "block", marginBottom: 8 }}>
                    Email address
                  </label>
                  <input
                    className="login-input"
                    type="email"
                    placeholder="Enter your Email address"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    style={{
                      width: "100%", padding: "13px 16px",
                      border: "1.5px solid #e8eef5", borderRadius: 12,
                      fontSize: 14, fontFamily: "inherit", color: "#1a1a2e",
                      outline: "none", background: "#fff",
                      boxSizing: "border-box", transition: "all 0.2s",
                    }}
                  />
                </div>

                {/* Password */}
                <div style={{ marginBottom: 8 }}>
                  <label style={{ fontSize: 13, fontWeight: 600, color: "#374151", display: "block", marginBottom: 8 }}>
                    Password
                  </label>
                  <div style={{ position: "relative" }}>
                    <input
                      className="login-input"
                      type={showPass ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      style={{
                        width: "100%", padding: "13px 44px 13px 16px",
                        border: "1.5px solid #e8eef5", borderRadius: 12,
                        fontSize: 14, fontFamily: "inherit", color: "#1a1a2e",
                        outline: "none", background: "#fff",
                        boxSizing: "border-box", transition: "all 0.2s",
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass(!showPass)}
                      style={{
                        position: "absolute", right: 14, top: "50%",
                        transform: "translateY(-50%)", background: "none",
                        border: "none", cursor: "pointer", fontSize: 15,
                        color: "#9aa5b4", padding: 0,
                      }}>
                      {showPass ? "🙈" : "👁️"}
                    </button>
                  </div>
                </div>

                {/* Forgot password */}
                <div style={{ textAlign: "left", marginBottom: 28 }}>
                  <span style={{ fontSize: 13, color: "#2196f3", fontWeight: 600, cursor: "pointer" }}>
                    forgot password?
                  </span>
                </div>

                {/* Login button */}
                <button
                  className="login-btn"
                  type="submit"
                  disabled={loading}
                  style={{
                    width: "100%", padding: "14px",
                    background: loading ? "#90caf9" : "#2196f3",
                    border: "none", borderRadius: 50,
                    color: "#fff", fontSize: 15, fontWeight: 700,
                    cursor: loading ? "not-allowed" : "pointer",
                    fontFamily: "inherit", transition: "all 0.2s",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                    marginBottom: 16,
                  }}>
                  {loading
                    ? <div style={{ width: 18, height: 18, border: "2px solid rgba(255,255,255,0.4)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.6s linear infinite" }} />
                    : "Login account"
                  }
                </button>

                {/* Divider */}
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                  <div style={{ flex: 1, height: 1, background: "#e8eef5" }} />
                  <span style={{ fontSize: 12, color: "#9aa5b4", fontWeight: 600 }}>OR</span>
                  <div style={{ flex: 1, height: 1, background: "#e8eef5" }} />
                </div>

                {/* Google button */}
                <button
                  type="button"
                  style={{
                    width: "100%", padding: "13px",
                    background: "#fff", border: "1.5px solid #e8eef5",
                    borderRadius: 50, color: "#374151",
                    fontSize: 14, fontWeight: 600,
                    cursor: "pointer", fontFamily: "inherit",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = "#2196f3"}
                  onMouseLeave={e => e.currentTarget.style.borderColor = "#e8eef5"}
                >
                  <svg width="18" height="18" viewBox="0 0 48 48">
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                  </svg>
                  Continue with Google
                </button>

              </form>
            </>
          ) : (
            <div style={{ textAlign: "center", padding: "32px 0" }}>
              <div style={{ fontSize: 56, marginBottom: 16 }}>✅</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: "#1a1a2e", marginBottom: 8 }}>Welcome back!</div>
              <div style={{ fontSize: 14, color: "#9aa5b4" }}>Taking you to your dashboard...</div>
            </div>
          )}
        </div>

        {/* RIGHT — Image */}
        <div style={{
          width: 420,
          background: "linear-gradient(135deg, #e3f2fd 0%, #bbdefb 50%, #e1f5fe 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          overflow: "hidden",
          flexShrink: 0,
        }}>
          {/* Background circles */}
          <div style={{ position: "absolute", width: 300, height: 300, borderRadius: "50%", background: "rgba(33,150,243,0.08)", top: -50, right: -50 }} />
          <div style={{ position: "absolute", width: 200, height: 200, borderRadius: "50%", background: "rgba(33,150,243,0.06)", bottom: -30, left: -30 }} />

          {/* Content */}
          <div style={{ textAlign: "center", position: "relative", zIndex: 1, padding: 40 }}>
            <div style={{ fontSize: 90, marginBottom: 20 }}>💊</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: "#1565c0", marginBottom: 10 }}>PharmaSys</div>
            <div style={{ fontSize: 14, color: "#1976d2", lineHeight: 1.7, maxWidth: 260, margin: "0 auto" }}>
              Your complete pharmacy management platform. Manage medicines, prescriptions, patients and sales all in one place.
            </div>

            <div style={{ display: "flex", justifyContent: "center", gap: 20, marginTop: 32 }}>
              {[
                { icon: "💊", label: "Medicines" },
                { icon: "👥", label: "Patients" },
                { icon: "🧾", label: "Sales" },
              ].map((item, i) => (
                <div key={i} style={{
                  background: "rgba(255,255,255,0.7)",
                  borderRadius: 14, padding: "12px 16px",
                  backdropFilter: "blur(10px)",
                  textAlign: "center",
                }}>
                  <div style={{ fontSize: 22, marginBottom: 4 }}>{item.icon}</div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#1565c0" }}>{item.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}