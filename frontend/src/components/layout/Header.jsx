import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

export default function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logoutUser } = useAuth();

  const isActive = (path) => location.pathname === path;
  const canCreate = !!user;

  const handleLogout = async () => {
    await logoutUser();
    navigate("/");
  };

  return (
    <header style={styles.header}>
      <div style={styles.inner}>
        <Link to="/" style={styles.logo}>
          <span style={styles.logoIcon}>&#9998;</span>
          BlogManager
        </Link>
        <nav style={styles.nav}>
          <Link
            to="/"
            style={{
              ...styles.navLink,
              ...(isActive("/") ? styles.navLinkActive : {}),
            }}
          >
            All Posts
          </Link>

          {canCreate && (
            <Link to="/posts/new" style={styles.cta}>
              + New Post
            </Link>
          )}

          {user ? (
            <div style={styles.userSection}>
              <span style={styles.userInfo}>
                {user.email}
                <span style={styles.roleBadge}>{user.role}</span>
              </span>
              <button onClick={handleLogout} style={styles.logoutBtn}>
                Logout
              </button>
            </div>
          ) : (
            <>
              <Link
                to="/login"
                style={{
                  ...styles.navLink,
                  ...(isActive("/login") ? styles.navLinkActive : {}),
                }}
              >
                Sign in
              </Link>
              <Link to="/register" style={styles.cta}>
                Register
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

const styles = {
  header: {
    backgroundColor: "#0f172a",
    padding: "0 1.5rem",
    position: "sticky",
    top: 0,
    zIndex: 100,
  },
  inner: {
    maxWidth: "var(--max-width)",
    margin: "0 auto",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    height: "64px",
  },
  logo: {
    fontSize: "1.25rem",
    fontWeight: 700,
    color: "#ffffff",
    textDecoration: "none",
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
  },
  logoIcon: {
    fontSize: "1.5rem",
  },
  nav: {
    display: "flex",
    gap: "0.5rem",
    alignItems: "center",
  },
  navLink: {
    fontSize: "0.875rem",
    fontWeight: 500,
    color: "#94a3b8",
    textDecoration: "none",
    padding: "0.5rem 0.75rem",
    borderRadius: "var(--border-radius)",
    transition: "color 0.15s, background-color 0.15s",
  },
  navLinkActive: {
    color: "#ffffff",
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  cta: {
    fontSize: "0.875rem",
    fontWeight: 600,
    padding: "0.5rem 1rem",
    backgroundColor: "var(--color-primary)",
    color: "#fff",
    borderRadius: "var(--border-radius)",
    textDecoration: "none",
    transition: "background-color 0.15s",
  },
  userSection: {
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
    marginLeft: "0.5rem",
    paddingLeft: "0.75rem",
    borderLeft: "1px solid rgba(255,255,255,0.15)",
  },
  userInfo: {
    fontSize: "0.8rem",
    color: "#cbd5e1",
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
  },
  roleBadge: {
    fontSize: "0.65rem",
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    padding: "0.15rem 0.5rem",
    borderRadius: "9999px",
    backgroundColor: "rgba(99,102,241,0.2)",
    color: "#a5b4fc",
  },
  logoutBtn: {
    fontSize: "0.8rem",
    fontWeight: 600,
    color: "#f87171",
    background: "transparent",
    border: "1px solid rgba(248,113,113,0.3)",
    padding: "0.35rem 0.75rem",
    borderRadius: "var(--border-radius)",
    cursor: "pointer",
    transition: "background-color 0.15s",
  },
};
