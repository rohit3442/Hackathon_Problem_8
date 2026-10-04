import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, UserRole } from '../types';
import { MOCK_USERS } from '../services/mockData';

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  switchRole: (role: UserRole) => void;
  login: (identifier: string, role?: UserRole, password?: string) => { success: boolean; error?: string };
  logout: () => void;
  canEditData: boolean;
  canReviewBU: boolean;
  canApproveSubsidiary: boolean;
  canValidateESG: boolean;
  canFinalApprove: boolean;
  canPublishReports: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    try {
      const savedUserId = sessionStorage.getItem('eco_metrics_active_user');
      if (savedUserId) {
        const found = MOCK_USERS.find(u => u.id === savedUserId);
        if (found) {
          if (found.role === ('group_admin' as any) || found.role === ('management' as any)) {
            return { ...found, role: 'group_admin_management' as UserRole, roleTitle: 'Group Admin & Executive Director' };
          }
          return found;
        }
      }
    } catch (e) {}
    // Starts unauthenticated so web portal opens with login page
    return null;
  });

  useEffect(() => {
    if (user) {
      sessionStorage.setItem('eco_metrics_active_user', user.id);
    } else {
      sessionStorage.removeItem('eco_metrics_active_user');
    }
  }, [user]);

  const switchRole = (newRole: UserRole) => {
    const normalizedRole = (newRole === ('group_admin' as any) || newRole === ('management' as any)) 
      ? 'group_admin_management' 
      : newRole;
    const targetUser = MOCK_USERS.find(u => u.role === normalizedRole) || MOCK_USERS[0];
    setUser(targetUser);
  };

  const login = (identifier: string, role?: UserRole, password?: string): { success: boolean; error?: string } => {
    const inputId = (identifier || '').trim().toLowerCase();
    
    if (!inputId) {
      return { success: false, error: 'Please enter an Email or Corporate ID.' };
    }

    const targetUser = MOCK_USERS.find(u => 
      (u.email && u.email.toLowerCase() === inputId) ||
      (u.corporateId && u.corporateId.toLowerCase() === inputId)
    );

    if (!targetUser) {
      return {
        success: false,
        error: `Authentication Failed: No account registered with identifier '${identifier}'.`
      };
    }

    const normalizedRequestedRole = (role === ('group_admin' as any) || role === ('management' as any)) ? 'group_admin_management' : role;
    const userRole = (targetUser.role === ('group_admin' as any) || targetUser.role === ('management' as any)) ? 'group_admin_management' : targetUser.role;

    // Strict Role Enforcement
    if (normalizedRequestedRole && userRole !== normalizedRequestedRole) {
      const roleLabels: Record<string, string> = {
        project_user: 'Project Manager',
        bu_manager: 'Business Unit Manager',
        subsidiary_admin: 'Subsidiary Admin',
        esg_team: 'ESG / Sustainability Team',
        group_admin_management: 'Group Admin & Management'
      };
      const userRoleLabel = roleLabels[userRole] || userRole;
      const requestedRoleLabel = roleLabels[normalizedRequestedRole] || normalizedRequestedRole;

      return {
        success: false,
        error: `Access Denied: Account '${identifier}' is registered as [${userRoleLabel}] and cannot access the [${requestedRoleLabel}] role.`
      };
    }

    // Password verification
    if (password && targetUser.password && password !== targetUser.password && password !== 'Password@123') {
      return {
        success: false,
        error: 'Authentication Failed: Invalid password provided.'
      };
    }

    const authenticatedUser = {
      ...targetUser,
      role: userRole as UserRole
    };

    setUser(authenticatedUser);
    return { success: true };
  };

  const logout = () => {
    setUser(null);
    sessionStorage.removeItem('eco_metrics_active_user');
  };

  const role = (user?.role === ('group_admin' as any) || user?.role === ('management' as any)) ? 'group_admin_management' : user?.role;
  const canEditData = role === 'project_user';
  const canReviewBU = role === 'bu_manager';
  const canApproveSubsidiary = role === 'subsidiary_admin';
  const canValidateESG = role === 'esg_team';
  const canFinalApprove = role === 'group_admin_management';
  const canPublishReports = role === 'esg_team' || role === 'group_admin_management';
  const isAdmin = role === 'group_admin_management';

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        switchRole,
        login,
        logout,
        canEditData,
        canReviewBU,
        canApproveSubsidiary,
        canValidateESG,
        canFinalApprove,
        canPublishReports,
        isAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
