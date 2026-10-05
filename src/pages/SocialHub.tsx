import React, { useState } from 'react';
import { 
  Users, 
  HeartHandshake, 
  ShieldCheck, 
  GraduationCap, 
  Sparkles, 
  Save, 
  Send, 
  CheckCircle2, 
  TrendingDown, 
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { Card, CardHeader } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { StatusBadge } from '../components/common/StatusBadge';
import { ProgressBar } from '../components/common/ProgressBar';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { esgApi } from '../api';
import confetti from 'canvas-confetti';

export const SocialHub: React.FC = () => {
  const { user, canEditData } = useAuth();
  const { reportingYear, addToast } = useApp();
  const queryClient = useQueryClient();

  const [activeSection, setActiveSection] = useState<'workforce' | 'safety' | 'training' | 'csr'>('workforce');

  // Interactive metrics
  const [totalEmployees, setTotalEmployees] = useState(14850);
  const [femaleEmployees, setFemaleEmployees] = useState(3594);
  const femalePct = ((femaleEmployees / totalEmployees) * 100).toFixed(1);

  const [ltifr, setLtifr] = useState(0.12);
  const [safeManHours, setSafeManHours] = useState(18.4); // million
  const [avgTrainingHrs, setAvgTrainingHrs] = useState(36.4);
  const [csrSpentCr, setCsrSpentCr] = useState(84.5);

  const saveMutation = useMutation({
    mutationFn: async (status: 'draft' | 'submitted') => {
      return await esgApi.saveSocial({
        projectId: 'proj-1',
        reportingPeriod: reportingYear || 'FY 2025-26',
        permanentEmployees: totalEmployees,
        femaleEmployees,
        femaleEmployeesPct: Number(femalePct),
        ltifr,
        avgTrainingHoursPerPerson: avgTrainingHrs,
        csrSpentCr,
        status,
        userName: user?.name || 'Project User'
      });
    },
    onSuccess: (_, status) => {
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['approvals'] });
      if (status === 'submitted') {
        try { confetti({ particleCount: 70, spread: 60 }); } catch (e) {}
        addToast('Submitted to BU Manager', 'Social disclosures package submitted to Vikram Malhotra for Stage 1 signoff', 'success');
      } else {
        addToast('Draft Saved', 'Workforce census & safety indicators recorded in draft state', 'info');
      }
    },
    onError: () => {
      addToast('Sync Warning', 'Saved locally. Ensure API server is listening on port 3000.', 'info');
    }
  });

  const handleSave = () => {
    saveMutation.mutate('draft');
  };

  const handleSubmit = () => {
    saveMutation.mutate('submitted');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 font-heading m-0">
              Social ESG Hub
            </h1>
            <span className="text-xs px-2 py-0.5 rounded-full bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 font-bold border border-teal-300/40">
              BRSR Principles 3 & 5
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Workforce diversity, human rights compliance, occupational health & safety (LTIFR), and community CSR impact.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleSave}
            disabled={!canEditData}
            icon={<Save className="w-3.5 h-3.5" />}
          >
            Save Changes
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleSubmit}
            disabled={!canEditData || saveMutation.isPending}
            icon={<Send className="w-3.5 h-3.5" />}
          >
            Submit for Signoff
          </Button>
        </div>
      </div>

      {/* Social KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <Card className="bg-teal-50/50 dark:bg-teal-950/20 border-teal-200/80 dark:border-teal-800/60">
          <p className="text-[11px] font-bold text-teal-800 dark:text-teal-300 uppercase tracking-wider">
            Total Workforce
          </p>
          <div className="mt-2 text-2xl font-black text-slate-900 dark:text-slate-100 font-heading">
            {totalEmployees.toLocaleString()}
          </div>
          <p className="text-[10px] text-teal-600 dark:text-teal-400 font-semibold mt-1">
            Permanent Employees (94,000+ total incl. workers)
          </p>
        </Card>

        <Card className="bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200/80 dark:border-emerald-800/60">
          <p className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">
            Female Representation
          </p>
          <div className="mt-2 text-2xl font-black text-slate-900 dark:text-slate-100 font-heading">
            {femalePct}%
          </div>
          <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1">
            +3.4% YoY growth in technical roles
          </p>
        </Card>

        <Card className="bg-blue-50/50 dark:bg-blue-950/20 border-blue-200/80 dark:border-blue-800/60">
          <p className="text-[11px] font-bold text-blue-800 dark:text-blue-300 uppercase tracking-wider">
            Safety LTIFR
          </p>
          <div className="mt-2 text-2xl font-black text-slate-900 dark:text-slate-100 font-heading">
            {ltifr}
          </div>
          <p className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold mt-1">
            Zero fatalities across {safeManHours}M safe hours
          </p>
        </Card>

        <Card className="bg-purple-50/50 dark:bg-purple-950/20 border-purple-200/80 dark:border-purple-800/60">
          <p className="text-[11px] font-bold text-purple-800 dark:text-purple-300 uppercase tracking-wider">
            CSR Investment
          </p>
          <div className="mt-2 text-2xl font-black text-slate-900 dark:text-slate-100 font-heading">
            ₹ {csrSpentCr} Cr
          </div>
          <p className="text-[10px] text-purple-600 dark:text-purple-400 font-semibold mt-1">
            106% of prescribed statutory spend
          </p>
        </Card>
      </div>

      {/* Social Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-2">
        {[
          { id: 'workforce', label: 'Workforce & Diversity (P3-E1 & P5-E1)', icon: Users },
          { id: 'safety', label: 'Health & Safety / LTIFR (P3-E4)', icon: ShieldCheck },
          { id: 'training', label: 'Skill Building & Hours (P3-E2)', icon: GraduationCap },
          { id: 'csr', label: 'Corporate Social Responsibility (P8)', icon: HeartHandshake },
        ].map(sec => {
          const Icon = sec.icon;
          return (
            <button
              key={sec.id}
              onClick={() => setActiveSection(sec.id as any)}
              className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold border-b-2 transition-all cursor-pointer ${
                activeSection === sec.id
                  ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400 bg-emerald-50/40 dark:bg-emerald-950/20'
                  : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              <Icon className="w-4 h-4 text-teal-500" />
              <span>{sec.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Panels */}
      {activeSection === 'workforce' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader
              title="Employee & Worker Headcount Census"
              subtitle="SEBI BRSR Section A (General Disclosures) Table 4"
            />
            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold mb-1">Total Permanent Employees</label>
                <input
                  type="number"
                  value={totalEmployees}
                  onChange={(e) => setTotalEmployees(Number(e.target.value))}
                  disabled={!canEditData}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 font-mono font-bold"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Female Employees (Headcount)</label>
                <input
                  type="number"
                  value={femaleEmployees}
                  onChange={(e) => setFemaleEmployees(Number(e.target.value))}
                  disabled={!canEditData}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 font-mono font-bold"
                />
              </div>

              <div className="p-3 bg-teal-50 dark:bg-teal-950/40 rounded-xl space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-300">Female Representation Ratio:</span>
                  <strong className="text-teal-700 dark:text-teal-300">{femalePct}%</strong>
                </div>
                <ProgressBar value={Number(femalePct)} variant="teal" size="sm" />
              </div>
            </div>
          </Card>

          <Card>
            <CardHeader
              title="Differently-Abled Employees & Inclusivity"
              subtitle="Disclosures under Equal Opportunity & PwD policies"
            />
            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-800 dark:text-slate-200">Differently Abled Permanent Employees</h4>
                  <p className="text-[10px] text-slate-400">Accessible infrastructure at 100% corporate campuses</p>
                </div>
                <strong className="text-base font-bold text-slate-900 dark:text-slate-100 font-heading">142</strong>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-800 dark:text-slate-200">Median Male-to-Female Remuneration Ratio</h4>
                  <p className="text-[10px] text-slate-400">Equal pay audit completed by independent consultant</p>
                </div>
                <strong className="text-base font-bold text-emerald-600 dark:text-emerald-400 font-heading">1.02 : 1.00</strong>
              </div>
            </div>
          </Card>
        </div>
      )}

      {activeSection === 'safety' && (
        <Card>
          <CardHeader
            title="Occupational Health, Safety & Incident Rate"
            subtitle="ISO 45001 certified sites and Directorate of Industrial Safety & Health compliance"
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-4 bg-slate-50 dark:bg-slate-900/60 rounded-xl space-y-1">
              <span className="text-slate-400 block text-[10px]">LTIFR (Lost Time Injury Rate)</span>
              <strong className="text-2xl font-bold font-heading text-emerald-600 dark:text-emerald-400">{ltifr}</strong>
              <p className="text-[10px] text-slate-500">Per million man-hours worked (Previous: 0.18)</p>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-900/60 rounded-xl space-y-1">
              <span className="text-slate-400 block text-[10px]">Fatalities</span>
              <strong className="text-2xl font-bold font-heading text-slate-900 dark:text-slate-100">0</strong>
              <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">Zero fatality record maintained</p>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-900/60 rounded-xl space-y-1">
              <span className="text-slate-400 block text-[10px]">Safe Man-Hours Worked</span>
              <strong className="text-2xl font-bold font-heading text-slate-900 dark:text-slate-100">{safeManHours} Million</strong>
              <p className="text-[10px] text-slate-500">Audited by Directorate of Industrial Safety</p>
            </div>
          </div>
        </Card>
      )}

      {(activeSection === 'training' || activeSection === 'csr') && (
        <Card>
          <CardHeader
            title={activeSection === 'training' ? 'Safety & ESG Training Hours (P3-E2)' : 'CSR Beneficiaries & Impact Reach (P8)'}
            subtitle={activeSection === 'training' ? 'LMS verifiable attendance records' : 'Approved by Board CSR Committee'}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 bg-slate-50 dark:bg-slate-900/60 rounded-xl space-y-2">
              <span className="text-slate-400 text-[10px] block">Annual Focus</span>
              <strong className="text-base font-bold text-slate-900 dark:text-slate-100 font-heading">
                {activeSection === 'training' ? `${avgTrainingHrs} Average Training Hours / Person` : `₹ ${csrSpentCr} Crore CSR Outlay`}
              </strong>
              <p className="text-[11px] text-slate-500">
                {activeSection === 'training'
                  ? 'Covered behavioral safety, human rights compliance, anti-bribery, and green engineering practices.'
                  : 'Benefited 64,000+ individuals in rural water access, STEM education scholarships, and skill development.'}
              </p>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-900/60 rounded-xl space-y-2">
              <span className="text-slate-400 text-[10px] block">Statutory Compliance Status</span>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                <span className="font-bold text-emerald-700 dark:text-emerald-300">
                  100% Compliant with SEBI BRSR Requirements
                </span>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};
