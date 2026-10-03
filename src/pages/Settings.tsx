import React, { useState } from 'react';
import { 
  Settings as SettingsIcon, 
  Shield, 
  Bell, 
  Database, 
  Save, 
  Sliders, 
  Building2, 
  Calendar,
  CheckCircle2
} from 'lucide-react';
import { Card, CardHeader } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { useApp } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';

export const Settings: React.FC = () => {
  const { reportingYear, addToast } = useApp();
  const { theme, setTheme } = useTheme();

  const [outlierThreshold, setOutlierThreshold] = useState(25);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [requireEvidence, setRequireEvidence] = useState(true);
  const [auditHashing, setAuditHashing] = useState(true);

  const handleSave = () => {
    addToast('Settings Saved', 'Platform configuration parameters updated', 'success');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 font-heading m-0">
              Platform & Regulatory Settings
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold">
              Admin Configuration
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Global boundary rules, validation anomaly thresholds, notification preferences, and reporting years.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={handleSave}
          icon={<Save className="w-3.5 h-3.5" />}
        >
          Save Configuration
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-xs">
        {/* Validation Engine Rules */}
        <Card>
          <CardHeader
            title="Validation Rule Engine Thresholds"
            subtitle="Parameters for automatic anomaly detection and outlier flagging"
          />
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="font-semibold text-slate-800 dark:text-slate-200">
                  Year-over-Year Jump Warning Threshold (% Variance)
                </label>
                <span className="font-bold font-mono text-emerald-600 dark:text-emerald-400">
                  ± {outlierThreshold}%
                </span>
              </div>
              <input
                type="range"
                min="10"
                max="50"
                value={outlierThreshold}
                onChange={(e) => setOutlierThreshold(Number(e.target.value))}
                className="w-full accent-emerald-600"
              />
              <p className="text-[10px] text-slate-400 mt-1">
                Metrics with YoY delta exceeding this threshold automatically flag a warning for reviewer justification.
              </p>
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-3">
              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <span className="font-semibold text-slate-800 dark:text-slate-200 block">
                    Strict Evidence Enforcement
                  </span>
                  <span className="text-[10px] text-slate-400">
                    Disallow submission without attached proof for Scope 1 & 2 GHG metrics.
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={requireEvidence}
                  onChange={(e) => setRequireEvidence(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <span className="font-semibold text-slate-800 dark:text-slate-200 block">
                    Cryptographic SHA-256 Audit Hashing
                  </span>
                  <span className="text-[10px] text-slate-400">
                    Seal each approval step with digital hash for third-party auditor assurance.
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={auditHashing}
                  onChange={(e) => setAuditHashing(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                />
              </label>
            </div>
          </div>
        </Card>

        {/* Reporting Boundaries */}
        <Card>
          <CardHeader
            title="SEBI Regulatory Scope & Boundary"
            subtitle="Market categorization and assurance requirements"
          />
          <div className="space-y-3">
            <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl space-y-1">
              <span className="text-[10px] text-slate-400 block">SEBI Market Capitalization Tier:</span>
              <strong className="text-slate-900 dark:text-slate-100 font-bold text-sm">
                Top 1000 Listed Entities (Mandatory BRSR & BRSR Core)
              </strong>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl space-y-1">
              <span className="text-[10px] text-slate-400 block">Assurance Regime:</span>
              <strong className="text-emerald-600 dark:text-emerald-400 font-bold text-sm">
                Reasonable Assurance for BRSR Core Required
              </strong>
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
              <label className="block font-semibold mb-1">Active Reporting Financial Year</label>
              <input
                type="text"
                readOnly
                value={reportingYear}
                className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-800 dark:text-slate-200 font-bold"
              />
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
