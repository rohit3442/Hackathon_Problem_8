// src/pages/Dashboard.jsx
// Page 2 (starred as most important landing page): totals, completion %,
// pending approvals, and E/S/G summary charts. Pulls everything from the
// shared data layer so the numbers match every other page.

import { useApp } from "../context/AppContext";
import StatCard from "../components/common/StatCard";
import { ENTITIES, ROOT_ID, leavesOf, subsidiariesOf } from "../data/entities";
import { SCHEMA } from "../data/schema";
import { resolve, entityCompleteness, fmt } from "../data/aggregation";
import { STATUS } from "../data/mockData";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts";

export default function Dashboard() {
  const { period } = useApp();

  const energy = resolve(ROOT_ID, SCHEMA.find((d) => d.id === "P6E1"));
  const water = resolve(ROOT_ID, SCHEMA.find((d) => d.id === "P6E3"));
  const waste = resolve(ROOT_ID, SCHEMA.find((d) => d.id === "P6E8"));
  const safety = resolve(ROOT_ID, SCHEMA.find((d) => d.id === "P3E11"));
  const head = resolve(ROOT_ID, SCHEMA.find((d) => d.id === "A18a"));

  const totalPeople = ["pemp", "oemp", "pwrk", "owrk"].reduce((s, k) => s + head[k].total, 0);
  const totalProjects = leavesOf(ROOT_ID).length;
  const totalSubs = subsidiariesOf(ROOT_ID).length;
  const overallPct = Math.round(entityCompleteness(ROOT_ID, leavesOf, SCHEMA) * 100);

  let pending = 0, approved = 0;
  leavesOf(ROOT_ID).forEach((l) =>
    SCHEMA.forEach((d) => {
      const s = STATUS[l]?.[d.id];
      if (s === "approved") approved += 1;
      else if (s === "review") pending += 1;
    })
  );

  const energyBySite = leavesOf(ROOT_ID).map((id) => ({
    name: ENTITIES[id].short,
    GJ: Math.round(resolve(id, SCHEMA.find((d) => d.id === "P6E1")).total.v / 1000),
  }));

  const genderSplit = [
    { name: "Male", value: ["pemp", "oemp", "pwrk", "owrk"].reduce((s, k) => s + head[k].male, 0) },
    { name: "Female", value: ["pemp", "oemp", "pwrk", "owrk"].reduce((s, k) => s + head[k].female, 0) },
  ];
  const COLORS = ["#2F7FA8", "#0F6E63"];

  return (
    <div className="page">
      <div className="page-head">
        <h1>Dashboard</h1>
        <p>MEIL Group overview for {period}</p>
      </div>

      <div className="stat-grid">
        <StatCard label="Subsidiaries" value={totalSubs} />
        <StatCard label="Projects" value={totalProjects} />
        <StatCard label="Data completion" value={`${overallPct}%`} tone={overallPct > 70 ? "good" : "warn"} />
        <StatCard label="Pending approvals" value={pending} tone={pending ? "warn" : "good"} />
        <StatCard label="Approved submissions" value={approved} tone="good" />
        <StatCard label="People on roll" value={fmt(totalPeople)} />
      </div>

      <div className="grid-2col">
        <div className="panel">
          <h3>Energy consumption by site (TJ)</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={energyBySite}>
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="GJ" fill="#0F6E63" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="panel">
          <h3>Workforce gender split</h3>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={genderSplit} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85}>
                {genderSplit.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
              </Pie>
              <Legend />
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid-3col" style={{ marginTop: 20 }}>
        <div className="panel-mini">
          <h4>Environmental</h4>
          <p>Water consumption: <b>{fmt(water.consumption.v / 1000)} ML</b></p>
          <p>Waste recovery rate: <b>{fmt(waste.recovery.v, 1)}%</b></p>
        </div>
        <div className="panel-mini">
          <h4>Social</h4>
          <p>Worker LTIFR: <b>{fmt(safety.ltifr.wrk, 2)}</b></p>
          <p>Fatalities this year: <b>{fmt(safety.fatal.wrk)}</b></p>
        </div>
        <div className="panel-mini">
          <h4>Governance</h4>
          <p>BRSR status: <b>4 disclosures pending approval</b></p>
          <p>Board policy coverage: <b>7 of 9 principles</b></p>
        </div>
      </div>
    </div>
  );
}
