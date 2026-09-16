// src/data/entities.js
// The organization hierarchy: Group -> Subsidiary -> Business Unit / Project.
// This is the single source of truth for the org tree. Add/edit entities here
// and every page (Organization, ESG Data Collection, BRSR, Analytics, Reports)
// picks the change up automatically.

export const ROOT_ID = "meil";

export const ENTITIES = {
  meil: {
    id: "meil",
    name: "Megha Engineering & Infrastructures Ltd",
    short: "MEIL Group",
    kind: "Group",
    turnover: 86400, // in INR crore, used for intensity ratios
    children: ["hydro", "water", "roads"],
  },
  hydro: {
    id: "hydro",
    name: "MEIL Hydro Power Ltd",
    short: "Hydro Power",
    kind: "Subsidiary",
    turnover: 31200,
    children: ["pola", "kalesh"],
  },
  pola: {
    id: "pola",
    name: "Polavaram Head Works",
    short: "Polavaram",
    kind: "Project",
    state: "Andhra Pradesh",
    turnover: 18400,
    children: [],
  },
  kalesh: {
    id: "kalesh",
    name: "Kaleshwaram Lift Package 8",
    short: "Kaleshwaram",
    kind: "Project",
    state: "Telangana",
    turnover: 12800,
    children: [],
  },
  water: {
    id: "water",
    name: "MEIL Water Infrastructure Ltd",
    short: "Water Infra",
    kind: "Subsidiary",
    turnover: 24100,
    children: ["bhag"],
  },
  bhag: {
    id: "bhag",
    name: "Mission Bhagiratha Grid",
    short: "Bhagiratha",
    kind: "Project",
    state: "Telangana",
    turnover: 24100,
    children: [],
  },
  roads: {
    id: "roads",
    name: "MEIL Transport Infra Ltd",
    short: "Transport",
    kind: "Subsidiary",
    turnover: 31100,
    children: ["nh163", "metro"],
  },
  nh163: {
    id: "nh163",
    name: "NH-163 Corridor Package 4",
    short: "NH-163",
    kind: "Project",
    state: "Telangana",
    turnover: 17600,
    children: [],
  },
  metro: {
    id: "metro",
    name: "Chennai Metro UG-04",
    short: "Metro UG-04",
    kind: "Project",
    state: "Tamil Nadu",
    turnover: 13500,
    children: [],
  },
};

export const isLeaf = (id) => ENTITIES[id].children.length === 0;

export const leavesOf = (id) =>
  isLeaf(id) ? [id] : ENTITIES[id].children.flatMap(leavesOf);

export const parentOf = (id) =>
  Object.keys(ENTITIES).find((k) => ENTITIES[k].children.includes(id));

export const pathTo = (id) => {
  const p = [];
  let cur = id;
  while (cur) {
    p.unshift(cur);
    cur = parentOf(cur);
  }
  return p;
};

export const allEntityIds = () => Object.keys(ENTITIES);

export const subsidiariesOf = (groupId = ROOT_ID) =>
  ENTITIES[groupId].children;
