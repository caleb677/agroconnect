import { C } from "../../utils/constants.js";

export default function Alert({ type = "info", msg, onClose }) {
  if (!msg) return null;
  const colors = {
    success: { bg: C.primaryLight, border: C.primary,  text: "#0F6E56" },
    error:   { bg: "#FEE2E2",      border: C.danger,   text: "#991B1B" },
    info:    { bg: "#EFF6FF",      border: C.info,     text: "#1E40AF" },
    warning: { bg: "#FEF3C7",      border: "#F59E0B",  text: "#92400E" },
  };
  const c = colors[type] || colors.info;
  return (
    <div style={{
      background: c.bg, border: `1.5px solid ${c.border}`, color: c.text,
      borderRadius: 10, padding: "12px 16px", marginBottom: 16,
      display: "flex", alignItems: "flex-start", gap: 10, fontSize: 13,
    }}>
      <span style={{ fontSize: 16, flexShrink: 0 }}>
        {type === "success" ? "✅" : type === "error" ? "❌" : type === "warning" ? "⚠️" : "ℹ️"}
      </span>
      <span style={{ flex: 1, lineHeight: 1.5 }}>{msg}</span>
      {onClose && (
        <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: c.text, fontSize: 16, padding: 0, lineHeight: 1 }}>×</button>
      )}
    </div>
  );
}
