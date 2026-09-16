// src/data/schema.js
// The BRSR disclosure format (Annexure I) encoded as data rather than hardcoded
// forms. Each entry drives: the ESG Data Collection form, the BRSR Indicators
// page, the aggregation engine, and the Reports export. Add a new disclosure
// by adding an object here — no other file needs to change.
//
// agg field meaning:
//   SUM      -> values add up the entity tree
//   DERIVED  -> recomputed at every level from that level's own aggregates
//               (ratios must never be averaged across children)

export const ESG_CATEGORY = {
  environmental: "Environmental",
  social: "Social",
  governance: "Governance",
};

export const SCHEMA = [
  {
    id: "A18a",
    code: "A-18",
    brsrSection: "Section A",
    principle: null,
    tier: null,
    category: ESG_CATEGORY.social,
    title: "Employees and workers at year end",
    lead: "Headcount split by permanent / other-than-permanent and by gender.",
    core: false,
    cols: [
      { key: "total", label: "Total (A)" },
      { key: "male", label: "Male (B)" },
      { key: "female", label: "Female (C)" },
    ],
    rows: [
      { key: "pemp", label: "Permanent employees" },
      { key: "oemp", label: "Other than permanent employees" },
      { key: "pwrk", label: "Permanent workers" },
      { key: "owrk", label: "Other than permanent workers" },
    ],
    guidance:
      "Worker is defined under Sec 2(zr) of the Industrial Relations Code 2020. Other-than-permanent covers fixed-term or contractor-supplied people.",
  },
  {
    id: "P6E1",
    code: "P6.1",
    brsrSection: "Section C",
    principle: 6,
    tier: "Essential",
    category: ESG_CATEGORY.environmental,
    title: "Energy consumption and intensity",
    lead: "Electricity, fuel and other energy sources, in gigajoules.",
    core: true,
    cols: [{ key: "v", label: "Value", unit: "GJ" }],
    rows: [
      { key: "elec", label: "Total electricity consumption (A)" },
      { key: "fuel", label: "Total fuel consumption (B)" },
      { key: "other", label: "Energy from other sources (C)" },
      { key: "total", label: "Total energy consumption (A+B+C)", derived: true },
      {
        key: "intensity",
        label: "Energy intensity per rupee of turnover",
        derived: true,
        unit: "GJ / ₹ crore",
        dp: 2,
      },
      { key: "renew", label: "Of which, from renewable sources" },
    ],
    deriveRows: (v, ent) => {
      const total = (v.elec || 0) + (v.fuel || 0) + (v.other || 0);
      return { total, intensity: ent.turnover ? total / ent.turnover : 0 };
    },
    guidance:
      "Report in Joules or multiples (GJ). Energy generated and self-consumed is counted once. Intensity per rupee of turnover is mandatory.",
  },
  {
    id: "P6E3",
    code: "P6.3",
    brsrSection: "Section C",
    principle: 6,
    tier: "Essential",
    category: ESG_CATEGORY.environmental,
    title: "Water withdrawal, consumption and discharge",
    lead: "Withdrawal by source, plus discharge and derived consumption.",
    core: true,
    cols: [{ key: "v", label: "Volume", unit: "kL" }],
    rows: [
      { key: "surface", label: "Surface water" },
      { key: "ground", label: "Groundwater" },
      { key: "third", label: "Third party water" },
      { key: "others", label: "Other sources" },
      { key: "withdrawal", label: "Total water withdrawal", derived: true },
      { key: "discharge", label: "Total water discharged" },
      { key: "consumption", label: "Total water consumption", derived: true },
    ],
    deriveRows: (v) => {
      const w = (v.surface || 0) + (v.ground || 0) + (v.third || 0) + (v.others || 0);
      return { withdrawal: w, consumption: w - (v.discharge || 0) };
    },
    validate: (v) => {
      const w = (v.surface || 0) + (v.ground || 0) + (v.third || 0) + (v.others || 0);
      const issues = [];
      if ((v.discharge || 0) > w)
        issues.push({ level: "error", msg: "Discharge exceeds total withdrawal." });
      if (w && (v.ground || 0) / w > 0.6)
        issues.push({ level: "warning", msg: "Groundwater is over 60% of withdrawal — check CGWB stress classification." });
      return issues;
    },
    guidance:
      "Consumption = withdrawal − discharge, where consumption is not separately metered.",
  },
  {
    id: "P6E8",
    code: "P6.8",
    brsrSection: "Section C",
    principle: 6,
    tier: "Essential",
    category: ESG_CATEGORY.environmental,
    title: "Waste generated, recovered and disposed",
    lead: "Waste by category, split into recovered vs landfilled.",
    core: true,
    cols: [{ key: "v", label: "Quantity", unit: "MT" }],
    rows: [
      { key: "plastic", label: "Plastic waste" },
      { key: "ewaste", label: "E-waste" },
      { key: "hazard", label: "Other hazardous waste" },
      { key: "nonhaz", label: "Other non-hazardous waste" },
      { key: "totalw", label: "Total waste generated", derived: true },
      { key: "recycled", label: "Recovered through recycling / re-use" },
      { key: "landfill", label: "Disposed to landfill" },
      { key: "recovery", label: "Recovery rate", derived: true, unit: "%", dp: 1 },
    ],
    deriveRows: (v) => {
      const t = (v.plastic || 0) + (v.ewaste || 0) + (v.hazard || 0) + (v.nonhaz || 0);
      return { totalw: t, recovery: t ? ((v.recycled || 0) / t) * 100 : 0 };
    },
    guidance:
      "Landfilling means deposit into a sanitary landfill. Open burning/dumping must be reported as non-compliance, not disposal.",
  },
  {
    id: "P3E11",
    code: "P3.11",
    brsrSection: "Section C",
    principle: 3,
    tier: "Essential",
    category: ESG_CATEGORY.social,
    title: "Safety incidents and LTIFR",
    lead: "Lost-time injuries and the frequency rate derived from hours worked.",
    core: true,
    cols: [
      { key: "emp", label: "Employees" },
      { key: "wrk", label: "Workers" },
    ],
    rows: [
      { key: "lti", label: "Lost time injuries in the year" },
      { key: "hours", label: "Total hours worked", unit: "hrs" },
      { key: "ltifr", label: "LTIFR (per million person-hours)", derived: true, dp: 2 },
      { key: "fatal", label: "Fatalities" },
    ],
    perColumn: true,
    derive: (row) => ({ ltifr: row.hours ? (row.lti * 1_000_000) / row.hours : 0 }),
    guidance:
      "LTIFR = lost time injuries × 1,000,000 ÷ total hours worked. Sum injuries and hours up the tree, then recompute the rate — never average site rates.",
  },
  {
    id: "P5E6",
    code: "P5.6",
    brsrSection: "Section C",
    principle: 5,
    tier: "Essential",
    category: ESG_CATEGORY.social,
    title: "Human rights related complaints",
    lead: "Complaints filed and pending, by category.",
    core: false,
    cols: [
      { key: "filed", label: "Filed" },
      { key: "pending", label: "Pending" },
    ],
    rows: [
      { key: "sexharass", label: "Sexual harassment" },
      { key: "discrim", label: "Discrimination at workplace" },
      { key: "child", label: "Child labour" },
      { key: "forced", label: "Forced / involuntary labour" },
      { key: "wages", label: "Wages" },
    ],
    perColumn: true,
    validate: (_v, byRow) => {
      const issues = [];
      if ((byRow.child?.filed || 0) > 0)
        issues.push({ level: "error", msg: "Child labour complaint recorded — requires materiality assessment before filing." });
      return issues;
    },
    guidance: "Child = under 14 years (Child Labour Prohibition & Regulation Act, 1986).",
  },
  {
    id: "GOV1",
    code: "B-9",
    brsrSection: "Section B",
    principle: null,
    tier: null,
    category: ESG_CATEGORY.governance,
    title: "Policy coverage and board oversight",
    lead: "Whether each of the nine principles is covered by a Board-approved policy.",
    core: false,
    cols: [{ key: "v", label: "Status" }],
    rows: [
      { key: "policyCoverage", label: "Principles covered by policy (of 9)" },
      { key: "boardApproved", label: "Policies approved by the Board (of 9)" },
      { key: "valueChainExtended", label: "Policies extended to value chain (of 9)" },
      { key: "externalAssessed", label: "Principles independently assessed (of 9)" },
    ],
    guidance:
      "Section B asks whether policy exists, is Board-approved, is translated into procedure, and extends to value chain partners for each principle.",
  },
];

