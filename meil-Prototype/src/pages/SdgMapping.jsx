// src/pages/SdgMapping.jsx
// Page 9: SDG Mapping. Maps ESG activities to relevant UN Sustainable
// Development Goals, e.g. Water Conservation -> SDG 6.

import { SDG_MAP } from "../data/schema";

export default function SdgMapping() {
  return (
    <div className="page">
      <div className="page-head">
        <h1>SDG Mapping</h1>
        <p>How MEIL's ESG activities connect to the UN Sustainable Development Goals.</p>
      </div>

      <div className="sdg-grid">
        {SDG_MAP.map((m) => (
          <div key={m.sdg} className="sdg-card">
            <div className="sdg-badge">SDG {m.sdg}</div>
            <div className="sdg-flow">
              <span>{m.activity}</span>
              <span className="sdg-arrow">↓</span>
              <span className="sdg-target">{m.sdgTitle}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
