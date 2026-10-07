import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Layers, Building2, ArrowRight, FileText } from 'lucide-react';
import { Card, CardHeader } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { ProgressBar } from '../components/common/ProgressBar';
import { organizationApi } from '../api';

interface SubsidiaryRollup {
  subsidiaryId: string;
  name: string;
  code: string;
  projectsCount: number;
  esgCompletion: number;
  scope1Ghg: number;
  scope2Ghg: number;
  totalEnergyGj: number;
  waterWithdrawalKl: number;
  consolidationStatus: string;
}

interface ConsolidationData {
  reportingPeriod: string;
  organizationName: string;
  subsidiaryRollups: SubsidiaryRollup[];
  eliminationAdjustments: string;
  consolidationReadinessPct: number;
}

const fmt = (n: number) => Math.round(n || 0).toLocaleString();

export const Consolidation: React.FC = () => {
  const navigate = useNavigate();

  const { data, isLoading } = useQuery<ConsolidationData>({
    queryKey: ['consolidation'],
    queryFn: organizationApi.getConsolidation,
  });

  const rollups = data?.subsidiaryRollups ?? [];
  const totals = rollups.reduce(
    (acc, r) => ({
      scope1: acc.scope1 + (r.scope1Ghg || 0),
      scope2: acc.scope2 + (r.scope2Ghg || 0),
      energy: acc.energy + (r.totalEnergyGj || 0),
      water: acc.water + (r.waterWithdrawalKl || 0),
      projects: acc.projects + (r.projectsCount || 0),
    }),
    { scope1: 0, scope2: 0, energy: 0, water: 0, projects: 0 }
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 font-heading m-0">
            Enterprise Consolidation Rollup
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {data?.organizationName || 'Group'} • Reporting Period: <strong>{data?.reportingPeriod || '—'}</strong>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => navigate('/subsidiaries')} icon={<Building2 className="w-4 h-4" />}>
            Subsidiaries
          </Button>
          <Button variant="primary" size="sm" onClick={() => navigate('/reports')} icon={<FileText className="w-4 h-4" />}>
            Generate Reports
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { label: 'Readiness', value: `${data?.consolidationReadinessPct ?? 0}%` },
          { label: 'Scope 1 (tCO2e)', value: fmt(totals.scope1) },
          { label: 'Scope 2 (tCO2e)', value: fmt(totals.scope2) },
          { label: 'Energy (GJ)', value: fmt(totals.energy) },
          { label: 'Water (kL)', value: fmt(totals.water) },
        ].map((kpi) => (
          <Card key={kpi.label} className="p-4">
            <p className="text-[11px] uppercase tracking-wider font-semibold text-slate-500">{kpi.label}</p>
            <p className="text-xl font-bold text-slate-900 dark:text-slate-100 mt-1">{kpi.value}</p>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader
          title="Subsidiary Rollups"
          subtitle={data?.eliminationAdjustments}
          action={<Layers className="w-5 h-5 text-emerald-600" />}
        />
        {isLoading ? (
          <p className="text-xs text-slate-500">Loading consolidation data…</p>
        ) : rollups.length === 0 ? (
          <p className="text-xs text-slate-500">No subsidiary data available.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-left text-slate-500 border-b border-slate-100 dark:border-slate-800">
                  <th className="py-2 pr-3">Subsidiary</th>
                  <th className="py-2 pr-3">Projects</th>
                  <th className="py-2 pr-3 w-40">ESG Completion</th>
                  <th className="py-2 pr-3 text-right">Scope 1</th>
                  <th className="py-2 pr-3 text-right">Scope 2</th>
                  <th className="py-2 pr-3 text-right">Energy (GJ)</th>
                  <th className="py-2 pr-3 text-right">Water (kL)</th>
                  <th className="py-2" />
                </tr>
              </thead>
              <tbody>
                {rollups.map((r) => (
                  <tr key={r.subsidiaryId} className="border-b border-slate-50 dark:border-slate-800/60">
                    <td className="py-2.5 pr-3">
                      <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400 mr-2">{r.code}</span>
                      <span className="font-semibold text-slate-900 dark:text-slate-100">{r.name}</span>
                    </td>
                    <td className="py-2.5 pr-3">{r.projectsCount}</td>
                    <td className="py-2.5 pr-3">
                      <div className="flex items-center gap-2">
                        <ProgressBar progress={r.esgCompletion || 0} size="sm" />
                        <span className="font-bold">{r.esgCompletion || 0}%</span>
                      </div>
                    </td>
                    <td className="py-2.5 pr-3 text-right">{fmt(r.scope1Ghg)}</td>
                    <td className="py-2.5 pr-3 text-right">{fmt(r.scope2Ghg)}</td>
                    <td className="py-2.5 pr-3 text-right">{fmt(r.totalEnergyGj)}</td>
                    <td className="py-2.5 pr-3 text-right">{fmt(r.waterWithdrawalKl)}</td>
                    <td className="py-2.5 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(`/subsidiaries/${r.subsidiaryId}`)}
                        icon={<ArrowRight className="w-3.5 h-3.5" />}
                      >
                        Inspect
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};
