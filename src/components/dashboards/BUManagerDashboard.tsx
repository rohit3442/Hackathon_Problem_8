import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Building2, 
  CheckCircle, 
  AlertTriangle, 
  Layers, 
  ArrowRight, 
  FolderKanban,
  FileCheck2,
  TrendingUp,
  Clock,
  Sparkles
} from 'lucide-react';
import { StatCard } from '../common/StatCard';
import { Card, CardHeader } from '../common/Card';
import { Button } from '../common/Button';
import { ProgressBar } from '../common/ProgressBar';
import { StatusBadge } from '../common/StatusBadge';
import { useQuery } from '@tanstack/react-query';
import { projectsApi, approvalsApi, validationApi, dashboardApi } from '../../api';

export const BUManagerDashboard: React.FC = () => {
  const navigate = useNavigate();

  const { data: projects = [] } = useQuery({
    queryKey: ['projects'],
    queryFn: projectsApi.getProjects,
  });

  const { data: workflows = [] } = useQuery({
    queryKey: ['approvals'],
    queryFn: approvalsApi.getApprovals,
  });

  const { data: validations = [] } = useQuery({
    queryKey: ['validations'],
    queryFn: validationApi.getAlerts,
  });

  const { data: dashboardData } = useQuery({
    queryKey: ['dashboard'],
    queryFn: dashboardApi.getDashboardData,
  });

  // BU specific filters (e.g. Renewables & Power BU)
  const projectList = Array.isArray(projects) ? projects : [];
  const workflowList = Array.isArray(workflows) ? workflows : [];
  const validationList = Array.isArray(validations) ? validations : [];

  const buProjects = projectList.filter(p => p.businessUnitId === 'bu-1' || p.businessUnitName?.includes('Renewables') || true);
  const submittedProjects = buProjects.filter(p => p.approvalStatus === 'submitted' || p.approvalStatus === 'under_review');
  const pendingReviewsCount = Math.max(submittedProjects.length, workflowList.filter(w => w.overallStatus === 'submitted' || w.overallStatus === 'under_review').length);
  const correctionProjects = projectList.filter(p => p.approvalStatus === 'correction_required' || p.validationStatus === 'flagged');
  const openValidationAlerts = validationList.filter(v => v.status === 'open');

  const avgCompletion = buProjects.length > 0 
    ? Math.round(buProjects.reduce((acc, p) => acc + (p.esgCompletion || 0), 0) / buProjects.length)
    : 0;

  return (
    <div className="space-y-6">
      {/* BU Manager Hero Banner */}
      <div className="bg-gradient-to-r from-teal-900 to-slate-900 rounded-2xl p-6 text-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-800/80 text-teal-200 border border-teal-600/40 mb-2">
            <Building2 className="w-3.5 h-3.5 text-teal-300" />
            Business Unit Manager Workspace
          </div>
          <h2 className="text-xl md:text-2xl font-bold font-heading">
            Renewables & Power Transmission BU
          </h2>
          <p className="text-xs md:text-sm text-slate-300 mt-1 max-w-xl">
            Logged in as <strong>Vikram Malhotra</strong>. Review incoming project ESG data entries, conduct variance comparisons, request corrections, and approve unit-level submissions before subsidiary signoff.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="primary"
            onClick={() => navigate('/projects')}
            icon={<Building2 className="w-4 h-4" />}
            className="bg-emerald-500 hover:bg-emerald-600 text-white border-0 shadow-sm"
          >
            All Projects Portfolio
          </Button>
        </div>
      </div>

      {/* BU KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Projects in BU"
          value={buProjects.length.toString()}
          subtitle="Operational facilities monitored"
          icon={<FolderKanban className="w-5 h-5 text-teal-600" />}
        />
        <StatCard
          title="Submissions Pending Review"
          value={pendingReviewsCount.toString()}
          subtitle="Action needed at Stage 1"
          icon={<Clock className="w-5 h-5 text-amber-600" />}
          trend={pendingReviewsCount > 0 ? 'down' : 'up'}
        />
        <StatCard
          title="Projects Requiring Correction"
          value={correctionProjects.length.toString()}
          subtitle="Re-opened for project teams"
          icon={<AlertTriangle className="w-5 h-5 text-rose-600" />}
        />
        <StatCard
          title="BU ESG Completion"
          value={`${avgCompletion}%`}
          subtitle="BRSR Core readiness: 85%"
          icon={<TrendingUp className="w-5 h-5 text-emerald-600" />}
          change="+8% vs Q3 baseline"
          trend="up"
        />
      </div>

      {/* Projects Table & Pending Approvals Queue */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader
              title="Business Unit Projects Progress & Comparison"
              subtitle="Overview of all projects under Renewables & Power Transmission"
              action={
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/business-units/bu-1')}
                  icon={<ArrowRight className="w-3.5 h-3.5" />}
                >
                  BU Details
                </Button>
              }
            />
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="p-3 font-semibold">Project</th>
                    <th className="p-3 font-semibold">Location</th>
                    <th className="p-3 font-semibold">ESG Completion</th>
                    <th className="p-3 font-semibold">Workflow Status</th>
                    <th className="p-3 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {buProjects.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="p-3">
                        <div className="font-semibold text-slate-900 dark:text-slate-100">{p.name}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{p.code}</div>
                      </td>
                      <td className="p-3 text-slate-600 dark:text-slate-300">
                        {p.location}, {p.state}
                      </td>
                      <td className="p-3">
                        <div className="w-32">
                          <ProgressBar progress={p.esgCompletion} showPercentage size="sm" />
                        </div>
                      </td>
                      <td className="p-3">
                        <StatusBadge status={p.approvalStatus as any} />
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/projects/${p.id}/overview`)}
                          >
                            Inspect
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* Right Column: Pending Approvals & Validation Alerts in BU */}
        <div className="space-y-6">
          {/* Submissions Pending BU Review Queue */}
          <Card className="border border-emerald-300 dark:border-emerald-800/80 bg-emerald-50/20 dark:bg-emerald-950/10">
            <CardHeader
              title="Submissions Awaiting BU Signoff"
              subtitle="Project ESG disclosures in Stage 1 queue"
              action={
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 font-mono">
                  {submittedProjects.length} Pending
                </span>
              }
            />
            <div className="p-4 space-y-3">
              {submittedProjects.length === 0 ? (
                <div className="text-center py-4 text-xs text-slate-400">
                  No submissions currently awaiting BU manager signoff.
                </div>
              ) : (
                submittedProjects.map((p) => (
                  <div key={p.id} className="p-3 rounded-xl border border-emerald-200 dark:border-emerald-800/60 bg-white dark:bg-[#0c1411] space-y-2 shadow-xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-bold text-xs px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[10px]">
                          {p.code}
                        </span>
                        <span className="font-bold text-xs text-slate-900 dark:text-slate-100 truncate max-w-[150px]">
                          {p.name}
                        </span>
                      </div>
                      <StatusBadge status="submitted" />
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <span>Lead: {p.leadPerson || 'Project Lead'}</span>
                      <span className="font-mono text-emerald-600 font-bold">{p.esgCompletion}% Done</span>
                    </div>
                    <div className="pt-1 flex items-center justify-end">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/projects/${p.id}/overview`)}
                        className="text-xs w-full sm:w-auto"
                      >
                        Inspect Facility
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>

          <Card>
            <CardHeader
              title="Validation Alerts (BU Scope)"
              subtitle="Active rule and statistical anomalies requiring BU signoff"
              action={
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('/validation')}
                >
                  View All
                </Button>
              }
            />
            <div className="p-4 space-y-3">
              {openValidationAlerts.slice(0, 3).map((val) => (
                <div key={val.id} className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 text-xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 dark:text-slate-100">{val.metric}</span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                      {val.severity}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Reported: <strong>{val.currentValue}</strong> vs Prev: <strong>{val.previousValue}</strong>
                  </p>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300">
                    {val.details}
                  </p>
                  <div className="pt-1 flex items-center justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/validation/${val.id}`)}
                    >
                      Resolve Alert
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
