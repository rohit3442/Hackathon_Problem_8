import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Building2, 
  Layers, 
  FolderKanban, 
  TrendingUp, 
  FileSpreadsheet, 
  Download, 
  ArrowLeft, 
  ShieldCheck, 
  ArrowRight,
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import { Card, CardHeader } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { ProgressBar } from '../components/common/ProgressBar';
import { StatusBadge } from '../components/common/StatusBadge';
import { useQuery } from '@tanstack/react-query';
import { organizationApi } from '../api';

export const SubsidiaryDetail: React.FC = () => {
  const { id = 'sub-1' } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'overview' | 'bus' | 'projects' | 'esg' | 'brsr' | 'reports'>('overview');

  const { data: subData, isLoading } = useQuery({
    queryKey: ['subsidiary', id],
    queryFn: () => organizationApi.getSubsidiaryById(id),
  });

  const sub = subData || {
    id,
    name: 'Apex Heavy Engineering & Construction',
    code: 'AHEC',
    managingDirector: 'Sunita Rao',
    headquarters: 'Vadodara, Gujarat',
    esgCompletion: 89,
    businessUnits: [
      { id: 'bu-1', name: 'Renewables & Power Transmission', code: 'BU-RPT', projectsCount: 4, esgCompletion: 92 },
      { id: 'bu-2', name: 'Civil Infrastructure & Metro Rail', code: 'BU-CIM', projectsCount: 3, esgCompletion: 84 },
    ],
    projects: [
      { id: 'proj-1', name: 'Project Solar Apex', code: 'PRJ-001', location: 'Bhadla, Rajasthan', esgCompletion: 96, approvalStatus: 'submitted' },
      { id: 'proj-2', name: 'Western Dedicated Freight Corridor', code: 'PRJ-002', location: 'Surat, Gujarat', esgCompletion: 82, approvalStatus: 'draft' },
    ]
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/subsidiaries')}
              icon={<ArrowLeft className="w-4 h-4" />}
            >
              Subsidiaries
            </Button>
            <span className="text-slate-300 dark:text-slate-700">/</span>
            <span className="text-xs font-mono font-bold text-slate-500">{sub.code}</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 font-heading m-0">
            {sub.name}
          </h1>
          <p className="text-xs text-slate-500">
            Managing Director: <strong>{sub.managingDirector}</strong> • Headquarters: {sub.headquarters} • Group Entity
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/consolidation')}
            icon={<Layers className="w-4 h-4" />}
          >
            Consolidation Rollup
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate('/reports')}
            icon={<Download className="w-4 h-4" />}
          >
            Export Subsidiary Dossier
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto border-b border-slate-200 dark:border-slate-800 pb-px text-xs font-semibold">
        {(['overview', 'bus', 'projects', 'esg', 'brsr', 'reports'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2.5 rounded-t-lg transition-colors border-b-2 capitalize ${
              activeTab === tab
                ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/20'
                : 'border-transparent text-slate-600 hover:text-slate-900 dark:text-slate-400'
            }`}
          >
            {tab === 'bus' ? 'Business Units' : tab}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-5 space-y-3">
            <h3 className="font-bold text-sm flex items-center gap-2">
              <Building2 className="w-4 h-4 text-emerald-600" />
              Subsidiary Overview
            </h3>
            <p className="text-xs text-slate-500">
              Core manufacturing and EPC engineering subsidiary delivering transmission lines, solar farms, and regional metro lines.
            </p>
            <div className="pt-2 text-xs space-y-2">
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span>Active Business Units</span>
                <span className="font-bold">{sub.businessUnits?.length || 2}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span>Total Monitored Projects</span>
                <span className="font-bold">{sub.projects?.length || 4}</span>
              </div>
              <div className="flex justify-between py-1">
                <span>Reporting Scope</span>
                <span className="text-emerald-600 font-bold">100% Boundary</span>
              </div>
            </div>
          </Card>

          <Card className="p-5 space-y-3">
            <h3 className="font-bold text-sm flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-teal-600" />
              ESG & BRSR Progress
            </h3>
            <div className="space-y-3 pt-2">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span>ESG Disclosures</span>
                  <span className="font-bold text-emerald-600">{sub.esgCompletion}%</span>
                </div>
                <ProgressBar progress={sub.esgCompletion} size="sm" />
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span>BRSR Principle Core</span>
                  <span className="font-bold text-teal-600">86%</span>
                </div>
                <ProgressBar progress={86} size="sm" />
              </div>
            </div>
          </Card>

          <Card className="p-5 space-y-3">
            <h3 className="font-bold text-sm flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-purple-600" />
              Actions & Navigation
            </h3>
            <div className="space-y-2 pt-1">
              <Button
                variant="outline"
                fullWidth
                size="sm"
                onClick={() => setActiveTab('bus')}
                icon={<Layers className="w-3.5 h-3.5" />}
              >
                Inspect Business Units
              </Button>
              <Button
                variant="outline"
                fullWidth
                size="sm"
                onClick={() => setActiveTab('projects')}
                icon={<FolderKanban className="w-3.5 h-3.5" />}
              >
                Inspect Projects
              </Button>
              <Button
                variant="primary"
                fullWidth
                size="sm"
                onClick={() => navigate('/approvals')}
              >
                Review Submissions
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Business Units Tab */}
      {activeTab === 'bus' && (
        <Card className="p-5 space-y-4">
          <CardHeader
            title="Business Units in this Subsidiary"
            subtitle="Click any business unit to drill down to its specific project roster"
          />
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {sub.businessUnits?.map((bu: any) => (
              <div key={bu.id} className="p-3.5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">{bu.name}</h4>
                  <p className="text-[11px] text-slate-500 font-mono mt-0.5">{bu.code} • {bu.projectsCount} Projects</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-24">
                    <ProgressBar progress={bu.esgCompletion || 88} size="sm" />
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/business-units/${bu.id}`)}
                    icon={<ArrowRight className="w-3.5 h-3.5" />}
                  >
                    Open BU
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Projects Tab */}
      {activeTab === 'projects' && (
        <Card className="p-5 space-y-4">
          <CardHeader
            title="Projects under this Subsidiary"
            subtitle="Click any project to inspect overview, enter ESG metrics, or view audit trails"
          />
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {sub.projects?.map((p: any) => (
              <div key={p.id} className="p-3.5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">{p.name}</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">{p.code} • {p.location}</p>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge status={p.approvalStatus as any} />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/projects/${p.id}/overview`)}
                    icon={<ArrowRight className="w-3.5 h-3.5" />}
                  >
                    View Project
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* ESG Status Tab */}
      {activeTab === 'esg' && (
        <Card className="p-5 space-y-4">
          <CardHeader title="Subsidiary ESG Disclosures Status" subtitle="Calculated from project databases" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 space-y-1">
              <span className="font-bold text-slate-800 dark:text-slate-200">Total Energy Consumption</span>
              <p className="text-lg font-mono font-bold text-emerald-600">142,500 GJ</p>
              <p className="text-[11px] text-slate-400">45.2% Renewable mix</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 space-y-1">
              <span className="font-bold text-slate-800 dark:text-slate-200">GHG Scope 1 & 2 Emissions</span>
              <p className="text-lg font-mono font-bold text-blue-600">48,200 tCO₂e</p>
              <p className="text-[11px] text-slate-400">-6.4% YoY reduction</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 space-y-1">
              <span className="font-bold text-slate-800 dark:text-slate-200">Safety LTIFR</span>
              <p className="text-lg font-mono font-bold text-emerald-600">0.08</p>
              <p className="text-[11px] text-slate-400">Zero fatalities</p>
            </div>
          </div>
        </Card>
      )}

      {/* BRSR Status Tab */}
      {activeTab === 'brsr' && (
        <Card className="p-5 space-y-4">
          <CardHeader title="BRSR Readiness by Principle" subtitle="Essential and leadership indicators" />
          <div className="space-y-2 text-xs">
            <p className="text-slate-600 dark:text-slate-400">
              All 9 SEBI Principles are active. Principles 1 (Ethics), 3 (Employee Wellbeing), and 6 (Environment) are 90%+ populated from facility data.
            </p>
            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate('/brsr')}
            >
              Open BRSR Workspace
            </Button>
          </div>
        </Card>
      )}

      {/* Reports Tab */}
      {activeTab === 'reports' && (
        <Card className="p-5 space-y-4">
          <CardHeader title="Subsidiary Reports" subtitle="Pre-built regulatory and executive summaries" />
          <div className="space-y-2">
            <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
              <div>
                <p className="font-semibold text-slate-900 dark:text-slate-100">AHEC Annual BRSR Annexure FY 2025-26</p>
                <p className="text-[11px] text-slate-500">PDF • 3.8 MB • Ready</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/reports')}
                icon={<Download className="w-3.5 h-3.5" />}
              >
                Download
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default SubsidiaryDetail;
