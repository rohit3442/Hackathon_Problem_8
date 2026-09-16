// src/pages/Analytics.jsx
// Page 8: ESG Dashboard / Analytics. Filters by year, subsidiary, business
// unit/project, and ESG category, then charts KPIs at whatever level is
// selected — Group, Subsidiary, or Project.

import { useState, useMemo } from "react";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";
import { ENTITIES, ROOT_ID, subsidiariesOf, leavesOf } from "../data/entities";
import { SCHEMA } from "../data/schema";
import { resolve, fmt } from "../data/aggregation";

const YEARS = ["FY 2024-25", "FY 2023-24"];
const CATEGORIES = ["All", "Environmental", "Social", "Governance"];

export default function Analytics() {
  const [year, setYear] = useState(YEARS[0]);
  const [subsidiary, setSubsidiary] = useState("All");
  const [project, setProject] = useState("All");
  const [category, setCategory] = useState("All");

  const scopeId = project !== "All" ? project : subsidiary !== "All" ? subsidiary : ROOT_ID;

  const projectOptions = subsidiary === "All" ? [] : ENTITIES[subsidiary].children;

  const energy = resolve(scopeId, SCHEMA.find((d) => d.id === "P6E1"));
  const water = resolve(scopeId, SCHEMA.find((d) => d.id === "P6E3"));
  const waste = resolve(scopeId, SCHEMA.find((d) => d.id === "P6E8"));
  const safety = resolve(scopeId, SCHEMA.find((d) => d.id === "P3E11"));

  // synthetic year-over-year trend for the demo (real build: query by period)
  const trend = useMemo(() => {
    const base = energy.total.v;
    return [0.86, 0.9, 0.95, 1.0].map((mult, i) => ({
      period: ["Q1", "Q2", "Q3", "Q4"][i],
      GJ: Math.round((base * mult) / 1000),
    }));
  }, [energy.total.v]);

  return (
    <div className="page">
      <div className="page-head">
        <h1>ESG Analytics</h1>
        <p>Drill from MEIL Group down to a single project.</p>
      </div>

      <div className="filter-bar">
        <label>
          Year
          <select value={year} onChange={(e) => setYear(e.target.value)}>
            {YEARS.map((y) => <option key={y}>{y}</option>)}
          </select>
        </label>
        <label>
          Subsidiary
          <select value={subsidiary} onChange={(e) => { setSubsidiary(e.target.value); setProject("All"); }}>
            <option>All</option>
            {subsidiariesOf(ROOT_ID).map((id) => <option key={id} value={id}>{ENTITIES[id].short}</option>)}
          </select>
        </label>
        <label>
          Project
          <select value={project} onChange={(e) => setProject(e.target.value)} disabled={subsidiary === "All"}>
            <option>All</option>
            {projectOptions.map((id) => <option key={id} value={id}>{ENTITIES[id].short}</option>)}
          </select>
        </label>
        <label>
          ESG category
          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
          </select>
        </label>
      </div>

      <p className="muted" style={{ marginTop: 10 }}>
        Showing <b>{ENTITIES[scopeId].short}</b> · {leavesOf(scopeId).length} reporting site(s) · {year}
      </p>

      <div className="stat-grid" style={{ marginTop: 14 }}>
        <div className="stat-card"><h4>Total energy</h4><div className="stat-value">{fmt(energy.total.v / 1000, 1)}<span className="stat-unit"> TJ</span></div></div>
        <div className="stat-card"><h4>Water consumed</h4><div className="stat-value">{fmt(water.consumption.v / 1000)}<span className="stat-unit"> ML</span></div></div>
        <div className="stat-card"><h4>Waste recovery</h4><div className="stat-value">{fmt(waste.recovery.v, 1)}<span className="stat-unit">%</span></div></div>
        <div className="stat-card"><h4>Worker LTIFR</h4><div className="stat-value">{fmt(safety.ltifr.wrk, 2)}</div></div>
      </div>

      <div className="panel" style={{ marginTop: 20 }}>
        <h3>Energy trend (TJ)</h3>
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={trend}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8E8" />
            <XAxis dataKey="period" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip />
            <Line type="monotone" dataKey="GJ" stroke="#0F6E63" strokeWidth={2} dot={{ r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
