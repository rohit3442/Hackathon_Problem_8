import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Layers, ArrowRight, FolderKanban, Building2 } from 'lucide-react';
import { Card, CardHeader } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { ProgressBar } from '../components/common/ProgressBar';
import { useQuery } from '@tanstack/react-query';
import { organizationApi } from '../api';

export const BusinessUnits: React.FC = () => {
  const navigate = useNavigate();

  const { data: businessUnits = [], isLoading } = useQuery({
    queryKey: ['businessUnits'],
    queryFn: organizationApi.getBusinessUnits,
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 font-heading m-0">
            Business Units
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Browse all divisional business units, review project rosters, and track unit ESG progress.
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
        {(Array.isArray(businessUnits) ? businessUnits : []).map((bu) => (
          <Card key={bu.id} className="p-5 flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300">
                  {bu.code}
                </span>
                <span className="text-xs text-slate-500">{bu.subsidiaryName || 'Apex Heavy Eng.'}</span>
              </div>
              <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 leading-snug">
                {bu.name}
              </h3>
              <p className="text-xs text-slate-500">
                BU Head: <strong>{bu.headOfBU || 'Vikram Malhotra'}</strong>
              </p>
              <div className="pt-2">
                <div className="flex justify-between text-xs mb-1">
                  <span>ESG Completion</span>
                  <span className="font-bold text-teal-600">{bu.esgCompletion || 88}%</span>
                </div>
                <ProgressBar progress={bu.esgCompletion || 88} size="sm" />
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <span className="text-xs text-slate-500">
                {bu.projectsCount || 3} Projects
              </span>
              <Button
                variant="primary"
                size="sm"
                onClick={() => navigate(`/business-units/${bu.id}`)}
                icon={<ArrowRight className="w-3.5 h-3.5" />}
              >
                Inspect BU
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default BusinessUnits;
