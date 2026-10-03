import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, ArrowRight, Layers, FolderKanban, ShieldCheck } from 'lucide-react';
import { Card, CardHeader } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { ProgressBar } from '../components/common/ProgressBar';
import { useQuery } from '@tanstack/react-query';
import { organizationApi } from '../api';

export const Subsidiaries: React.FC = () => {
  const navigate = useNavigate();

  const { data: subsidiaries = [], isLoading } = useQuery({
    queryKey: ['subsidiaries'],
    queryFn: organizationApi.getSubsidiaries,
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 font-heading m-0">
            Enterprise Subsidiaries
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Browse all group subsidiaries, monitor operational divisions, and track BRSR completion.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/organization')}
          icon={<Building2 className="w-4 h-4" />}
        >
          View Full Org Tree
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {subsidiaries.map((sub) => (
          <Card key={sub.id} className="p-5 flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                  {sub.code}
                </span>
                <span className="text-xs font-semibold text-slate-500">{sub.headquarters?.split(',')[0]}</span>
              </div>
              <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 leading-snug">
                {sub.name}
              </h3>
              <p className="text-xs text-slate-500">
                Lead: <strong>{sub.managingDirector}</strong>
              </p>
              <div className="pt-2">
                <div className="flex justify-between text-xs mb-1">
                  <span>ESG Completion</span>
                  <span className="font-bold text-emerald-600">{sub.esgCompletion}%</span>
                </div>
                <ProgressBar progress={sub.esgCompletion} size="sm" />
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <span className="text-xs text-slate-500">
                {sub.projectsCount || 4} Projects
              </span>
              <Button
                variant="primary"
                size="sm"
                onClick={() => navigate(`/subsidiaries/${sub.id}`)}
                icon={<ArrowRight className="w-3.5 h-3.5" />}
              >
                Inspect Dossier
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Subsidiaries;
