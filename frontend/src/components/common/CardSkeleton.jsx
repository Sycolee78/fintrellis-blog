import React from "react";

export default function CardSkeleton() {
  return (
    <div style={styles.card}>
      <div className="skeleton" style={styles.image} />
      <div style={styles.body}>
        <div className="skeleton" style={{ height: "14px", width: "30%", marginBottom: "0.75rem" }} />
        <div className="skeleton" style={{ height: "20px", width: "85%", marginBottom: "0.5rem" }} />
        <div className="skeleton" style={{ height: "14px", width: "100%", marginBottom: "0.25rem" }} />
        <div className="skeleton" style={{ height: "14px", width: "70%" }} />
      </div>
    </div>
  );
}

export function GridSkeleton({ count = 6 }) {
  return (
    <div style={styles.grid}>
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}

const styles = {
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
    gap: "1.5rem",
  },
  card: {
    borderRadius: "var(--border-radius-lg)",
    overflow: "hidden",
    backgroundColor: "var(--color-surface)",
    border: "1px solid var(--color-border)",
  },
  image: {
    width: "100%",
    paddingTop: "60%",
  },
  body: {
    padding: "1.25rem",
  },
};
