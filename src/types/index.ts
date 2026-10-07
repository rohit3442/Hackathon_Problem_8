export type UserRole = 
  | 'project_user'
  | 'bu_manager'
  | 'subsidiary_admin'
  | 'esg_team'
  | 'group_admin_management'
  | 'group_admin'
  | 'management';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  corporateId?: string;
  password?: string;
  role: UserRole;
  roleTitle: string;
  organization: string;
  subsidiary?: string;
  businessUnit?: string;
  project?: string;
  avatar?: string;
}

export type SubmissionStatus = 
  | 'draft'
  | 'submitted'
  | 'under_review'
  | 'under_subsidiary_review'
  | 'under_esg_review'
  | 'under_management_review'
  | 'correction_required'
  | 'validated'
  | 'approved'
  | 'final';

export type ValidationSeverity = 'error' | 'warning' | 'info' | 'high' | 'medium' | 'low';

export interface ValidationAlert {
  id: string;
  recordId: string;
  metric: string;
  project: string;
  businessUnit: string;
  subsidiary: string;
  category: 'Environmental' | 'Social' | 'Governance' | 'BRSR' | string;
  value?: string | number;
  currentValue?: string | number;
  previousValue?: string | number;
  rule: string;
  severity: ValidationSeverity;
  status: 'open' | 'under_review' | 'resolved' | 'accepted_with_justification' | 'flagged' | string;
  detectedAt: string;
  details: string;
  justification?: string;
}

export interface ApprovalStep {
  id?: string;
  level?: 'project' | 'bu' | 'subsidiary' | 'esg_team' | 'group_admin_management' | 'final' | string;
  label: string;
  roleKey?: string;
  role?: string;
  assignedRole?: UserRole | string;
  status: 'pending' | 'in_progress' | 'approved' | 'rejected' | 'skipped' | string;
  actionBy?: string;
  actionAt?: string;
  comments?: string;
}

export interface ApprovalRecord {
  id: string;
  projectCode: string;
  projectName: string;
  projectId?: string;
  subsidiary?: string;
  subsidiaryName?: string;
  businessUnit?: string;
  businessUnitName?: string;
  category?: 'Environmental' | 'Social' | 'Governance' | 'BRSR Core' | string;
  reportingPeriod: string;
  submittedBy?: string;
  submittedAt?: string;
  validationStatus?: 'clean' | 'warnings_flagged' | 'errors_blocked' | string;
  currentLevelIndex?: number;
  currentStepIndex?: number;
  steps: ApprovalStep[];
  overallStatus: SubmissionStatus | string;
  evidenceCount?: number;
  summaryHighlights?: string;
}

export interface ProjectEntity {
  id: string;
  code: string;
  name: string;
  subsidiaryId: string;
  subsidiaryName: string;
  businessUnitId: string;
  businessUnitName: string;
  location: string;
  state: string;
  esgCompletion: number;
  brsrCompletion: number;
  validationStatus: 'clean' | 'has_warnings' | 'has_errors' | string;
  approvalStatus: SubmissionStatus | string;
  lastUpdated: string;
  leadPerson: string;
  reportingYear?: string;
  description?: string;
  environmentalData?: any;
  socialData?: any;
  governanceData?: any;
  workflows?: any[];
}

export type ReviewItemStatus = 
  | 'OPEN'
  | 'CORRECTION_REQUESTED'
  | 'CORRECTION_SUBMITTED'
  | 'UNDER_REVIEW'
  | 'RESOLVED'
  | 'APPROVED';

export interface ReviewThreadMessage {
  id: string;
  author: string;
  role: string;
  message: string;
  timestamp: string;
  type?: 'comment' | 'response' | 'resolution';
  attachment?: string;
}

export interface ReviewRequest {
  id: string;
  submissionId: string;
  projectId: string;
  projectName?: string;
  projectCode?: string;
  reportingPeriodId?: string;
  reportingPeriod: string;
  reviewerId: string;
  reviewerName: string;
  reviewerRole: string;
  assigneeId?: string;
  assigneeName: string;
  assigneeRole: string;
  section: 'Environmental' | 'Social' | 'Governance' | 'Evidence' | 'Validation & AI' | string;
  category: string;
  metric: string;
  fieldPath: string;
  currentValue: string | number;
  previousValue?: string | number;
  variancePct?: number;
  aiAnomalySeverity?: 'low' | 'medium' | 'high' | string;
  issueType: 'Verification Required' | 'Evidence Missing' | 'Calculation Variance' | 'Threshold Exceeded' | 'Compliance Document Missing' | string;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  comment: string;
  requiredAction: string;
  status: ReviewItemStatus;
  isDraft?: boolean;
  thread?: ReviewThreadMessage[];
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
}

