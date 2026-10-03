import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  CheckCircle, 
  Clock, 
  ArrowRight, 
  User, 
  FileText, 
  ShieldCheck, 
  MessageSquare,
  Sparkles,
  CheckCircle2,
  Building2
} from 'lucide-react';
import { Card, CardHeader } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { StatusBadge } from '../components/common/StatusBadge';
import { useAuth } from '../context/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { approvalsApi } from '../api';

export const ApprovalCenter: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data: approvals = [], isLoading } = useQuery({
    queryKey: ['approvals'],
    queryFn: approvalsApi.getApprovals,
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 font-heading m-0">
              Multi-Tier Approval Center
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold border border-emerald-300/40">
              5-Stage Governance Pipeline
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Configurable governance workflow: Project User → BU Manager → Subsidiary Admin → ESG/Sustainability Team → Final Approver.
          </p>
        </div>
      </div>

      {/* Workflow Chain Visualizer Banner */}
      <Card className="bg-gradient-to-r from-slate-900 via-[#0a1b14] to-[#0f2e22] text-white border-0 shadow-md">
        <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-300 mb-3">
          Configurable Enterprise Corporate Signoff Hierarchy
        </h3>
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2 text-xs">
          {[
            { role: 'Project User', desc: 'Data Entry & Evidence' },
            { role: 'BU Manager', desc: 'Unit Level Check' },
            { role: 'Subsidiary Admin', desc: 'Subsidiary Rollup' },
            { role: 'ESG / Sustainability Team', desc: 'BRSR Validation' },
            { role: 'Final Approver', desc: 'Final Publication' },
          ].map((item, idx) => (
            <React.Fragment key={idx}>
              <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 flex-1">
                <span className="text-[10px] text-emerald-400 font-bold block">Stage {idx + 1}</span>
                <strong className="text-slate-100 font-bold block mt-0.5">{item.role}</strong>
                <span className="text-[10px] text-slate-400">{item.desc}</span>
              </div>
              {idx < 4 && (
                <div className="hidden md:flex text-emerald-500 flex-shrink-0">
                  <ArrowRight className="w-4 h-4" />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </Card>

      {/* Submissions List */}
      <div className="space-y-4">
        {approvals.map(appr => (
          <Card key={appr.id} className="p-5 space-y-4 hover:shadow-md transition-shadow">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                    {appr.projectName}
                  </span>
                  <span className="font-mono text-xs text-slate-500 px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800">
                    {appr.projectCode}
                  </span>
                  <StatusBadge status={appr.overallStatus as any} size="sm" />
                </div>
                <p className="text-xs text-slate-500">
                  {appr.subsidiaryName || appr.subsidiary} • {appr.businessUnitName || appr.businessUnit} • Reporting Period: <strong>{appr.reportingPeriod}</strong>
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => navigate(`/approvals/${appr.id}`)}
                  icon={<ArrowRight className="w-3.5 h-3.5" />}
                >
                  Review Dossier
                </Button>
              </div>
            </div>

            {/* Stepper preview */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
              {appr.steps?.map((step: any, idx: number) => {
                const isCurrent = idx === (appr.currentStepIndex ?? 0);
                const isDone = step.status === 'approved';
                return (
                  <div
                    key={idx}
                    className={`p-2.5 rounded-lg border text-left ${
                      isDone
                        ? 'border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/50 dark:bg-emerald-950/20'
                        : isCurrent
                        ? 'border-amber-300 dark:border-amber-700 bg-amber-50/50 dark:bg-amber-950/20 shadow-xs'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40 opacity-70'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-slate-400">Step {idx + 1}</span>
                      {isDone && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                    </div>
                    <p className="font-bold text-slate-800 dark:text-slate-200 mt-0.5 truncate">{step.label}</p>
                    <p className="text-[10px] text-slate-500 mt-0.5 truncate">{step.actionBy || 'Pending'}</p>
                  </div>
                );
              })}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ApprovalCenter;
