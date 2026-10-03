import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Leaf, 
  FileSpreadsheet, 
  FileCheck2, 
  AlertTriangle, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight,
  TrendingDown,
  Globe2,
  ShieldAlert,
  BarChart3
} from 'lucide-react';
import { StatCard } from '../common/StatCard';
import { Card, CardHeader } from '../common/Card';
import { Button } from '../common/Button';
import { ProgressBar } from '../common/ProgressBar';
import { StatusBadge } from '../common/StatusBadge';
import { useQuery } from '@tanstack/react-query';
import { dashboardApi, brsrApi, validationApi, approvalsApi } from '../../api';

export const ESGTeamDashboard: React.FC = () => {
  const navigate = useNavigate();

  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: dashboardApi.getDashboardData,
  });

  const { data: principles = [] } = useQuery({
    queryKey: ['brsrPrinciples'],
    queryFn: brsrApi.getPrinciples,
  });

  const { data: validations = [] } = useQuery({
    queryKey: ['validations'],
    queryFn: validationApi.getAlerts,
  });

  const { data: workflows = [] } = useQuery({
    queryKey: ['approvals'],
    queryFn: approvalsApi.getApprovals,
  });

  const openValidationAlerts = validations.filter(v => v.status === 'open');
  const aiAnomalies = validations.filter(v => v.rule?.includes('AI') || v.severity === 'high');

  return (
    <div className="space-y-6">
      {/* ESG Team Hero Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-teal-900 to-slate-900 rounded-2xl p-6 text-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-800/80 text-emerald-200 border border-emerald-600/40 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
            Sustainability Technical Center
          </div>
          <h2 className="text-xl md:text-2xl font-bold font-heading">
            Enterprise ESG & BRSR Control Center
          </h2>
          <p className="text-xs md:text-sm text-slate-300 mt-1 max-w-xl">
            Logged in as <strong>Dr. Ananya Sen (CSO & Head of Sustainability)</strong>. Validate enterprise ESG metrics, manage BRSR Section A/B/C disclosures, review AI anomaly alerts, map activities to UN SDGs, and prepare audited regulatory filings.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="primary"
            onClick={() => navigate('/validation')}
            icon={<FileCheck2 className="w-4 h-4" />}
            className="bg-emerald-500 hover:bg-emerald-600 text-white border-0 shadow-sm"
          >
            Validation Center ({openValidationAlerts.length})
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate('/brsr')}
            icon={<FileSpreadsheet className="w-4 h-4" />}
            className="bg-white/10 hover:bg-white/20 text-white border-white/20"
          >
            BRSR Workspace
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Organization ESG Completion"
          value={`${dashboardData?.esgCompletion ?? 87}%`}
          subtitle="Aggregate across all subsidiaries"
          icon={<Leaf className="w-5 h-5 text-emerald-600" />}
          change="+6.2% vs last cycle"
          trend="up"
        />
        <StatCard
          title="BRSR Core Readiness"
          value={`${dashboardData?.brsrCompletion ?? 90}%`}
          subtitle="P1 through P9 disclosures ready"
          icon={<FileSpreadsheet className="w-5 h-5 text-teal-600" />}
          change="SEBI Compliant"
          trend="up"
        />
        <StatCard
          title="Validation & Anomaly Alerts"
          value={openValidationAlerts.length.toString()}
          subtitle="AI & Rule-based flags"
          icon={<AlertTriangle className="w-5 h-5 text-amber-600" />}
          trend={openValidationAlerts.length > 0 ? 'down' : 'up'}
        />
        <StatCard
          title="Data Quality Assurance"
          value={`${dashboardData?.dataQualityScore ?? 94.8}%`}
          subtitle="Verified with supporting evidence"
          icon={<CheckCircle2 className="w-5 h-5 text-emerald-600" />}
          trend="up"
        />
      </div>

      {/* Principles Completion & Anomaly Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader
              title="BRSR Section C: Principle Completion Progress"
              subtitle="Progress tracker across all 9 National Guidelines on Responsible Business Conduct principles"
              action={
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/brsr/section-c')}
                  icon={<ArrowRight className="w-3.5 h-3.5" />}
                >
                  Section C Workspace
                </Button>
              }
            />
            <div className="p-4 space-y-3">
              {principles.map((p) => (
                <div key={p.id} className="p-3 rounded-xl border border-slate-100 dark:border-slate-800/80 hover:border-slate-200 dark:hover:border-slate-700 transition-colors">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {p.code}: {p.title}
                    </span>
                    <span className="font-bold text-emerald-700 dark:text-emerald-400">
                      {p.totalCompletion}%
                    </span>
                  </div>
                  <ProgressBar progress={p.totalCompletion} size="sm" />
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* AI Anomaly Detection Card */}
        <div className="space-y-6">
          <Card>
            <CardHeader
              title="AI Anomaly Watchlist"
              subtitle="Flagged by Isolation Forest & Z-Score engine"
              action={
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('/validation/anomalies')}
                >
                  AI Center
                </Button>
              }
            />
            <div className="p-4 space-y-3">
              {aiAnomalies.slice(0, 3).map((item) => (
                <div key={item.id} className="p-3 rounded-xl border border-amber-200 dark:border-amber-900/60 bg-amber-50/50 dark:bg-amber-950/20 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 dark:text-slate-100">{item.metric}</span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-200 text-amber-900 dark:bg-amber-900 dark:text-amber-200">
                      Z-Score: 2.8σ
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300">
                    Current: <strong>{item.currentValue}</strong> (Baseline: {item.previousValue})
                  </p>
                  <p className="text-[11px] text-slate-500">
                    {item.details}
                  </p>
                  <div className="pt-1 flex items-center justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/validation/${item.id}`)}
                    >
                      Investigate
                    </Button>
                  </div>
                </div>
              ))}

              <Button
                variant="primary"
                fullWidth
                size="sm"
                onClick={() => navigate('/validation/anomalies')}
                icon={<Sparkles className="w-3.5 h-3.5" />}
                className="mt-2"
              >
                Open AI Anomaly Hub
              </Button>
            </div>
          </Card>

          {/* Quick Links */}
          <Card>
            <CardHeader title="ESG Team Workflows" />
            <div className="p-4 grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/sdg-mapping')}
                icon={<Globe2 className="w-3.5 h-3.5 text-blue-500" />}
              >
                SDG Mapping
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/analytics')}
                icon={<BarChart3 className="w-3.5 h-3.5 text-emerald-500" />}
              >
                ESG Analytics
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/reports')}
                icon={<FileSpreadsheet className="w-3.5 h-3.5 text-amber-500" />}
              >
                Reports
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/audit-trail')}
                icon={<CheckCircle2 className="w-3.5 h-3.5 text-purple-500" />}
              >
                Audit Trail
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
