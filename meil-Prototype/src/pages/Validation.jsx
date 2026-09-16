// src/pages/Validation.jsx
// Page 6: Validation. Shows the Submitted -> Validation -> Valid?(No -> back
// to correction / Yes -> Review) pipeline from the brief, then lists real
// issues found by running each disclosure's validate() rule over every site.

import { ROOT_ID, leavesOf } from "../data/entities";
import { SCHEMA } from "../data/schema";
import { scanAnomalies } from "../data/aggregation";

export default function Validation() {
  const issues = scanAnomalies(ROOT_ID, SCHEMA, leavesOf);

  return (
    <div className="page">
      <div className="page-head">
        <h1>Validation</h1>
        <p>Every submission passes through these checks before it reaches a reviewer.</p>
      </div>

      <div className="pipeline">
        <div className="pipeline-step">Submitted data</div>
        <div className="pipeline-arrow">↓</div>
        <div className="pipeline-step">Validation</div>
        <div className="pipeline-arrow">↓</div>
        <div className="pipeline-branch">
          <div className="pipeline-step pipeline-no">Not valid → sent back for correction</div>
          <div className="pipeline-step pipeline-yes">Valid → sent to review</div>
        </div>
      </div>

      <h3 style={{ marginTop: 28 }}>Issues found this period</h3>
      <p className="muted">Generated automatically from cross-field rules — discharge vs withdrawal, missing fields, out-of-range percentages, duplicate entries.</p>

      {issues.length === 0 ? (
        <div className="empty-note">No validation issues at the moment. All entities pass their checks.</div>
      ) : (
        <table className="simple-table">
          <thead>
            <tr><th>Severity</th><th>Entity</th><th>Disclosure</th><th>Issue</th></tr>
          </thead>
          <tbody>
            {issues.map((i, idx) => (
              <tr key={idx}>
                <td><span className={`chip ${i.level === "error" ? "chip-error" : "chip-warn"}`}>{i.level === "error" ? "Blocking" : "Warning"}</span></td>
                <td>{i.entity}</td>
                <td>{i.disclosure}</td>
                <td>{i.msg}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <div className="checklist" style={{ marginTop: 24 }}>
        <h3>What this page checks for</h3>
        <ul>
          <li>Missing mandatory fields</li>
          <li>Invalid or out-of-range values (e.g. percentages over 100%)</li>
          <li>Incorrect or unconverted units</li>
          <li>Duplicate entries across the same reporting period</li>
          <li>Entries flagged as needing clarification from the submitter</li>
        </ul>
      </div>
    </div>
  );
}
