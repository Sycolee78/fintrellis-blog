import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../hooks/useToast";
import Button from "../components/common/Button";

export default function LoginPage() {
  const { loginUser, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const addToast = useToast();

  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");

  // If already logged in, redirect
  if (user) {
    const from = location.state?.from?.pathname || "/";
    navigate(from, { replace: true });
    return null;
  }

  const validate = () => {
    const errs = {};
    if (!form.email.trim()) errs.email = "Email is required.";
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = "Invalid email format.";
    if (!form.password) errs.password = "Password is required.";
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setLoading(true);
    setServerError("");
    try {
      await loginUser(form.email, form.password);
      addToast("Logged in successfully!", "success");
      const from = location.state?.from?.pathname || "/";
      navigate(from, { replace: true });
    } catch (err) {
      setServerError(err.message || "Login failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: undefined });
    }
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.card}>
        <h1 style={styles.title}>Welcome back</h1>
        <p style={styles.subtitle}>Sign in to your account</p>

        {serverError && <div style={styles.alert}>{serverError}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.field}>
            <label style={styles.label}>Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              style={{
                ...styles.input,
                ...(errors.email ? styles.inputError : {}),
              }}
              placeholder="you@example.com"
              autoComplete="email"
            />
            {errors.email && <span style={styles.error}>{errors.email}</span>}
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Password</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              style={{
                ...styles.input,
                ...(errors.password ? styles.inputError : {}),
              }}
              placeholder="Enter your password"
              autoComplete="current-password"
            />
            {errors.password && (
              <span style={styles.error}>{errors.password}</span>
            )}
          </div>

          <Button
            type="submit"
            disabled={loading}
            style={{ width: "100%", marginTop: "0.5rem" }}
          >
            {loading ? "Signing in..." : "Sign in"}
          </Button>
        </form>

        <p style={styles.footer}>
          Don't have an account?{" "}
          <Link to="/register" style={styles.link}>
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}

const styles = {
  wrapper: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "calc(100vh - 200px)",
    padding: "2rem 1rem",
  },
  card: {
    width: "100%",
    maxWidth: "420px",
    background: "var(--color-surface)",
    borderRadius: "var(--radius-lg)",
    padding: "2.5rem 2rem",
    boxShadow: "var(--shadow-lg)",
    border: "1px solid var(--color-border)",
  },
  title: {
    fontSize: "var(--text-2xl)",
    fontWeight: 700,
    margin: 0,
    textAlign: "center",
  },
  subtitle: {
    color: "var(--color-text-light)",
    textAlign: "center",
    margin: "0.5rem 0 1.5rem",
    fontSize: "var(--text-sm)",
  },
  alert: {
    background: "#fef2f2",
    color: "var(--color-danger)",
    border: "1px solid #fecaca",
    borderRadius: "var(--radius-md)",
    padding: "0.75rem 1rem",
    fontSize: "var(--text-sm)",
    marginBottom: "1rem",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
  },
  field: {
    display: "flex",
    flexDirection: "column",
    gap: "0.375rem",
  },
  label: {
    fontSize: "var(--text-sm)",
    fontWeight: 600,
    color: "var(--color-text)",
  },
  input: {
    padding: "0.625rem 0.75rem",
    borderRadius: "var(--radius-md)",
    border: "1px solid var(--color-border)",
    fontSize: "var(--text-base)",
    outline: "none",
    transition: "border-color var(--transition-fast)",
  },
  inputError: {
    borderColor: "var(--color-danger)",
  },
  error: {
    color: "var(--color-danger)",
    fontSize: "var(--text-xs)",
  },
  footer: {
    textAlign: "center",
    marginTop: "1.5rem",
    fontSize: "var(--text-sm)",
    color: "var(--color-text-light)",
  },
  link: {
    color: "var(--color-primary)",
    fontWeight: 600,
    textDecoration: "none",
  },
};
