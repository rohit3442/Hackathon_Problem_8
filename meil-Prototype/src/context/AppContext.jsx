// src/context/AppContext.jsx
// Global state shared across the whole app: who is logged in, which entity
// and reporting period are selected. Any component can read/update this via
// the useApp() hook instead of passing props down through every page.

import { createContext, useContext, useState } from "react";
import { ROOT_ID } from "../data/entities";

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [user, setUser] = useState(null); // null = logged out
  const [selectedEntity, setSelectedEntity] = useState(ROOT_ID);
  const [period, setPeriod] = useState("FY 2024-25");

  const login = (email, role) => {
    setUser({ name: email.split("@")[0].replace(".", " "), email, role });
  };
  const logout = () => setUser(null);

  const value = {
    user,
    login,
    logout,
    selectedEntity,
    setSelectedEntity,
    period,
    setPeriod,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