export interface ReviewResponse {
  id: string;
  reviewRequestId: string;
  responderId: string;
  responderName: string;
  response: string;
  correctedValue?: string | number;
  evidenceId?: string;
  evidenceName?: string;
  createdAt: string;
}

export interface NotificationItem {
  id: string;
  userId?: string;
  type: 'CORRECTION_REQUESTED' | 'CORRECTION_SUBMITTED' | 'REVIEW_RESOLVED' | 'SUBMISSION_APPROVED' | 'VALIDATION_ALERT' | string;
  title: string;
  message: string;
  projectId: string;
  projectName?: string;
  submissionId?: string;
  reviewRequestId?: string;
  section?: string;
  category?: string;
  metric?: string;
  fieldPath?: string;
  priority?: 'Low' | 'Medium' | 'High' | 'Critical';
  isRead: boolean;
  createdAt: string;
}

export interface BusinessUnitEntity {
  id: string;
  name: string;
  code?: string;
  subsidiaryId: string;
  subsidiaryName?: string;
  projectsCount: number;
  esgCompletion: number;
  brsrCompletion: number;
  headOfUnit?: string;
  headOfBU?: string;
}

export interface SubsidiaryEntity {
  id: string;
  name: string;
  code: string;
  businessUnitsCount: number;
  projectsCount: number;
  esgCompletion: number;
  brsrCompletion: number;
  leadAdmin: string;
  managingDirector?: string;
  headquarters?: string;
}

export type Project = ProjectEntity;
export type User = UserProfile;
export type Subsidiary = SubsidiaryEntity;
export type BusinessUnit = BusinessUnitEntity;

export interface BRSRPrinciple {
  id?: string;
  number: number;
  code?: string;
  title?: string;
  subtitle?: string;
  name?: string;
  shortName?: string;
  description?: string;
  essentialCompletion?: number;
  leadershipCompletion?: number;
  totalCompletion?: number;
  indicatorsCount?: number;
  essentialCount?: number;
  leadershipCount?: number;
  essentialCompleted?: number;
  leadershipCompleted?: number;
  status?: string;
}

export interface ESGMetricItem {
  id: string;
  category: 'environmental' | 'social' | 'governance';
  subCategory: string;
  name: string;
  code: string;
  value: number | string;
  unit: string;
  previousValue: number | string;
  yoyChangePct: number;
  reportingPeriod: string;
  projectCode: string;
  status: SubmissionStatus;
  evidenceFile?: string;
  evidenceUrl?: string;
  remarks: string;
  validationStatus: 'valid' | 'warning' | 'error';
  validationMessage?: string;
  trend: number[];
  brsrPrincipleMapping: string;
  sdgMapping: number[];
}

export interface BRSRIndicator {
  code: string;
  principle: number;
  type: 'essential' | 'leadership';
  question: string;
  unit?: string;
  currentValue: string | number;
  previousValue?: string | number;
  dataType: 'number' | 'text' | 'boolean' | 'percentage' | 'table';
  status: SubmissionStatus;
  evidenceRequired: boolean;
  evidenceAttached?: string;
  reviewerNotes?: string;
  lastUpdated: string;
  assignedRole: UserRole;
  esgMetricSource?: string;
}

export interface AuditTrailRecord {
  id: string;
  timestamp: string;
  userName: string;
  userRole: string;
  action: 'Created' | 'Updated' | 'Submitted' | 'Validated' | 'Approved' | 'Rejected' | 'Generated Report' | 'Uploaded Evidence' | string;
  entity: string;
  entityId: string;
  previousValue?: string;
  newValue: string;
  ipAddress: string;
}

export type AuditLog = AuditTrailRecord;

export interface SDGItem {
  number: number;
  title: string;
  color: string;
  targetCount: number;
  mappedMetricsCount: number;
  progressScore: number;
  initiatives: string[];
}

export type SDGGoal = SDGItem;

