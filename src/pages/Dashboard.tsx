import React from 'react';
import { useAuth } from '../context/AuthContext';
import { ProjectUserDashboard } from '../components/dashboards/ProjectUserDashboard';
import { BUManagerDashboard } from '../components/dashboards/BUManagerDashboard';
import { SubsidiaryAdminDashboard } from '../components/dashboards/SubsidiaryAdminDashboard';
import { ESGTeamDashboard } from '../components/dashboards/ESGTeamDashboard';
import { GroupAdminDashboard } from '../components/dashboards/GroupAdminDashboard';
import { ManagementDashboard } from '../components/dashboards/ManagementDashboard';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const role = user?.role || 'project_user';

  // Render role-specific dashboard experience
  switch (role) {
    case 'project_user':
      return <ProjectUserDashboard />;
    case 'bu_manager':
      return <BUManagerDashboard />;
    case 'subsidiary_admin':
      return <SubsidiaryAdminDashboard />;
    case 'esg_team':
      return <ESGTeamDashboard />;
    case 'group_admin':
    case 'group_admin_management':
      return <GroupAdminDashboard />;
    case 'management':
      return <ManagementDashboard />;
    default:
      return <ProjectUserDashboard />;
  }
};

export default Dashboard;
