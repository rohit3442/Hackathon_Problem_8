import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FileCheck2, 
  AlertTriangle, 
  ShieldAlert, 
  CheckCircle2, 
  Filter, 
  Play, 
  ArrowRight,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { Card, CardHeader } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { StatusBadge } from '../components/common/StatusBadge';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { validationApi } from '../api';

export const ValidationCenter: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { addToast } = useApp();

  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  const { data: alerts = [], isLoading } = useQuery({
    queryKey: ['validations'],
    queryFn: validationApi.getAlerts,
  });

  const runScanMutation = useMutation({
    mutationFn: validationApi.runValidationScan,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['validations'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      addToast('Validation Engine Finished', data.message || 'Scanned stored database records', 'success');
    }
  });

  const filteredAlerts = alerts.filter(a => {
    if (selectedSeverity !== 'all' && a.severity !== selectedSeverity) return false;
    if (selectedStatus !== 'all' && a.status !== selectedStatus) return false;
    return true;
  });

  const highCount = alerts.filter(a => a.severity === 'high').length;
  const mediumCount = alerts.filter(a => a.severity === 'medium').length;
  const openCount = alerts.filter(a => a.status === 'open').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 font-heading m-0">
              ESG & BRSR Validation Center
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold border border-emerald-300/40">
              Rule Engine & AI Statistical Sentinel
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Automated integrity checks: Outlier detection, YoY jump threshold (&gt;20%), scope boundaries, and regulatory standard limits.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/validation/anomalies')}
            icon={<Sparkles className="w-3.5 h-3.5 text-emerald-600" />}
          >
            AI Anomaly Hub
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => runScanMutation.mutate()}
            loading={runScanMutation.isPending}
            icon={<Play className="w-3.5 h-3.5" />}
          >
            Run Validation Scan
          </Button>
        </div>
      </div>

      {/* Validation Top KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="p-4">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Tracked Flags</span>
          <strong className="text-2xl font-black text-slate-900 dark:text-slate-100 font-heading mt-1 block">
            {alerts.length} Records
          </strong>
          <span className="text-[10px] text-slate-500">From database tables</span>
        </Card>

        <Card className="p-4">
          <span className="text-[10px] font-bold text-rose-500 uppercase tracking-wider block">High Severity</span>
          <strong className="text-2xl font-black text-rose-600 font-heading mt-1 block">
            {highCount} Issues
          </strong>
          <span className="text-[10px] text-slate-500">Blocking signoff</span>
        </Card>

        <Card className="p-4">
          <span className="text-[10px] font-bold text-amber-500 uppercase tracking-wider block">Medium Severity</span>
          <strong className="text-2xl font-black text-amber-600 font-heading mt-1 block">
            {mediumCount} Warnings
          </strong>
          <span className="text-[10px] text-slate-500">Verification needed</span>
        </Card>

        <Card className="p-4">
          <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider block">Open Review Status</span>
          <strong className="text-2xl font-black text-emerald-600 font-heading mt-1 block">
            {openCount} Open
          </strong>
          <span className="text-[10px] text-slate-500">In audit queue</span>
        </Card>
      </div>

      {/* Filter Toolbar */}
      <div className="p-4 bg-white dark:bg-[#0f1714] border border-slate-200/80 dark:border-slate-800 rounded-xl flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300">
          <Filter className="w-4 h-4 text-emerald-600" />
          <span>Filter Issues:</span>
        </div>

        <select
          value={selectedSeverity}
          onChange={(e) => setSelectedSeverity(e.target.value)}
          className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200"
        >
          <option value="all">All Severities</option>
          <option value="high">High Severity</option>
          <option value="medium">Medium Severity</option>
          <option value="low">Low Severity</option>
        </select>

        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200"
        >
          <option value="all">All Statuses</option>
          <option value="open">Open</option>
          <option value="resolved">Resolved</option>
          <option value="flagged">Flagged for Correction</option>
        </select>
      </div>

      {/* Issues Table */}
      <Card>
        <CardHeader
          title="Validation Issues & Anomaly Queue"
          subtitle="Click any item to view complete details, rule conditions, and take resolution actions"
        />
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="p-3 font-semibold">Severity</th>
                <th className="p-3 font-semibold">Metric</th>
                <th className="p-3 font-semibold">Project / Site</th>
                <th className="p-3 font-semibold">Reported Value</th>
                <th className="p-3 font-semibold">Baseline</th>
                <th className="p-3 font-semibold">Diagnostic Rule</th>
                <th className="p-3 font-semibold">Status</th>
                <th className="p-3 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredAlerts.map((item) => (
                <tr 
                  key={item.id} 
                  onClick={() => navigate(`/validation/${item.id}`)}
                  className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors cursor-pointer"
                >
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      item.severity === 'high' ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300' :
                      item.severity === 'medium' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {item.severity}
                    </span>
                  </td>
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
                  <td className="p-3 font-mono text-[11px] text-emerald-700 dark:text-emerald-400">
                    {item.rule}
                  </td>
                  <td className="p-3">
                    <StatusBadge status={item.status as any} size="sm" />
                  </td>
                  <td className="p-3 text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/validation/${item.id}`);
                      }}
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
      </Card>
    </div>
  );
};

export default ValidationCenter;
