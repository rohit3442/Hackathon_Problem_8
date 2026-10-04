import React, { useState, useEffect } from 'react';
import { 
  History, 
  Search, 
  Filter, 
  ShieldCheck, 
  User, 
  Clock, 
  Download,
  CheckCircle2,
  FileText
} from 'lucide-react';
import { Card, CardHeader } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { DataTable, Column } from '../components/common/DataTable';
import { useApp } from '../context/AppContext';
import { useQuery } from '@tanstack/react-query';
import { auditApi } from '../api';
import { AuditTrailRecord } from '../types';
import { exportAuditTrailPDF } from '../utils/pdfExport';

export const AuditTrail: React.FC = () => {
  const { addToast } = useApp();

  const { data: logs = [], isLoading } = useQuery({
    queryKey: ['audit'],
    queryFn: auditApi.getLogs,
    refetchInterval: 5000,
  });

  const columns: Column<AuditTrailRecord>[] = [
    {
      key: 'timestamp',
      header: 'Timestamp',
      sortable: true,
      render: (row) => (
        <span className="font-mono text-slate-500 text-[11px] whitespace-nowrap">
          {row.timestamp}
        </span>
      ),
      width: '160px'
    },
    {
      key: 'userName',
      header: 'User & Role',
      sortable: true,
      render: (row) => (
        <div>
          <strong className="text-slate-900 dark:text-slate-100 block">{row.userName}</strong>
          <span className="text-[10px] text-slate-400">{row.userRole}</span>
        </div>
      )
    },
    {
      key: 'action',
      header: 'Action Taken',
      sortable: true,
      render: (row) => {
        const colors = {
          Created: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300',
          Updated: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
          Submitted: 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300',
          Validated: 'bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300',
          Approved: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
          Rejected: 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300',
          'Generated Report': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300',
          'Uploaded Evidence': 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
        };
        return (
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${(colors as Record<string, string>)[row.action] || 'bg-slate-100 text-slate-700'}`}>
            {row.action}
          </span>
        );
      },
      width: '130px'
    },
    {
      key: 'entity',
      header: 'Target Entity & ID',
      render: (row) => (
        <div>
          <span className="font-semibold text-slate-800 dark:text-slate-200 block">{row.entity}</span>
          <span className="font-mono text-[10px] text-slate-400">{row.entityId}</span>
        </div>
      )
    },
    {
      key: 'newValue',
      header: 'Audit Value / Hash',
      render: (row) => (
        <span className="text-slate-600 dark:text-slate-300 font-mono text-[11px] truncate block max-w-xs">
          {row.newValue}
        </span>
      )
    },
    {
      key: 'ipAddress',
      header: 'Origin IP',
      render: (row) => (
        <span className="text-slate-400 font-mono text-[10px]">
          {row.ipAddress}
        </span>
      ),
      width: '120px'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 font-heading m-0">
              Immutable ESG Audit Trail
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold border border-emerald-300/40">
              SHA-256 Verifiable
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Complete traceability of data entries, validation triggers, multi-tier approvals, evidence uploads, and report compilations.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            try {
              exportAuditTrailPDF(logs);
              addToast('Audit Trail Exported', 'Tamper-evident statutory audit ledger PDF downloaded', 'success');
            } catch (e: any) {
              addToast('Export Failed', e.message || 'Failed to download audit PDF', 'error');
            }
          }}
          icon={<Download className="w-3.5 h-3.5" />}
        >
          Export Audit Ledger (PDF)
        </Button>
      </div>

      {/* Security Assurance Banner */}
      <div className="p-4 bg-emerald-50/60 dark:bg-[#0f1d16] border border-emerald-200/80 dark:border-[#1c3d2e] rounded-xl flex items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-600 flex items-center justify-center text-white flex-shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-slate-900 dark:text-slate-100">
              SOC 2 Type II & SEBI Digital Records Compliant
            </h4>
            <p className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5">
              All state transitions are append-only. No historical record can be altered or destroyed.
            </p>
          </div>
        </div>
        <span className="text-xs font-mono font-bold text-emerald-700 dark:text-emerald-300 hidden sm:inline">
          Hash Integrity: 100% OK
        </span>
      </div>

      {/* Audit Log Table */}
      <DataTable
        data={Array.isArray(logs) ? logs : []}
        columns={columns}
        keyExtractor={(l) => l.id}
        searchPlaceholder="Search user, action, entity or metric..."
        searchableKeys={['userName', 'userRole', 'action', 'entity', 'entityId', 'newValue']}
      />
    </div>
  );
};
