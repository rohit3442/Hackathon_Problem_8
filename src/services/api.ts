import axios from 'axios';
import { 
  MOCK_USERS, 
  MOCK_SUBSIDIARIES, 
  MOCK_BUSINESS_UNITS, 
  MOCK_PROJECTS, 
  MOCK_ESG_METRICS, 
  MOCK_BRSR_PRINCIPLES, 
  MOCK_BRSR_INDICATORS, 
  MOCK_VALIDATION_ALERTS, 
  MOCK_APPROVALS, 
  MOCK_SDGS, 
  MOCK_AUDIT_LOGS, 
  MOCK_REPORTS,
  MOCK_BRSR_SECTION_A 
} from './mockData';
import { ESGMetricItem, ApprovalRecord, ValidationAlert, BRSRIndicator } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api/v1';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// In-memory state for interactive mutations in demo
let liveEsgMetrics = [...MOCK_ESG_METRICS];
let liveApprovals = [...MOCK_APPROVALS];
let liveValidationAlerts = [...MOCK_VALIDATION_ALERTS];
let liveBrsrIndicators = [...MOCK_BRSR_INDICATORS];
let liveAuditLogs = [...MOCK_AUDIT_LOGS];

export const esgApi = {
  getDashboardData: async () => {
    // Return consolidated KPIs
    return {
      esgCompletion: 92,
      brsrCompletion: 87,
      pendingReviews: liveApprovals.filter(a => a.overallStatus === 'under_review' || a.overallStatus === 'submitted').length,
      validationAlerts: liveValidationAlerts.filter(v => v.status === 'open').length,
      projectsReporting: MOCK_PROJECTS.length,
      approvedRecords: liveApprovals.filter(a => a.overallStatus === 'approved').length + 18,
      dataQualityScore: 94.6,
      emissionsTrend: [
        { year: 'FY23', scope1: 18200, scope2: 38500, scope3: 78000 },
        { year: 'FY24', scope1: 17400, scope2: 35800, scope3: 74500 },
        { year: 'FY25', scope1: 16200, scope2: 33100, scope3: 71500 },
        { year: 'FY26 (Current)', scope1: 14850, scope2: 28400, scope3: 68200 },
      ],
      energyMix: [
        { name: 'Captive Solar', value: 34 },
        { name: 'Grid Green Tariff', value: 13 },
        { name: 'Conventional Grid', value: 41 },
        { name: 'Backup Clean Fuels', value: 12 },
      ],
      workflowPipeline: [
        { stage: 'Data Entry', completed: 28, total: 30, pct: 93 },
        { stage: 'BU Review', completed: 24, total: 30, pct: 80 },
        { stage: 'Subsidiary Signoff', completed: 22, total: 30, pct: 73 },
        { stage: 'ESG Validation', completed: 21, total: 30, pct: 70 },
        { stage: 'Executive Final', completed: 18, total: 30, pct: 60 },
      ]
    };
  },

  getOrganizationTree: async () => {
    return {
      groupName: 'Apex Infrastructure Group',
      subsidiaries: MOCK_SUBSIDIARIES,
      businessUnits: MOCK_BUSINESS_UNITS,
      projects: MOCK_PROJECTS,
    };
  },

  getProjects: async () => {
    return MOCK_PROJECTS;
  },

  getESGMetrics: async (category?: string) => {
    if (!category || category === 'all') return liveEsgMetrics;
    return liveEsgMetrics.filter(m => m.category === category);
  },

  updateESGMetric: async (id: string, updates: Partial<ESGMetricItem>) => {
    liveEsgMetrics = liveEsgMetrics.map(m => m.id === id ? { ...m, ...updates } : m);
    // Add audit log
    liveAuditLogs.unshift({
      id: `aud-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      userName: 'Current User',
      userRole: 'ESG Lead',
      action: 'Updated',
      entity: 'ESG Metric',
      entityId: id,
      newValue: `Updated ${Object.keys(updates).join(', ')}`,
      ipAddress: '192.168.1.100'
    });
    return liveEsgMetrics.find(m => m.id === id);
  },

  getBRSRSections: async () => {
    return {
      sectionA: MOCK_BRSR_SECTION_A,
      principles: MOCK_BRSR_PRINCIPLES,
      indicators: liveBrsrIndicators
    };
  },

  updateBRSRIndicator: async (code: string, updates: Partial<BRSRIndicator>) => {
    liveBrsrIndicators = liveBrsrIndicators.map(i => i.code === code ? { ...i, ...updates } : i);
    return liveBrsrIndicators.find(i => i.code === code);
  },

  getValidationAlerts: async () => {
    return liveValidationAlerts;
  },

  resolveValidationAlert: async (id: string, justification: string) => {
    liveValidationAlerts = liveValidationAlerts.map(a => 
      a.id === id ? { ...a, status: 'resolved', justification } : a
    );
    return true;
  },

  getApprovals: async () => {
    return liveApprovals;
  },

  actionApproval: async (id: string, action: 'approve' | 'reject' | 'request_correction', comments: string) => {
    liveApprovals = liveApprovals.map(appr => {
      if (appr.id === id) {
        const nextSteps = [...appr.steps];
        const currIdx = appr.currentLevelIndex ?? 0;
        if (action === 'approve') {
          if (nextSteps[currIdx]) {
            nextSteps[currIdx] = {
              ...nextSteps[currIdx],
              status: 'approved',
              actionAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
              comments: comments || 'Approved in accordance with compliance standards.'
            };
          }
          const nextIdx = Math.min(currIdx + 1, nextSteps.length - 1);
          if (nextSteps[nextIdx] && nextSteps[nextIdx].status === 'pending') {
            nextSteps[nextIdx].status = 'in_progress';
          }
          const isFinal = nextIdx === nextSteps.length - 1 && nextSteps[nextIdx].status === 'approved';
          return {
            ...appr,
            currentLevelIndex: nextIdx,
            steps: nextSteps,
            overallStatus: isFinal ? 'approved' : 'under_review'
          };
        } else if (action === 'request_correction' || action === 'reject') {
          if (nextSteps[currIdx]) {
            nextSteps[currIdx] = {
              ...nextSteps[currIdx],
              status: 'rejected',
              comments: comments || 'Correction required by reviewer.'
            };
          }
          return {
            ...appr,
            steps: nextSteps,
            overallStatus: 'correction_required'
          };
        }
      }
      return appr;
    });
    return liveApprovals.find(a => a.id === id);
  },

  getSDGs: async () => {
    return MOCK_SDGS;
  },

  getReports: async () => {
    return MOCK_REPORTS;
  },

  getAuditLogs: async () => {
    return liveAuditLogs;
  },

  getUsers: async () => {
    return MOCK_USERS;
  }
};
