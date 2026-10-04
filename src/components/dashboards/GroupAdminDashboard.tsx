import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Building2, 
  Layers, 
  Users, 
  ShieldCheck, 
  ArrowRight, 
  Settings, 
  CheckCircle2, 
  FolderKanban,
  FileSpreadsheet,
  History,
  TrendingUp,
  ShieldAlert
} from 'lucide-react';
import { StatCard } from '../common/StatCard';
import { Card, CardHeader } from '../common/Card';
import { Button } from '../common/Button';
import { ProgressBar } from '../common/ProgressBar';
import { StatusBadge } from '../common/StatusBadge';
import { useQuery } from '@tanstack/react-query';
import { dashboardApi, organizationApi, projectsApi, usersApi, approvalsApi } from '../../api';

export const GroupAdminDashboard: React.FC = () => {
  const navigate = useNavigate();

  const { data: dashboardData } = useQuery({
    queryKey: ['dashboard'],
    queryFn: dashboardApi.getDashboardData,
  });

  const { data: orgData } = useQuery({
    queryKey: ['organization'],
    queryFn: organizationApi.getOrganization,
  });

  const { data: projects = [] } = useQuery({
    queryKey: ['projects'],
    queryFn: projectsApi.getProjects,
  });

  const { data: usersList = [] } = useQuery({
    queryKey: ['users'],
    queryFn: usersApi.getUsers,
  });

  const { data: workflows = [] } = useQuery({
    queryKey: ['approvals'],
    queryFn: approvalsApi.getApprovals,
  });

  const subsidiaries = orgData?.subsidiaries || [];
  const workflowList = Array.isArray(workflows) ? workflows : [];
  const pendingApprovalsCount = workflowList.filter(w => w.overallStatus !== 'approved').length;

  return (
    <div className="space-y-6">
      {/* Group Admin Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-teal-950 rounded-2xl p-6 text-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-800/80 text-emerald-200 border border-emerald-600/40 mb-2">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
            Group Executive Administration
          </div>
          <h2 className="text-xl md:text-2xl font-bold font-heading">
            Enterprise Governance & Consolidation
          </h2>
          <p className="text-xs md:text-sm text-slate-300 mt-1 max-w-xl">
            Logged in as <strong>Arun Mehta (Group Administrator)</strong>. Full governance over 3 subsidiaries, {projects.length} reporting facilities, multi-tiered approval hierarchy, user credentials, and SEBI filing pipelines.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="primary"
            onClick={() => navigate('/organization')}
            icon={<Building2 className="w-4 h-4" />}
            className="bg-emerald-500 hover:bg-emerald-600 text-white border-0 shadow-sm"
          >
            Organization Tree
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate('/users')}
            icon={<Users className="w-4 h-4" />}
            className="bg-white/10 hover:bg-white/20 text-white border-white/20"
          >
            User Access
          </Button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Consolidated Subsidiaries"
          value={subsidiaries.length.toString()}
          subtitle="100% boundary coverage"
          icon={<Building2 className="w-5 h-5 text-teal-600" />}
        />
        <StatCard
          title="Active Projects Reporting"
          value={projects.length.toString()}
          subtitle="All reporting boundaries active"
          icon={<FolderKanban className="w-5 h-5 text-emerald-600" />}
        />
        <StatCard
          title="Overall ESG Completion"
          value={`${dashboardData?.esgCompletion ?? 87}%`}
          subtitle="BRSR: 90% finalized"
          icon={<TrendingUp className="w-5 h-5 text-emerald-600" />}
          change="+9% YoY"
          trend="up"
        />
        <StatCard
          title="Active Workflow Approvals"
          value={pendingApprovalsCount.toString()}
          subtitle="Multi-level signoff queue"
          icon={<CheckCircle2 className="w-5 h-5 text-amber-600" />}
        />
      </div>

      {/* Subsidiary Performance Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader
              title="Subsidiary Reporting Coverage & Comparison"
              subtitle="Performance and compliance across group entities"
              action={
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/subsidiaries')}
                  icon={<ArrowRight className="w-3.5 h-3.5" />}
                >
                  All Subsidiaries
                </Button>
              }
            />
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {subsidiaries.map((sub) => (
                <div key={sub.id} className="p-4 hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-slate-900 dark:text-slate-100 truncate">
                        {sub.name}
                      </span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                        {sub.code}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">
                      Projects: {sub.projectsCount || 4} • BUs: {sub.businessUnitsCount || 2} • Lead: {sub.managingDirector || 'Director'}
                    </p>
                    <div className="flex items-center gap-3 pt-1 max-w-sm">
                      <ProgressBar progress={sub.esgCompletion || 88} showPercentage size="sm" />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/subsidiaries/${sub.id}`)}
                    >
                      Dossier
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => navigate('/reports')}
                    >
                      Audit
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Administration Links */}
        <div className="space-y-6">
          <Card>
            <CardHeader
              title="System Governance Hub"
              subtitle="Quick navigation for enterprise controls"
            />
            <div className="p-4 space-y-2">
              <button
                onClick={() => navigate('/organization')}
                className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors text-left"
              >
                <div className="flex items-center gap-3">
                  <Building2 className="w-4 h-4 text-emerald-600" />
                  <div>
                    <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">Hierarchy Management</p>
                    <p className="text-[11px] text-slate-500">Add BUs, sites & subsidiaries</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400" />
              </button>

              <button
                onClick={() => navigate('/users')}
                className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors text-left"
              >
                <div className="flex items-center gap-3">
                  <Users className="w-4 h-4 text-teal-600" />
                  <div>
                    <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">User Access & Roles</p>
                    <p className="text-[11px] text-slate-500">{usersList.length} authenticated enterprise users</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400" />
              </button>

              <button
                onClick={() => navigate('/audit-trail')}
                className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors text-left"
              >
                <div className="flex items-center gap-3">
                  <History className="w-4 h-4 text-purple-600" />
                  <div>
                    <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">Immutable Audit Trail</p>
                    <p className="text-[11px] text-slate-500">Full tamper-evident compliance log</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400" />
              </button>

              <button
                onClick={() => navigate('/settings')}
                className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors text-left"
              >
                <div className="flex items-center gap-3">
                  <Settings className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                  <div>
                    <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">Platform Settings</p>
                    <p className="text-[11px] text-slate-500">Workflow triggers & thresholds</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400" />
              </button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
