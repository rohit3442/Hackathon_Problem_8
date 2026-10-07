import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, UserRole } from '../types';
import { MOCK_USERS } from '../services/mockData';

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  switchRole: (role: UserRole) => void;
  login: (
    identifier: string, 
    role?: UserRole, 
    password?: string, 
    metadata?: { name?: string; role?: string; roleTitle?: string }
  ) => { success: boolean; error?: string };
  loginWithGoogle: (email: string, name?: string, role?: UserRole, avatar?: string) => { success: boolean; error?: string };
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

export const getAssignedRoleForEmail = (
  email: string, 
  requestedRole?: UserRole,
  metadataRole?: string
): UserRole => {
  const cleanEmail = (email || '').toLowerCase().trim();
  
  // 1. HIGHEST PRIORITY: Explicitly configured role from Supabase user_metadata (raw_user_meta_data)
  if (metadataRole) {
    const cleanMeta = metadataRole.toLowerCase().trim();
    const roleMapping: Record<string, UserRole> = {
      project_user: 'project_user',
      'project user': 'project_user',
      bu_manager: 'bu_manager',
      'bu manager': 'bu_manager',
      subsidiary_admin: 'subsidiary_admin',
      'subsidiary admin': 'subsidiary_admin',
      esg_team: 'esg_team',
      'esg team': 'esg_team',
      group_admin: 'group_admin',
      'group admin': 'group_admin',
      group_admin_management: 'group_admin_management',
      management: 'management'
    };
    if (roleMapping[cleanMeta]) {
      return roleMapping[cleanMeta];
    }
  }

  // 2. Explicit configured accounts (known demos & accounts)
  const GMAIL_ROLE_MAP: Record<string, UserRole> = {
    'rohitkumarsahu144@gmail.com': 'group_admin',
    'rekha.nair@meil.in': 'group_admin',
    'admin@gmail.com': 'group_admin',
    'vikram.malhotra@meil.in': 'bu_manager',
    'bu.manager@gmail.com': 'bu_manager',
    'sunita.rao@meil.in': 'subsidiary_admin',
    'sub.admin@gmail.com': 'subsidiary_admin',
    'rajesh.verma@meil.in': 'project_user',
    'project.user@gmail.com': 'project_user',
    'ananya.sen@meil.in': 'esg_team',
    'esg.team@gmail.com': 'esg_team',
    'deepak.khaitan@meil.in': 'management',
    'management@gmail.com': 'management',
  };

  if (GMAIL_ROLE_MAP[cleanEmail]) {
    return GMAIL_ROLE_MAP[cleanEmail];
  }

  // 3. User explicitly selected an access role in the UI dropdown
  if (requestedRole) {
    return requestedRole;
  }

  // 4. Keyword detection from email username
  const username = cleanEmail.split('@')[0] || '';
  if (username.includes('bu') || username.includes('bumanager') || username.includes('business')) return 'bu_manager';
  if (username.includes('sub') || username.includes('subsidiary')) return 'subsidiary_admin';
  if (username.includes('esg') || username.includes('audit') || username.includes('sustainability')) return 'esg_team';
  if (username.includes('proj') || username.includes('project') || username.includes('user')) return 'project_user';
  if (username.includes('exec') || username.includes('mgmt') || username.includes('management') || username.includes('board')) return 'management';
  if (username.includes('admin') || username.includes('director') || username.includes('lead')) return 'group_admin';

  return 'project_user';
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    try {
      const savedSupa = sessionStorage.getItem('eco_metrics_supabase_user');
      if (savedSupa) {
        return JSON.parse(savedSupa);
      }
      const savedGmail = sessionStorage.getItem('eco_metrics_gmail_user');
      if (savedGmail) {
        return JSON.parse(savedGmail);
      }
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

  const login = (
    identifier: string, 
    role?: UserRole, 
    password?: string,
    metadata?: { name?: string; role?: string; roleTitle?: string }
  ): { success: boolean; error?: string } => {
    const inputId = (identifier || '').trim().toLowerCase();
    
    if (!inputId) {
      return { success: false, error: 'Please enter an Email or Corporate ID.' };
    }

    let targetUser = MOCK_USERS.find(u => 
      (u.email && u.email.toLowerCase() === inputId) ||
      (u.corporateId && u.corporateId.toLowerCase() === inputId)
    );

    const assignedRole = getAssignedRoleForEmail(inputId, role, metadata?.role);
    const normalizedRole = (assignedRole === ('group_admin' as any) || assignedRole === ('management' as any)) 
      ? 'group_admin_management' 
      : assignedRole;

    if (!targetUser) {
      // Dynamic profile creation for Supabase Auth / Gmail users
      const displayName = metadata?.name || (inputId.includes('@')
        ? inputId.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase())
        : inputId);

      const roleTitle = metadata?.roleTitle || (
        normalizedRole === 'group_admin_management' ? 'Group Admin & Executive Director' :
        normalizedRole === 'bu_manager' ? 'Business Unit Manager' :
        normalizedRole === 'subsidiary_admin' ? 'Subsidiary Admin' :
        normalizedRole === 'esg_team' ? 'ESG Sustainability Lead' :
        normalizedRole === 'management' ? 'Executive Director' :
        'Project Sustainability Lead'
      );

      targetUser = {
        id: `u-supa-${Date.now()}`,
        name: displayName,
        email: inputId,
        corporateId: `EMP-${inputId.split('@')[0].toUpperCase().slice(0, 8)}`,
        password: password || 'Password@123',
        role: normalizedRole as UserRole,
        roleTitle,
        organization: 'Apex Infrastructure Group Limited',
        avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(displayName)}&backgroundColor=00c77f`
      };
    } else {
      if (metadata?.roleTitle) {
        targetUser = { ...targetUser, roleTitle: metadata.roleTitle };
      }
    }

    const authenticatedUser: UserProfile = {
      ...targetUser,
      role: normalizedRole as UserRole
    };

    setUser(authenticatedUser);
    sessionStorage.setItem('eco_metrics_active_user', authenticatedUser.id);
    sessionStorage.setItem('eco_metrics_supabase_user', JSON.stringify(authenticatedUser));
    return { success: true };
  };

  const loginWithGoogle = (email: string, name?: string, role?: UserRole, avatar?: string): { success: boolean; error?: string } => {
    const cleanEmail = (email || '').trim().toLowerCase();
    if (!cleanEmail) {
      return { success: false, error: 'Valid Gmail address is required.' };
    }

    // Check if an existing profile is linked
    const existingUser = MOCK_USERS.find(u => u.email.toLowerCase() === cleanEmail);

    const displayName = name || cleanEmail.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase());
    const assignedRole = role || (existingUser?.role) || 'group_admin_management';
    const normalizedRole = (assignedRole === ('group_admin' as any) || assignedRole === ('management' as any)) 
      ? 'group_admin_management' 
      : assignedRole;

    const roleTitle = existingUser?.roleTitle || (
      normalizedRole === 'group_admin_management' ? 'Enterprise Lead & Director' :
      normalizedRole === 'bu_manager' ? 'Business Unit Manager' :
      normalizedRole === 'subsidiary_admin' ? 'Subsidiary Admin' :
      normalizedRole === 'esg_team' ? 'ESG Sustainability Lead' :
      'Project ESG Specialist'
    );

    const googleUser: UserProfile = {
      id: existingUser?.id || `user-gmail-${Date.now()}`,
      name: existingUser?.name || displayName,
      email: cleanEmail,
      corporateId: existingUser?.corporateId || `GMAIL-${cleanEmail.split('@')[0].toUpperCase().slice(0, 8)}`,
      role: normalizedRole as UserRole,
      roleTitle,
      organization: 'Apex Infrastructure Group',
      avatar: avatar || existingUser?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(displayName)}&backgroundColor=00c77f`
    };

    setUser(googleUser);
    sessionStorage.setItem('eco_metrics_active_user', googleUser.id);
    sessionStorage.setItem('eco_metrics_gmail_user', JSON.stringify(googleUser));
    return { success: true };
  };

  const logout = () => {
    setUser(null);
    sessionStorage.removeItem('eco_metrics_active_user');
    sessionStorage.removeItem('eco_metrics_gmail_user');
    sessionStorage.removeItem('eco_metrics_supabase_user');
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
        loginWithGoogle,
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
