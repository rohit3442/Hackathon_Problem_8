import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';
import { getRoleDefaultPath, isRouteAllowedForRole, ROLE_LABELS } from '../../services/userRegistry';

interface RoleGuardProps {
  allowedRoles?: UserRole[];
  children: React.ReactNode;
}

export const RoleGuard: React.FC<RoleGuardProps> = ({ allowedRoles, children }) => {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const role = user.role;

  // 1. Check explicit allowedRoles if provided
  if (allowedRoles && allowedRoles.length > 0) {
    const isExplicitlyAllowed =
      allowedRoles.includes(role) ||
      ((role === 'group_admin' || role === 'group_admin_management') &&
        allowedRoles.includes('group_admin'));

    if (!isExplicitlyAllowed) {
      const targetPath = getRoleDefaultPath(role);
      return <Navigate to={targetPath} replace />;
    }
  }

  // 2. Check route permission from registry
  const routeCheck = isRouteAllowedForRole(role, location.pathname);
  if (!routeCheck.allowed) {
    const targetPath = getRoleDefaultPath(role);
    return <Navigate to={targetPath} replace />;
  }

  return <>{children}</>;
};

export default RoleGuard;
