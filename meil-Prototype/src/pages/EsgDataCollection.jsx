// src/pages/EsgDataCollection.jsx
// Page 4 (marked most important in the brief): ESG Data Collection, split
// into Environmental / Social / Governance tabs. Fields come straight from
// the BRSR schema (data/schema.js) rather than being invented, per the brief.

import { useState } from "react";
import EntityTree from "../components/common/EntityTree";
import DisclosureTable from "../components/common/DisclosureTable";
import StatusBadge from "../components/common/StatusBadge";
import { useApp } from "../context/AppContext";
import { byCategory, ESG_CATEGORY } from "../data/schema";
import { ENTITIES, isLeaf } from "../data/entities";
import { STATUS } from "../data/mockData";
import { RESPONSES } from "../data/mockData";

const TABS = [
  { key: ESG_CATEGORY.environmental, label: "Environmental" },
  { key: ESG_CATEGORY.social, label: "Social" },
  { key: ESG_CATEGORY.governance, label: "Governance" },
];

export default function EsgDataCollection() {
  const { selectedEntity, setSelectedEntity } = useApp();
  const [tab, setTab] = useState(ESG_CATEGORY.environmental);
  const disclosures = byCategory(tab);
  const entity = ENTITIES[selectedEntity];
  const leaf = isLeaf(selectedEntity);

  // local mutation so edits are visible immediately (would be an API call)
  const [, forceRender] = useState(0);
  const handleChange = (entityId, discId, rowKey, colKey, value) => {
    RESPONSES[entityId] ||= {};
    RESPONSES[entityId][discId] ||= {};
    RESPONSES[entityId][discId][rowKey] ||= {};
    RESPONSES[entityId][discId][rowKey][colKey] = value;
    forceRender((n) => n + 1);
  };

  return (
    <div className="page">
      <div className="page-head">
        <h1>ESG Data</h1>
        <p>Enter or review Environmental, Social and Governance data, mapped to BRSR fields.</p>
      </div>

      <div className="split-panel">
        <div className="split-left">
          <h3>Scope</h3>
          <EntityTree selected={selectedEntity} onSelect={setSelectedEntity} />
        </div>

        <div className="split-right">
          <div className="chips-row">
            <span className="chip">{entity.short}</span>
            <span className="chip">{leaf ? "Site-level entry" : "Consolidated view"}</span>
          </div>

          <div className="tabbar">
            {TABS.map((t) => (
              <button
                key={t.key}
                className={"tabbar-btn" + (tab === t.key ? " active" : "")}
                onClick={() => setTab(t.key)}
              >
                {t.label}
              </button>
            ))}
          </div>

          {disclosures.map((d) => (
            <div key={d.id} className="disclosure-block">
              <div className="disclosure-head">
                <div>
                  <h3>{d.title}</h3>
                  <p className="muted">{d.lead}</p>
                </div>
                {leaf && <StatusBadge status={STATUS[selectedEntity]?.[d.id] || "none"} />}
              </div>
              <DisclosureTable entityId={selectedEntity} disclosure={d} onChange={handleChange} />
            </div>
          ))}

          {leaf && (
            <div className="action-row" style={{ marginTop: 8 }}>
              <button className="btn btn-primary">Submit for review</button>
              <button className="btn">Save draft</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
