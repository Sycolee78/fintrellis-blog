import React from "react";

export default function Hero({ title, subtitle }) {
  return (
    <section style={styles.hero}>
      <div style={styles.inner}>
        <h1 style={styles.title}>{title}</h1>
        {subtitle && <p style={styles.subtitle}>{subtitle}</p>}
      </div>
    </section>
  );
}

const styles = {
  hero: {
    backgroundColor: "#0f172a",
    padding: "4rem 1.5rem 3.5rem",
    textAlign: "center",
  },
  inner: {
    maxWidth: "640px",
    margin: "0 auto",
  },
  title: {
    fontSize: "clamp(2rem, 5vw, 3rem)",
    fontWeight: 800,
    color: "#ffffff",
    marginBottom: "0.75rem",
    letterSpacing: "-0.02em",
    lineHeight: 1.1,
  },
  subtitle: {
    fontSize: "clamp(1rem, 2.5vw, 1.25rem)",
    color: "#94a3b8",
    lineHeight: 1.5,
    fontWeight: 400,
  },
};
