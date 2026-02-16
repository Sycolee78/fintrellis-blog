import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../hooks/useToast";
import Button from "../components/common/Button";

export default function RegisterPage() {
  const { registerUser, user } = useAuth();
  const navigate = useNavigate();
  const addToast = useToast();

  const [form, setForm] = useState({
    email: "",
    password: "",
    password_confirm: "",
    first_name: "",
    last_name: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");

  if (user) {
    navigate("/", { replace: true });
    return null;
  }

  const validate = () => {
    const errs = {};
    if (!form.email.trim()) errs.email = "Email is required.";
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = "Invalid email format.";
    if (!form.password) errs.password = "Password is required.";
    else if (form.password.length < 8) errs.password = "Password must be at least 8 characters.";
    if (form.password !== form.password_confirm)
      errs.password_confirm = "Passwords do not match.";
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
      await registerUser(form);
      addToast("Account created! Welcome!", "success");
      navigate("/", { replace: true });
    } catch (err) {
      if (err.details) {
        const fieldErrors = {};
        for (const [key, val] of Object.entries(err.details)) {
          fieldErrors[key] = Array.isArray(val) ? val[0] : val;
        }
        setErrors(fieldErrors);
      }
      setServerError(err.message || "Registration failed.");
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
        <h1 style={styles.title}>Create an account</h1>
        <p style={styles.subtitle}>Join the blog community</p>

        {serverError && <div style={styles.alert}>{serverError}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.row}>
            <div style={styles.field}>
              <label style={styles.label}>First name</label>
              <input
                type="text"
                name="first_name"
                value={form.first_name}
                onChange={handleChange}
                style={styles.input}
                placeholder="John"
                autoComplete="given-name"
              />
            </div>
            <div style={styles.field}>
              <label style={styles.label}>Last name</label>
              <input
                type="text"
                name="last_name"
                value={form.last_name}
                onChange={handleChange}
                style={styles.input}
                placeholder="Doe"
                autoComplete="family-name"
              />
            </div>
          </div>

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
              placeholder="Min. 8 characters"
              autoComplete="new-password"
            />
            {errors.password && (
              <span style={styles.error}>{errors.password}</span>
            )}
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Confirm password</label>
            <input
              type="password"
              name="password_confirm"
              value={form.password_confirm}
              onChange={handleChange}
              style={{
                ...styles.input,
                ...(errors.password_confirm ? styles.inputError : {}),
              }}
              placeholder="Repeat password"
              autoComplete="new-password"
            />
            {errors.password_confirm && (
              <span style={styles.error}>{errors.password_confirm}</span>
            )}
          </div>

          <Button
            type="submit"
            disabled={loading}
            style={{ width: "100%", marginTop: "0.5rem" }}
          >
            {loading ? "Creating account..." : "Create account"}
          </Button>
        </form>

        <p style={styles.footer}>
          Already have an account?{" "}
          <Link to="/login" style={styles.link}>
            Sign in
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
    maxWidth: "480px",
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
  row: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "0.75rem",
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
