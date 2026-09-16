// src/pages/ReviewApproval.jsx
// Page 7: Review & Approval. Shows the Submission -> Project Manager ->
// Subsidiary Manager -> ESG Team -> Approved workflow, and a queue of
// items currently sitting at "review" status with action buttons.

import { useState } from "react";
import { ENTITIES, leavesOf, ROOT_ID } from "../data/entities";
import { SCHEMA } from "../data/schema";
import { STATUS, STATUS_LABEL } from "../data/mockData";
import StatusBadge from "../components/common/StatusBadge";

export default function ReviewApproval() {
  const [localStatus, setLocalStatus] = useState(STATUS);

  const queue = [];
  leavesOf(ROOT_ID).forEach((leafId) =>
    SCHEMA.forEach((d) => {
      const s = localStatus[leafId]?.[d.id];
      if (s === "review") queue.push({ leafId, discId: d.id, title: d.title });
    })
  );

  const act = (leafId, discId, newStatus) => {
    setLocalStatus((prev) => ({
      ...prev,
      [leafId]: { ...prev[leafId], [discId]: newStatus },
    }));
  };

  return (
    <div className="page">
      <div className="page-head">
        <h1>Review &amp; Approval</h1>
        <p>Submissions move through Project Manager → Subsidiary Manager → ESG Team before they're marked approved.</p>
      </div>

      <div className="pipeline pipeline-horizontal">
        {["Submission", "Project Manager", "Subsidiary Manager", "ESG Team", "Approved"].map((step, i, arr) => (
          <span key={step} className="pipeline-chain">
            <span className="pipeline-step">{step}</span>
            {i < arr.length - 1 && <span className="pipeline-arrow-h">→</span>}
          </span>
        ))}
      </div>

      <h3 style={{ marginTop: 26 }}>Awaiting your review</h3>
      {queue.length === 0 ? (
        <div className="empty-note">Nothing waiting in the review queue.</div>
      ) : (
        <table className="simple-table">
          <thead>
            <tr><th>Entity</th><th>Disclosure</th><th>Status</th><th>Action</th></tr>
          </thead>
          <tbody>
            {queue.map(({ leafId, discId, title }) => (
              <tr key={leafId + discId}>
                <td>{ENTITIES[leafId].short}</td>
                <td>{title}</td>
                <td><StatusBadge status={localStatus[leafId][discId]} /></td>
                <td className="action-cell">
                  <button className="btn btn-primary btn-sm" onClick={() => act(leafId, discId, "approved")}>Approve</button>
                  <button className="btn btn-sm" onClick={() => act(leafId, discId, "draft")}>Request correction</button>
                  <button className="btn btn-ghost btn-sm" onClick={() => act(leafId, discId, "draft")}>Reject</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
