// src/App.jsx
// The route table. Wraps everything in AppProvider (global state), then
// defines Login as a standalone route and every other page inside Layout
// (Sidebar + Topbar) behind a simple auth guard.

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppProvider, useApp } from "./context/AppContext";
import Layout from "./components/layout/Layout";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Organization from "./pages/Organization";
import EsgDataCollection from "./pages/EsgDataCollection";
import BrsrIndicators from "./pages/BrsrIndicators";
import Validation from "./pages/Validation";
import ReviewApproval from "./pages/ReviewApproval";
import Analytics from "./pages/Analytics";
import SdgMapping from "./pages/SdgMapping";
import Reports from "./pages/Reports";
import AuditTrail from "./pages/AuditTrail";
import UserRoles from "./pages/UserRoles";

function RequireAuth({ children }) {
  const { user } = useApp();
  return user ? children : <Navigate to="/login" replace />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          <RequireAuth>
            <Layout />
          </RequireAuth>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="organization" element={<Organization />} />
        <Route path="esg-data" element={<EsgDataCollection />} />
        <Route path="brsr" element={<BrsrIndicators />} />
        <Route path="validation" element={<Validation />} />
        <Route path="approvals" element={<ReviewApproval />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="sdg-mapping" element={<SdgMapping />} />
        <Route path="reports" element={<Reports />} />
        <Route path="audit-trail" element={<AuditTrail />} />
        <Route path="users" element={<UserRoles />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AppProvider>
  );
}
