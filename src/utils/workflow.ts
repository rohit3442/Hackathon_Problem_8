import { UserRole } from '../types';

export const WORKFLOW_STAGE_ROLES = [
  'project_user',
  'bu_manager',
  'subsidiary_admin',
  'esg_team',
  'group_admin_management',
] as const;

export const WORKFLOW_STAGE_LABELS = [
  'Project Data Entry',
  'BU Manager Review',
  'Subsidiary Admin Signoff',
  'ESG Team Validation',
  'Group Admin & Management Signoff',
];

export const normalizeRole = (role?: string | null): string =>
  role === 'group_admin' || role === 'management' ? 'group_admin_management' : role || '';

// Index of the workflow stage currently awaiting action for a given project/workflow status.
export const stageIndexForStatus = (status?: string | null): number => {
  switch (status) {
    case 'submitted':
    case 'under_review':
      return 1;
    case 'under_subsidiary_review':
      return 2;
    case 'under_esg_review':
      return 3;
    case 'under_management_review':
    case 'validated':
      return 4;
    case 'approved':
    case 'final':
      return WORKFLOW_STAGE_ROLES.length;
    default:
      return 0;
  }
};

export const canActOnStage = (role: UserRole | string | undefined, status?: string | null): boolean => {
  const idx = stageIndexForStatus(status);
  return idx >= 1 && idx < WORKFLOW_STAGE_ROLES.length && WORKFLOW_STAGE_ROLES[idx] === normalizeRole(role);
};

export const awaitingStageLabel = (status?: string | null): string | null => {
  const idx = stageIndexForStatus(status);
  return idx >= 1 && idx < WORKFLOW_STAGE_LABELS.length ? WORKFLOW_STAGE_LABELS[idx] : null;
};

export const isPastBUReview = (status?: string | null): boolean => stageIndexForStatus(status) >= 2;

export const isAwaitingBUReview = (status?: string | null): boolean => stageIndexForStatus(status) === 1;