export const byId = (id) => SCHEMA.find((d) => d.id === id);
export const byCategory = (cat) => SCHEMA.filter((d) => d.category === cat);

export const PRINCIPLES = [
  { n: 1, title: "Ethics, transparency and accountability" },
  { n: 2, title: "Sustainable and safe goods and services" },
  { n: 3, title: "Well-being of employees" },
  { n: 4, title: "Responsive to stakeholders" },
  { n: 5, title: "Human rights" },
  { n: 6, title: "Protect and restore the environment" },
  { n: 7, title: "Responsible public policy engagement" },
  { n: 8, title: "Inclusive growth and equitable development" },
  { n: 9, title: "Responsible engagement with consumers" },
];

export const SDG_MAP = [
  { activity: "Water conservation", sdg: 6, sdgTitle: "Clean Water and Sanitation" },
  { activity: "Renewable energy adoption", sdg: 7, sdgTitle: "Affordable and Clean Energy" },
  { activity: "Worker safety programs", sdg: 8, sdgTitle: "Decent Work and Economic Growth" },
  { activity: "Waste recycling initiatives", sdg: 12, sdgTitle: "Responsible Consumption and Production" },
  { activity: "GHG emission reduction", sdg: 13, sdgTitle: "Climate Action" },
  { activity: "Community development (CSR)", sdg: 11, sdgTitle: "Sustainable Cities and Communities" },
];
