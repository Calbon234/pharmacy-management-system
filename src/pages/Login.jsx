import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import bgImage from "../assets/hospital-pharmacy.jpg";
import "./Login.css";

export default function Login() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const [loginType, setLoginType] = useState("pharmacist");
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
      const user = data.data.user;
      if (loginType === "pharmacist" && user.role !== "pharmacist") return setError("This account is not a pharmacist account.");
      if (loginType === "admin" && user.role !== "admin") return setError("This account is not an admin account.");
      login({ ...user, token: data.data.token });
      setSuccess(true);
      setTimeout(() => navigate(user.role === "admin" ? "/admin/dashboard" : "/dashboard"), 1000);
    } catch (err) {
      setError("Cannot connect to server. Make sure XAMPP is running.");
    } finally {
      setLoading(false);
    }
  };

  const isAdmin = loginType === "admin";

  return (
    <div className="login-page">

      {/* LEFT — image panel */}
      <div className="login-left" style={{ backgroundImage: `url(${bgImage})` }}>
        <div className="login-left-overlay">
          <div className="login-branding">
            <div className="login-logo"></div>
            <div className="login-logo-name">Pharma<span>Sys</span></div>
          </div>
          <h1 className="login-headline">
            Your pharmacy,<br />
            <span>smarter.</span>
          </h1>
          <p className="login-subtext">
            One platform for inventory, prescriptions, sales and more.
          </p>
        </div>
      </div>

      {/* RIGHT — form panel */}
      <div className="login-right">
        <div className="login-card">

          {!success ? (
            <>
              <div className="login-card-header">
                <h2>Welcome back 👋</h2>
                <p>Sign in to continue</p>
              </div>

              {/* Role Toggle */}
              <div className="role-section">
                <div className="role-label">Login As</div>
                <div className="role-toggle">
                  {[
                    { type: "pharmacist", icon: "💊", label: "Pharmacist", color: "#00e5c0" },
                    { type: "admin",      icon: "🔐", label: "Admin",      color: "#818cf8" },
                  ].map(r => (
                    <button
                      key={r.type}
                      className={`role-btn ${loginType === r.type ? "role-btn--active" : ""}`}
                      style={loginType === r.type ? { borderColor: r.color, color: r.color } : {}}
                      onClick={() => { setLoginType(r.type); setError(""); }}
                    >
                      <span className="role-icon">{r.icon}</span>
                      <span className="role-name">{r.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {error && <div className="login-error">⚠️ {error}</div>}

              <form onSubmit={handleSubmit} noValidate>
                <div className="form-group">
                  <label>Email address</label>
                  <input
                    className="login-inp"
                    type="email"
                    placeholder={isAdmin ? "sysadmin@pharmasys.com" : "admin@pharma.com"}
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label>Password</label>
                  <div className="password-wrap">
                    <input
                      className="login-inp"
                      type={showPass ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                    />
                    <button type="button" className="toggle-pass" onClick={() => setShowPass(!showPass)}>
                      {showPass ? "" : "👁️"}
                    </button>
                  </div>
                </div>

                <div className="forgot-wrap">
                  <span className="forgot-link">Forgot password?</span>
                </div>

                <button
                  type="submit"
                  className={`sign-btn ${isAdmin ? "sign-btn--admin" : "sign-btn--pharmacist"}`}
                  disabled={loading}
                >
                  {loading
                    ? <span className="spinner" />
                    : `Sign in as ${isAdmin ? "Admin" : "Pharmacist"}`
                  }
                </button>
              </form>
            </>
          ) : (
            <div className="login-success">
              <div className="success-icon">✅</div>
              <h2>Welcome back!</h2>
              <p>Taking you to your dashboard...</p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}