// src/data/mockData.js
// Placeholder leaf-level submissions (what a site would actually type in) and
// their workflow status. In a real build this comes from the API; here it's a
// plain object so the whole app runs standalone. Swap this file for API calls
// without touching any component.

export const RESPONSES = {
  pola: {
    A18a: {
      pemp: { total: 340, male: 291, female: 49 },
      oemp: { total: 118, male: 101, female: 17 },
      pwrk: { total: 1260, male: 1192, female: 68 },
      owrk: { total: 4180, male: 3711, female: 469 },
    },
    P6E1: { elec: { v: 214800 }, fuel: { v: 498300 }, other: { v: 6400 }, renew: { v: 31200 } },
    P6E3: { surface: { v: 1284000 }, ground: { v: 196000 }, third: { v: 74500 }, others: { v: 0 }, discharge: { v: 612000 } },
    P6E8: { plastic: { v: 84 }, ewaste: { v: 11 }, hazard: { v: 172 }, nonhaz: { v: 940 }, recycled: { v: 640 }, landfill: { v: 300 } },
    P3E11: { lti: { emp: 2, wrk: 14 }, hours: { emp: 712000, wrk: 9840000 }, fatal: { emp: 0, wrk: 1 } },
    P5E6: { sexharass: { filed: 1, pending: 0 }, discrim: { filed: 2, pending: 1 }, child: { filed: 0, pending: 0 }, forced: { filed: 0, pending: 0 }, wages: { filed: 7, pending: 2 } },
  },
  kalesh: {
    A18a: {
      pemp: { total: 212, male: 184, female: 28 },
      oemp: { total: 74, male: 66, female: 8 },
      pwrk: { total: 880, male: 842, female: 38 },
      owrk: { total: 2940, male: 2618, female: 322 },
    },
    P6E1: { elec: { v: 168200 }, fuel: { v: 341700 }, other: { v: 2900 }, renew: { v: 8400 } },
    P6E3: { surface: { v: 742000 }, ground: { v: 388000 }, third: { v: 41000 }, others: { v: 0 }, discharge: { v: 401000 } },
    P6E8: { plastic: { v: 61 }, ewaste: { v: 7 }, hazard: { v: 118 }, nonhaz: { v: 610 }, recycled: { v: 420 }, landfill: { v: 250 } },
    P3E11: { lti: { emp: 1, wrk: 9 }, hours: { emp: 448000, wrk: 6720000 }, fatal: { emp: 0, wrk: 0 } },
    P5E6: { sexharass: { filed: 0, pending: 0 }, discrim: { filed: 1, pending: 0 }, child: { filed: 0, pending: 0 }, forced: { filed: 0, pending: 0 }, wages: { filed: 4, pending: 1 } },
  },
  bhag: {
    A18a: {
      pemp: { total: 296, male: 238, female: 58 },
      oemp: { total: 91, male: 74, female: 17 },
      pwrk: { total: 640, male: 592, female: 48 },
      owrk: { total: 2110, male: 1826, female: 284 },
    },
    P6E1: { elec: { v: 402600 }, fuel: { v: 118400 }, other: { v: 1100 }, renew: { v: 96800 } },
    P6E3: { surface: { v: 310000 }, ground: { v: 842000 }, third: { v: 28000 }, others: { v: 0 }, discharge: { v: 1268000 } },
    P6E8: { plastic: { v: 118 }, ewaste: { v: 22 }, hazard: { v: 64 }, nonhaz: { v: 520 }, recycled: { v: 210 }, landfill: { v: 90 } },
    P3E11: { lti: { emp: 0, wrk: 5 }, hours: { emp: 592000, wrk: 4180000 }, fatal: { emp: 0, wrk: 0 } },
    P5E6: { sexharass: { filed: 0, pending: 0 }, discrim: { filed: 0, pending: 0 }, child: { filed: 0, pending: 0 }, forced: { filed: 0, pending: 0 }, wages: { filed: 2, pending: 0 } },
  },
  nh163: {
    A18a: {
      pemp: { total: 188, male: 166, female: 22 },
      oemp: { total: 56, male: 51, female: 5 },
      pwrk: { total: 520, male: 498, female: 22 },
      owrk: { total: 1980, male: 1754, female: 226 },
    },
    P6E1: { elec: { v: 96400 }, fuel: { v: 612900 }, other: { v: 4200 }, renew: { v: 12600 } },
    P6E3: { surface: { v: 188000 }, ground: { v: 264000 }, third: { v: 96000 }, others: { v: 0 }, discharge: { v: 142000 } },
    P6E8: { plastic: { v: 47 }, ewaste: { v: 4 }, hazard: { v: 96 }, nonhaz: { v: 380 }, recycled: { v: 300 }, landfill: { v: 130 } },
    P3E11: { lti: { emp: 1, wrk: 11 }, hours: { emp: 392000, wrk: 5460000 }, fatal: { emp: 0, wrk: 0 } },
    P5E6: { sexharass: { filed: 0, pending: 0 }, discrim: { filed: 1, pending: 1 }, child: { filed: 0, pending: 0 }, forced: { filed: 0, pending: 0 }, wages: { filed: 5, pending: 3 } },
  },
  metro: {
    A18a: {
      pemp: { total: 254, male: 198, female: 56 },
      oemp: { total: 88, male: 69, female: 19 },
      pwrk: { total: 430, male: 398, female: 32 },
      owrk: { total: 1640, male: 1402, female: 238 },
    },
    P6E1: { elec: { v: 288100 }, fuel: { v: 204600 }, other: { v: 900 }, renew: { v: 41400 } },
    P6E3: { surface: { v: 62000 }, ground: { v: 118000 }, third: { v: 412000 }, others: { v: 0 }, discharge: { v: 388000 } },
    P6E8: { plastic: { v: 92 }, ewaste: { v: 16 }, hazard: { v: 88 }, nonhaz: { v: 460 }, recycled: { v: 350 }, landfill: { v: 160 } },
    P3E11: { lti: { emp: 0, wrk: 7 }, hours: { emp: 486000, wrk: 3920000 }, fatal: { emp: 0, wrk: 0 } },
    P5E6: { sexharass: { filed: 2, pending: 1 }, discrim: { filed: 0, pending: 0 }, child: { filed: 1, pending: 1 }, forced: { filed: 0, pending: 0 }, wages: { filed: 3, pending: 0 } },
  },
};

