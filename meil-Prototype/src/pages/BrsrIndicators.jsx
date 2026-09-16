// src/pages/BrsrIndicators.jsx
// Page 5: BRSR Data / Indicators. Presents the same underlying data as ESG
// Data Collection but organized the way SEBI's format expects it: Section A
// (general disclosures), Section B (management & process), Section C
// (Principles 1-9, each with Essential/Leadership indicators).

import { useState } from "react";
import EntityTree from "../components/common/EntityTree";
import DisclosureTable from "../components/common/DisclosureTable";
import { useApp } from "../context/AppContext";
import { SCHEMA, PRINCIPLES } from "../data/schema";
import { ENTITIES } from "../data/entities";

export default function BrsrIndicators() {
  const { selectedEntity, setSelectedEntity } = useApp();
  const [activePrinciple, setActivePrinciple] = useState(6);

  const sectionA = SCHEMA.filter((d) => d.brsrSection === "Section A");
  const sectionB = SCHEMA.filter((d) => d.brsrSection === "Section B");
  const principleDiscs = SCHEMA.filter((d) => d.principle === activePrinciple);

  return (
    <div className="page">
      <div className="page-head">
        <h1>BRSR Indicators</h1>
        <p>Your ESG data mapped onto the SEBI BRSR structure for {ENTITIES[selectedEntity].short}.</p>
      </div>

      <div className="split-panel">
        <div className="split-left">
          <h3>Scope</h3>
          <EntityTree selected={selectedEntity} onSelect={setSelectedEntity} />
        </div>

        <div className="split-right">
          <section className="brsr-section">
            <h2>Section A — General disclosures</h2>
            {sectionA.map((d) => (
              <DisclosureTable key={d.id} entityId={selectedEntity} disclosure={d} />
            ))}
          </section>

          <section className="brsr-section">
            <h2>Section B — Management &amp; process disclosures</h2>
            <p className="muted">Policy coverage, Board approval, and performance against targets.</p>
            {sectionB.map((d) => (
              <DisclosureTable key={d.id} entityId={selectedEntity} disclosure={d} />
            ))}
          </section>

          <section className="brsr-section">
            <h2>Section C — Principle-wise performance</h2>
            <div className="principle-pills">
              {PRINCIPLES.map((p) => (
                <button
                  key={p.n}
                  className={"pill" + (activePrinciple === p.n ? " active" : "")}
                  onClick={() => setActivePrinciple(p.n)}
                  title={p.title}
                >
                  P{p.n}
                </button>
              ))}
            </div>
            <p className="muted">
              Principle {activePrinciple}: {PRINCIPLES.find((p) => p.n === activePrinciple)?.title}
            </p>

            {principleDiscs.length ? (
              principleDiscs.map((d) => (
                <div key={d.id}>
                  <span className="chip" style={{ marginBottom: 6, display: "inline-block" }}>
                    {d.tier} indicator {d.core && "· BRSR Core"}
                  </span>
                  <DisclosureTable entityId={selectedEntity} disclosure={d} />
                </div>
              ))
            ) : (
              <div className="empty-note">No disclosures loaded yet for this principle in the prototype schema.</div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
