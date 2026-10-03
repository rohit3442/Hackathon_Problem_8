import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FolderKanban, 
  FileEdit, 
  Clock, 
  AlertCircle, 
  CheckCircle2, 
  Upload, 
  ArrowRight,
  TrendingUp,
  Sparkles,
  FileCheck2,
  Building2,
  Zap,
  Droplet,
  Flame,
  ShieldCheck,
  Send,
  Calendar,
  Layers
} from 'lucide-react';
import { StatCard } from '../common/StatCard';
import { Card, CardHeader } from '../common/Card';
import { Button } from '../common/Button';
import { ProgressBar } from '../common/ProgressBar';
import { StatusBadge } from '../common/StatusBadge';
import { useQuery } from '@tanstack/react-query';
import { projectsApi, approvalsApi, validationApi } from '../../api';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';

export const ProjectUserDashboard: React.FC = () => {
  const navigate = useNavigate();

  const { data: projects = [], isLoading: loadingProjects } = useQuery({
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

  // Assigned facilities for Project User
  const myProjects = projects.slice(0, 3);
  const avgCompletion = myProjects.length > 0 
    ? Math.round(myProjects.reduce((acc, p) => acc + (p.esgCompletion || 0), 0) / myProjects.length)
    : 0;

  const draftsCount = myProjects.filter(p => p.approvalStatus === 'draft').length;
  const pendingSubmissions = myProjects.filter(p => p.approvalStatus === 'submitted' || p.approvalStatus === 'under_review').length;
  const correctionRequests = validations.filter(v => v.severity === 'high' && v.status === 'open').length;

  // Monthly telemetry data for project site (PRJ-001 / SMP-500)
  const telemetryMonthly = [
    { month: 'Oct 25', gridKwh: 78000, solarKwh: 34000, fuelLitres: 21000, scope1: 56, scope2: 41 },
    { month: 'Nov 25', gridKwh: 82000, solarKwh: 37000, fuelLitres: 22500, scope1: 60, scope2: 42 },
    { month: 'Dec 25', gridKwh: 84000, solarKwh: 39000, fuelLitres: 23000, scope1: 61, scope2: 43 },
    { month: 'Jan 26', gridKwh: 89000, solarKwh: 41000, fuelLitres: 24200, scope1: 64, scope2: 44 },
    { month: 'Feb 26', gridKwh: 92000, solarKwh: 43500, fuelLitres: 24800, scope1: 66, scope2: 44 },
    { month: 'Mar 26', gridKwh: 100000, solarKwh: 45000, fuelLitres: 25000, scope1: 67, scope2: 45 },
  ];

  // Pillar disclosure completion breakdown
  const pillarStatus = [
    { pillar: 'Environmental', completion: 95, target: 100, status: 'Verified' },
    { pillar: 'Social & Workforce', completion: 88, target: 100, status: 'In Review' },
    { pillar: 'Governance & Safety', completion: 92, target: 100, status: 'Audited' },
    { pillar: 'SEBI BRSR P6-E1', completion: 90, target: 100, status: 'Live Linked' },
  ];

  return (
    <div className="space-y-6">
      {/* Top Welcome Banner */}
      <div className="bg-gradient-to-r from-emerald-800 via-teal-900 to-[#072418] rounded-2xl p-6 text-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 border border-emerald-700/40">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-700/70 text-emerald-100 border border-emerald-500/40 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
            Project Contributor Portal
          </div>
          <h2 className="text-xl md:text-2xl font-bold font-heading">
            Welcome back, Rajesh Verma
          </h2>
          <p className="text-xs md:text-sm text-emerald-100/90 mt-1 max-w-xl">
            Assigned Facility: <strong className="text-white">Solar Mega-Park 500MW (SMP-500)</strong> • Reporting Period: <strong className="text-emerald-300">FY 2025-26</strong>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="primary"
            onClick={() => navigate('/projects/proj-1/esg/environmental')}
            icon={<FileEdit className="w-4 h-4" />}
            className="bg-white text-emerald-900 hover:bg-emerald-50 border-0 shadow-sm font-semibold"
          >
            Enter Project ESG Data
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Assigned Projects"
          value={myProjects.length.toString()}
          subtitle="Operational facilities"
          icon={<FolderKanban className="w-5 h-5" />}
        />
        <StatCard
          title="ESG Data Completion"
          value={`${avgCompletion}%`}
          subtitle="Across assigned sites"
          icon={<TrendingUp className="w-5 h-5 text-emerald-600" />}
          change={avgCompletion > 80 ? '+12% vs last month' : 'Pending submissions'}
          trend={avgCompletion > 80 ? 'up' : 'neutral'}
        />
        <StatCard
          title="Draft Submissions"
          value={draftsCount.toString()}
          subtitle="Awaiting final check & submit"
          icon={<Clock className="w-5 h-5 text-amber-600" />}
        />
        <StatCard
          title="Correction Requests"
          value={correctionRequests.toString()}
          subtitle="Actions required by BU Manager"
          icon={<AlertCircle className="w-5 h-5 text-rose-600" />}
          trend={correctionRequests > 0 ? 'down' : 'up'}
        />
      </div>

      {/* ==================================================================== */}
      {/* CHARTS SECTION (Replaces former Multi-Page Tour Banner) */}
      {/* ==================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Monthly Energy & Telemetry Trajectory */}
        <Card className="p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Zap className="w-4 h-4 text-emerald-500" />
                Monthly Energy Telemetry (kWh)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Grid Electricity vs. Captive Solar Generation (FY 2025-26)
              </p>
            </div>
            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-mono">
              Live DB Telemetry
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={telemetryMonthly} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="gridKwhGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0}/>
                  </linearGradient>
                  <linearGradient id="solarKwhGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={(val) => `${val / 1000}k`} />
                <Tooltip 
                  formatter={(value: any, name: any) => [
                    `${Number(value).toLocaleString()} kWh`,
                    name === 'gridKwh' ? 'Grid Electricity' : 'Captive Solar Generation'
                  ]}
                  contentStyle={{ backgroundColor: '#0f1714', borderColor: '#1e332a', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                />
                <Legend 
                  wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }}
                  formatter={(value) => value === 'gridKwh' ? 'Grid Electricity' : 'Captive Solar'}
                />
                <Area type="monotone" dataKey="gridKwh" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#gridKwhGrad)" />
                <Area type="monotone" dataKey="solarKwh" stroke="#06b6d4" strokeWidth={2} fillOpacity={1} fill="url(#solarKwhGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Chart 2: Calculated GHG Footprint Trajectory */}
        <Card className="p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Flame className="w-4 h-4 text-amber-500" />
                GHG Emissions Footprint (tCO₂e)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Scope 1 (Direct Fuel) vs. Scope 2 (Grid Power)
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-slate-500 dark:text-slate-400">
              GHG Protocol
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={telemetryMonthly} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip 
                  formatter={(value: any, name: any) => [
                    `${value} tCO₂e`,
                    name === 'scope1' ? 'Scope 1 (Diesel Fuel)' : 'Scope 2 (Electricity)'
                  ]}
                  contentStyle={{ backgroundColor: '#0f1714', borderColor: '#1e332a', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                />
                <Legend 
                  wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }}
                  formatter={(value) => value === 'scope1' ? 'Scope 1 (Fuel)' : 'Scope 2 (Electricity)'}
                />
                <Bar dataKey="scope1" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                <Bar dataKey="scope2" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* ==================================================================== */}
      {/* PROJECT STATUS SECTION (Facility Dossiers & Pipeline Health) */}
      {/* ==================================================================== */}
      <Card className="p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-500" />
              Project Status & Operational Disclosure Pipeline
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Active facilities assigned to your identity with live telemetry, verification status, and submission stages
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/projects')}
            icon={<ArrowRight className="w-3.5 h-3.5" />}
          >
            All Projects Portfolio
          </Button>
        </div>

        {/* Project Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {myProjects.map((p) => {
            const isSelected = p.id === 'proj-1';
            return (
              <div
                key={p.id}
                className={`p-4 rounded-xl border transition-all ${
                  isSelected
                    ? 'border-emerald-500/60 bg-emerald-50/20 dark:bg-emerald-950/20 shadow-xs'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c1411]'
                }`}
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                      {p.code}
                    </span>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100 mt-1 line-clamp-1">
                      {p.name}
                    </h4>
                  </div>
                  <StatusBadge status={p.approvalStatus as any} />
                </div>

                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mb-3">
                  {p.businessUnitName} • {p.location}
                </p>

                {/* Progress Metric */}
                <div className="space-y-1.5 mb-4">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 dark:text-slate-400">ESG Completion</span>
                    <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">{p.esgCompletion}%</span>
                  </div>
                  <ProgressBar progress={p.esgCompletion} showPercentage={false} size="sm" />
                </div>

                {/* Status Badges */}
                <div className="grid grid-cols-2 gap-2 text-[11px] pt-2 border-t border-slate-100 dark:border-slate-800/80 mb-3">
                  <div>
                    <span className="text-slate-400 block text-[10px]">BRSR Alignment</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {p.brsrCompletion || 90}% (P1-P9)
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Validation</span>
                    <span className={`font-semibold ${p.validationStatus === 'clean' ? 'text-emerald-500' : 'text-amber-500'}`}>
                      {p.validationStatus === 'clean' ? 'Audit Passed' : '1 Warning'}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-2">
                  <Button
                    variant="primary"
                    size="sm"
                    className="flex-1 text-xs"
                    onClick={() => navigate(`/projects/${p.id}/esg/environmental`)}
                    icon={<FileEdit className="w-3.5 h-3.5" />}
                  >
                    Enter Telemetry
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs"
                    onClick={() => navigate(`/projects/${p.id}/overview`)}
                  >
                    Dossier
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Pillar Disclosure Verification Checklist */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {pillarStatus.map((pillar, idx) => (
          <Card key={idx} className="p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                {pillar.pillar}
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-semibold">
                {pillar.status}
              </span>
            </div>
            <div className="flex items-baseline justify-between text-xs">
              <span className="text-slate-500 dark:text-slate-400">Readiness</span>
              <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">{pillar.completion}%</span>
            </div>
            <ProgressBar progress={pillar.completion} showPercentage={false} size="sm" />
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ProjectUserDashboard;
