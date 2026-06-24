export function PriorityBadge({ priority }) {
  const PRIORITY_CONFIG = {
    urgent: { bg: "#FCEBEB", color: "#E24B4A", label: "Urgent" },
    high: { bg: "#FCEBEB", color: "#E24B4A", label: "High" },
    medium: { bg: "#FAEEDA", color: "#BA7517", label: "Medium" },
    low: { bg: "#E1F5EE", color: "#1D9E75", label: "Low" }
  };

  const p = PRIORITY_CONFIG[priority] || PRIORITY_CONFIG.medium;
  return <span style={{ background: p.bg, color: p.color, borderRadius: 6, padding: "2px 10px", fontSize: 12, fontWeight: 600 }}>{p.label}</span>;
}