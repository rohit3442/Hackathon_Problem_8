import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  FileCheck2, 
  AlertTriangle, 
  ArrowLeft, 
  CheckCircle, 
  MessageSquare, 
  History, 
  FileText, 
  Send,
  Sparkles,
  ShieldAlert
} from 'lucide-react';
import { Card, CardHeader } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { StatusBadge } from '../components/common/StatusBadge';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { validationApi } from '../api';
import { useApp } from '../context/AppContext';

export const ValidationDetail: React.FC = () => {
  const { id = 'val-1' } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { addToast } = useApp();

  const [justification, setJustification] = useState('');
  const [actionInProgress, setActionInProgress] = useState(false);

  const { data: item, isLoading } = useQuery({
    queryKey: ['validation', id],
    queryFn: () => validationApi.getAlertById(id),
  });

  const updateMutation = useMutation({
    mutationFn: async (updates: { status: string; justification?: string }) => {
      return await validationApi.updateAlert(id, updates);
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['validation', id] });
      queryClient.invalidateQueries({ queryKey: ['validations'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      addToast(
        variables.status === 'resolved' ? 'Alert Resolved' : 'Correction Requested',
        `Validation status updated to ${variables.status}`,
        'success'
      );
      navigate('/validation');
    }
  });

  const alertItem = item || {
    id,
    recordId: 'env-1',
    metric: 'Electricity Consumption',
    project: 'Project Solar Apex (PRJ-001)',
    businessUnit: 'Renewables & Power Transmission',
    subsidiary: 'Apex Heavy Engineering & Construction',
    category: 'Environmental',
    currentValue: '100,000 kWh',
    previousValue: '84,000 kWh',
    rule: 'RULE-ENV-OUTLIER-20PCT',
    severity: 'medium',
    status: 'open',
    detectedAt: '2026-10-02 14:30',
    details: 'Current period grid consumption exceeded previous baseline by 19.0%. Verified against utility bill meter reads.',
    justification: ''
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
              onClick={() => navigate('/validation')}
              icon={<ArrowLeft className="w-4 h-4" />}
            >
              Validation Center
            </Button>
            <span className="text-slate-300 dark:text-slate-700">/</span>
            <span className="text-xs font-mono font-bold text-slate-500">{alertItem.id}</span>
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
              alertItem.severity === 'high' ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300' :
              alertItem.severity === 'medium' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' :
              'bg-blue-100 text-blue-800'
            }`}>
              {alertItem.severity} Severity
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 font-heading m-0">
            Validation Issue: {alertItem.metric}
          </h1>
          <p className="text-xs text-slate-500">
            Flagged for {alertItem.project} • {alertItem.businessUnit} • Detected: {alertItem.detectedAt}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => updateMutation.mutate({ status: 'flagged', justification: 'Requires project user correction.' })}
            loading={updateMutation.isPending}
          >
            Request Correction
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => updateMutation.mutate({ status: 'resolved', justification: justification || 'Auditor reviewed and verified.' })}
            loading={updateMutation.isPending}
            icon={<CheckCircle className="w-4 h-4" />}
          >
            Resolve Issue
          </Button>
        </div>
      </div>

      {/* Detail Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Main Inspection Card */}
          <Card className="p-5 space-y-4">
            <CardHeader
              title="Metric Variance & Rule Evaluation"
              subtitle="Comparison of reported figures against validation criteria"
            />
            
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-1">
                <span className="text-slate-500">Reported Current Value</span>
                <p className="text-xl font-mono font-bold text-slate-900 dark:text-slate-100">
                  {alertItem.currentValue}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-1">
                <span className="text-slate-500">Previous Period Baseline</span>
                <p className="text-xl font-mono font-bold text-slate-900 dark:text-slate-100">
                  {alertItem.previousValue}
                </p>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="font-semibold text-slate-600 dark:text-slate-400">Triggered Validation Rule</span>
                <span className="font-mono font-bold text-emerald-600">{alertItem.rule}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="font-semibold text-slate-600 dark:text-slate-400">ESG Category</span>
                <span className="font-semibold">{alertItem.category}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="font-semibold text-slate-600 dark:text-slate-400">Current Status</span>
                <StatusBadge status={alertItem.status as any} />
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 text-xs">
              <p className="font-bold text-amber-900 dark:text-amber-200">Rule Engine Diagnostic Message:</p>
              <p className="text-amber-800 dark:text-amber-300 mt-1">{alertItem.details}</p>
            </div>
          </Card>

          {/* Action / Justification Card */}
          <Card className="p-5 space-y-3">
            <CardHeader
              title="Reviewer Justification & Resolution Notes"
              subtitle="Provide explanatory rationale for SEBI audit trail"
            />
            <textarea
              rows={3}
              value={justification}
              onChange={(e) => setJustification(e.target.value)}
              placeholder="e.g. Variance explained by commissioning of new auxiliary substation in Q3. Supporting meter bills verified."
              className="w-full p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-slate-100"
            />
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => updateMutation.mutate({ status: 'flagged', justification })}
              >
                Request Facility Revision
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => updateMutation.mutate({ status: 'resolved', justification })}
              >
                Accept with Justification
              </Button>
            </div>
          </Card>
        </div>

        {/* Evidence & History Sidebar */}
        <div className="space-y-6">
          <Card className="p-5 space-y-3">
            <CardHeader title="Attached Evidence" />
            <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center gap-3 text-xs">
              <FileText className="w-5 h-5 text-emerald-600" />
              <div>
                <p className="font-semibold text-slate-900 dark:text-slate-100">DISCOM_Power_Invoices_FY26.pdf</p>
                <p className="text-[11px] text-slate-400">Utility Billing Proof</p>
              </div>
            </div>
          </Card>

          <Card className="p-5 space-y-3">
            <CardHeader title="Validation Audit History" />
            <div className="text-xs space-y-2">
              <div className="p-2 rounded bg-slate-50 dark:bg-slate-800/40">
                <span className="font-semibold text-slate-800 dark:text-slate-200">System Engine</span>
                <p className="text-[10px] text-slate-400">Triggered rule validation scan • 2026-10-02</p>
              </div>
              <div className="p-2 rounded bg-slate-50 dark:bg-slate-800/40">
                <span className="font-semibold text-slate-800 dark:text-slate-200">AI Anomaly Service</span>
                <p className="text-[10px] text-slate-400">Z-Score 2.4 evaluated vs historical set</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ValidationDetail;
