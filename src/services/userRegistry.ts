import { UserProfile, UserRole } from '../types';
import { MOCK_USERS } from './mockData';
import { supabase } from '../supabaseClient';

const STORAGE_KEY = 'eco_metrics_registered_users';

export const ROLE_LABELS: Record<UserRole, string> = {
  project_user: 'Project User',
  bu_manager: 'Business Unit Manager',
  subsidiary_admin: 'Subsidiary Admin',
  esg_team: 'ESG Team',
  group_admin: 'Group Admin',
  group_admin_management: 'Group Admin & Management',
  management: 'Executive Board & Management'
};

export const ROLE_DEFAULT_TITLES: Record<UserRole, string> = {
  project_user: 'Project Sustainability Lead',
  bu_manager: 'Project & Business Unit Manager',
  subsidiary_admin: 'Subsidiary Director of ESG',
  esg_team: 'Group Chief Sustainability Officer',
  group_admin: 'Group Executive VP & Compliance Officer',
  group_admin_management: 'Group Admin & Executive Director',
  management: 'Managing Director & Board ESG Chair'
};

/**
 * Gets all registered users from localStorage, seeded with default mock users.
 */
export const getAllRegisteredUsers = (): UserProfile[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed: UserProfile[] = JSON.parse(stored);
      // Combine with mock users ensuring no duplicate IDs or emails
      const combined = [...parsed];
      MOCK_USERS.forEach((mock) => {
        if (!combined.some((u) => u.email.toLowerCase() === mock.email.toLowerCase())) {
          combined.push(mock);
        }
      });
      return combined;
    }
  } catch (e) {
    console.error('Failed to read registered users from storage:', e);
  }
  return [...MOCK_USERS];
};

/**
 * Saves a user with their assigned role to Supabase Auth metadata and local registry.
 */
export const saveUserWithRole = async (profile: UserProfile): Promise<void> => {
  try {
    const currentUsers = getAllRegisteredUsers();
    const existingIndex = currentUsers.findIndex(
      (u) => u.email.toLowerCase() === profile.email.toLowerCase()
    );

    if (existingIndex >= 0) {
      currentUsers[existingIndex] = { ...currentUsers[existingIndex], ...profile };
    } else {
      currentUsers.push(profile);
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(currentUsers));

    // Also notify backend server
    try {
      await fetch('/api/v1/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile)
      });
    } catch (_apiErr) {
      // Backend sync fallback
    }

    // Try saving to Supabase profiles table if available
    if (supabase && typeof (supabase as any).from === 'function') {
      try {
        await (supabase as any).from('profiles').upsert({
          id: profile.id,
          email: profile.email,
          name: profile.name,
          role: profile.role,
          role_title: profile.roleTitle,
          organization: profile.organization,
          corporate_id: profile.corporateId,
          updated_at: new Date().toISOString()
        });
      } catch (_sbErr) {
        // Handled silently if profiles table isn't created in Supabase project yet
      }
    }
  } catch (err) {
    console.error('Error saving user with role:', err);
  }
};

/**
 * Finds user profile by email or corporate identifier.
 */
export const findUserByIdentifier = (identifier: string): UserProfile | null => {
  const cleanId = (identifier || '').trim().toLowerCase();
  if (!cleanId) return null;

  const users = getAllRegisteredUsers();
  return (
    users.find(
      (u) =>
        (u.email && u.email.toLowerCase() === cleanId) ||
        (u.corporateId && u.corporateId.toLowerCase() === cleanId)
    ) || null
  );
};

/**
 * Returns the designated default home path for a specific role.
 */
export const getRoleDefaultPath = (role: UserRole): string => {
  switch (role) {
    case 'management':
      return '/executive-dashboard';
    case 'project_user':
    case 'bu_manager':
    case 'subsidiary_admin':
    case 'esg_team':
    case 'group_admin':
    case 'group_admin_management':
    default:
      return '/dashboard';
  }
};

/**
 * Checks whether a user with a given role has permission to access a specific route.
 */
export const isRouteAllowedForRole = (role: UserRole, pathname: string): { allowed: boolean; reason?: string } => {
  const normalizedPath = pathname.toLowerCase();
  const normalizedRole = (role === 'group_admin' || role === 'management') ? role : role;

  // 1. Executive Dashboard: ONLY management, group_admin, group_admin_management
  if (normalizedPath === '/executive-dashboard') {
    if (role === 'management' || role === 'group_admin' || role === 'group_admin_management') {
      return { allowed: true };
    }
    return {
      allowed: false,
      reason: 'The Executive Dashboard is restricted to Executive Board and Management members.'
    };
  }

  // 2. Settings & User Management: ONLY group_admin / group_admin_management
  if (normalizedPath.startsWith('/settings') || normalizedPath.startsWith('/users')) {
    if (role === 'group_admin' || role === 'group_admin_management') {
      return { allowed: true };
    }
    return {
      allowed: false,
      reason: 'System settings and user administration require Group Admin permissions.'
    };
  }

  // 3. Approvals: BU Manager, Subsidiary Admin, Group Admin
  if (normalizedPath.startsWith('/approvals')) {
    if (['bu_manager', 'subsidiary_admin', 'group_admin', 'group_admin_management'].includes(role)) {
      return { allowed: true };
    }
    return {
      allowed: false,
      reason: 'Approval workflows are restricted to Reviewers, BU Managers, and Admins.'
    };
  }

  // 4. Review Center: BU Manager, Subsidiary Admin, ESG Team, Group Admin
  if (normalizedPath.startsWith('/review-center') || normalizedPath.startsWith('/reviews')) {
    if (['bu_manager', 'subsidiary_admin', 'esg_team', 'group_admin', 'group_admin_management'].includes(role)) {
      return { allowed: true };
    }
    return {
      allowed: false,
      reason: 'Review Center is accessible only to BU Managers, ESG Team, and Administrators.'
    };
  }

  // 5. Audit Trail: ESG Team and Group Admin
  if (normalizedPath.startsWith('/audit-trail')) {
    if (['esg_team', 'group_admin', 'group_admin_management'].includes(role)) {
      return { allowed: true };
    }
    return {
      allowed: false,
      reason: 'Audit Trail is restricted to the ESG Audit Team and Group Administrators.'
    };
  }

  // Default: Allowed
  return { allowed: true };
};
