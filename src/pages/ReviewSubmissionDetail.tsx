import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { 
  ArrowLeft, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Sparkles, 
  FileText, 
  Send, 
  Building2, 
  Leaf, 
  Users, 
  Scale, 
  Upload, 
  Eye, 
  MessageSquare, 
  Check, 
  X, 
  ExternalLink,
  ChevronRight,
  HelpCircle,
  FileCheck2,
  Lock,
  Layers
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Card, CardHeader } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { StatusBadge } from '../components/common/StatusBadge';
import { ProgressBar } from '../components/common/ProgressBar';
import { Modal } from '../components/common/Modal';
import { projectsApi, reviewsApi, approvalsApi } from '../api';
import { canActOnStage } from '../utils/workflow';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { ReviewRequest, ReviewThreadMessage } from '../types';

export const ReviewSubmissionDetail: React.FC = () => {
  const { submissionId } = useParams<{ submissionId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToast } = useApp();

  const projectId = submissionId || 'proj-1';

  // Active section tab
  const [activeSection, setActiveSection] = useState<'environmental' | 'social' | 'governance' | 'documents' | 'validation'>('environmental');

  // Correction Request Modal State
  const [correctionModalOpen, setCorrectionModalOpen] = useState(false);
  const [selectedMetricForReview, setSelectedMetricForReview] = useState<any>(null);
  const [reviewComment, setReviewComment] = useState('');
  const [requiredAction, setRequiredAction] = useState('');
  const [priority, setPriority] = useState<'Low' | 'Medium' | 'High' | 'Critical'>('Medium');
  const [issueType, setIssueType] = useState('Verification Required');

  // Review Thread Modal State
  const [threadModalOpen, setThreadModalOpen] = useState(false);
  const [activeReviewThread, setActiveReviewThread] = useState<ReviewRequest | null>(null);
  const [threadReplyComment, setThreadReplyComment] = useState('');

  // Drafts drawer / panel state
  const [showDraftsPanel, setShowDraftsPanel] = useState(false);

  // Load project details
  const { data: project, isLoading: loadingProject, refetch: refetchProject } = useQuery({
    queryKey: ['project', projectId],
    queryFn: () => projectsApi.getProjectById(projectId),
  });

  // Load reviews for this project
  const { data: reviews = [], refetch: refetchReviews } = useQuery({
    queryKey: ['reviews', projectId],
    queryFn: () => reviewsApi.getReviews({ projectId }),
  });

  // Calculate issue counts per section
  const sectionIssues = useMemo(() => {
    const issues = {
      environmental: 0,
      social: 0,
      governance: 0,
      documents: 0,
      validation: 0
    };

    reviews.forEach(r => {
      const sec = r.section.toLowerCase();
      if (r.status === 'CORRECTION_REQUESTED' || r.status === 'CORRECTION_SUBMITTED' || r.status === 'OPEN') {
        if (sec.includes('env')) issues.environmental++;
        else if (sec.includes('soc')) issues.social++;
        else if (sec.includes('gov')) issues.governance++;
        else if (sec.includes('doc') || sec.includes('evi')) issues.documents++;
        else if (sec.includes('val')) issues.validation++;
      }
    });

    return issues;
  }, [reviews]);

  // Draft review items
  const draftReviews = useMemo(() => {
    return reviews.filter(r => r.isDraft);
  }, [reviews]);

  // Checklist items completion state
  const checklist = useMemo(() => {
    const activeUnresolvedIssues = reviews.filter(r => r.status === 'CORRECTION_REQUESTED' || r.status === 'OPEN').length;
    return [
      { id: 'proj_info', label: 'Project information & operational boundary verified', checked: true },
      { id: 'env_data', label: 'Environmental metrics audited against utility invoices', checked: true },
      { id: 'env_evidence', label: 'Electricity and diesel invoice evidence verified', checked: sectionIssues.documents === 0 },
      { id: 'soc_data', label: 'Social workforce headcount & safety metrics reviewed', checked: true },
      { id: 'gov_data', label: 'Anti-corruption affirmation and policy disclosures verified', checked: sectionIssues.governance === 0 },
      { id: 'ai_anomalies', label: 'AI statistical anomalies inspected & evaluated', checked: true },
      { id: 'all_resolved', label: 'All correction requests resolved or accepted', checked: activeUnresolvedIssues === 0 },
    ];
  }, [reviews, sectionIssues]);

  const checklistCompleted = checklist.filter(c => c.checked).length;
  const isBUStageOpen = canActOnStage(user?.role, project?.approvalStatus);
  const canApprove = checklistCompleted === checklist.length && isBUStageOpen;

  // Mutation: Create or Update Review Request (Draft or Direct Send)
  const saveReviewMutation = useMutation({
    mutationFn: async (asDraft: boolean) => {
      if (!selectedMetricForReview) return;

      const payload: Partial<ReviewRequest> = {
        submissionId: `subm-${project?.code.toLowerCase() || 'smp500'}-fy26`,
        projectId,
        projectCode: project?.code || 'SMP-500',
        projectName: project?.name || 'Operational Facility',
        reportingPeriod: project?.reportingYear || 'FY 2025-26',
        reviewerId: user?.id || 'usr-3',
        reviewerName: user?.name || 'Vikram Malhotra',
        reviewerRole: 'Business Unit Manager',
        assigneeName: project?.leadPerson || 'Rajesh Verma',
        section: selectedMetricForReview.section,
        category: selectedMetricForReview.category,
        metric: selectedMetricForReview.metric,
        fieldPath: selectedMetricForReview.fieldPath,
        currentValue: selectedMetricForReview.currentValue,
        previousValue: selectedMetricForReview.previousValue,
        variancePct: selectedMetricForReview.variancePct,
        aiAnomalySeverity: selectedMetricForReview.aiAnomalySeverity,
        issueType,
        priority,
        comment: reviewComment,
        requiredAction: requiredAction || 'Verify value and upload supporting evidence.',
        isDraft: asDraft,
      };

      return await reviewsApi.createReview(payload);
    },
    onSuccess: (data, asDraft) => {
      refetchReviews();
      refetchProject();
      setCorrectionModalOpen(false);
      setReviewComment('');
      setRequiredAction('');
      if (asDraft) {
        addToast('Review Draft Saved', `Added ${selectedMetricForReview?.metric} to Review Draft queue`, 'info');
      } else {
        addToast('Correction Request Dispatched', `Sent to Project Manager ${project?.leadPerson || 'Rajesh Verma'} with notification`, 'success');
      }
    }
  });

  // Mutation: Bulk Send Review Drafts
  const sendDraftsMutation = useMutation({
    mutationFn: async () => {
      return await reviewsApi.sendBulkReviewDraft(`subm-${project?.code.toLowerCase() || 'smp500'}-fy26`, projectId, user?.name);
    },
    onSuccess: (res) => {
      refetchReviews();
      refetchProject();
      setShowDraftsPanel(false);
      addToast('Drafts Dispatched', `Sent ${res.sentCount} correction requests to Project Manager`, 'success');
    }
  });

  // Mutation: Approve Single Review Item
  const approveItemMutation = useMutation({
    mutationFn: async ({ metricItem }: { metricItem: any }) => {
      const existing = reviews.find(r => r.metric === metricItem.metric);
      if (existing) {
        return await reviewsApi.resolveReview(existing.id, {
          status: 'APPROVED',
          resolutionComment: 'Approved by BU Manager after audit verification.',
          reviewerName: user?.name || 'Vikram Malhotra'
        });
      } else {
        return await reviewsApi.createReview({
          submissionId: `subm-${project?.code.toLowerCase() || 'smp500'}-fy26`,
          projectId,
          projectCode: project?.code,
          projectName: project?.name,
          reportingPeriod: project?.reportingYear || 'FY 2025-26',
          reviewerId: user?.id || 'usr-3',
          reviewerName: user?.name || 'Vikram Malhotra',
          reviewerRole: 'Business Unit Manager',
          assigneeName: project?.leadPerson || 'Rajesh Verma',
          section: metricItem.section,
          category: metricItem.category,
          metric: metricItem.metric,
          fieldPath: metricItem.fieldPath,
          currentValue: metricItem.currentValue,
          issueType: 'Verification Required',
          priority: 'Low',
          comment: 'Metric reviewed and accepted by BU Manager.',
          requiredAction: 'None. Approved.',
          status: 'APPROVED',
          isDraft: false
        });
      }
    },
    onSuccess: () => {
      refetchReviews();
      addToast('Item Approved', 'Metric verified and marked approved in review record', 'success');
    }
  });

  // Mutation: Resolve or Accept Response on Review Request
  const resolveItemMutation = useMutation({
    mutationFn: async ({ reviewId, comment }: { reviewId: string; comment?: string }) => {
      return await reviewsApi.resolveReview(reviewId, {
        status: 'RESOLVED',
        resolutionComment: comment || 'Correction reviewed and accepted by BU Manager.',
        reviewerName: user?.name || 'Vikram Malhotra'
      });
    },
    onSuccess: () => {
      refetchReviews();
      refetchProject();
      setThreadModalOpen(false);
      addToast('Correction Accepted', 'Review item marked resolved. Ready for final BU signoff.', 'success');
    }
  });

  // Mutation: Final BU Signoff & Forward to Subsidiary Admin
  const approveSubmissionMutation = useMutation({
    mutationFn: async () => {
      const dynamicWfId = project?.workflows?.[0]?.id || `wf-${project?.code.toLowerCase()}-env` || projectId;
      return await approvalsApi.actionApproval(
        dynamicWfId,
        'approve',
        'All reported metrics audited and verified in BU Review Center. Forwarded to Subsidiary Admin for Stage 3 signoff.',
        user?.name || 'Vikram Malhotra',
        'BU Manager',
      user?.role
      );
    },
    onSuccess: () => {
      refetchProject();
      refetchReviews();
      try {
        confetti({ particleCount: 90, spread: 75, origin: { y: 0.6 } });
      } catch (e) {}
      addToast('Submission Approved', `Project ${project?.name} validated and forwarded to Subsidiary Admin Sunita Rao`, 'success');
      navigate('/review-center');
    }
  });

  if (loadingProject && !project) {
    return (
      <div className="p-8 text-center text-slate-500">
        <div className="w-8 h-8 border-3 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        Loading Submission Dossier...
      </div>
    );
  }

  const proj = project || {
    id: projectId,
    name: 'Solar Mega-Park 500MW (SMP-500)',
    code: 'SMP-500',
    subsidiaryName: 'Apex Heavy Engineering & Construction',
    businessUnitName: 'Renewables & Power Transmission',
    location: 'Bhadla, Jodhpur',
    state: 'Rajasthan',
    reportingYear: 'FY 2025-26',
    approvalStatus: 'under_review',
    leadPerson: 'Rajesh Verma (Project Manager)'
  };

  // Environmental Metrics list for Field-Level Review
  const envMetrics = [
    {
      section: 'Environmental',
      category: 'Energy',
      metric: 'Grid Electricity',
      fieldPath: 'environmental/energy/grid-electricity',
      currentValue: '100,000 kWh',
      previousValue: '84,000 kWh',
      variancePct: 19.0,
      aiAnomalySeverity: 'medium',
      aiExplanation: 'Possible anomaly detected. Current consumption differs significantly (+19.0%) from historical baseline (84,000 kWh). Z-Score = 1.82.',
      evidenceName: 'DISCOM_Power_Invoices_FY26.pdf',
    },
    {
      section: 'Environmental',
      category: 'Energy',
      metric: 'Stationary Diesel / Fuel',
      fieldPath: 'environmental/energy/fuel',
      currentValue: '25,000 Litres',
      previousValue: '24,000 Litres',
      variancePct: 4.2,
      evidenceName: 'Fuel_Delivery_Log_FY26.pdf',
    },
    {
      section: 'Environmental',
      category: 'Energy',
      metric: 'Renewable Energy Share',
      fieldPath: 'environmental/energy/renewable',
      currentValue: '45.0 %',
      previousValue: '40.0 %',
      variancePct: 12.5,
      evidenceName: 'Solar_Export_NetMeter_Report.pdf',
    },
    {
      section: 'Environmental',
      category: 'Water',
      metric: 'Total Water Withdrawal',
      fieldPath: 'environmental/water/withdrawal',
      currentValue: '50,000 KL',
      previousValue: '48,000 KL',
      variancePct: 4.1,
      evidenceName: 'Municipal_Water_Supply_Bill.pdf',
    },
    {
      section: 'Environmental',
      category: 'Water',
      metric: 'Recycled / Reused Water',
      fieldPath: 'environmental/water/recycled',
      currentValue: '18,500 KL (37.0%)',
      previousValue: '15,000 KL',
      variancePct: 23.3,
      evidenceName: 'Water_STP_Calibration_Cert.pdf',
    },
    {
      section: 'Environmental',
      category: 'Waste',
      metric: 'Hazardous Waste Generated',
      fieldPath: 'environmental/waste/hazardous',
      currentValue: '12.5 MT',
      previousValue: '11.8 MT',
      variancePct: 5.9,
      evidenceName: 'Hazardous_Waste_Manifest_FY26.pdf',
    },
    {
      section: 'Environmental',
      category: 'Waste',
      metric: 'Non-Hazardous Waste (Recycled/Diverted)',
      fieldPath: 'environmental/waste/non-hazardous',
      currentValue: '145.0 MT',
      previousValue: '135.0 MT',
      variancePct: 7.4,
      evidenceName: 'Scrap_Disposal_Certificates.pdf',
    },
  ];

  // Social Metrics list
  const socMetrics = [
    {
      section: 'Social',
      category: 'Workforce',
      metric: 'Permanent Employees Count',
      fieldPath: 'social/workforce/permanent',
      currentValue: '1,420 Personnel',
      previousValue: '1,380 Personnel',
      variancePct: 2.9,
      evidenceName: 'HR_Headcount_Report_Q4.pdf',
    },
    {
      section: 'Social',
      category: 'Workforce',
      metric: 'Female Workforce Representation',
      fieldPath: 'social/workforce/gender-diversity',
      currentValue: '24.2 %',
      previousValue: '21.5 %',
      variancePct: 12.6,
      evidenceName: 'Diversity_Inclusion_Register.pdf',
    },
    {
      section: 'Social',
      category: 'Workforce',
      metric: 'Contracted Workers (Peak)',
      fieldPath: 'social/workforce/contract',
      currentValue: '4,200 Workers',
      previousValue: '4,050 Workers',
      variancePct: 3.7,
      evidenceName: 'Contractor_Muster_Roll_FY26.pdf',
    },
    {
      section: 'Social',
      category: 'Health & Safety',
      metric: 'Lost Time Injury Frequency Rate (LTIFR)',
      fieldPath: 'social/safety/ltifr',
      currentValue: '0.12 per million hours',
      previousValue: '0.18 per million hours',
      variancePct: -33.3,
      evidenceName: 'EHS_Audit_Log_FY26.pdf',
    },
    {
      section: 'Social',
      category: 'Health & Safety',
      metric: 'Fatalities (Operational Site)',
      fieldPath: 'social/safety/fatalities',
      currentValue: '0 Fatalities (Zero Harm)',
      previousValue: '0 Fatalities',
      variancePct: 0,
      evidenceName: 'Annual_Safety_Assurance_Affidavit.pdf',
    },
  ];

  // Governance Metrics list
  const govMetrics = [
    {
      section: 'Governance',
      category: 'Ethics & Compliance',
      metric: 'Anti-Corruption Policy Affirmation',
      fieldPath: 'governance/ethics/anti-corruption',
      currentValue: 'Affirmed (100% Covered)',
      previousValue: 'Affirmed',
      evidenceName: 'Anti_Corruption_Training_Register.pdf',
    },
    {
      section: 'Governance',
      category: 'Ethics & Compliance',
      metric: 'Whistleblower Complaints Received',
      fieldPath: 'governance/ethics/whistleblower',
      currentValue: '3 Received (3 Resolved)',
      previousValue: '4 Received',
      variancePct: -25.0,
      evidenceName: 'Vigil_Mechanism_Committee_Minutes.pdf',
    },
    {
      section: 'Governance',
      category: 'Data Privacy',
      metric: 'Cybersecurity & Data Privacy Breaches',
      fieldPath: 'governance/privacy/breaches',
      currentValue: '0 Substantiated Complaints',
      previousValue: '0 Complaints',
      evidenceName: 'CISO_Annual_Assurance_Cert.pdf',
    },
  ];

  // Evidence Documents list
  const docMetrics = [
    {
      section: 'Evidence',
      category: 'Utility Proofs',
      metric: 'State Electricity DISCOM Invoices (Q1-Q4)',
      fieldPath: 'documents/invoices/electricity',
      currentValue: 'DISCOM_Power_Invoices_FY26.pdf (12 Invoices, 4.2 MB)',
      previousValue: 'Uploaded',
      evidenceName: 'DISCOM_Power_Invoices_FY26.pdf',
    },
    {
      section: 'Evidence',
      category: 'Fuel Slips',
      metric: 'Stationary Diesel Tanker Delivery Slips',
      fieldPath: 'documents/invoices/fuel',
      currentValue: 'Fuel_Delivery_Log_FY26.pdf (1.8 MB)',
      previousValue: 'Uploaded',
      evidenceName: 'Fuel_Delivery_Log_FY26.pdf',
    },
    {
      section: 'Evidence',
      category: 'Environmental Permits',
      metric: 'State Pollution Control Board Consent to Operate (CTO)',
      fieldPath: 'documents/permits/cto',
      currentValue: 'SPCB_CTO_Air_Water_Valid_2028.pdf (3.5 MB)',
      previousValue: 'Valid',
      evidenceName: 'SPCB_CTO_Air_Water_Valid_2028.pdf',
    },
  ];

  // Helper: Open the correction request modal for a specific metric
  const handleOpenCorrectionModal = (metricItem: any) => {
    setSelectedMetricForReview(metricItem);
    // Pre-populate with intelligent default comment
    if (metricItem.aiAnomalySeverity) {
      setReviewComment(`Please verify the reported ${metricItem.metric}. The reported figure increased by ${metricItem.variancePct}% compared with the previous period. Please confirm additional consumption reasons and provide supporting billing evidence.`);
      setRequiredAction('Verify value, provide operational justification, and upload supporting invoice evidence.');
      setIssueType('Verification Required');
      setPriority('Medium');
    } else {
      setReviewComment(`Please verify the reported ${metricItem.metric} and confirm calibration/supporting documentation for FY 2025-26.`);
      setRequiredAction('Review figure and re-upload supporting invoice or calibration document.');
      setIssueType('Verification Required');
      setPriority('Medium');
    }
    setCorrectionModalOpen(true);
  };

  // Helper: Open thread modal
  const handleOpenThread = (review: ReviewRequest) => {
    setActiveReviewThread(review);
    setThreadReplyComment('');
    setThreadModalOpen(true);
  };

  // Render individual metric review card
  const renderMetricReviewItem = (item: any) => {
    // Find if a review request exists for this metric
    const review = reviews.find(r => r.metric === item.metric);
    const hasAnomaly = !!item.aiAnomalySeverity;

    const isCorrectionRequested = review?.status === 'CORRECTION_REQUESTED';
    const isCorrectionSubmitted = review?.status === 'CORRECTION_SUBMITTED';
    const isResolved = review?.status === 'RESOLVED';
    const isApproved = review?.status === 'APPROVED';
    const isDraft = review?.isDraft;

    return (
      <div 
        key={item.metric}
        className={`p-4 rounded-xl border transition-all ${
          isCorrectionRequested ? 'border-amber-400 bg-amber-50/20 dark:bg-amber-950/15' :
          isCorrectionSubmitted ? 'border-blue-400 bg-blue-50/20 dark:bg-blue-950/15' :
          isResolved || isApproved ? 'border-emerald-300 dark:border-emerald-800/80 bg-emerald-50/10' :
          isDraft ? 'border-purple-300 bg-purple-50/10' :
          'border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c1411]'
        }`}
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Metric Details */}
          <div className="space-y-1 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                {item.category}
              </span>
              <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                {item.metric}
              </h4>

              {/* Status Badge */}
              {isApproved && (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  <Check className="w-3 h-3" /> Approved
                </span>
              )}
              {isResolved && (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  <CheckCircle2 className="w-3 h-3" /> Resolved
                </span>
              )}
              {isCorrectionSubmitted && (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 animate-pulse">
                  <MessageSquare className="w-3 h-3" /> Correction Submitted
                </span>
              )}
              {isCorrectionRequested && (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300">
                  <AlertTriangle className="w-3 h-3" /> Correction Requested
                </span>
              )}
              {isDraft && (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-900 dark:bg-purple-950 dark:text-purple-300">
                  Draft Comment
                </span>
              )}
            </div>

            {/* Values: Read-Only Display */}
            <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1 pt-1 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="text-slate-500 font-medium">Reported Value:</span>
                <span className="font-mono font-bold text-slate-900 dark:text-slate-100 bg-slate-100 dark:bg-slate-800/80 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                  {item.currentValue}
                </span>
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-tight">
                  [Read Only]
                </span>
              </div>

              {item.previousValue && (
                <div className="text-slate-500">
                  Previous: <span className="font-mono">{item.previousValue}</span>
                </div>
              )}

              {item.variancePct !== undefined && (
                <div className={`font-semibold ${item.variancePct > 10 ? 'text-amber-600 dark:text-amber-400' : 'text-slate-600'}`}>
                  Variance: {item.variancePct > 0 ? `+${item.variancePct}%` : `${item.variancePct}%`}
                </div>
              )}
            </div>

            {/* Evidence Document Link */}
            {item.evidenceName && (
              <div className="flex items-center gap-2 text-xs pt-1 text-slate-600 dark:text-slate-400">
                <FileText className="w-3.5 h-3.5 text-teal-600" />
                <span>Supporting Proof: <strong className="text-slate-800 dark:text-slate-200 font-mono text-[11px]">{item.evidenceName}</strong></span>
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                  Attached & Verified
                </span>
              </div>
            )}

            {/* AI Anomaly Alert Banner if flagged */}
            {hasAnomaly && (
              <div className="mt-2 p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-xs text-amber-900 dark:text-amber-200 space-y-1">
                <div className="flex items-center gap-1.5 font-bold">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  <span>AI Anomaly Flag ({item.aiAnomalySeverity?.toUpperCase()} SEVERITY)</span>
                </div>
                <p className="text-[11px] text-amber-800 dark:text-amber-300 leading-relaxed">
                  {item.aiExplanation}
                </p>
              </div>
            )}

            {/* Reviewer Feedback / Thread Preview */}
            {review && (
              <div className="mt-2 p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    Review Request Note ({review.issueType} • {review.priority} Priority):
                  </span>
                  <span className="text-[10px] text-slate-400">{review.updatedAt}</span>
                </div>
                <p className="text-slate-600 dark:text-slate-400 italic">
                  "{review.comment}"
                </p>

                {/* If Project Manager has responded */}
                {review.thread && review.thread.length > 1 && (
                  <div className="pt-1.5 border-t border-slate-200 dark:border-slate-800 text-[11px] space-y-1">
                    <div className="flex items-center justify-between font-semibold text-blue-700 dark:text-blue-300">
                      <span>Response from {review.thread[review.thread.length - 1].author} ({review.thread[review.thread.length - 1].role}):</span>
                      <span className="text-[10px] text-slate-400">{review.thread[review.thread.length - 1].timestamp}</span>
                    </div>
                    <p className="text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-800/60 p-2 rounded border border-slate-200 dark:border-slate-700 font-medium">
                      "{review.thread[review.thread.length - 1].message}"
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Review Actions */}
          <div className="flex flex-col sm:flex-row lg:flex-col items-end justify-center gap-2 flex-shrink-0">
            {isCorrectionSubmitted && (
              <div className="flex items-center gap-1.5 w-full sm:w-auto">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleOpenThread(review)}
                  icon={<MessageSquare className="w-3.5 h-3.5" />}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs w-full"
                >
                  Review Thread & Accept
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => resolveItemMutation.mutate({ reviewId: review.id, comment: 'Accepted after reviewing Project Manager explanation and verification.' })}
                  className="text-xs text-emerald-700 border-emerald-300"
                >
                  <Check className="w-3.5 h-3.5 mr-1" /> Accept
                </Button>
              </div>
            )}

            {isCorrectionRequested && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleOpenThread(review)}
                icon={<MessageSquare className="w-3.5 h-3.5" />}
                className="text-xs w-full sm:w-auto"
              >
                View Review Thread
              </Button>
            )}

            {(!review || review.status === 'OPEN' || isDraft) && (
              <div className="flex items-center gap-1.5 w-full sm:w-auto">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => approveItemMutation.mutate({ metricItem: item })}
                  icon={<Check className="w-3.5 h-3.5 text-emerald-600" />}
                  className="text-xs hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
                >
                  Approve Item
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleOpenCorrectionModal(item)}
                  icon={<AlertTriangle className="w-3.5 h-3.5 text-amber-600" />}
                  className="text-xs hover:bg-amber-50 dark:hover:bg-amber-950/30 text-amber-900 dark:text-amber-300 border-amber-300 dark:border-amber-700"
                >
                  Request Correction
                </Button>
              </div>
            )}

            {(isResolved || isApproved) && (
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" /> Verified
                </span>
                {review && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleOpenThread(review)}
                    className="text-[11px] text-slate-500"
                  >
                    Thread
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/review-center')}
              icon={<ArrowLeft className="w-4 h-4" />}
            >
              Review Center
            </Button>
            <span className="text-slate-300 dark:text-slate-700">/</span>
            <span className="text-xs font-mono font-bold text-slate-500">{proj.code}</span>
            <StatusBadge status={proj.approvalStatus as any} />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 font-heading m-0">
            {proj.name} — Periodic ESG Telemetry Review
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Submitted by <strong>{proj.leadPerson || 'Rajesh Verma (Project Manager)'}</strong> • Facility: {proj.location}, {proj.state} • Reporting Period: <strong className="text-teal-700 dark:text-teal-400">{proj.reportingYear}</strong> • Stage 2: BU Review
          </p>
        </div>

        {/* Top Actions: Review Draft Queue & Final Approve */}
        <div className="flex items-center gap-2.5">
          {draftReviews.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDraftsPanel(true)}
              className="border-purple-300 dark:border-purple-700 text-purple-700 dark:text-purple-300 bg-purple-50/40 dark:bg-purple-950/20 text-xs font-bold"
            >
              Review Draft ({draftReviews.length})
            </Button>
          )}

          <Button
            variant="primary"
            size="md"
            onClick={() => approveSubmissionMutation.mutate()}
            disabled={!canApprove || approveSubmissionMutation.isPending}
            loading={approveSubmissionMutation.isPending}
            icon={<ShieldCheck className="w-4 h-4" />}
            className={`font-semibold text-xs ${
              canApprove 
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm' 
                : 'opacity-50 cursor-not-allowed bg-slate-300 text-slate-500 dark:bg-slate-800 dark:text-slate-500'
            }`}
            title={canApprove ? 'Approve & forward to Subsidiary Admin' : !isBUStageOpen ? 'This submission is not awaiting BU Manager review' : 'Complete the review checklist before approving'}
          >
            Approve Submission & Forward to Subsidiary
          </Button>
        </div>
      </div>

      {/* Review Summary Scorecards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <Card 
          className={`p-3 cursor-pointer transition-all border-l-4 ${
            activeSection === 'environmental' ? 'border-l-emerald-600 ring-1 ring-emerald-500' : 'border-l-slate-300'
          }`}
          onClick={() => setActiveSection('environmental')}
        >
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-semibold">Environmental</span>
            <Leaf className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-lg font-bold font-mono text-slate-900 dark:text-slate-100">
              {sectionIssues.environmental}
            </span>
            <span className={`text-[10px] font-bold ${sectionIssues.environmental > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
              {sectionIssues.environmental > 0 ? `${sectionIssues.environmental} Issues` : 'Clean'}
            </span>
          </div>
        </Card>

        <Card 
          className={`p-3 cursor-pointer transition-all border-l-4 ${
            activeSection === 'social' ? 'border-l-blue-600 ring-1 ring-blue-500' : 'border-l-slate-300'
          }`}
          onClick={() => setActiveSection('social')}
        >
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-semibold">Social Data</span>
            <Users className="w-3.5 h-3.5 text-blue-600" />
          </div>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-lg font-bold font-mono text-slate-900 dark:text-slate-100">
              {sectionIssues.social}
            </span>
            <span className={`text-[10px] font-bold ${sectionIssues.social > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
              {sectionIssues.social > 0 ? `${sectionIssues.social} Issues` : 'Clean'}
            </span>
          </div>
        </Card>

        <Card 
          className={`p-3 cursor-pointer transition-all border-l-4 ${
            activeSection === 'governance' ? 'border-l-purple-600 ring-1 ring-purple-500' : 'border-l-slate-300'
          }`}
          onClick={() => setActiveSection('governance')}
        >
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-semibold">Governance</span>
            <Scale className="w-3.5 h-3.5 text-purple-600" />
          </div>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-lg font-bold font-mono text-slate-900 dark:text-slate-100">
              {sectionIssues.governance}
            </span>
            <span className={`text-[10px] font-bold ${sectionIssues.governance > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
              {sectionIssues.governance > 0 ? `${sectionIssues.governance} Issues` : 'Clean'}
            </span>
          </div>
        </Card>

        <Card 
          className={`p-3 cursor-pointer transition-all border-l-4 ${
            activeSection === 'documents' ? 'border-l-teal-600 ring-1 ring-teal-500' : 'border-l-slate-300'
          }`}
          onClick={() => setActiveSection('documents')}
        >
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-semibold">Evidence</span>
            <Upload className="w-3.5 h-3.5 text-teal-600" />
          </div>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-lg font-bold font-mono text-slate-900 dark:text-slate-100">
              {sectionIssues.documents}
            </span>
            <span className={`text-[10px] font-bold ${sectionIssues.documents > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
              {sectionIssues.documents > 0 ? `${sectionIssues.documents} Issues` : 'Clean'}
            </span>
          </div>
        </Card>

        <Card 
          className={`p-3 cursor-pointer transition-all border-l-4 ${
            activeSection === 'validation' ? 'border-l-amber-600 ring-1 ring-amber-500' : 'border-l-slate-300'
          }`}
          onClick={() => setActiveSection('validation')}
        >
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-semibold">AI Anomalies</span>
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
          </div>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-lg font-bold font-mono text-slate-900 dark:text-slate-100">
              1
            </span>
            <span className="text-[10px] font-bold text-amber-600">
              1 Flagged
            </span>
          </div>
        </Card>

        <Card className="p-3 border-l-4 border-l-emerald-500 bg-emerald-50/20 dark:bg-emerald-950/20">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-semibold">Review Checklist</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-lg font-bold font-mono text-emerald-700 dark:text-emerald-300">
              {checklistCompleted} / {checklist.length}
            </span>
            <span className="text-[10px] font-bold text-emerald-600">
              {Math.round((checklistCompleted / checklist.length) * 100)}%
            </span>
          </div>
        </Card>
      </div>

      {/* Main Review Sections & Checklist Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left 3 Columns: Section Review Items */}
        <div className="lg:col-span-3 space-y-4">
          {/* Section Navigation Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200 dark:border-slate-800 text-xs">
            <span className="font-bold text-slate-400 uppercase text-[10px] tracking-wider mr-2">
              SECTIONS REQUIRING REVIEW:
            </span>
            <button
              onClick={() => setActiveSection('environmental')}
              className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeSection === 'environmental' 
                  ? 'bg-emerald-600 text-white shadow-xs' 
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              <Leaf className="w-3.5 h-3.5" />
              <span>Environmental Data</span>
              {sectionIssues.environmental > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-400 text-slate-900 font-bold">
                  {sectionIssues.environmental}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveSection('social')}
              className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeSection === 'social' 
                  ? 'bg-blue-600 text-white shadow-xs' 
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Social Data</span>
              {sectionIssues.social > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-400 text-slate-900 font-bold">
                  {sectionIssues.social}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveSection('governance')}
              className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeSection === 'governance' 
                  ? 'bg-purple-600 text-white shadow-xs' 
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              <Scale className="w-3.5 h-3.5" />
              <span>Governance Data</span>
              {sectionIssues.governance > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-400 text-slate-900 font-bold">
                  {sectionIssues.governance}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveSection('documents')}
              className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeSection === 'documents' 
                  ? 'bg-teal-600 text-white shadow-xs' 
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Evidence & Invoices</span>
              {sectionIssues.documents > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-400 text-slate-900 font-bold">
                  {sectionIssues.documents}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveSection('validation')}
              className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeSection === 'validation' 
                  ? 'bg-amber-600 text-white shadow-xs' 
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Validation & AI Anomalies</span>
            </button>
          </div>

          {/* Section Header Notice */}
          <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300 uppercase tracking-wider">
                REVIEW MODE • READ ONLY
              </span>
              <span className="text-slate-600 dark:text-slate-300 font-medium">
                {activeSection === 'environmental' ? 'Environmental Energy, Water & Waste Disclosures' :
                 activeSection === 'social' ? 'Social Workforce, Inclusion & Occupational Safety Metrics' :
                 activeSection === 'governance' ? 'Corporate Governance, Ethics & Anti-Corruption Affirmations' :
                 activeSection === 'documents' ? 'Uploaded Utility Invoices & Calibration Proofs' :
                 'AI Outlier Engine & Variance Baseline Diagnostics'}
              </span>
            </div>
            <span className="text-[11px] text-slate-400">
              Project Manager: <strong>{proj.leadPerson || 'Rajesh Verma'}</strong> owns data correction
            </span>
          </div>

          {/* Metric Cards List */}
          <div className="space-y-3">
            {activeSection === 'environmental' && envMetrics.map(renderMetricReviewItem)}
            {activeSection === 'social' && socMetrics.map(renderMetricReviewItem)}
            {activeSection === 'governance' && govMetrics.map(renderMetricReviewItem)}
            {activeSection === 'documents' && docMetrics.map(renderMetricReviewItem)}
            {activeSection === 'validation' && (
              <div className="space-y-3">
                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-3 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-amber-900 dark:text-amber-200 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-amber-600" />
                      AI Statistical Variance Diagnostic: Grid Electricity
                    </span>
                    <span className="px-2 py-0.5 rounded font-bold text-[10px] bg-amber-200 text-amber-900">
                      Medium Severity
                    </span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                    Reported Value: <strong>100,000 kWh</strong> vs Historical Baseline: <strong>84,000 kWh (+19.0%)</strong>.
                    Anomaly Engine flags this variance because it exceeds 2 standard deviations from the solar installation benchmark.
                  </p>
                  <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 space-y-2">
                    <div className="font-semibold text-slate-800 dark:text-slate-200">
                      Reviewer Decision:
                    </div>
                    <p className="text-slate-500 text-[11px]">
                      The AI does not modify data. You can accept the justification or request formal billing proof from the Project Manager.
                    </p>
                    <div className="flex items-center gap-2 pt-1">
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleOpenCorrectionModal(envMetrics[0])}
                        icon={<AlertTriangle className="w-3.5 h-3.5" />}
                        className="bg-amber-600 hover:bg-amber-700 text-white text-xs"
                      >
                        Request Verification for Anomaly
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => approveItemMutation.mutate({ metricItem: envMetrics[0] })}
                        icon={<Check className="w-3.5 h-3.5 text-emerald-600" />}
                        className="text-xs"
                      >
                        Accept with Justification
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: BU Review Checklist & Action Guide */}
        <div className="space-y-4">
          <Card className="p-4 space-y-3 border-2 border-teal-500/40">
            <CardHeader
              title="BU Review Checklist"
              subtitle="Verification gates required before Stage 3 signoff"
              action={
                <span className="font-mono text-xs font-bold text-teal-700 dark:text-teal-400">
                  {checklistCompleted}/{checklist.length}
                </span>
              }
            />
            <div className="space-y-2 pt-1 text-xs">
              {checklist.map((item) => (
                <div 
                  key={item.id} 
                  className={`p-2 rounded-lg border flex items-start gap-2.5 transition-all ${
                    item.checked 
                      ? 'border-emerald-200 dark:border-emerald-800/60 bg-emerald-50/20 text-slate-800 dark:text-slate-200' 
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40 text-slate-500'
                  }`}
                >
                  <span className={`w-4 h-4 rounded flex items-center justify-center flex-shrink-0 mt-0.5 ${
                    item.checked ? 'bg-emerald-600 text-white' : 'border border-slate-300 dark:border-slate-700'
                  }`}>
                    {item.checked && <Check className="w-3 h-3 stroke-[3]" />}
                  </span>
                  <span className={`text-[11px] leading-tight ${item.checked ? 'font-medium' : ''}`}>
                    {item.label}
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
              <Button
                variant="primary"
                fullWidth
                size="md"
                disabled={!canApprove || approveSubmissionMutation.isPending}
                onClick={() => approveSubmissionMutation.mutate()}
                loading={approveSubmissionMutation.isPending}
                icon={<ShieldCheck className="w-4 h-4" />}
                className={`text-xs font-semibold ${
                  canApprove 
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white' 
                    : 'opacity-50 cursor-not-allowed bg-slate-200 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                }`}
              >
                {canApprove ? 'Approve BU Submission' : 'Complete All Checklist Items'}
              </Button>
              {!canApprove && (
                <p className="text-[10px] text-amber-600 dark:text-amber-400 text-center mt-1.5">
                  Resolve or approve all flagged items above to enable signoff.
                </p>
              )}
            </div>
          </Card>

          {/* Quick Review Draft Card */}
          {draftReviews.length > 0 && (
            <Card className="p-4 space-y-2.5 border-purple-300 dark:border-purple-800 bg-purple-50/15">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-purple-900 dark:text-purple-200">
                  Review Draft ({draftReviews.length})
                </span>
                <span className="text-[10px] font-mono bg-purple-100 dark:bg-purple-950 text-purple-700 px-1.5 py-0.5 rounded">
                  Pending Dispatch
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                You have {draftReviews.length} prepared correction {draftReviews.length === 1 ? 'request' : 'requests'}.
              </p>
              <div className="space-y-1 text-xs">
                {draftReviews.map(dr => (
                  <div key={dr.id} className="p-1.5 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[11px] flex justify-between items-center">
                    <span className="font-semibold truncate max-w-[140px]">{dr.metric}</span>
                    <span className="text-[10px] text-purple-600 font-bold">{dr.priority}</span>
                  </div>
                ))}
              </div>
              <Button
                variant="primary"
                fullWidth
                size="sm"
                onClick={() => sendDraftsMutation.mutate()}
                loading={sendDraftsMutation.isPending}
                icon={<Send className="w-3.5 h-3.5" />}
                className="bg-purple-600 hover:bg-purple-700 text-white text-xs"
              >
                Send All Review Comments
              </Button>
            </Card>
          )}

          {/* Reviewer Principles Card */}
          <Card className="p-4 space-y-2 bg-slate-50/50 dark:bg-slate-900/30 text-xs">
            <h4 className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-teal-600" />
              Data Ownership Rules
            </h4>
            <p className="text-slate-500 text-[11px] leading-relaxed">
              As Business Unit Manager, your role is strictly <strong>Review & Audit</strong>. Submitted ESG values cannot be modified directly by the reviewer. If an anomaly is spotted, dispatch a targeted correction request so the Project Manager makes verified corrections.
            </p>
          </Card>
        </div>
      </div>

      {/* CORRECTION REQUEST MODAL */}
      <Modal
        isOpen={correctionModalOpen}
        onClose={() => setCorrectionModalOpen(false)}
        title={`Request Metric Correction — ${selectedMetricForReview?.metric || ''}`}
        subtitle="Dispatches a targeted review request with notification directly to Project Manager"
        maxWidth="lg"
        footer={
          <div className="flex items-center justify-between w-full">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCorrectionModalOpen(false)}
            >
              Cancel
            </Button>
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => saveReviewMutation.mutate(true)}
                loading={saveReviewMutation.isPending}
              >
                Save as Draft
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => saveReviewMutation.mutate(false)}
                loading={saveReviewMutation.isPending}
                icon={<Send className="w-3.5 h-3.5" />}
                className="bg-amber-600 hover:bg-amber-700 text-white"
              >
                Send Correction Request
              </Button>
            </div>
          </div>
        }
      >
        <div className="space-y-4 text-xs">
          {/* Target Metric Identity */}
          <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 grid grid-cols-2 gap-2">
            <div>
              <span className="text-[10px] text-slate-400 block">Section & Category</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {selectedMetricForReview?.section} → {selectedMetricForReview?.category}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block">Reported Value</span>
              <span className="font-mono font-bold text-slate-900 dark:text-slate-100">
                {selectedMetricForReview?.currentValue}
              </span>
            </div>
          </div>

          {/* Issue Classification & Priority */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                Issue Type
              </label>
              <select
                value={issueType}
                onChange={(e) => setIssueType(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
              >
                <option value="Verification Required">Verification Required</option>
                <option value="Evidence Missing">Evidence Missing / Unclear</option>
                <option value="Calculation Variance">Calculation Variance Outlier</option>
                <option value="Threshold Exceeded">Operational Threshold Exceeded</option>
                <option value="Compliance Document Missing">Compliance Certificate Missing</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
              >
                <option value="Low">Low Priority</option>
                <option value="Medium">Medium Priority</option>
                <option value="High">High Priority</option>
                <option value="Critical">Critical Barrier</option>
              </select>
            </div>
          </div>

          {/* Reviewer Comment */}
          <div>
            <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
              Reviewer Comment / Clarification Needed
            </label>
            <textarea
              rows={3}
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
              placeholder="Explain why this metric requires verification or correction..."
              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-slate-100 font-sans"
            />
          </div>

          {/* Required Action */}
          <div>
            <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
              Required Action for Project Manager
            </label>
            <input
              type="text"
              value={requiredAction}
              onChange={(e) => setRequiredAction(e.target.value)}
              placeholder="e.g. Verify consumption against billing statement and upload supporting PDF."
              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
            />
          </div>
        </div>
      </Modal>

      {/* REVIEW THREAD MODAL */}
      <Modal
        isOpen={threadModalOpen}
        onClose={() => setThreadModalOpen(false)}
        title={`Review Thread — ${activeReviewThread?.metric || ''}`}
        subtitle={`${activeReviewThread?.section} → ${activeReviewThread?.category} • Priority: ${activeReviewThread?.priority}`}
        maxWidth="lg"
      >
        <div className="space-y-4 text-xs">
          {/* Thread Status Badge */}
          <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-100 dark:bg-slate-900">
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              Current Review Status:
            </span>
            <span className="font-bold text-xs font-mono uppercase px-2 py-0.5 rounded bg-white dark:bg-slate-800">
              {activeReviewThread?.status}
            </span>
          </div>

          {/* Message Thread History */}
          <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
            {activeReviewThread?.thread?.map((msg, idx) => (
              <div 
                key={idx}
                className={`p-3 rounded-xl border text-xs space-y-1 ${
                  msg.role.includes('Business Unit') 
                    ? 'border-teal-200 dark:border-teal-800 bg-teal-50/20 dark:bg-teal-950/20 ml-2' 
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 mr-2'
                }`}
              >
                <div className="flex items-center justify-between text-[11px] font-semibold text-slate-800 dark:text-slate-200">
                  <span>{msg.author} ({msg.role})</span>
                  <span className="text-[10px] text-slate-400">{msg.timestamp}</span>
                </div>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                  {msg.message}
                </p>
                {msg.attachment && (
                  <div className="flex items-center gap-1.5 text-[11px] text-teal-600 font-medium pt-1">
                    <FileText className="w-3.5 h-3.5" />
                    <span>Attached Document: {msg.attachment}</span>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Reply / Resolution Action Box */}
          <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-2">
            <label className="block font-semibold text-slate-700 dark:text-slate-300">
              Reviewer Resolution Notes:
            </label>
            <textarea
              rows={2}
              value={threadReplyComment}
              onChange={(e) => setThreadReplyComment(e.target.value)}
              placeholder="Accept response, or enter follow-up instructions..."
              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
            />
            <div className="flex items-center justify-end gap-2 pt-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setThreadModalOpen(false)}
              >
                Close
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  if (!activeReviewThread) return;
                  resolveItemMutation.mutate({
                    reviewId: activeReviewThread.id,
                    comment: threadReplyComment || 'Correction reviewed and accepted.'
                  });
                }}
                icon={<CheckCircle2 className="w-3.5 h-3.5" />}
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                Accept & Mark Resolved
              </Button>
            </div>
          </div>
        </div>
      </Modal>

      {/* REVIEW DRAFTS DRAWER / MODAL */}
      <Modal
        isOpen={showDraftsPanel}
        onClose={() => setShowDraftsPanel(false)}
        title="Review Comments Draft Queue"
        subtitle="Batch dispatch prepared correction requests to the Project Manager"
        maxWidth="lg"
        footer={
          <div className="flex items-center justify-between w-full">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDraftsPanel(false)}
            >
              Keep Editing
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => sendDraftsMutation.mutate()}
              loading={sendDraftsMutation.isPending}
              icon={<Send className="w-3.5 h-3.5" />}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              Send All Review Comments ({draftReviews.length})
            </Button>
          </div>
        }
      >
        <div className="space-y-3 text-xs">
          {draftReviews.length === 0 ? (
            <p className="text-slate-400 py-4 text-center">No drafts currently in queue.</p>
          ) : (
            draftReviews.map((dr, idx) => (
              <div key={dr.id} className="p-3 rounded-xl border border-purple-200 dark:border-purple-800 bg-purple-50/20 dark:bg-purple-950/20 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {idx + 1}. {dr.section} → {dr.metric}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-200 text-purple-900">
                    {dr.priority}
                  </span>
                </div>
                <p className="text-slate-600 dark:text-slate-400 italic">
                  "{dr.comment}"
                </p>
                <div className="text-[11px] text-slate-500 pt-1">
                  Required Action: <strong>{dr.requiredAction}</strong>
                </div>
              </div>
            ))
          )}
        </div>
      </Modal>
    </div>
  );
};

export default ReviewSubmissionDetail;
