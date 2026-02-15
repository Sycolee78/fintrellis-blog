import React from "react";

const footerStyle = {
  borderTop: "1px solid var(--color-border)",
  padding: "1.5rem 1rem",
  textAlign: "center",
  fontSize: "var(--font-size-sm)",
  color: "var(--color-text-secondary)",
  marginTop: "auto",
};

export default function Footer() {
  return (
    <footer style={footerStyle}>
      Blog Post Manager &copy; {new Date().getFullYear()}
    </footer>
  );
}
