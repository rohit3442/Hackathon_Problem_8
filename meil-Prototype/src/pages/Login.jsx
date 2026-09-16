// src/pages/Login.jsx
// Page 1: Login. Email/password + role-based login as called for in the
// brief. On submit, stores the user in AppContext and the router (see
// App.jsx) redirects into the authenticated shell.

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { ROLES } from "../data/mockData";

export default function Login() {
  const { login } = useApp();
  const navigate = useNavigate();
  const [email, setEmail] = useState("rekha.nair@meil.in");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("Group Admin");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Enter both an email and a password.");
      return;
    }
    login(email, role);
    navigate("/");
  };

  return (
    <div className="login-screen">
      <form className="login-card" onSubmit={handleSubmit}>
        <div className="login-brand">MEIL ESG</div>
        <p className="login-sub">BRSR reporting portal — sign in to continue</p>

        <label className="field-label" htmlFor="email">Email</label>
        <input
          id="email"
          className="field-input"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="name@meil.in"
        />

        <label className="field-label" htmlFor="password">Password</label>
        <input
          id="password"
          className="field-input"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
        />

        <label className="field-label" htmlFor="role">Sign in as</label>
        <select id="role" className="field-input" value={role} onChange={(e) => setRole(e.target.value)}>
          {ROLES.map((r) => (
            <option key={r.role}>{r.role}</option>
          ))}
        </select>

        {error && <div className="form-error">{error}</div>}

        <button className="btn btn-primary" type="submit" style={{ width: "100%", marginTop: 14 }}>
          Sign in
        </button>
        <a className="login-forgot" href="#!">Forgot password?</a>
      </form>
    </div>
  );
}
