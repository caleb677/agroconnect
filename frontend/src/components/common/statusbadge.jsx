// src/components/common/StatusBadge.jsx
export function StatusBadge({ status }) {
  const STATUS_CONFIG = {
    open: { bg: "#E6F1FB", color: "#378ADD", label: "Open", icon: "🟢" },
    pending: { bg: "#FAEEDA", color: "#BA7517", label: "Pending", icon: "🟡" },
    "in-progress": { bg: "#EEEDFE", color: "#7F77DD", label: "In Progress", icon: "🔄" },
    resolved: { bg: "#E1F5EE", color: "#1D9E75", label: "Resolved", icon: "✅" },
    closed: { bg: "#F1EFE8", color: "#888780", label: "Closed", icon: "🔒" },
    approved: { bg: "#E1F5EE", color: "#1D9E75", label: "Approved", icon: "✅" },
    rejected: { bg: "#FCEBEB", color: "#E24B4A", label: "Rejected", icon: "❌" },
    "in-transit": { bg: "#E6F1FB", color: "#378ADD", label: "In Transit", icon: "🚚" },
    delivered: { bg: "#E1F5EE", color: "#1D9E75", label: "Delivered", icon: "📦" },
  };

  const config = STATUS_CONFIG[status] || STATUS_CONFIG.open;

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
        background: config.bg,
        color: config.color,
        padding: "4px 12px",
        borderRadius: "20px",
        fontSize: "12px",
        fontWeight: 600,
      }}
    >
      <span>{config.icon}</span>
      <span>{config.label}</span>
    </span>
  );
}