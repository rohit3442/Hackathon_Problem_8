// src/components/common/EntityTree.jsx
// A collapsible tree of the organization hierarchy. Used in Organization,
// ESG Data Collection, and BRSR Indicators pages to pick the current scope.
// Controlled from the outside: pass the selected id and a setter.

import { useState } from "react";
import { ENTITIES, ROOT_ID, isLeaf, leavesOf } from "../../data/entities";
import { entityCompleteness } from "../../data/aggregation";
import { SCHEMA } from "../../data/schema";

export default function EntityTree({ selected, onSelect }) {
  const [open, setOpen] = useState(new Set(["meil", "hydro", "water", "roads"]));

  const toggle = (id) => {
    const next = new Set(open);
    next.has(id) ? next.delete(id) : next.add(id);
    setOpen(next);
  };

  const renderNode = (id, depth = 0) => {
    const e = ENTITIES[id];
    const expanded = open.has(id);
    const pct = Math.round(entityCompleteness(id, leavesOf, SCHEMA) * 100);

    return (
      <div key={id}>
        <button
          className="tree-node"
          style={{ paddingLeft: 8 + depth * 14 }}
          aria-current={selected === id}
          onClick={() => onSelect(id)}
        >
          {e.children.length > 0 ? (
            <span
              className={`tree-twist ${expanded ? "open" : ""}`}
              onClick={(ev) => {
                ev.stopPropagation();
                toggle(id);
              }}
            >
              ▶
            </span>
          ) : (
            <span className="tree-twist-spacer" />
          )}
          <span className="tree-dot" />
          <span className="tree-name">{e.short}</span>
          <span className="tree-meter" title={`${pct}% approved`}>
            <i style={{ width: `${pct}%` }} />
          </span>
        </button>
        {e.children.length > 0 && expanded && (
          <div>{e.children.map((c) => renderNode(c, depth + 1))}</div>
        )}
      </div>
    );
  };

  return <div className="entity-tree">{renderNode(ROOT_ID)}</div>;
}

export { isLeaf };