// status per leaf entity per disclosure id: 'approved' | 'review' | 'draft' | 'none'
export const STATUS = {
  pola: { A18a: "approved", P6E1: "approved", P6E3: "review", P6E8: "approved", P3E11: "approved", P5E6: "review" },
  kalesh: { A18a: "approved", P6E1: "approved", P6E3: "approved", P6E8: "review", P3E11: "approved", P5E6: "approved" },
  bhag: { A18a: "approved", P6E1: "review", P6E3: "draft", P6E8: "approved", P3E11: "approved", P5E6: "approved" },
  nh163: { A18a: "approved", P6E1: "approved", P6E3: "approved", P6E8: "approved", P3E11: "review", P5E6: "draft" },
  metro: { A18a: "review", P6E1: "draft", P6E3: "approved", P6E8: "draft", P3E11: "approved", P5E6: "review" },
};

export const STATUS_LABEL = {
  approved: "Approved",
  review: "In review",
  draft: "Draft",
  none: "Not started",
};

export const AUDIT_LOG = [
  { user: "Rahul Sharma", action: "Added ESG data — P6.1 Energy", entity: "Polavaram", date: "12 Sep 2026", status: "Submitted" },
  { user: "Amit Verma", action: "Reviewed P6.1 Energy", entity: "Polavaram", date: "13 Sep 2026", status: "Approved" },
  { user: "Priya Menon", action: "Modified water discharge figure", entity: "Bhagiratha", date: "14 Sep 2026", status: "Updated" },
  { user: "S. Reddy", action: "Rejected P5.6 Complaints", entity: "Metro UG-04", date: "14 Sep 2026", status: "Rejected" },
  { user: "Rekha Nair", action: "Approved consolidated Section A", entity: "MEIL Group", date: "15 Sep 2026", status: "Approved" },
  { user: "K. Iyer", action: "Uploaded evidence — DISCOM invoices", entity: "NH-163", date: "15 Sep 2026", status: "Submitted" },
];

export const USERS = [
  { name: "Rahul Sharma", email: "rahul.sharma@meil.in", role: "Project User", scope: "Polavaram" },
  { name: "Amit Verma", email: "amit.verma@meil.in", role: "Project Manager", scope: "Hydro Power" },
  { name: "Priya Menon", email: "priya.menon@meil.in", role: "Subsidiary Admin", scope: "Water Infra" },
  { name: "S. Reddy", email: "s.reddy@meil.in", role: "ESG Team", scope: "MEIL Group" },
  { name: "Rekha Nair", email: "rekha.nair@meil.in", role: "Group Admin", scope: "MEIL Group" },
  { name: "V. Krishnan", email: "v.krishnan@meil.in", role: "Management", scope: "MEIL Group" },
];

export const ROLES = [
  { role: "Project User", access: "Enter project-level data" },
  { role: "Project Manager", access: "Review project submissions" },
  { role: "Subsidiary Admin", access: "Manage subsidiary organization & users" },
  { role: "ESG Team", access: "Validate and consolidate group data" },
  { role: "Group Admin", access: "Full access across the portal" },
  { role: "Management", access: "Dashboard and reports, read-only" },
];
