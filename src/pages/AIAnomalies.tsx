import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, ArrowLeft, ArrowRight, ShieldAlert, CheckCircle2, AlertTriangle, RefreshCw } from 'lucide-react';
import { Card, CardHeader } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { useQuery } from '@tanstack/react-query';
import { validationApi } from '../api';

export const AIAnomalies: React.FC = () => {
  const navigate = useNavigate();

  const { data: anomalies = [], isLoading, refetch } = useQuery({
    queryKey: ['anomalies'],
    queryFn: validationApi.getAnomalies,
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/validation')}
              icon={<ArrowLeft className="w-4 h-4" />}
            >
              Validation Center
            </Button>
            <span className="text-slate-300 dark:text-slate-700">/</span>
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600">
              <Sparkles className="w-3.5 h-3.5" />
              Machine Learning Outlier Watchlist
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 font-heading m-0">
            AI Anomaly Detection Center
          </h1>
          <p className="text-xs text-slate-500">
            Statistical anomaly detection & variance alerts evaluated against historical multi-year facility time series.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          icon={<RefreshCw className="w-3.5 h-3.5" />}
        >
          Rescan Baselines
        </Button>
      </div>

      {/* Anomaly Table */}
      <Card>
        <CardHeader
          title="Flagged Operational Outliers"
          subtitle="All statistical anomalies requiring sustainability engineer verification"
        />
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="p-3 font-semibold">Metric</th>
                <th className="p-3 font-semibold">Entity / Project</th>
                <th className="p-3 font-semibold">Reported Value</th>
                <th className="p-3 font-semibold">Expected Baseline</th>
                <th className="p-3 font-semibold">Severity</th>
                <th className="p-3 font-semibold">ML Explanation</th>
                <th className="p-3 font-semibold">Review Status</th>
                <th className="p-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {(Array.isArray(anomalies) ? anomalies : []).map((item) => (
                <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="p-3 font-bold text-slate-900 dark:text-slate-100">
                    {item.metric}
                  </td>
                  <td className="p-3 text-slate-600 dark:text-slate-300">
                    <div>{item.project}</div>
                    <div className="text-[10px] text-slate-400">{item.businessUnit}</div>
                  </td>
                  <td className="p-3 font-mono font-bold text-slate-900 dark:text-slate-100">
                    {item.currentValue}
                  </td>
                  <td className="p-3 font-mono text-slate-500">
                    {item.previousValue}
                  </td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      item.severity === 'high' ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300' :
                      item.severity === 'medium' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {item.severity}
                    </span>
                  </td>
                  <td className="p-3 max-w-xs text-slate-600 dark:text-slate-300 truncate" title={item.details}>
                    {item.details}
                  </td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                      item.status === 'resolved' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-50 text-amber-800'
                    }`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/validation/${item.id}`)}
                      icon={<ArrowRight className="w-3.5 h-3.5" />}
                    >
                      Investigate
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default AIAnomalies;
