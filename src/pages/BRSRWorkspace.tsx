import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FileSpreadsheet, 
  FileText, 
  Layers, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight, 
  Download, 
  ExternalLink,
  ShieldCheck,
  Building2,
  Sparkles
} from 'lucide-react';
import { Card, CardHeader } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { ProgressBar } from '../components/common/ProgressBar';
import { StatusBadge } from '../components/common/StatusBadge';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { useQuery } from '@tanstack/react-query';
import { brsrApi } from '../api';
import { MOCK_BRSR_PRINCIPLES } from '../services/mockData';

export const BRSRWorkspace: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { reportingYear, toggleAiAssistant, addToast } = useApp();

  const { data: principlesData = [] } = useQuery({
    queryKey: ['brsrPrinciples'],
    queryFn: brsrApi.getPrinciples,
  });

  const principles = Array.isArray(principlesData) && principlesData.length > 0 ? principlesData : MOCK_BRSR_PRINCIPLES;

  const [selectedSection, setSelectedSection] = useState<'all' | 'A' | 'B' | 'C'>('all');

  const sectionsOverview = [
    {
      code: 'SECTION A',
      title: 'General Disclosures',
      desc: 'Entity Details, Products/Services, Operations, Employees, Holding/Subsidiaries, CSR, Transparency & Grievance mechanisms.',
      completion: 96,
      indicatorsCount: '7 Major Subsections',
      status: 'validated' as const,
      route: '/brsr/section-a',
    },
    {
      code: 'SECTION B',
      title: 'Management & Process Disclosures',
      desc: 'NGRBC 9-Principle Policy Coverage, Board approvals, Value chain applicability, Commitments & Goal achievement.',
      completion: 90,
      indicatorsCount: '9 Principles Policy Matrix',
      status: 'validated' as const,
      route: '/brsr/section-b',
    },
    {
      code: 'SECTION C',
      title: 'Principle-wise Performance Disclosures',
      desc: 'Principles 1 through 9 Essential Indicators (Mandatory) & Leadership Indicators (Aspirational/Extended).',
      completion: 87,
      indicatorsCount: '9 Principles (P1 - P9)',
      status: 'under_review' as const,
      route: '/brsr/section-c',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 font-heading m-0">
              SEBI BRSR Reporting Workspace
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold border border-emerald-300/40">
              Circular SEBI/HO/CFD/CMD-2/P/CIR/2021/562
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Business Responsibility and Sustainability Reporting framework (Annexure 1 & BRSR Core Annexure 2) for <strong className="text-emerald-700 dark:text-emerald-400">{reportingYear}</strong>.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={toggleAiAssistant}
            icon={<Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />}
          >
            BRSR Gap Assistant
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate('/reports')}
            icon={<FileSpreadsheet className="w-3.5 h-3.5" />}
          >
            Export SEBI Report
          </Button>
        </div>
      </div>

      {/* Top Readiness Scorecard */}
      <div className="p-5 bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 rounded-2xl text-white shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-300">
            SEBI BRSR Filing Readiness Index
          </span>
          <h2 className="text-2xl font-extrabold font-heading text-white m-0 mt-1">
            87.0% Comprehensive Filing Ready
          </h2>
          <p className="text-xs text-slate-200 mt-1 max-w-xl">
            All 9 Principles have achieved required Essential Indicator thresholds. Third-party assurance for BRSR Core is completed.
          </p>
        </div>

        <div className="flex items-center gap-4 w-full md:w-72">
          <div className="w-full space-y-1.5">
            <div className="flex justify-between text-xs font-semibold">
              <span>Overall BRSR Progress</span>
              <span className="text-emerald-300">87%</span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-2.5 overflow-hidden">
              <div className="bg-emerald-400 h-2.5 rounded-full" style={{ width: '87%' }} />
            </div>
          </div>
        </div>
      </div>

      {/* 3 Main BRSR Section Cards (A, B, C) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {sectionsOverview.map(sec => (
          <Card key={sec.code} hover onClick={() => navigate(sec.route)} className="flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 tracking-wider">
                  {sec.code}
                </span>
                <StatusBadge status={sec.status} size="sm" />
              </div>

              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 font-heading mt-3">
                {sec.title}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
                {sec.desc}
              </p>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80">
                <ProgressBar value={sec.completion} label="Section Readiness" showLabel variant="emerald" />
              </div>
            </div>

            <div className="mt-4 pt-3 flex items-center justify-between text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              <span>{sec.indicatorsCount}</span>
              <span className="flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                <span>Open Section</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </Card>
        ))}
      </div>

      {/* Principle-wise Breakdown P1 - P9 Cards Grid */}
      <Card>
        <CardHeader
          title="NGRBC 9 Principles Completion Ledger (Section C Overview)"
          subtitle="National Guidelines on Responsible Business Conduct indicators matrix"
          action={
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/brsr/section-c')}
              icon={<ArrowRight className="w-3.5 h-3.5" />}
            >
              Principle Details
            </Button>
          }
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
          {principles.map(p => (
            <div
              key={p.number}
              onClick={() => navigate('/brsr/section-c')}
              className="p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 hover:border-emerald-500/60 bg-slate-50/50 dark:bg-slate-900/40 transition-all cursor-pointer space-y-2.5"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-md bg-emerald-600 text-white font-bold flex items-center justify-center text-xs">
                    P{p.number}
                  </span>
                  <strong className="text-slate-900 dark:text-slate-100">{p.shortName}</strong>
                </div>
                <StatusBadge status={p.status || 'validated'} size="sm" />
              </div>

              <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">
                {p.description || ''}
              </p>

              <div className="space-y-1 pt-1">
                <div className="flex justify-between text-[11px] text-slate-600 dark:text-slate-300">
                  <span>Essential: {p.essentialCompleted ?? 5} / {p.essentialCount ?? 6}</span>
                  <span className="font-bold text-slate-900 dark:text-slate-100">{p.totalCompletion ?? 90}%</span>
                </div>
                <ProgressBar value={p.totalCompletion ?? 90} size="sm" variant={(p.totalCompletion ?? 90) > 90 ? 'emerald' : 'teal'} />
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
