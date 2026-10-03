import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  FileText, 
  Download, 
  ArrowLeft, 
  FileSpreadsheet, 
  Printer, 
  CheckCircle2, 
  Building2, 
  ShieldCheck,
  Calendar,
  Layers
} from 'lucide-react';
import { Card, CardHeader } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { ProgressBar } from '../components/common/ProgressBar';
import { useQuery } from '@tanstack/react-query';
import { reportsApi, dashboardApi, projectsApi, esgApi } from '../api';
import { useApp } from '../context/AppContext';
import { exportBrsrReportPDF } from '../utils/pdfExport';

export const ReportDetail: React.FC = () => {
  const { id = 'rep-1' } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToast } = useApp();

  const { data: dashboardData } = useQuery({
    queryKey: ['dashboard'],
    queryFn: dashboardApi.getDashboardData,
  });

  const { data: projects = [] } = useQuery({
    queryKey: ['projects'],
    queryFn: projectsApi.getProjects,
  });

  const { data: envData = [] } = useQuery({
    queryKey: ['environmental'],
    queryFn: esgApi.getEnvironmental,
  });

  const handleExportPDF = () => {
    addToast('Generating PDF', 'Compiling approved database records into SEBI BRSR Core format...', 'info');
    try {
      exportBrsrReportPDF({
        reportTitle: 'SEBI BRSR Comprehensive Annual Report FY 2025-26',
        reportType: 'SEBI Mandatory Regulatory Filing',
        reportingYear: 'FY 2025-26',
        organization: 'Apex Infrastructure Group Limited',
        dashboard: dashboardData,
        projects,
        environmentalRecords: envData,
      });
      addToast('PDF Download Complete', 'Official SEBI BRSR Annual Report PDF downloaded successfully', 'success');
    } catch (e: any) {
      addToast('Download Error', e.message || 'Failed to build PDF', 'error');
    }
  };

  const handleExportExcel = () => {
    // Generate clean statutory CSV for Excel
    const headers = ['Metric', 'Category', 'Calculated Value', 'Unit', 'BRSR Principle', 'Assurance Status'];
    const rows = [
      ['Total Energy Consumption', 'Environmental', dashboardData?.metricsSummary?.totalEnergyGj || 118610, 'GJ', 'P6-E1', 'Reasonable (ISO 14064)'],
      ['Renewable Energy Share', 'Environmental', dashboardData?.metricsSummary?.avgRenewableEnergyPct || 44.2, '%', 'P6-E1', 'Reasonable (ISO 14064)'],
      ['Scope 1 Direct GHG', 'Environmental', dashboardData?.metricsSummary?.totalScope1Tco2e || 12367, 'tCO2e', 'P6-E5', 'Reasonable (ISO 14064)'],
      ['Scope 2 Market-Based GHG', 'Environmental', dashboardData?.metricsSummary?.totalScope2Tco2e || 22345, 'tCO2e', 'P6-E5', 'Reasonable (ISO 14064)'],
      ['Scope 3 Upstream GHG', 'Environmental', dashboardData?.metricsSummary?.totalScope3Tco2e || 55500, 'tCO2e', 'P6-L1', 'Limited Assurance'],
      ['Freshwater Recycled Ratio', 'Environmental', '58.4', '%', 'P6-E3', 'Verified'],
      ['Hazardous Waste Diverted', 'Environmental', '94.2', '%', 'P6-E8', 'State Pollution Board Manifest'],
      ['Total Workforce Census', 'Social', '14,850', 'Employees', 'P3-E1', 'HRMS Verified'],
      ['Female Workforce Diversity', 'Social', '24.2', '%', 'P3-E1', 'HRMS Verified'],
      ['Lost Time Injury Frequency (LTIFR)', 'Social', '0.12', 'per million hrs', 'P3-E8', 'EHS Audited'],
      ['Anti-Corruption Code Coverage', 'Governance', '100', '%', 'P1-E1', 'Board Approved']
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' + 
      [headers.join(','), ...rows.map(r => r.map(cell => `"${cell}"`).join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'SEBI_BRSR_Annexure_Disclosures_FY2025-26.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    addToast('Excel/CSV Export Ready', 'Exported SEBI BRSR Annexure disclosures to spreadsheet file', 'success');
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
              onClick={() => navigate('/reports')}
              icon={<ArrowLeft className="w-4 h-4" />}
            >
              Report Center
            </Button>
            <span className="text-slate-300 dark:text-slate-700">/</span>
            <span className="text-xs font-mono font-bold text-slate-500">{id}</span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
              Audit Approved
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 font-heading m-0">
            SEBI BRSR Comprehensive Annual Report FY 2025-26
          </h1>
          <p className="text-xs text-slate-500">
            Organization: <strong>Apex Infrastructure Group Limited</strong> • Boundary: Consolidated (Top 1000 Listed Entities)
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportExcel}
            icon={<FileSpreadsheet className="w-4 h-4 text-emerald-600" />}
          >
            Export Excel
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleExportPDF}
            icon={<Download className="w-4 h-4" />}
          >
            Export Official PDF
          </Button>
        </div>
      </div>

      {/* Report Metadata & Readiness Checklist */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4 space-y-1">
          <span className="text-xs text-slate-500">Reporting Period</span>
          <p className="font-bold text-sm text-slate-900 dark:text-slate-100">FY 2025-26</p>
          <p className="text-[10px] text-slate-400">April 1, 2025 - March 31, 2026</p>
        </Card>

        <Card className="p-4 space-y-1">
          <span className="text-xs text-slate-500">ESG Data Completion</span>
          <p className="font-bold text-sm text-emerald-600 font-mono">
            {dashboardData?.esgCompletion ?? 87}% Complete
          </p>
          <ProgressBar progress={dashboardData?.esgCompletion ?? 87} size="sm" />
        </Card>

        <Card className="p-4 space-y-1">
          <span className="text-xs text-slate-500">BRSR Principles Readiness</span>
          <p className="font-bold text-sm text-teal-600 font-mono">
            {dashboardData?.brsrCompletion ?? 90}% Verified
          </p>
          <ProgressBar progress={dashboardData?.brsrCompletion ?? 90} size="sm" />
        </Card>

        <Card className="p-4 space-y-1">
          <span className="text-xs text-slate-500">Workflow Signoffs</span>
          <p className="font-bold text-sm text-emerald-600 font-mono">5 / 5 Stages</p>
          <p className="text-[10px] text-slate-400">Board Signoff Executed</p>
        </Card>
      </div>

      {/* Generated Report Content Preview */}
      <Card className="p-8 space-y-6 bg-white dark:bg-slate-900 shadow-sm border border-slate-200 dark:border-slate-800">
        <div className="border-b border-slate-200 dark:border-slate-800 pb-4 flex items-center justify-between">
          <div>
            <span className="text-xs uppercase tracking-widest font-extrabold text-emerald-600">
              ECO METRICS REGULATORY FILING
            </span>
            <h2 className="text-xl font-bold font-heading text-slate-900 dark:text-slate-100 mt-1">
              Business Responsibility and Sustainability Report (BRSR)
            </h2>
            <p className="text-xs text-slate-500">
              Pursuant to Regulation 34(2)(f) of the SEBI (Listing Obligations and Disclosure Requirements) Regulations, 2015
            </p>
          </div>
          <div className="text-right">
            <span className="text-xs font-mono text-slate-400">Doc ID: BRSR-2026-APEX-01</span>
            <div className="mt-1">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                Audited & Approved
              </span>
            </div>
          </div>
        </div>

        {/* Section A Preview */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 border-l-3 border-emerald-500 pl-2">
            Section A: General Disclosures
          </h3>
          <div className="grid grid-cols-2 text-xs gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/40">
            <div>
              <span className="text-slate-500">Corporate Identity Number (CIN):</span>
              <p className="font-mono font-bold text-slate-800 dark:text-slate-200">L99999MH2002PLC138924</p>
            </div>
            <div>
              <span className="text-slate-500">Name of Listed Entity:</span>
              <p className="font-bold text-slate-800 dark:text-slate-200">Apex Infrastructure Group Limited</p>
            </div>
            <div>
              <span className="text-slate-500">Registered Office:</span>
              <p className="text-slate-800 dark:text-slate-200">Bandra-Kurla Complex, Mumbai, Maharashtra 400051</p>
            </div>
            <div>
              <span className="text-slate-500">Reporting Boundary:</span>
              <p className="text-slate-800 dark:text-slate-200">Consolidated (Subsidiaries + Joint Ventures)</p>
            </div>
          </div>
        </div>

        {/* Section B & C Live Aggregate Numbers */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 border-l-3 border-teal-500 pl-2">
            Section C: Principle 6 - Environmental Performance Indicators
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                <tr>
                  <th className="p-2.5">Indicator Code</th>
                  <th className="p-2.5">Disclosure Parameter</th>
                  <th className="p-2.5">Reported Value</th>
                  <th className="p-2.5">Measurement Unit</th>
                  <th className="p-2.5">Verification Source</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                <tr>
                  <td className="p-2.5 font-mono font-bold">P6-E1.1</td>
                  <td className="p-2.5">Total Electricity Consumption from Grid</td>
                  <td className="p-2.5 font-mono font-bold">100,000</td>
                  <td className="p-2.5 text-slate-500">kWh</td>
                  <td className="p-2.5 text-emerald-600 font-semibold">DISCOM utility meters</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-mono font-bold">P6-E1.2</td>
                  <td className="p-2.5">Total Fuel Consumption (Stationary Combustion)</td>
                  <td className="p-2.5 font-mono font-bold">25,000</td>
                  <td className="p-2.5 text-slate-500">Litres</td>
                  <td className="p-2.5 text-emerald-600 font-semibold">Fuel dispensing logs</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-mono font-bold">P6-E1.3</td>
                  <td className="p-2.5">Total Energy Consumed in Gigajoules (GJ)</td>
                  <td className="p-2.5 font-mono font-bold">1,310.0</td>
                  <td className="p-2.5 text-slate-500">GJ</td>
                  <td className="p-2.5 text-emerald-600 font-semibold">Calculated conversion</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-mono font-bold">P6-E2.1</td>
                  <td className="p-2.5">Scope 1 Direct GHG Emissions</td>
                  <td className="p-2.5 font-mono font-bold">67.0</td>
                  <td className="p-2.5 text-slate-500">tCO₂e</td>
                  <td className="p-2.5 text-emerald-600 font-semibold">IPCC 2006 factors</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-mono font-bold">P6-E2.2</td>
                  <td className="p-2.5">Scope 2 Indirect Electricity Emissions</td>
                  <td className="p-2.5 font-mono font-bold">45.1</td>
                  <td className="p-2.5 text-slate-500">tCO₂e</td>
                  <td className="p-2.5 text-emerald-600 font-semibold">CEA Grid Emission v20</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-mono font-bold">P6-E3.1</td>
                  <td className="p-2.5">Water Withdrawal from Ground and Municipal Sources</td>
                  <td className="p-2.5 font-mono font-bold">50,000</td>
                  <td className="p-2.5 text-slate-500">Kilolitres (KL)</td>
                  <td className="p-2.5 text-emerald-600 font-semibold">Municipal flowmeters</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Section B & C Social / Governance preview */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 border-l-3 border-blue-500 pl-2">
            Section C: Principle 3 - Employee Wellbeing & Safety
          </h3>
          <div className="grid grid-cols-3 gap-3 text-xs">
            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/40">
              <span className="text-slate-500">Workplace Fatalities:</span>
              <p className="font-bold text-emerald-600">0 (Zero)</p>
            </div>
            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/40">
              <span className="text-slate-500">Lost Time Injury Frequency Rate (LTIFR):</span>
              <p className="font-bold text-slate-800 dark:text-slate-200">0.12 per million hours</p>
            </div>
            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/40">
              <span className="text-slate-500">Female Workforce Representation:</span>
              <p className="font-bold text-slate-800 dark:text-slate-200">24.2%</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ReportDetail;
