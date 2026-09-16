// src/pages/Organization.jsx
// Page 3: Organization Management. Shows the Group -> Subsidiary ->
// Business Unit/Project hierarchy and exposes add/edit actions (mocked —
// wire these to your API's create-entity endpoints).

import { useState } from "react";
import EntityTree from "../components/common/EntityTree";
import { ENTITIES, ROOT_ID } from "../data/entities";
import { useApp } from "../context/AppContext";

export default function Organization() {
  const { selectedEntity, setSelectedEntity } = useApp();
  const [showAddForm, setShowAddForm] = useState(null); // 'subsidiary' | 'unit' | 'project' | null
  const entity = ENTITIES[selectedEntity];

  return (
    <div className="page">
      <div className="page-head">
        <h1>Organization</h1>
        <p>MEIL Group hierarchy: subsidiaries, business units and projects.</p>
      </div>

      <div className="split-panel">
        <div className="split-left">
          <div className="panel-title-row">
            <h3>Hierarchy</h3>
          </div>
          <EntityTree selected={selectedEntity} onSelect={setSelectedEntity} />
        </div>

        <div className="split-right">
          <div className="entity-detail">
            <span className="chip">{entity.kind}</span>
            <h2>{entity.name}</h2>
            {entity.state && <p className="muted">Location: {entity.state}</p>}
            <p className="muted">Turnover: ₹{entity.turnover.toLocaleString("en-IN")} crore</p>
            <p className="muted">Direct children: {entity.children.length || "None (leaf entity)"}</p>

            <div className="action-row">
              <button className="btn btn-primary" onClick={() => setShowAddForm("subsidiary")}>
                + Add subsidiary
              </button>
              <button className="btn" onClick={() => setShowAddForm("unit")}>+ Add business unit</button>
              <button className="btn" onClick={() => setShowAddForm("project")}>+ Add project</button>
              <button className="btn btn-ghost">Assign users</button>
            </div>

            {showAddForm && (
              <div className="inline-form">
                <h4>New {showAddForm}</h4>
                <label className="field-label">Name</label>
                <input className="field-input" placeholder={`e.g. New ${showAddForm} name`} />
                <label className="field-label">Parent entity</label>
                <input className="field-input" value={entity.short} disabled />
                <div className="action-row" style={{ marginTop: 10 }}>
                  <button className="btn btn-primary" onClick={() => setShowAddForm(null)}>Save</button>
                  <button className="btn btn-ghost" onClick={() => setShowAddForm(null)}>Cancel</button>
                </div>
              </div>
            )}
          </div>

          {entity.children.length > 0 && (
            <div className="panel" style={{ marginTop: 16 }}>
              <h3>Direct children</h3>
              <table className="simple-table">
                <thead>
                  <tr><th>Name</th><th>Kind</th><th>Turnover (₹ crore)</th></tr>
                </thead>
                <tbody>
                  {entity.children.map((id) => (
                    <tr key={id} onClick={() => setSelectedEntity(id)} style={{ cursor: "pointer" }}>
                      <td>{ENTITIES[id].short}</td>
                      <td>{ENTITIES[id].kind}</td>
                      <td>{ENTITIES[id].turnover.toLocaleString("en-IN")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
