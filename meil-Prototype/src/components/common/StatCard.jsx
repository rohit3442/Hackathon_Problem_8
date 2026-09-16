// src/components/common/StatCard.jsx
// A single KPI tile: label, big number, optional trend note. Used on the
// Dashboard and Analytics pages.

export default function StatCard({ label, value, unit, note, tone }) {
  return (
    <div className="stat-card">
      <h4>{label}</h4>
      <div className="stat-value">
        {value}
        {unit && <span className="stat-unit">{unit}</span>}
      </div>
      {note && <div className={`stat-note ${tone || ""}`}>{note}</div>}
    </div>
  );
}
