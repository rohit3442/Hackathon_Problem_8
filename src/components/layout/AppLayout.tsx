import React, { useState } from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Sidebar } from './Sidebar';
import { TopHeader } from './TopHeader';
import { ToastContainer } from '../common/ToastContainer';
import { AIAssistantDrawer } from '../assistant/AIAssistantDrawer';

export const AppLayout: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // If not authenticated, always direct user to the login screen
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return (
    <div className="min-h-screen flex bg-[#f8faf9] dark:bg-[#080d0b] text-slate-800 dark:text-slate-100 transition-colors duration-200">
      {/* Sidebar (Desktop persistent, Tablet collapsible, Mobile drawer) */}
      <Sidebar
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
      />

      {/* Main Content Area */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out ${
          isCollapsed ? 'md:pl-18' : 'md:pl-64'
        }`}
      >
        {/* Top Header */}
        <TopHeader
          onMobileMenuClick={() => setIsMobileOpen(true)}
          isCollapsed={isCollapsed}
        />

        {/* Dynamic Route Outlet */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>

      {/* ESG AI Assistant Copilot Drawer */}
      <AIAssistantDrawer />

      {/* Global Notification Toasts */}
      <ToastContainer />
    </div>
  );
};
