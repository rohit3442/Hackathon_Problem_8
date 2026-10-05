import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Building2, 
  Layers, 
  TrendingUp, 
  CheckCircle, 
  Clock, 
  FileSpreadsheet, 
  ArrowRight,
  ShieldCheck,
  FileCheck2,
  PieChart as PieIcon
} from 'lucide-react';
import { StatCard } from '../common/StatCard';
import { Card, CardHeader } from '../common/Card';
import { Button } from '../common/Button';
import { ProgressBar } from '../common/ProgressBar';
import { StatusBadge } from '../common/StatusBadge';
import { useQuery } from '@tanstack/react-query';
import { organizationApi, projectsApi, approvalsApi } from '../../api';

export const SubsidiaryAdminDashboard: React.FC = () => {
  const navigate = useNavigate();

  const { data: orgData } = useQuery({
    queryKey: ['organization'],
    queryFn: organizationApi.getOrganization,
  });

  const { data: projects = [] } = useQuery({
    queryKey: ['projects'],
    queryFn: projectsApi.getProjects,
  });

  const { data: workflows = [] } = useQuery({
    queryKey: ['approvals'],
    queryFn: approvalsApi.getApprovals,
  });

  const businessUnits = orgData?.businessUnits || [];
  const subsidiary = orgData?.subsidiaries?.[0] || { name: 'Apex Heavy Engineering & Construction', code: 'AHEC' };

  const projectList = Array.isArray(projects) ? projects : [];
  const workflowList = Array.isArray(workflows) ? workflows : [];

  const pendingSubReviews = workflowList.filter(w => w.overallStatus === 'submitted' || w.overallStatus === 'under_review');
  const avgCompletion = projectList.length > 0 
    ? Math.round(projectList.reduce((acc, p) => acc + (p.esgCompletion || 0), 0) / projectList.length)
    : 0;

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 rounded-2xl p-6 text-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-800/80 text-emerald-200 border border-emerald-600/40 mb-2">
            <Building2 className="w-3.5 h-3.5 text-emerald-300" />
            Subsidiary Administrative Command
          </div>
          <h2 className="text-xl md:text-2xl font-bold font-heading">
            {subsidiary.name} ({subsidiary.code})
          </h2>
          <p className="text-xs md:text-sm text-slate-300 mt-1 max-w-xl">
            Logged in as <strong>Sunita Rao</strong>. Oversee business units, track multi-site ESG completion, review cross-BU performance trends, and trigger subsidiary-level consolidation for BRSR reporting.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="primary"
            onClick={() => navigate('/subsidiaries/sub-1')}
            icon={<Layers className="w-4 h-4" />}
            className="bg-emerald-500 hover:bg-emerald-600 text-white border-0 shadow-sm"
          >
            Subsidiary Dossier
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate('/reports')}
            className="bg-white/10 hover:bg-white/20 text-white border-white/20"
            icon={<FileSpreadsheet className="w-4 h-4" />}
          >
            Reports
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Constituent Business Units"
          value={businessUnits.length.toString()}
          subtitle="Operating operational divisions"
          icon={<Layers className="w-5 h-5 text-teal-600" />}
        />
        <StatCard
          title="Total Projects Monitored"
          value={projects.length.toString()}
          subtitle="All reporting boundaries"
          icon={<Building2 className="w-5 h-5 text-emerald-600" />}
        />
        <StatCard
          title="Pending Subsidiary Approvals"
          value={pendingSubReviews.length.toString()}
          subtitle="Submissions at Stage 2"
          icon={<Clock className="w-5 h-5 text-amber-600" />}
        />
        <StatCard
          title="Subsidiary ESG Readiness"
          value={`${avgCompletion}%`}
          subtitle="BRSR Alignment: 89%"
          icon={<TrendingUp className="w-5 h-5 text-emerald-600" />}
          change="+14% YoY"
          trend="up"
        />
      </div>

      {/* Business Units Drilldown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader
              title="Business Units Reporting Status"
              subtitle="Consolidated metrics across all operational business units"
              action={
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/business-units')}
                  icon={<ArrowRight className="w-3.5 h-3.5" />}
                >
                  View All BUs
                </Button>
              }
            />
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {businessUnits.map((bu) => (
                <div key={bu.id} className="p-4 hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-slate-900 dark:text-slate-100">{bu.name}</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                        {bu.code}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">
                      Lead: {bu.headOfBU || 'Vikram Malhotra'} • {bu.projectsCount || 4} Projects
                    </p>
                    <div className="pt-1 max-w-sm">
                      <ProgressBar progress={bu.esgCompletion || 88} showPercentage size="sm" />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/business-units/${bu.id}`)}
                    >
                      Inspect BU
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Subsidiary Trends & Reporting Readiness */}
        <div className="space-y-6">
          <Card>
            <CardHeader
              title="Reporting Readiness"
              subtitle="SEBI BRSR Core compliance checklist"
            />
            <div className="p-4 space-y-3">
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800">
                <div className="flex items-center gap-2 text-xs">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span className="font-medium text-slate-800 dark:text-slate-200">Environmental Scope 1 & 2</span>
                </div>
                <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400">100% Ready</span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800">
                <div className="flex items-center gap-2 text-xs">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span className="font-medium text-slate-800 dark:text-slate-200">Workforce & Safety Census</span>
                </div>
                <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400">92% Ready</span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800">
                <div className="flex items-center gap-2 text-xs">
                  <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  <span className="font-medium text-slate-800 dark:text-slate-200">Value Chain Scope 3 Disclosures</span>
                </div>
                <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400">In Progress</span>
              </div>

              <Button
                variant="primary"
                fullWidth
                size="sm"
                onClick={() => navigate('/subsidiaries/sub-1')}
                icon={<ArrowRight className="w-3.5 h-3.5" />}
                className="mt-2"
              >
                Open Full Subsidiary Workspace
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
