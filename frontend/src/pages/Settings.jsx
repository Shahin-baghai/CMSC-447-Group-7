import { useState } from "react";

const initialForm = {
  username: "",
  password: "",
  role: "employee"
};

const fieldStyle = {
  width: "100%",
  padding: "0.85rem 1rem",
  borderRadius: "8px",
  border: "1px solid #cfcfcf",
  fontSize: "1rem"
};

const Settings = ({ currentUser, authToken }) => {
  const [form, setForm] = useState(initialForm);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");
    setIsSubmitting(true);

    try {
      const response = await fetch("http://localhost:3001/auth/accounts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`
        },
        body: JSON.stringify(form)
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.error || "Account creation failed");
      }

      setMessage(`${data.user.username} was created as an ${data.user.role}.`);
      setForm(initialForm);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main style={{ padding: "2rem", maxWidth: "860px" }}>
      <header style={{ marginBottom: "1.5rem" }}>
        <p style={{ margin: 0, color: "#666" }}>
          Signed in as <strong>{currentUser?.username}</strong>
        </p>
        <h1 style={{ margin: "0.35rem 0 0" }}>Account Management</h1>
      </header>

      <section
        style={{
          backgroundColor: "#ffffff",
          borderRadius: "8px",
          padding: "1.5rem",
          boxShadow: "0 8px 24px rgba(0,0,0,0.08)"
        }}
      >
        <h2 style={{ marginTop: 0 }}>Add employee or admin</h2>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "1rem" }}>
            <label htmlFor="username" style={{ display: "block", marginBottom: "0.5rem", fontWeight: "bold" }}>
              Email
            </label>
            <input
              id="username"
              name="username"
              type="email"
              value={form.username}
              onChange={handleChange}
              required
              style={fieldStyle}
            />
          </div>

          <div style={{ marginBottom: "1rem" }}>
            <label htmlFor="password" style={{ display: "block", marginBottom: "0.5rem", fontWeight: "bold" }}>
              Temporary password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              minLength={8}
              required
              style={fieldStyle}
            />
          </div>

          <div style={{ marginBottom: "1rem" }}>
            <label htmlFor="role" style={{ display: "block", marginBottom: "0.5rem", fontWeight: "bold" }}>
              Account type
            </label>
            <select
              id="role"
              name="role"
              value={form.role}
              onChange={handleChange}
              required
              style={fieldStyle}
            >
              <option value="employee">Employee</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          {error && (
            <div
              role="alert"
              style={{
                marginBottom: "1rem",
                padding: "0.75rem 1rem",
                borderRadius: "8px",
                backgroundColor: "#f8d7da",
                color: "#721c24"
              }}
            >
              {error}
            </div>
          )}

          {message && (
            <div
              role="status"
              style={{
                marginBottom: "1rem",
                padding: "0.75rem 1rem",
                borderRadius: "8px",
                backgroundColor: "#d4edda",
                color: "#155724"
              }}
            >
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              padding: "0.85rem 1.2rem",
              border: "none",
              borderRadius: "8px",
              backgroundColor: "#0c0c0c",
              color: "#ffffff",
              fontWeight: "bold",
              cursor: isSubmitting ? "default" : "pointer"
            }}
          >
            {isSubmitting ? "Creating..." : "Create Account"}
          </button>
        </form>
      </section>
    </main>
  );
};

export default Settings;
