// src/pages/Reports.jsx
// Page 10 (starred): Reports & BRSR Generation. Where the collected data
// becomes an exportable deliverable — full BRSR, category reports, or a
// subsidiary/project-wise cut — as PDF or Excel/CSV.

import { useState } from "react";
import { ENTITIES, ROOT_ID, subsidiariesOf, leavesOf } from "../data/entities";

const REPORT_TYPES = [
  { key: "brsr", label: "Full BRSR report" },
  { key: "esg", label: "ESG summary" },
  { key: "env", label: "Environmental report" },
  { key: "soc", label: "Social report" },
  { key: "gov", label: "Governance report" },
  { key: "sub", label: "Subsidiary-wise report" },
  { key: "proj", label: "Project-wise report" },
];

export default function Reports() {
  const [reportType, setReportType] = useState("brsr");
  const [scope, setScope] = useState(ROOT_ID);
  const [generated, setGenerated] = useState(null);

  const handleGenerate = (format) => {
    setGenerated({ type: reportType, scope, format, at: new Date().toLocaleString() });
  };

  return (
    <div className="page">
      <div className="page-head">
        <h1>Reports</h1>
        <p>Turn collected ESG data into a report you can file or circulate.</p>
      </div>

      <div className="report-builder">
        <div>
          <label className="field-label">Report type</label>
          <select className="field-input" value={reportType} onChange={(e) => setReportType(e.target.value)}>
            {REPORT_TYPES.map((r) => <option key={r.key} value={r.key}>{r.label}</option>)}
          </select>
        </div>
        <div>
          <label className="field-label">Scope</label>
          <select className="field-input" value={scope} onChange={(e) => setScope(e.target.value)}>
            <option value={ROOT_ID}>{ENTITIES[ROOT_ID].short} (consolidated)</option>
            {subsidiariesOf(ROOT_ID).map((id) => <option key={id} value={id}>{ENTITIES[id].short}</option>)}
            {leavesOf(ROOT_ID).map((id) => <option key={id} value={id}>{ENTITIES[id].short}</option>)}
          </select>
        </div>
        <div className="action-row" style={{ alignItems: "flex-end" }}>
          <button className="btn btn-primary" onClick={() => handleGenerate("PDF")}>Export PDF</button>
          <button className="btn" onClick={() => handleGenerate("Excel/CSV")}>Export Excel/CSV</button>
        </div>
      </div>

      {generated && (
        <div className="banner" style={{ marginTop: 18 }}>
          <b>{REPORT_TYPES.find((r) => r.key === generated.type).label}</b> for{" "}
          <b>{ENTITIES[generated.scope].short}</b> generated as {generated.format} at {generated.at}.
          (Prototype — wire this button to your export service.)
        </div>
      )}

      <h3 style={{ marginTop: 26 }}>Recently generated</h3>
      <table className="simple-table">
        <thead><tr><th>Report</th><th>Scope</th><th>Format</th><th>Generated</th></tr></thead>
        <tbody>
          <tr><td>Full BRSR report</td><td>MEIL Group</td><td>PDF</td><td>10 Sep 2026</td></tr>
          <tr><td>Environmental report</td><td>Hydro Power</td><td>Excel</td><td>08 Sep 2026</td></tr>
          <tr><td>Project-wise report</td><td>Polavaram</td><td>PDF</td><td>02 Sep 2026</td></tr>
        </tbody>
      </table>
    </div>
  );
}
