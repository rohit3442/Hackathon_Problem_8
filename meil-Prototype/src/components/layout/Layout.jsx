// src/components/layout/Layout.jsx
// The authenticated app shell: Sidebar on the left, Topbar across the top,
// and the routed page in between via React Router's <Outlet />.

import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

export default function Layout() {
  return (
    <div className="app-shell">
      <Sidebar />
      <div className="app-main">
        <Topbar />
        <div className="app-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
