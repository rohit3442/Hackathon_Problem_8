import React, { useState } from 'react';
import { 
  Scale, 
  ShieldCheck, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Building2, 
  ExternalLink,
  Lock,
  Eye
} from 'lucide-react';
import { Card, CardHeader } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { StatusBadge } from '../components/common/StatusBadge';
import { ProgressBar } from '../components/common/ProgressBar';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';

export const GovernanceHub: React.FC = () => {
  const { canEditData } = useAuth();
  const { addToast } = useApp();

  const policies = [
    {
      name: 'Anti-Bribery & Anti-Corruption Policy',
      principle: 'P1',
      boardApprovedDate: '2024-05-18',
      lastReviewedDate: '2025-11-10',
      valueChainCoverage: '100% Operations & Vendors',
      status: 'Active & Verified',
      weblink: 'https://apexinfratech.com/governance/anti-bribery',
      evidence: 'Board_Resolution_ABAC_2024.pdf'
    },
    {
      name: 'Whistle-Blower & Vigil Mechanism Policy',
      principle: 'P1',
      boardApprovedDate: '2023-08-12',
      lastReviewedDate: '2025-10-15',
      valueChainCoverage: 'Employees, Contractors, Suppliers',
      status: 'Active & Verified',
      weblink: 'https://apexinfratech.com/governance/whistleblower',
      evidence: 'Ombudsman_Quarterly_Attestation.pdf'
    },
    {
      name: 'Human Rights in Supply Chain Policy',
      principle: 'P5',
      boardApprovedDate: '2024-02-20',
      lastReviewedDate: '2025-12-05',
      valueChainCoverage: 'Tier-1 & Tier-2 Supply Chain Partners',
      status: 'Active & Verified',
      weblink: 'https://apexinfratech.com/governance/human-rights',
      evidence: 'Human_Rights_Policy_Board_Minutes.pdf'
    },
    {
      name: 'Information Security & Data Privacy Policy',
      principle: 'P9',
      boardApprovedDate: '2024-09-14',
      lastReviewedDate: '2026-01-20',
      valueChainCoverage: 'Internal IT Systems & Cloud Endpoints',
      status: 'ISO 27001 Certified',
      weblink: 'https://apexinfratech.com/governance/cybersecurity',
      evidence: 'ISO27001_Audit_Attestation.pdf'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 font-heading m-0">
              Governance ESG Hub
            </h1>
            <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 font-bold border border-blue-300/40">
              BRSR Principles 1, 7 & 9
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Ethics & integrity, anti-corruption oversight, whistleblower grievance resolution, and cybersecurity attestation.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => addToast('Governance Scorecard Exported', 'Downloaded SEBI Regulation 25 compliance report', 'success')}
          icon={<FileText className="w-3.5 h-3.5" />}
        >
          Export Governance Brief
        </Button>
      </div>

      {/* Governance Scorecard & Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <Card className="bg-blue-50/50 dark:bg-blue-950/20 border-blue-200/80 dark:border-blue-800/60">
          <p className="text-[11px] font-bold text-blue-800 dark:text-blue-300 uppercase tracking-wider">
            Governance Score
          </p>
          <div className="mt-2 text-2xl font-black text-slate-900 dark:text-slate-100 font-heading">
            98.5%
          </div>
          <p className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold mt-1">
            Full compliance with SEBI LODR rules
          </p>
        </Card>

        <Card className="bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200/80 dark:border-emerald-800/60">
          <p className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">
            Whistleblower Resolution
          </p>
          <div className="mt-2 text-2xl font-black text-slate-900 dark:text-slate-100 font-heading">
            100%
          </div>
          <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1">
            14 of 14 cases investigated & closed
          </p>
        </Card>

        <Card className="bg-teal-50/50 dark:bg-teal-950/20 border-teal-200/80 dark:border-teal-800/60">
          <p className="text-[11px] font-bold text-teal-800 dark:text-teal-300 uppercase tracking-wider">
            Anti-Bribery Affirmation
          </p>
          <div className="mt-2 text-2xl font-black text-slate-900 dark:text-slate-100 font-heading">
            100%
          </div>
          <p className="text-[10px] text-teal-600 dark:text-teal-400 font-semibold mt-1">
            Signed by all executives & suppliers
          </p>
        </Card>

        <Card className="bg-purple-50/50 dark:bg-purple-950/20 border-purple-200/80 dark:border-purple-800/60">
          <p className="text-[11px] font-bold text-purple-800 dark:text-purple-300 uppercase tracking-wider">
            Cybersecurity Status
          </p>
          <div className="mt-2 text-2xl font-black text-slate-900 dark:text-slate-100 font-heading">
            Zero Breaches
          </div>
          <p className="text-[10px] text-purple-600 dark:text-purple-400 font-semibold mt-1">
            ISO 27001 & SOC 2 maintained
          </p>
        </Card>
      </div>

      {/* Policy Matrix Table */}
      <Card>
        <CardHeader
          title="Responsible Business Conduct (NGRBC) Policy Register"
          subtitle="Board approvals, procedure coverage, and value chain oversight"
        />
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                <th className="py-2.5 px-3">Policy Name</th>
                <th className="py-2.5 px-3">BRSR Principle</th>
                <th className="py-2.5 px-3">Board Approval Date</th>
                <th className="py-2.5 px-3">Last Reviewed</th>
                <th className="py-2.5 px-3">Value Chain Scope</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Proof Document</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {policies.map((p, i) => (
                <tr key={i} className="hover:bg-slate-50 dark:hover:bg-[#141f1b] transition-colors">
                  <td className="py-3 px-3">
                    <strong className="text-slate-900 dark:text-slate-100">{p.name}</strong>
                  </td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold border border-emerald-200 dark:border-emerald-800">
                      {p.principle}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-slate-600 dark:text-slate-400 font-mono">
                    {p.boardApprovedDate}
                  </td>
                  <td className="py-3 px-3 text-slate-600 dark:text-slate-400 font-mono">
                    {p.lastReviewedDate}
                  </td>
                  <td className="py-3 px-3 text-slate-600 dark:text-slate-400">
                    {p.valueChainCoverage}
                  </td>
                  <td className="py-3 px-3">
                    <StatusBadge status="validated" size="sm" />
                  </td>
                  <td className="py-3 px-3 text-right">
                    <button
                      onClick={() => addToast('Document Preview', `Opening ${p.evidence}`, 'info')}
                      className="inline-flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 hover:underline font-semibold"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>{p.evidence.split('.')[0]}</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Governance Lifecycle Timeline */}
      <Card>
        <CardHeader
          title="Policy Lifecycle & Board Oversight Pipeline"
          subtitle="Audited progression for enterprise policies from creation to annual review"
        />
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-2">
          {[
            { step: '1. Policy Drafted', desc: 'Framed under NGRBC / UNGC principles', date: 'Q1 Annual Cycle', status: 'Completed' },
            { step: '2. Board Approval', desc: 'Approved by Board ESG Committee', date: 'Board Resolution Signed', status: 'Approved' },
            { step: '3. Value Chain Rollout', desc: 'Communicated to 100% staff & suppliers', date: 'LMS & Vendor Portal', status: 'Active' },
            { step: '4. Annual Audit & Review', desc: 'Tested against SEBI LODR benchmarks', date: 'Independent Verification', status: 'Current' },
          ].map((item, idx) => (
            <div key={idx} className="p-3.5 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200/80 dark:border-slate-800 text-xs">
              <span className="text-[10px] font-bold text-emerald-600 uppercase block">{item.step}</span>
              <p className="font-semibold text-slate-800 dark:text-slate-200 mt-1">{item.desc}</p>
              <span className="text-[10px] text-slate-400 block mt-2">{item.date}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
