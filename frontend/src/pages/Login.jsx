import { useState } from "react";
import { useLocation, useNavigate, Navigate } from "react-router-dom";

function Login({ isAuthenticated, onLogin }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const redirectTo = location.state?.from?.pathname || null;

  if (isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const response = await fetch("http://localhost:3001/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ username, password })
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.error || "Login failed");
      }

      onLogin(data);
      navigate(redirectTo || (data.user.role === "admin" ? "/settings" : "/"), { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        padding: "2rem",
        background:
          "linear-gradient(135deg, rgba(12,12,12,1) 0%, rgba(38,38,38,1) 55%, rgba(253,180,20,0.9) 100%)"
      }}
    >
      <form
        onSubmit={handleSubmit}
        style={{
          width: "100%",
          maxWidth: "420px",
          backgroundColor: "#ffffff",
          padding: "2rem",
          borderRadius: "18px",
          boxShadow: "0 18px 60px rgba(0,0,0,0.22)"
        }}
      >
        <p style={{ margin: 0, color: "#666", textTransform: "uppercase", letterSpacing: "0.08em" }}>
          Staff Access
        </p>
        <h1 style={{ marginTop: "0.5rem", marginBottom: "1.5rem" }}>
          Sign in to manage the vending machine
        </h1>

        <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "bold" }}>
          Username
        </label>
        <input
          type="text"
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          required
          style={{
            width: "100%",
            padding: "0.85rem 1rem",
            marginBottom: "1rem",
            borderRadius: "10px",
            border: "1px solid #cfcfcf"
          }}
        />

        <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "bold" }}>
          Password
        </label>
        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
          style={{
            width: "100%",
            padding: "0.85rem 1rem",
            marginBottom: "1rem",
            borderRadius: "10px",
            border: "1px solid #cfcfcf"
          }}
        />

        {error && (
          <div
            style={{
              marginBottom: "1rem",
              padding: "0.75rem 1rem",
              borderRadius: "10px",
              backgroundColor: "#f8d7da",
              color: "#721c24"
            }}
          >
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          style={{
            width: "100%",
            padding: "0.9rem 1rem",
            border: "none",
            borderRadius: "10px",
            backgroundColor: "#0c0c0c",
            color: "#ffffff",
            fontWeight: "bold",
            cursor: "pointer"
          }}
        >
          {isSubmitting ? "Signing in..." : "Sign In"}
        </button>

        <p style={{ marginTop: "1rem", marginBottom: 0, color: "#666" }}>
          Seeded demo credentials: <strong>admin</strong> / <strong>admin123</strong> or <strong>employee1</strong> / <strong>employee123</strong>
        </p>
      </form>
    </div>
  );
}

export default Login;
