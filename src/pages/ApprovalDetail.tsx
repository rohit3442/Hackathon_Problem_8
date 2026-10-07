import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  CheckCircle, 
  ArrowLeft, 
  AlertTriangle, 
  FileText, 
  MessageSquare, 
  User, 
  Building2, 
  Clock, 
  ShieldCheck,
  Send,
  CheckCircle2,
  FileSpreadsheet
} from 'lucide-react';
import { Card, CardHeader } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { StatusBadge } from '../components/common/StatusBadge';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { approvalsApi } from '../api';
import { normalizeRole } from '../utils/workflow';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import confetti from 'canvas-confetti';

export const ApprovalDetail: React.FC = () => {
  const { id = 'appr-1' } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { addToast } = useApp();

  const [commentText, setCommentText] = useState('');

  const { data: workflow, isLoading } = useQuery({
    queryKey: ['approval', id],
    queryFn: () => approvalsApi.getApprovalById(id),
  });

  const actionMutation = useMutation({
    mutationFn: async ({ action }: { action: 'approve' | 'reject' | 'request_correction' }) => {
      return await approvalsApi.actionApproval(
        id,
        action,
        commentText,
        user?.name || 'Authorized Reviewer',
        user?.roleTitle || 'Compliance Officer',
        user?.role
      );
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['approval', id] });
      queryClient.invalidateQueries({ queryKey: ['approvals'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });

      if (variables.action === 'approve') {
        try {
          confetti({ particleCount: 60, spread: 50 });
        } catch (e) {}
        addToast('Stage Approved', 'Approval milestone logged to immutable audit trail', 'success');
      } else {
        addToast('Correction Requested', 'Submission returned to previous stage for revision', 'info');
      }
      setCommentText('');
    }
  });

  const wf = workflow || {
    id,
    projectId: 'proj-1',
    projectCode: 'PRJ-001',
    projectName: 'Project Solar Apex',
    businessUnitName: 'Renewables & Power Transmission',
    subsidiaryName: 'Apex Heavy Engineering & Construction',
    reportingPeriod: 'FY 2025-26',
    currentStepIndex: 1,
    overallStatus: 'under_review',
    steps: [
      { id: 's1', roleKey: 'project_user', label: 'Project Lead Submission', status: 'approved', actionBy: 'Rajesh Verma', actionAt: '2026-10-02 11:30', comments: 'All meter reading invoices attached.' },
      { id: 's2', roleKey: 'bu_manager', label: 'BU Manager Review', status: 'in_progress', actionBy: 'Vikram Malhotra', actionAt: '', comments: '' },
      { id: 's3', roleKey: 'subsidiary_admin', label: 'Subsidiary Admin Signoff', status: 'pending', actionBy: 'Sunita Rao', actionAt: '', comments: '' },
      { id: 's4', roleKey: 'esg_team', label: 'ESG Team Technical Validation', status: 'pending', actionBy: 'Dr. Ananya Sen', actionAt: '', comments: '' },
      { id: 's5', roleKey: 'management', label: 'Final Executive / Board Signoff', status: 'pending', actionBy: 'Deepak Khaitan', actionAt: '', comments: '' },
    ]
  };

  // Determine allowed actions based on current user's role
  const stepIdx = wf.currentStepIndex ?? 0;
  const currentStepRole = wf.steps?.[stepIdx]?.role || wf.steps?.[stepIdx]?.roleKey;
  const isActionable = stepIdx >= 1 && !['approved', 'correction_required', 'draft'].includes(wf.overallStatus);
  const canApprove = isActionable && normalizeRole(currentStepRole) === normalizeRole(user?.role);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/approvals')}
              icon={<ArrowLeft className="w-4 h-4" />}
            >
              Approval Center
            </Button>
            <span className="text-slate-300 dark:text-slate-700">/</span>
            <span className="text-xs font-mono font-bold text-slate-500">{wf.projectCode}</span>
            <StatusBadge status={wf.overallStatus as any} />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 font-heading m-0">
            Submission Dossier: {wf.projectName}
          </h1>
          <p className="text-xs text-slate-500">
            {wf.subsidiaryName || wf.subsidiary} • {wf.businessUnitName || wf.businessUnit} • Reporting Period: <strong>{wf.reportingPeriod}</strong>
          </p>
        </div>

        {canApprove && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => actionMutation.mutate({ action: 'request_correction' })}
              loading={actionMutation.isPending}
            >
              Request Correction
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => actionMutation.mutate({ action: 'approve' })}
              loading={actionMutation.isPending}
              icon={<CheckCircle className="w-4 h-4" />}
            >
              {stepIdx >= 4 ? 'Grant Final Executive Signoff' : 'Approve Milestone'}
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Dossier Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Submission Summary */}
          <Card className="p-5 space-y-4">
            <CardHeader
              title="Reported ESG Summary"
              subtitle="Data submitted by facility engineer for formal signoff"
            />
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60">
                <span className="text-slate-400">Electricity</span>
                <p className="font-bold text-sm font-mono mt-0.5">100,000 kWh</p>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60">
                <span className="text-slate-400">Total Energy</span>
                <p className="font-bold text-sm font-mono text-emerald-600 mt-0.5">1,310 GJ</p>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60">
                <span className="text-slate-400">Water Recycled</span>
                <p className="font-bold text-sm font-mono text-blue-600 mt-0.5">37.0%</p>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60">
                <span className="text-slate-400">Workplace Safety</span>
                <p className="font-bold text-sm font-mono text-emerald-600 mt-0.5">Zero Fatalities</p>
              </div>
            </div>

            <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-600" />
                <span className="font-semibold text-slate-800 dark:text-slate-200">Attached Audit Evidence</span>
              </div>
              <span className="font-mono text-slate-500">DISCOM_Power_Invoices_FY26.pdf</span>
            </div>

            <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-teal-600" />
                <span className="font-semibold text-slate-800 dark:text-slate-200">SEBI BRSR Linkage</span>
              </div>
              <span className="text-emerald-700 dark:text-emerald-400 font-bold">P6-E1, P6-E2, P3-E1 Mapped</span>
            </div>
          </Card>

          {/* Reviewer Comments Form */}
          {canApprove && (
            <Card className="p-5 space-y-3">
              <CardHeader
                title="Reviewer Comments & Authorization Signoff"
                subtitle="Sign off on compliance with SEBI BRSR guidelines"
              />
              <textarea
                rows={3}
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="e.g. Energy calculations verified against DISCOM utility invoices. Approved for next workflow stage."
                className="w-full p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs"
              />
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => actionMutation.mutate({ action: 'request_correction' })}
                  loading={actionMutation.isPending}
                >
                  Request Correction
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => actionMutation.mutate({ action: 'approve' })}
                  loading={actionMutation.isPending}
                >
                  Approve as {user?.roleTitle || 'Reviewer'}
                </Button>
              </div>
            </Card>
          )}
        </div>

        {/* Right Column: Multi-stage Approval Hierarchy */}
        <div className="space-y-6">
          <Card className="p-5 space-y-4">
            <CardHeader
              title="5-Stage Authorization Chain"
              subtitle="Configurable multi-level verification pipeline"
            />
            <div className="space-y-4">
              {wf.steps?.map((step: any, index: number) => {
                const isCurrent = index === stepIdx;
                const isDone = step.status === 'approved';
                const isRejected = step.status === 'rejected';

                return (
                  <div key={step.id || index} className="flex gap-3 text-xs">
                    <div className="flex flex-col items-center">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${
                        isDone ? 'bg-emerald-600 text-white' :
                        isRejected ? 'bg-rose-600 text-white' :
                        isCurrent ? 'bg-amber-500 text-white animate-pulse' :
                        'bg-slate-200 dark:bg-slate-700 text-slate-500'
                      }`}>
                        {index + 1}
                      </div>
                      {index < (wf.steps?.length - 1) && (
                        <div className={`w-0.5 h-10 ${
                          isDone ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-800'
                        }`} />
                      )}
                    </div>

                    <div className="space-y-1 pb-2 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 dark:text-slate-100">{step.label}</span>
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold capitalize ${
                          isDone ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' :
                          isRejected ? 'bg-rose-100 text-rose-800' :
                          isCurrent ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' :
                          'text-slate-400'
                        }`}>
                          {step.status?.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500">
                        {step.actionBy || 'Pending assignment'} {step.actionAt ? `• ${step.actionAt}` : ''}
                      </p>
                      {step.comments && (
                        <p className="text-[11px] italic text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/40 p-2 rounded">
                          "{step.comments}"
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ApprovalDetail;
