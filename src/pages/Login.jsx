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
      fontFamily: "'Plus Jakarta Sans', sans-serif",
      position: "relative",
      overflow: "hidden",
      background: "#f0f7ff",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes float1 { 0%,100%{transform:translateY(0) rotate(-15deg);} 50%{transform:translateY(-18px) rotate(-15deg);} }
        @keyframes float2 { 0%,100%{transform:translateY(0) rotate(10deg);} 50%{transform:translateY(-14px) rotate(10deg);} }
        @keyframes float3 { 0%,100%{transform:translateY(0) rotate(-8deg);} 50%{transform:translateY(-20px) rotate(-8deg);} }
        @keyframes float4 { 0%,100%{transform:translateY(0) rotate(20deg);} 50%{transform:translateY(-12px) rotate(20deg);} }
        @keyframes float5 { 0%,100%{transform:translateY(0) rotate(-5deg);} 50%{transform:translateY(-16px) rotate(-5deg);} }
        @keyframes fadeIn { from{opacity:0;transform:translateY(20px);}to{opacity:1;transform:translateY(0);} }
        .login-inp:focus { border-color: #2196f3 !important; box-shadow: 0 0 0 3px rgba(33,150,243,0.1) !important; outline: none; }
        .login-btn:hover { background: #1976d2 !important; transform: translateY(-1px); }
        .login-card { animation: fadeIn 0.5s ease both; }
      `}</style>

      {/* Floating medicine items — scattered around */}
      {[
        { emoji: "💊", size: 52, top: "8%", left: "6%", anim: "float1 4s ease-in-out infinite", opacity: 0.7 },
        { emoji: "🩺", size: 48, top: "15%", right: "8%", anim: "float2 5s ease-in-out infinite", opacity: 0.6 },
        { emoji: "🧴", size: 44, top: "55%", left: "4%", anim: "float3 4.5s ease-in-out infinite", opacity: 0.65 },
        { emoji: "💉", size: 46, bottom: "12%", right: "6%", anim: "float4 3.8s ease-in-out infinite", opacity: 0.6 },
        { emoji: "🩻", size: 50, bottom: "20%", left: "8%", anim: "float5 4.2s ease-in-out infinite", opacity: 0.55 },
        { emoji: "🔬", size: 42, top: "40%", right: "5%", anim: "float1 5.5s ease-in-out infinite", opacity: 0.5 },
        { emoji: "💊", size: 36, top: "70%", right: "12%", anim: "float2 4.8s ease-in-out infinite", opacity: 0.45 },
        { emoji: "🧪", size: 40, top: "25%", left: "14%", anim: "float3 3.5s ease-in-out infinite", opacity: 0.5 },
        { emoji: "🏥", size: 44, bottom: "35%", right: "14%", anim: "float4 4s ease-in-out infinite", opacity: 0.45 },
        { emoji: "💊", size: 38, top: "5%", left: "40%", anim: "float5 6s ease-in-out infinite", opacity: 0.4 },
      ].map((item, i) => (
        <div key={i} style={{
          position: "absolute",
          fontSize: item.size,
          top: item.top,
          left: item.left,
          right: item.right,
          bottom: item.bottom,
          animation: item.anim,
          opacity: item.opacity,
          pointerEvents: "none",
          userSelect: "none",
          filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.1))",
        }}>
          {item.emoji}
        </div>
      ))}

      {/* Background blobs */}
      <div style={{ position: "absolute", width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle, rgba(33,150,243,0.08) 0%, transparent 70%)", top: "10%", left: "10%", pointerEvents: "none" }} />
      <div style={{ position: "absolute", width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, rgba(0,229,192,0.07) 0%, transparent 70%)", bottom: "10%", right: "10%", pointerEvents: "none" }} />

      {/* Login Card */}
      <div className="login-card" style={{
        background: "#fff",
        borderRadius: 24,
        padding: "48px 44px",
        width: "100%",
        maxWidth: 420,
        boxShadow: "0 24px 80px rgba(0,0,0,0.12)",
        position: "relative",
        zIndex: 10,
      }}>

        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{
            width: 60, height: 60,
            background: "linear-gradient(135deg, #2196f3, #00bcd4)",
            borderRadius: 18,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 28, margin: "0 auto 14px",
            boxShadow: "0 8px 24px rgba(33,150,243,0.3)",
          }}>💊</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: "#0d1b2a", letterSpacing: "-0.5px" }}>
            Pharma<span style={{ color: "#2196f3" }}>Sys</span>
          </div>
        </div>

        {!success ? (
          <>
            <div style={{ marginBottom: 28, textAlign: "center" }}>
              <h1 style={{ fontSize: 24, fontWeight: 800, color: "#0d1b2a", margin: 0, marginBottom: 6, letterSpacing: "-0.5px" }}>Welcome back</h1>
              <p style={{ fontSize: 13, color: "#9aa5b4", margin: 0 }}>Sign in to your pharmacy dashboard</p>
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
              <div style={{ marginBottom: 18 }}>
                <label style={{ fontSize: 13, fontWeight: 600, color: "#374151", display: "block", marginBottom: 8 }}>
                  Email address
                </label>
                <input
                  className="login-inp"
                  type="email"
                  placeholder="admin@pharma.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  style={{
                    width: "100%", padding: "13px 16px",
                    border: "1.5px solid #e8eef5", borderRadius: 12,
                    fontSize: 14, fontFamily: "inherit", color: "#0d1b2a",
                    background: "#fff", boxSizing: "border-box", transition: "all 0.2s",
                  }}
                />
              </div>

              <div style={{ marginBottom: 8 }}>
                <label style={{ fontSize: 13, fontWeight: 600, color: "#374151", display: "block", marginBottom: 8 }}>
                  Password
                </label>
                <div style={{ position: "relative" }}>
                  <input
                    className="login-inp"
                    type={showPass ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    style={{
                      width: "100%", padding: "13px 44px 13px 16px",
                      border: "1.5px solid #e8eef5", borderRadius: 12,
                      fontSize: 14, fontFamily: "inherit", color: "#0d1b2a",
                      background: "#fff", boxSizing: "border-box", transition: "all 0.2s",
                    }}
                  />
                  <button type="button" onClick={() => setShowPass(!showPass)} style={{
                    position: "absolute", right: 14, top: "50%",
                    transform: "translateY(-50%)", background: "none",
                    border: "none", cursor: "pointer", fontSize: 15, color: "#9aa5b4", padding: 0,
                  }}>
                    {showPass ? "🙈" : "👁️"}
                  </button>
                </div>
              </div>

              <div style={{ textAlign: "right", marginBottom: 24 }}>
                <span style={{ fontSize: 13, color: "#2196f3", fontWeight: 600, cursor: "pointer" }}>
                  Forgot password?
                </span>
              </div>

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
                }}>
                {loading
                  ? <div style={{ width: 18, height: 18, border: "2px solid rgba(255,255,255,0.4)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.6s linear infinite" }} />
                  : "Sign In"
                }
              </button>
            </form>
          </>
        ) : (
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <div style={{ fontSize: 56, marginBottom: 16 }}>✅</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: "#0d1b2a", marginBottom: 8 }}>Welcome back!</div>
            <div style={{ fontSize: 14, color: "#9aa5b4" }}>Taking you to your dashboard...</div>
          </div>
        )}
      </div>
    </div>
  );
}