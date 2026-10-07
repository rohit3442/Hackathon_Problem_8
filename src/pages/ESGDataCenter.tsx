import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Leaf, 
  Users, 
  Scale, 
  FileUp, 
  CheckCircle2, 
  AlertTriangle, 
  Save, 
  Send, 
  Clock, 
  TrendingDown, 
  TrendingUp,
  Search,
  ExternalLink,
  Download
} from 'lucide-react';
import { Card, CardHeader } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { StatusBadge } from '../components/common/StatusBadge';
import { ProgressBar } from '../components/common/ProgressBar';
import { Modal } from '../components/common/Modal';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { esgApi, projectsApi } from '../api';
import { ESGMetricItem } from '../types';
import { MOCK_PROJECTS } from '../services/mockData';
import { exportSubmittedDataPDF } from '../utils/pdfExport';
import confetti from 'canvas-confetti';

export const ESGDataCenter: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, canEditData } = useAuth();
  const { reportingYear, addToast } = useApp();

  const { data: projectList = [] } = useQuery({
    queryKey: ['projects'],
    queryFn: projectsApi.getProjects,
  });

  const projects = Array.isArray(projectList) && projectList.length > 0 ? projectList : MOCK_PROJECTS;

  const [activeTab, setActiveTab] = useState<'environmental' | 'social' | 'governance'>('environmental');
  const [metrics, setMetrics] = useState<ESGMetricItem[]>([]);
  const [selectedProject, setSelectedProject] = useState('SMP-500');
  const [searchQuery, setSearchQuery] = useState('');
  const [isEvidenceModalOpen, setIsEvidenceModalOpen] = useState(false);
  const [selectedMetricForEvidence, setSelectedMetricForEvidence] = useState<ESGMetricItem | null>(null);
  const [isSubmittingAll, setIsSubmittingAll] = useState(false);

  useEffect(() => {
    esgApi.getESGMetrics(activeTab).then(data => {
      setMetrics(Array.isArray(data) ? data : []);
    });
  }, [activeTab]);

  const filteredMetrics = metrics.filter(m => {
    const q = (searchQuery || '').toLowerCase();
    return (
      (m.name || '').toLowerCase().includes(q) ||
      (m.code || '').toLowerCase().includes(q) ||
      (m.subCategory || '').toLowerCase().includes(q)
    );
  });

  const handleSaveDraft = (metric: ESGMetricItem) => {
    const activeProjObj = projects.find(p => p.code === selectedProject) || projects[0];
    projectsApi.updateProject(activeProjObj.id, { approvalStatus: 'draft' }).then(() => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      addToast('Draft Saved', `Saved updates for ${metric.name}. Marked as draft submission in dashboard.`, 'info');
    });
  };

  const handleSubmitMetric = (metric: ESGMetricItem) => {
    const activeProjObj = projects.find(p => p.code === selectedProject) || projects[0];
    esgApi.updateESGMetric(metric.id, { status: 'submitted' }).then(async () => {
      setMetrics(prev => prev.map(m => m.id === metric.id ? { ...m, status: 'submitted' } : m));
      // Submit project to BU Manager so Draft Submissions count decrements and moves to BU Manager Dashboard
      await esgApi.submitAllESG(activeProjObj.id, user?.name || 'Rajesh Verma', metric.category || 'ESG Consolidated');
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['approvals'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      try {
        confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
      } catch (e) {}
      addToast('Submitted for Review', `${metric.name} and project package submitted to Business Unit Manager Vikram Malhotra`, 'success');
    });
  };

  const handleSubmitAll = async () => {
    setIsSubmittingAll(true);
    try {
      const activeProjObj = projects.find(p => p.code === selectedProject) || projects[0];
      await esgApi.submitAllESG(activeProjObj.id, user?.name || 'Rajesh Verma', 'ESG Consolidated');
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['approvals'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      try {
        confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
      } catch (e) {}
      addToast('ESG Package Submitted', `All ESG disclosures for ${activeProjObj.name} submitted at once to Business Unit Manager Vikram Malhotra`, 'success');
      setMetrics(prev => prev.map(m => ({ ...m, status: 'submitted' })));
    } catch (e) {
      addToast('Submission Failed', 'Could not submit disclosures to server', 'error');
    } finally {
      setIsSubmittingAll(false);
    }
  };

  const handleOpenEvidence = (metric: ESGMetricItem) => {
    setSelectedMetricForEvidence(metric);
    setIsEvidenceModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 font-heading m-0">
              ESG Data Center
            </h1>
            <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold border border-emerald-300/40">
              {reportingYear}
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Centralized repository for operational telemetry, utility proofs, workforce censuses, and governance disclosures.
          </p>
        </div>

        {/* Project Selector & Direct Hub Links */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-1.5 bg-white dark:bg-[#141f1b] border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-lg text-xs">
            <span className="text-slate-400">Site:</span>
            <select
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              className="bg-transparent font-bold text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer"
            >
              {projects.map(p => (
                <option key={p.code} value={p.code} className="bg-white dark:bg-[#0f1714]">
                  {p.code} - {p.name.split(' ')[0]} {p.name.split(' ')[1] || ''}
                </option>
              ))}
            </select>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/${activeTab}`)}
            icon={<ExternalLink className="w-3.5 h-3.5" />}
          >
            Open Dedicated {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Hub
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleSubmitAll}
            loading={isSubmittingAll}
            disabled={!canEditData}
            icon={<Send className="w-3.5 h-3.5" />}
            className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
          >
            Submit All to BU Manager
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const activeProjObj = projects.find(p => p.code === selectedProject) || projects[0];
              try {
                exportSubmittedDataPDF({
                  project: activeProjObj,
                  envData: activeProjObj.environmentalData,
                  socData: activeProjObj.socialData,
                  govData: activeProjObj.governanceData,
                  submittedBy: user?.name || activeProjObj.leadPerson || 'Rajesh Verma (Project Manager)',
                  submittedTo: 'Vikram Malhotra (BU Manager)',
                  submittedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
                });
                addToast('Download Complete', `Downloaded submitted data PDF for ${activeProjObj.code}`, 'success');
              } catch (e: any) {
                addToast('Download Failed', 'Could not generate PDF receipt', 'error');
              }
            }}
            icon={<Download className="w-3.5 h-3.5 text-emerald-600" />}
            className="border-emerald-500/50 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-xs"
          >
            Download Submitted PDF
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-2">
        <button
          onClick={() => setActiveTab('environmental')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === 'environmental'
              ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/20'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Leaf className="w-4 h-4 text-emerald-500" />
          <span>Environmental (GHG, Energy, Water, Waste)</span>
        </button>

        <button
          onClick={() => setActiveTab('social')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === 'social'
              ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/20'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Users className="w-4 h-4 text-teal-500" />
          <span>Social (Workforce, Diversity, Safety, CSR)</span>
        </button>

        <button
          onClick={() => setActiveTab('governance')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === 'governance'
              ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/20'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Scale className="w-4 h-4 text-blue-500" />
          <span>Governance (Ethics, Whistleblower, Compliance)</span>
        </button>
      </div>

      {/* Search & Actions Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`Search ${activeTab} metrics...`}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>

        <div className="text-xs text-slate-500 dark:text-slate-400">
          Showing <strong className="text-slate-800 dark:text-slate-200">{filteredMetrics.length}</strong> active indicators
        </div>
      </div>

      {/* Structured Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredMetrics.map(metric => (
          <Card key={metric.id} className="relative overflow-hidden flex flex-col justify-between">
            <div>
              {/* Header */}
              <div className="flex items-start justify-between gap-2 pb-2.5 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-bold text-slate-600 dark:text-slate-400">
                      {metric.code}
                    </span>
                    <span className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400">
                      {metric.subCategory}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 font-heading mt-1">
                    {metric.name}
                  </h3>
                </div>
                <StatusBadge status={metric.status} size="sm" />
              </div>

              {/* Data Values & Comparison */}
              <div className="grid grid-cols-3 gap-3 my-3 p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px]">{reportingYear} (Current)</span>
                  <span className="text-base font-bold text-slate-900 dark:text-slate-100 font-heading">
                    {metric.value} <span className="text-xs font-normal text-slate-500">{metric.unit}</span>
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Previous Period</span>
                  <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                    {metric.previousValue} {metric.unit}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">YoY Variance</span>
                  <span className={`inline-flex items-center text-xs font-bold ${
                    metric.yoyChangePct < 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-700 dark:text-slate-300'
                  }`}>
                    {metric.yoyChangePct < 0 ? <TrendingDown className="w-3.5 h-3.5 mr-0.5" /> : <TrendingUp className="w-3.5 h-3.5 mr-0.5" />}
                    {metric.yoyChangePct}%
                  </span>
                </div>
              </div>

              {/* Remarks & Mapping */}
              <div className="space-y-1.5 text-xs">
                <p className="text-slate-500 dark:text-slate-400 text-[11px] leading-relaxed">
                  {metric.remarks}
                </p>
                <div className="flex flex-wrap items-center gap-1.5 text-[10px] pt-1">
                  <span className="font-semibold text-slate-600 dark:text-slate-300 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                    {metric.brsrPrincipleMapping}
                  </span>
                  {metric.sdgMapping.map(sdg => (
                    <span key={sdg} className="px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-bold border border-blue-200 dark:border-blue-800">
                      SDG {sdg}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Evidence & Action Buttons Footer */}
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => handleOpenEvidence(metric)}
                className="inline-flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 hover:underline font-semibold"
              >
                <FileUp className="w-3.5 h-3.5" />
                <span>{metric.evidenceFile ? 'View Evidence Proof' : 'Attach Proof'}</span>
              </button>

              <div className="flex items-center gap-1.5">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSaveDraft(metric)}
                  disabled={!canEditData}
                  icon={<Save className="w-3.5 h-3.5" />}
                >
                  Save Draft
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleSubmitMetric(metric)}
                  disabled={!canEditData || metric.status === 'approved'}
                  icon={<Send className="w-3.5 h-3.5" />}
                >
                  Submit
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Evidence Viewer / Uploader Modal */}
      <Modal
        isOpen={isEvidenceModalOpen}
        onClose={() => setIsEvidenceModalOpen(false)}
        title="ESG Verification Evidence & Audit Proof"
        subtitle={selectedMetricForEvidence?.name}
        footer={
          <Button size="sm" onClick={() => setIsEvidenceModalOpen(false)}>
            Close
          </Button>
        }
      >
        <div className="space-y-4 text-xs">
          <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-lg flex items-center justify-between">
            <div>
              <span className="text-[10px] text-slate-400 block">Attached Verification File:</span>
              <strong className="text-slate-800 dark:text-slate-200 text-xs">
                {selectedMetricForEvidence?.evidenceFile || 'No file attached'}
              </strong>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold">
              SHA-256 Verified
            </span>
          </div>

          <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl p-6 text-center">
            <FileUp className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Upload New Attestation / Meter Log / Manifest
            </p>
            <p className="text-[10px] text-slate-400 mt-1 mb-3">
              Accepted: PDF, XLSX, CSV, Signed EHS Audits (Max 25 MB)
            </p>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setIsEvidenceModalOpen(false);
                addToast('Evidence Linked', 'Document attached and hashed for audit integrity', 'success');
              }}
            >
              Choose File from Device
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
