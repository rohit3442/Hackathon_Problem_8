import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ManagementDashboard } from '../components/dashboards/ManagementDashboard';
import { getRoleDefaultPath } from '../services/userRegistry';

export const ExecutiveDashboard: React.FC = () => {
  const { user } = useAuth();
  const role = user?.role;

  // Strict Role Protection: Only Management and Group Admin can view Executive Dashboard
  if (role !== 'management' && role !== 'group_admin' && role !== 'group_admin_management') {
    return <Navigate to={getRoleDefaultPath(role || 'project_user')} replace />;
  }

  return <ManagementDashboard />;
};

export default ExecutiveDashboard;
