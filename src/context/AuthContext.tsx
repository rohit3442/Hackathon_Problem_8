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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    try {
      const savedUserId = sessionStorage.getItem('eco_metrics_active_user');
      if (savedUserId) {
        const found = MOCK_USERS.find(u => u.id === savedUserId);
        if (found) return found;
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

  const switchRole = (role: UserRole) => {
    const targetUser = MOCK_USERS.find(u => u.role === role) || MOCK_USERS[0];
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

    // Strict Role Enforcement
    if (role && targetUser.role !== role) {
      const roleLabels: Record<string, string> = {
        project_user: 'Project User',
        bu_manager: 'Business Manager',
        subsidiary_admin: 'Subsidiary Admin',
        esg_team: 'ESG Team',
        group_admin: 'Group Admin',
        management: 'Management'
      };
      const userRoleLabel = roleLabels[targetUser.role] || targetUser.role;
      const requestedRoleLabel = roleLabels[role] || role;

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

    setUser(targetUser);
    return { success: true };
  };

  const logout = () => {
    setUser(null);
    sessionStorage.removeItem('eco_metrics_active_user');
  };

  const role = user?.role;
  const canEditData = role === 'project_user' || role === 'esg_team' || role === 'group_admin';
  const canReviewBU = role === 'bu_manager' || role === 'subsidiary_admin' || role === 'group_admin';
  const canApproveSubsidiary = role === 'subsidiary_admin' || role === 'group_admin';
  const canValidateESG = role === 'esg_team' || role === 'group_admin';
  const canFinalApprove = role === 'group_admin' || role === 'management';
  const canPublishReports = role === 'esg_team' || role === 'group_admin' || role === 'management';

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
