// src/components/layout/Sidebar.jsx
// Left navigation. Structure follows the site map from the design brief:
// Dashboard, Organization, Projects, ESG Data, BRSR, Validation, Approvals,
// Analytics, SDG Mapping, Reports, Audit Trail, Users & Roles, Settings.

import { NavLink } from "react-router-dom";

const NAV_ITEMS = [
  { to: "/", label: "Dashboard", icon: "🏠", end: true },
  { to: "/organization", label: "Organization", icon: "🏢" },
  { to: "/esg-data", label: "ESG Data", icon: "🌱" },
  { to: "/brsr", label: "BRSR", icon: "📋" },
  { to: "/validation", label: "Validation", icon: "🔍" },
  { to: "/approvals", label: "Approvals", icon: "✅" },
  { to: "/analytics", label: "ESG Analytics", icon: "📊" },
  { to: "/sdg-mapping", label: "SDG Mapping", icon: "🎯" },
  { to: "/reports", label: "Reports", icon: "📄" },
  { to: "/audit-trail", label: "Audit Trail", icon: "📝" },
  { to: "/users", label: "Users & Roles", icon: "👥" },
];

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">MEIL ESG</div>
      <nav className="sidebar-nav">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) => "sidebar-link" + (isActive ? " active" : "")}
          >
            <span className="sidebar-icon">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
