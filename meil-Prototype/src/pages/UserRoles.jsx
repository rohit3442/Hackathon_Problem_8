// src/pages/UserRoles.jsx
// Page 12: User & Role Management (admin). Lists users, their role and
// scope, plus the role/access matrix given in the design brief.

import { useState } from "react";
import { USERS, ROLES } from "../data/mockData";

export default function UserRoles() {
  const [showInvite, setShowInvite] = useState(false);

  return (
    <div className="page">
      <div className="page-head">
        <h1>Users &amp; Roles</h1>
        <p>Manage who has access to the portal and what they can do.</p>
      </div>

      <div className="panel-title-row">
        <h3>Users</h3>
        <button className="btn btn-primary" onClick={() => setShowInvite((v) => !v)}>+ Invite user</button>
      </div>

      {showInvite && (
        <div className="inline-form">
          <label className="field-label">Email</label>
          <input className="field-input" placeholder="name@meil.in" />
          <label className="field-label">Role</label>
          <select className="field-input">
            {ROLES.map((r) => <option key={r.role}>{r.role}</option>)}
          </select>
          <div className="action-row" style={{ marginTop: 10 }}>
            <button className="btn btn-primary" onClick={() => setShowInvite(false)}>Send invite</button>
            <button className="btn btn-ghost" onClick={() => setShowInvite(false)}>Cancel</button>
          </div>
        </div>
      )}

      <table className="simple-table">
        <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Scope</th></tr></thead>
        <tbody>
          {USERS.map((u) => (
            <tr key={u.email}>
              <td>{u.name}</td>
              <td>{u.email}</td>
              <td>{u.role}</td>
              <td>{u.scope}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3 style={{ marginTop: 26 }}>Roles &amp; access</h3>
      <table className="simple-table">
        <thead><tr><th>Role</th><th>Access</th></tr></thead>
        <tbody>
          {ROLES.map((r) => (
            <tr key={r.role}><td>{r.role}</td><td>{r.access}</td></tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
