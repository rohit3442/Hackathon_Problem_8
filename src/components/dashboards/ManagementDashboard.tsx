import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { 
  ShieldCheck, 
  Leaf, 
  Users, 
  Scale, 
  Download, 
  FileSpreadsheet, 
  CheckCircle2, 
  TrendingDown, 
  ArrowRight,
  TrendingUp,
  Award
} from 'lucide-react';
import { StatCard } from '../common/StatCard';
import { Card, CardHeader } from '../common/Card';
import { Button } from '../common/Button';
import { ProgressBar } from '../common/ProgressBar';
import { useQuery } from '@tanstack/react-query';
import { dashboardApi, reportsApi, projectsApi } from '../../api';
import { exportBrsrReportPDF } from '../../utils/pdfExport';
import { useApp } from '../../context/AppContext';

export const ManagementDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { addToast } = useApp();

  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: dashboardApi.getDashboardData,
  });

  const { data: reports = [] } = useQuery({
    queryKey: ['reports'],
    queryFn: reportsApi.getReports,
  });

  const emissionsTrend = dashboardData?.emissionsTrend || [
    { year: 'FY 2022-23', scope1: 18200, scope2: 38500, scope3: 78000 },
    { year: 'FY 2023-24', scope1: 17400, scope2: 35800, scope3: 74500 },
    { year: 'FY 2024-25', scope1: 16200, scope2: 33100, scope3: 71500 },
    { year: 'FY 2025-26', scope1: 27150, scope2: 50700, scope3: 123700 },
  ];

  const energyMixData = [
    { name: 'Captive Solar & Wind', value: 44.8, color: '#10b981' },
    { name: 'Green Tariff Grid', value: 18.2, color: '#14b8a6' },
    { name: 'Conventional Grid', value: 28.5, color: '#64748b' },
    { name: 'Clean Backup Fuels', value: 8.5, color: '#f59e0b' },
  ];

  return (
    <div className="space-y-6">
      {/* Executive Briefing Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 rounded-2xl p-6 text-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-800/80 text-emerald-200 border border-emerald-600/40 mb-2">
            <Award className="w-3.5 h-3.5 text-emerald-300" />
            Executive Leadership & Board Briefing
          </div>
          <h2 className="text-xl md:text-2xl font-bold font-heading">
            Executive ESG & BRSR Performance Summary
          </h2>
          <p className="text-xs md:text-sm text-slate-300 mt-1 max-w-xl">
            Logged in as <strong>Deepak Khaitan (Board Member & Final Approver)</strong>. High-level verified performance indicators for SEBI BRSR Core, Net-Zero Decarbonization Trajectory, and Corporate Governance.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="primary"
            onClick={() => {
              try {
                exportBrsrReportPDF({
                  reportTitle: 'Executive Board Pack — Consolidated ESG & BRSR Disclosures',
                  reportingYear: 'FY 2025-26',
                  organization: 'Apex Infrastructure Group Limited',
                  status: 'Final Approved & Board Signed',
                  dashboard: dashboardData
                });
                addToast('Board Pack Download Complete', 'Executive ESG board pack PDF downloaded', 'success');
              } catch (e: any) {
                addToast('Download Error', e.message || 'Failed to download board pack', 'error');
              }
            }}
            icon={<Download className="w-4 h-4" />}
            className="bg-emerald-500 hover:bg-emerald-600 text-white border-0 shadow-sm"
          >
            Download Board Pack (PDF)
          </Button>
        </div>
      </div>

      {/* Top Level Board KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Overall ESG Index"
          value={`${dashboardData?.esgCompletion ?? 87}%`}
          subtitle="All reporting boundaries consolidated"
          icon={<ShieldCheck className="w-5 h-5 text-emerald-600" />}
          change="+8.4% vs FY24"
          trend="up"
        />
        <StatCard
          title="SEBI BRSR Core Readiness"
          value={`${dashboardData?.brsrCompletion ?? 90}%`}
          subtitle="Mandatory 9 principles verified"
          icon={<FileSpreadsheet className="w-5 h-5 text-teal-600" />}
          change="Audit Ready"
          trend="up"
        />
        <StatCard
          title="Renewable Energy Share"
          value={`${dashboardData?.metricsSummary?.avgRenewableEnergyPct ?? 44.8}%`}
          subtitle="Target: 50% by FY26"
          icon={<Leaf className="w-5 h-5 text-emerald-600" />}
          change="On track"
          trend="up"
        />
        <StatCard
          title="Safety Lost-Time Incident Rate"
          value="0.12"
          subtitle="Zero workplace fatalities"
          icon={<Users className="w-5 h-5 text-blue-600" />}
          change="-25% YoY"
          trend="up"
        />
      </div>

      {/* Charts: Emissions Trajectory & Energy Transition */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader
            title="Consolidated GHG Emissions Trajectory (tCO₂e)"
            subtitle="Multi-year Scope 1, Scope 2, and Scope 3 performance from persistent database records"
            action={
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/analytics')}
                icon={<ArrowRight className="w-3.5 h-3.5" />}
              >
                Deep Analytics
              </Button>
            }
          />
          <div className="p-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={emissionsTrend} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="execScope1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="execScope2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0284c7" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#0284c7" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="year" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff', fontSize: '11px' }} 
                />
                <Area type="monotone" dataKey="scope1" name="Scope 1 (Direct)" stroke="#10b981" fill="url(#execScope1)" strokeWidth={2} />
                <Area type="monotone" dataKey="scope2" name="Scope 2 (Electricity)" stroke="#0284c7" fill="url(#execScope2)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Energy Mix */}
        <Card>
          <CardHeader
            title="Clean Energy Transition Mix"
            subtitle="Consolidated power portfolio breakdown"
          />
          <div className="p-4 flex flex-col items-center">
            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={energyMixData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {energyMixData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: any) => `${value}%`} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="w-full space-y-1.5 mt-2">
              {energyMixData.map((item) => (
                <div key={item.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-slate-600 dark:text-slate-400">{item.name}</span>
                  </div>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{item.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* Governance & Social Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-5 space-y-3">
          <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
            <Leaf className="w-5 h-5" />
            <h3 className="font-bold text-sm">Environmental Pillar</h3>
          </div>
          <p className="text-xs text-slate-500">
            Total Energy Consumption: <strong>241,800 GJ</strong>. Water recycle rate improved to <strong>34.2%</strong>. Zero hazardous waste non-compliance across all operating facilities.
          </p>
          <ProgressBar progress={92} showPercentage label="Environmental Compliance" size="sm" />
        </Card>

        <Card className="p-5 space-y-3">
          <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
            <Users className="w-5 h-5" />
            <h3 className="font-bold text-sm">Social Pillar</h3>
          </div>
          <p className="text-xs text-slate-500">
            Workforce: <strong>1,420 permanent</strong>, <strong>4,200 contract</strong>. Female representation: <strong>24.2%</strong>. Total CSR expenditure: <strong>₹18.5 Cr</strong> focused on healthcare and education.
          </p>
          <ProgressBar progress={88} showPercentage label="Social Disclosures" size="sm" />
        </Card>

        <Card className="p-5 space-y-3">
          <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400">
            <Scale className="w-5 h-5" />
            <h3 className="font-bold text-sm">Governance Pillar</h3>
          </div>
          <p className="text-xs text-slate-500">
            Anti-Corruption Policy Coverage: <strong>100%</strong>. Whistleblower complaints: 3 received, 3 resolved by Audit Committee. Zero regulatory penalties from SEBI or MCA.
          </p>
          <ProgressBar progress={96} showPercentage label="Governance Integrity" size="sm" />
        </Card>
      </div>

      {/* Approved Reports Ready for Board */}
      <Card>
        <CardHeader
          title="Approved Regulatory Filings & Annual Reports"
          subtitle="Signed off by Chief Sustainability Officer and Audit Committee"
          action={
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/reports')}
              icon={<ArrowRight className="w-3.5 h-3.5" />}
            >
              All Reports
            </Button>
          }
        />
        <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          {reports.slice(0, 2).map((r) => (
            <div key={r.id} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex items-center justify-between gap-4">
              <div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  {r.status}
                </span>
                <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 mt-1">{r.title}</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">Format: {r.format} • Size: {r.fileSize} • {r.generatedAt}</p>
              </div>
              <Button
                variant="primary"
                size="sm"
                onClick={() => navigate(`/reports/${r.id}`)}
                icon={<Download className="w-3.5 h-3.5" />}
              >
                Inspect
              </Button>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
