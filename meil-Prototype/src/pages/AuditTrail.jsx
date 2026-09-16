// src/pages/AuditTrail.jsx
// Page 11: Audit Trail. Who changed what, when — required for a corporate
// reporting system. Reads from data/mockData.js; replace with an API call
// to your audit log service.

import { useState } from "react";
import StatusBadge from "../components/common/StatusBadge";
import { AUDIT_LOG } from "../data/mockData";

export default function AuditTrail() {
  const [query, setQuery] = useState("");

  const filtered = AUDIT_LOG.filter((row) =>
    (row.user + row.action + row.entity).toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="page">
      <div className="page-head">
        <h1>Audit Trail</h1>
        <p>Every change to ESG or BRSR data, with who made it and when.</p>
      </div>

      <input
        className="field-input"
        style={{ maxWidth: 320, marginBottom: 14 }}
        placeholder="Search by user, action or entity"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      <table className="simple-table">
        <thead>
          <tr><th>User</th><th>Action</th><th>Entity</th><th>Date</th><th>Status</th></tr>
        </thead>
        <tbody>
          {filtered.map((row, i) => (
            <tr key={i}>
              <td>{row.user}</td>
              <td>{row.action}</td>
              <td>{row.entity}</td>
              <td>{row.date}</td>
              <td><StatusBadge status={row.status} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
