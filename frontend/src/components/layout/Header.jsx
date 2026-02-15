import React from "react";
import { Link, useLocation } from "react-router-dom";

export default function Header() {
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

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
          <Link to="/posts/new" style={styles.cta}>
            + New Post
          </Link>
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
};
