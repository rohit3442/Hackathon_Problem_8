// src/components/common/DisclosureTable.jsx
// Renders ONE disclosure (a row/column shape from data/schema.js) as an
// editable table for leaf entities, or a read-only computed table for
// parent entities. This single component is reused by the ESG Data
// Collection page and the BRSR Indicators page — add a new disclosure to
// the schema and it renders here automatically, no new markup needed.

import { isLeaf } from "../../data/entities";
import { resolve, fmt } from "../../data/aggregation";

export default function DisclosureTable({ entityId, disclosure, onChange }) {
  const leaf = isLeaf(entityId);
  const values = resolve(entityId, disclosure);
  const cols = disclosure.cols;

  const isDerivedRow = (row) =>
    row.derived ||
    (disclosure.deriveRows &&
      ["total", "intensity", "withdrawal", "consumption", "totalw", "recovery", "ltifr"].includes(row.key));

  const handleInput = (rowKey, colKey, raw) => {
    const n = Number(String(raw).replace(/[, ]/g, ""));
    if (Number.isNaN(n)) return;
    onChange?.(entityId, disclosure.id, rowKey, colKey, n);
  };

  return (
    <table className="matrix">
      <caption>
        {disclosure.title}
        {cols[0].unit && <span className="unit-tag"> · all figures in {cols[0].unit}</span>}
      </caption>
      <thead>
        <tr>
          <th>Line item</th>
          {cols.map((c) => (
            <th key={c.key} className="n">{c.label}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {disclosure.rows.map((r) => {
          const derived = isDerivedRow(r);
          return (
            <tr key={r.key} className={derived ? "derived" : ""}>
              <td className="row-label">
                {r.label}
                {r.note && <small>{r.note}</small>}
              </td>
              {cols.map((c) => {
                const dp = c.dp ?? r.dp ?? 0;
                const v = values[r.key][c.key];
                const editable = leaf && !derived;
                return (
                  <td key={c.key} className="n">
                    {editable ? (
                      <input
                        className="cell-input"
                        defaultValue={fmt(v, dp)}
                        onBlur={(e) => handleInput(r.key, c.key, e.target.value)}
                        aria-label={`${r.label} ${c.label}`}
                      />
                    ) : (
                      fmt(v, dp)
                    )}
                  </td>
                );
              })}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
