// src/data/aggregation.js
// The roll-up engine. Given any entity (leaf or parent) and a disclosure,
// resolve() returns the values that entity should show — typed-in values for
// a leaf, or live-computed sums/ratios for a parent. This file is the only
// place aggregation rules live; pages just call resolve().

import { ENTITIES, isLeaf } from "./entities";
import { RESPONSES, STATUS } from "./mockData";

/** Raw values a leaf entity has submitted for a disclosure. */
export function rawValues(entityId, disclosure) {
  return (RESPONSES[entityId] && RESPONSES[entityId][disclosure.id]) || {};
}

/**
 * Resolve a disclosure's values for any entity in the tree.
 * Leaf: returns what was typed in (missing cells default to 0).
 * Parent: sums children's resolved values, then recomputes derived
 * rows/cells from THIS level's aggregates (never averages child ratios).
 */
export function resolve(entityId, disclosure) {
  const cols = disclosure.cols.map((c) => c.key);
  const out = {};

  if (isLeaf(entityId)) {
    const raw = rawValues(entityId, disclosure);
    disclosure.rows.forEach((r) => {
      out[r.key] = {};
      cols.forEach((c) => {
        out[r.key][c] = (raw[r.key] && raw[r.key][c]) || 0;
      });
    });
  } else {
    const childResults = ENTITIES[entityId].children.map((k) => resolve(k, disclosure));
    disclosure.rows.forEach((r) => {
      out[r.key] = {};
      cols.forEach((c) => {
        out[r.key][c] = r.derived
          ? 0
          : childResults.reduce((sum, child) => sum + (child[r.key]?.[c] || 0), 0);
      });
    });
  }

  // Row-level derived formula applied once per level (e.g. energy intensity)
  if (disclosure.deriveRows) {
    const flat = {};
    disclosure.rows.forEach((r) => (flat[r.key] = out[r.key][cols[0]]));
    const derived = disclosure.deriveRows(flat, ENTITIES[entityId]);
    Object.entries(derived).forEach(([k, v]) => {
      if (out[k]) out[k][cols[0]] = v;
    });
  }

  // Per-column derived formula (e.g. LTIFR computed separately for
  // employees and workers)
  if (disclosure.derive) {
    if (disclosure.perColumn) {
      cols.forEach((c) => {
        const colVals = {};
        disclosure.rows.forEach((r) => (colVals[r.key] = out[r.key][c]));
        const derived = disclosure.derive(colVals);
        Object.entries(derived).forEach(([k, v]) => {
          if (out[k]) out[k][c] = v;
        });
      });
    } else {
      disclosure.rows.forEach((r) => {
        Object.assign(out[r.key], disclosure.derive(out[r.key]));
      });
    }
  }

  return out;
}

/** Each direct child's contribution to one row/col of a disclosure. */
export function contributions(entityId, disclosure, rowKey, colKey) {
  if (isLeaf(entityId)) return null;
  return ENTITIES[entityId].children.map((k) => ({
    id: k,
    name: ENTITIES[k].short,
    value: resolve(k, disclosure)[rowKey]?.[colKey] || 0,
  }));
}

/** How many of the leaves under an entity have approved a given disclosure. */
export function completeness(entityId, disclosure, leavesOf) {
  const leaves = leavesOf(entityId);
  const done = leaves.filter((l) => STATUS[l]?.[disclosure.id] === "approved").length;
  return { done, total: leaves.length };
}

/** Overall % of (leaf x disclosure) cells approved under an entity. */
export function entityCompleteness(entityId, leavesOf, schema) {
  const leaves = leavesOf(entityId);
  let done = 0;
  let total = 0;
  leaves.forEach((l) =>
    schema.forEach((d) => {
      total += 1;
      if (STATUS[l]?.[d.id] === "approved") done += 1;
    })
  );
  return total ? done / total : 0;
}

/** Run every disclosure's validate() over every leaf and collect issues. */
export function scanAnomalies(entityId, schema, leavesOf) {
  const issues = [];
  leavesOf(entityId).forEach((leafId) => {
    schema.forEach((d) => {
      if (!d.validate) return;
      const vals = resolve(leafId, d);
      const flat = {};
      d.rows.forEach((r) => (flat[r.key] = vals[r.key][d.cols[0].key]));
      const found = d.validate(flat, vals) || [];
      found.forEach((f) =>
        issues.push({ ...f, entity: ENTITIES[leafId].short, disclosure: d.title, disclosureId: d.id })
      );
    });
  });
  return issues;
}

export const fmt = (n, dp = 0) =>
  n == null || Number.isNaN(n)
    ? "—"
    : n.toLocaleString("en-IN", { minimumFractionDigits: dp, maximumFractionDigits: dp });
