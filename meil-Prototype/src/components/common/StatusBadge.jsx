// src/components/common/StatusBadge.jsx
// A small colored label for workflow status. Used in Dashboard, ESG Data
// Collection, Validation, Review & Approval, and Audit Trail.

export default function StatusBadge({ status }) {
  const map = {
    approved: { text: "Approved", cls: "badge badge-approved" },
    review: { text: "In review", cls: "badge badge-review" },
    draft: { text: "Draft", cls: "badge badge-draft" },
    none: { text: "Not started", cls: "badge badge-none" },
    Submitted: { text: "Submitted", cls: "badge badge-review" },
    Approved: { text: "Approved", cls: "badge badge-approved" },
    Updated: { text: "Updated", cls: "badge badge-draft" },
    Rejected: { text: "Rejected", cls: "badge badge-error" },
  };
  const entry = map[status] || { text: status, cls: "badge" };
  return <span className={entry.cls}>{entry.text}</span>;
}
