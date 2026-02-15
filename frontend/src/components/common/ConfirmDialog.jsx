import React, { useEffect, useRef } from "react";
import Button from "./Button";

const overlayStyle = {
  position: "fixed",
  inset: 0,
  backgroundColor: "rgba(0, 0, 0, 0.5)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 1000,
};

const dialogStyle = {
  backgroundColor: "var(--color-surface)",
  borderRadius: "var(--border-radius)",
  padding: "1.5rem",
  maxWidth: "400px",
  width: "90%",
  boxShadow: "var(--shadow-md)",
};

const titleStyle = {
  fontSize: "var(--font-size-lg)",
  fontWeight: 600,
  marginBottom: "0.5rem",
};

const messageStyle = {
  color: "var(--color-text-secondary)",
  marginBottom: "1.5rem",
  fontSize: "0.875rem",
  lineHeight: 1.6,
};

const actionsStyle = {
  display: "flex",
  justifyContent: "flex-end",
  gap: "0.75rem",
};

export default function ConfirmDialog({ isOpen, title, message, onConfirm, onCancel }) {
  const cancelRef = useRef(null);

  useEffect(() => {
    if (isOpen && cancelRef.current) {
      cancelRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape" && isOpen) onCancel();
    };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return (
    <div style={overlayStyle} onClick={onCancel} role="dialog" aria-modal="true" aria-labelledby="confirm-title">
      <div style={dialogStyle} onClick={(e) => e.stopPropagation()}>
        <h3 id="confirm-title" style={titleStyle}>{title}</h3>
        <p style={messageStyle}>{message}</p>
        <div style={actionsStyle}>
          <Button variant="secondary" onClick={onCancel} ref={cancelRef}>
            Cancel
          </Button>
          <Button variant="danger" onClick={onConfirm}>
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
}
