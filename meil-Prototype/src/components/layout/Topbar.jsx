// src/components/layout/Topbar.jsx
// Top bar: shows the currently selected entity path, a reporting-period
// switcher, and the logged-in user with logout. Reads/writes global state
// through useApp() so any page can change scope and have it reflected here.

import { useApp } from "../../context/AppContext";
import { pathTo, ENTITIES } from "../../data/entities";

export default function Topbar() {
  const { user, logout, selectedEntity, period, setPeriod } = useApp();
  const crumbs = pathTo(selectedEntity).map((id) => ENTITIES[id].short);

  return (
    <header className="topbar">
      <div className="topbar-scope">
        {crumbs.map((c, i) => (
          <span key={i}>
            {i > 0 && <i className="crumb-sep">›</i>}
            {c}
          </span>
        ))}
      </div>
      <div className="topbar-period">
        <label htmlFor="period-select">Reporting period</label>
        <select id="period-select" value={period} onChange={(e) => setPeriod(e.target.value)}>
          <option>FY 2024-25</option>
          <option>FY 2023-24</option>
        </select>
      </div>
      <div className="topbar-user">
        <div className="avatar">{user?.name?.slice(0, 2).toUpperCase() || "?"}</div>
        <div className="topbar-user-meta">
          <b>{user?.name || "Guest"}</b>
          <span>{user?.role}</span>
        </div>
        <button className="btn btn-ghost" onClick={logout}>Sign out</button>
      </div>
    </header>
  );
}
