import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Building2, 
  FolderKanban, 
  TrendingUp, 
  CheckCircle, 
  Clock, 
  ArrowLeft, 
  ArrowRight,
  ShieldCheck,
  FileCheck2
} from 'lucide-react';
import { Card, CardHeader } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { ProgressBar } from '../components/common/ProgressBar';
import { StatusBadge } from '../components/common/StatusBadge';
import { useQuery } from '@tanstack/react-query';
import { organizationApi } from '../api';

export const BusinessUnitDetail: React.FC = () => {
  const { id = 'bu-1' } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'overview' | 'projects' | 'esg' | 'reviews' | 'approvals'>('overview');

  const { data: buData, isLoading } = useQuery({
    queryKey: ['businessUnit', id],
    queryFn: () => organizationApi.getBusinessUnitById(id),
  });

  const bu = buData || {
    id,
    name: 'Renewables & Power Transmission',
    code: 'BU-RPT',
    headOfBU: 'Vikram Malhotra',
    subsidiaryName: 'Apex Heavy Engineering & Construction',
    esgCompletion: 92,
    projects: [
      { id: 'proj-1', name: 'Project Solar Apex (PRJ-001)', code: 'PRJ-001', location: 'Bhadla, Rajasthan', esgCompletion: 96, approvalStatus: 'submitted' },
      { id: 'proj-4', name: 'Ultra-High Voltage Green Corridor', code: 'PRJ-004', location: 'Fatehgarh, Rajasthan', esgCompletion: 88, approvalStatus: 'draft' }
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
              onClick={() => navigate('/business-units')}
              icon={<ArrowLeft className="w-4 h-4" />}
            >
              Business Units
            </Button>
            <span className="text-slate-300 dark:text-slate-700">/</span>
            <span className="text-xs font-mono font-bold text-slate-500">{bu.code}</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 font-heading m-0">
            {bu.name}
          </h1>
          <p className="text-xs text-slate-500">
            Head of BU: <strong>{bu.headOfBU}</strong> • Subsidiary: {bu.subsidiaryName}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/validation')}
            icon={<FileCheck2 className="w-4 h-4" />}
          >
            BU Validations
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate('/approvals')}
            icon={<CheckCircle className="w-4 h-4" />}
          >
            Review Submissions
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto border-b border-slate-200 dark:border-slate-800 pb-px text-xs font-semibold">
        {(['overview', 'projects', 'esg', 'reviews', 'approvals'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2.5 rounded-t-lg transition-colors border-b-2 capitalize ${
              activeTab === tab
                ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/20'
                : 'border-transparent text-slate-600 hover:text-slate-900 dark:text-slate-400'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Overview */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-5 space-y-3">
            <h3 className="font-bold text-sm flex items-center gap-2">
              <Building2 className="w-4 h-4 text-emerald-600" />
              BU Profile
            </h3>
            <p className="text-xs text-slate-500">
              Focuses on high-capacity solar parks, battery energy storage systems (BESS), and green transmission networks.
            </p>
            <div className="text-xs space-y-2 pt-2">
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span>Active Projects</span>
                <span className="font-bold">{bu.projects?.length || 2}</span>
              </div>
              <div className="flex justify-between py-1">
                <span>Reporting Cycle</span>
                <span className="font-bold text-emerald-600">FY 2025-26</span>
              </div>
            </div>
          </Card>

          <Card className="p-5 space-y-3">
            <h3 className="font-bold text-sm flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-teal-600" />
              ESG Progress
            </h3>
            <div className="space-y-3 pt-2">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span>BU ESG Score</span>
                  <span className="font-bold text-emerald-600">{bu.esgCompletion}%</span>
                </div>
                <ProgressBar progress={bu.esgCompletion} size="sm" />
              </div>
            </div>
          </Card>

          <Card className="p-5 space-y-3">
            <h3 className="font-bold text-sm flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-purple-600" />
              Quick Actions
            </h3>
            <div className="space-y-2 pt-1">
              <Button
                variant="outline"
                fullWidth
                size="sm"
                onClick={() => setActiveTab('projects')}
                icon={<FolderKanban className="w-3.5 h-3.5" />}
              >
                Inspect All Projects
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

      {/* Projects */}
      {activeTab === 'projects' && (
        <Card className="p-5 space-y-4">
          <CardHeader title="Projects under this Business Unit" />
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {bu.projects?.map((p: any) => (
              <div key={p.id} className="p-3.5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">{p.name}</h4>
                  <p className="text-[11px] text-slate-500">{p.code} • {p.location}</p>
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

      {/* ESG Status */}
      {activeTab === 'esg' && (
        <Card className="p-5 space-y-4">
          <CardHeader title="BU ESG Aggregate Metrics" subtitle="Computed directly from project records" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 space-y-1">
              <span className="font-bold">Total Power Generated / Consumed</span>
              <p className="text-base font-bold font-mono text-emerald-600">84,200 GJ</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 space-y-1">
              <span className="font-bold">Total Workforce Monitored</span>
              <p className="text-base font-bold font-mono text-blue-600">2,100 personnel</p>
            </div>
          </div>
        </Card>
      )}

      {/* Reviews */}
      {activeTab === 'reviews' && (
        <Card className="p-5 space-y-4">
          <CardHeader title="Review Queue for BU Manager" />
          <p className="text-xs text-slate-500">
            Compare data submitted by Project Users against historical standards before passing to Subsidiary Admin.
          </p>
          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate('/approvals')}
          >
            Open Approvals Queue
          </Button>
        </Card>
      )}

      {/* Approvals */}
      {activeTab === 'approvals' && (
        <Card className="p-5 space-y-4">
          <CardHeader title="Unit Signoffs" />
          <p className="text-xs text-slate-500">
            BU Manager Vikram Malhotra has approved 4 out of 5 unit project submissions for FY 2025-26.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/approvals')}
          >
            Review Pipeline
          </Button>
        </Card>
      )}
    </div>
  );
};

export default BusinessUnitDetail;
