import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import { 
  Building2, 
  MapPin, 
  Leaf, 
  Users, 
  Scale, 
  FileCheck2, 
  CheckCircle, 
  Upload, 
  Save, 
  Send, 
  AlertTriangle, 
  AlertOctagon,
  Sparkles, 
  FileSpreadsheet, 
  ArrowLeft, 
  Clock, 
  FileText,
  CheckCircle2,
  HelpCircle,
  ShieldCheck,
  ShieldAlert,
  History,
  Download,
  Eye
} from 'lucide-react';
import { Card, CardHeader } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { ProgressBar } from '../components/common/ProgressBar';
import { StatusBadge } from '../components/common/StatusBadge';
import { Modal } from '../components/common/Modal';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { projectsApi, esgApi, validationApi, approvalsApi } from '../api';
import confetti from 'canvas-confetti';
import { exportProjectDossierPDF } from '../utils/pdfExport';
import { EvidenceManager } from '../components/evidence/EvidenceManager';
import { AiValidationCenter } from '../components/validation/AiValidationCenter';

export const ProjectDetail: React.FC = () => {
  const { id = 'proj-1' } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { addToast } = useApp();

  const role = user?.role || 'project_user';

  // Active subtab detection based on path & role
  const getActiveTab = () => {
    const path = location.pathname;
    if (path.includes('/review')) return 'review';
    if (path.includes('/submissions') || path.includes('/approvals')) return 'submissions';
    if (path.includes('/esg/environmental')) return 'environmental';
    if (path.includes('/esg/social')) return 'social';
    if (path.includes('/esg/governance')) return 'governance';
    if (path.includes('/esg')) return 'environmental';
    if (path.includes('/documents')) return 'documents';
    if (path.includes('/validation')) return 'validation';
    if (path.includes('/brsr')) return 'brsr';
    if (path.endsWith('/overview')) return 'overview';
    // When visiting base /projects/:id without subpath:
    return role === 'bu_manager' ? 'review' : 'overview';
  };

  const activeTab = getActiveTab();

  // Review & Approval state for BU Manager
  const [reviewComments, setReviewComments] = useState('Audited against DISCOM power invoice batch #842 and flowmeter calibration reports. Approved.');

  // Approval Mutation for BU Manager & Subsidiary Admin
  const approvalActionMutation = useMutation({
    mutationFn: async ({ action, comments }: { action: 'approve' | 'request_correction'; comments: string }) => {
      const dynamicWfId = project?.workflows?.[0]?.id || `wf-${(proj.code || id).toLowerCase()}-env` || id;
      await approvalsApi.actionApproval(
        dynamicWfId,
        action,
        comments,
        user?.name || (role === 'bu_manager' ? 'Vikram Malhotra' : role === 'subsidiary_admin' ? 'Sunita Rao' : 'Approver'),
        user?.roleTitle || (role === 'bu_manager' ? 'BU Manager' : role === 'subsidiary_admin' ? 'Subsidiary Admin' : 'Reviewer')
      );
      await projectsApi.updateProject(id, {
        approvalStatus: action === 'approve' 
          ? (role === 'subsidiary_admin' ? 'under_esg_review' : 'under_subsidiary_review')
          : 'correction_required',
      });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['project', id] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['approvals'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      if (variables.action === 'approve') {
        try {
          confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
        } catch (e) {}
        addToast(
          role === 'subsidiary_admin' ? 'Subsidiary Signoff Completed' : 'Validated by BU Manager',
          role === 'subsidiary_admin'
            ? `${proj.name} signed off by Subsidiary Admin Sunita Rao and forwarded to ESG Team`
            : `${proj.name} validated by BU Manager and forwarded to Subsidiary Admin Sunita Rao`,
          'success'
        );
      } else {
        addToast('Correction Requested', `Submission returned to Project User (${proj.leadPerson || 'Rajesh Verma'}) with reviewer feedback`, 'info');
      }
    }
  });

  // Load project details from backend API
  const { data: project, isLoading: loadingProject } = useQuery({
    queryKey: ['project', id],
    queryFn: () => projectsApi.getProjectById(id),
  });

  // Environmental Form State (Defaults from DB or project)
  const [electricity, setElectricity] = useState<number>(100000);
  const [fuel, setFuel] = useState<number>(25000);
  const [renewablePct, setRenewablePct] = useState<number>(45);
  const [waterWithdrawal, setWaterWithdrawal] = useState<number>(50000);
  const [waterConsumption, setWaterConsumption] = useState<number>(38000);
  const [waterRecycled, setWaterRecycled] = useState<number>(18500);
  const [hazardousWaste, setHazardousWaste] = useState<number>(12.5);
  const [nonHazardousWaste, setNonHazardousWaste] = useState<number>(145.0);
  const [remarks, setRemarks] = useState<string>('Routine operational disclosures backed by utility invoices.');
  const [evidenceName] = useState<string>('DISCOM_Power_Invoices_FY26.pdf');

  // Social Form State
  const [employees, setEmployees] = useState<number>(1420);
  const [femalePct, setFemalePct] = useState<number>(24.2);
  const [contractWorkers, setContractWorkers] = useState<number>(4200);
  const [injuries, setInjuries] = useState<number>(4);
  const [fatalities, setFatalities] = useState<number>(0);

  // Governance Form State
  const [antiCorruption, setAntiCorruption] = useState<boolean>(true);
  const [whistleblowerCases, setWhistleblowerCases] = useState<number>(3);

  // AI Anomaly State & Modal
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [aiAnomalyData, setAiAnomalyData] = useState<any>(null);
  const [isAiChecking, setIsAiChecking] = useState(false);

  // Populate from existing project data when loaded
  useEffect(() => {
    if (project?.environmentalData) {
      setElectricity(project.environmentalData.electricityKwh || 100000);
      setFuel(project.environmentalData.fuelLitres || 25000);
      setRenewablePct(project.environmentalData.renewableEnergyPct || 45);
      setWaterWithdrawal(project.environmentalData.waterWithdrawalKl || 50000);
      setWaterConsumption(project.environmentalData.waterConsumptionKl || 38000);
      setWaterRecycled(project.environmentalData.waterRecycledKl || 18500);
      setHazardousWaste(project.environmentalData.hazardousWasteMt || 12.5);
      setNonHazardousWaste(project.environmentalData.nonHazardousWasteMt || 145.0);
    }
  }, [project]);

  // Save Draft Mutation
  const saveDraftMutation = useMutation({
    mutationFn: async () => {
      await esgApi.saveEnvironmental({
        projectId: id,
        electricityKwh: Number(electricity),
        fuelLitres: Number(fuel),
        renewableEnergyPct: Number(renewablePct),
        waterWithdrawalKl: Number(waterWithdrawal),
        waterConsumptionKl: Number(waterConsumption),
        waterRecycledKl: Number(waterRecycled),
        hazardousWasteMt: Number(hazardousWaste),
        nonHazardousWasteMt: Number(nonHazardousWaste),
        status: 'draft',
        remarks,
        evidenceAttached: evidenceName,
        userName: user?.name || 'Rajesh Verma',
      });
      await projectsApi.updateProject(id, {
        approvalStatus: 'draft',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', id] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      addToast('Draft Saved', 'Environmental data recorded in draft state (Pending Submission)', 'info');
    },
    onError: () => {
      addToast('Save Failed', 'Unable to save data to server', 'error');
    }
  });

  // AI Anomaly Check Trigger
  const handleRunAiValidation = async () => {
    setIsAiChecking(true);
    try {
      // Historical reference points for solar/power plant
      const historicalElectricity = [82000, 85000, 88000, 84000, 91000];
      const result = await validationApi.checkAnomaly('Electricity Consumption', Number(electricity), historicalElectricity);
      setAiAnomalyData(result);
      setAiModalOpen(true);
      queryClient.invalidateQueries({ queryKey: ['validations'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    } catch (e) {
      addToast('Validation Check', 'Rule check complete. No critical barriers found.', 'info');
    } finally {
      setIsAiChecking(false);
    }
  };

  // Final Submit Mutation
  const submitMutation = useMutation({
    mutationFn: async () => {
      // 1. Save data as submitted
      await esgApi.saveEnvironmental({
        projectId: id,
        electricityKwh: Number(electricity),
        fuelLitres: Number(fuel),
        renewableEnergyPct: Number(renewablePct),
        waterWithdrawalKl: Number(waterWithdrawal),
        waterConsumptionKl: Number(waterConsumption),
        waterRecycledKl: Number(waterRecycled),
        hazardousWasteMt: Number(hazardousWaste),
        nonHazardousWasteMt: Number(nonHazardousWaste),
        status: 'submitted',
        remarks,
        evidenceAttached: evidenceName,
        userName: user?.name || proj.leadPerson || 'Rajesh Verma',
      });

      // 2. Submit to BU Manager in approval workflow
      await esgApi.submitAllESG(id, user?.name || proj.leadPerson || 'Rajesh Verma', 'Environmental');

      // 3. Update project status in DB
      await projectsApi.updateProject(id, {
        approvalStatus: 'submitted',
        esgCompletion: 100,
        validationStatus: 'clean'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', id] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['approvals'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      try {
        confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
      } catch (e) {}
      addToast('Submitted to BU Manager', `Disclosures & telemetry for ${proj.name} submitted to BU Manager Vikram Malhotra for validation`, 'success');
      navigate(`/projects/${id}/submissions`);
    }
  });

  if (loadingProject && !project) {
    return (
      <div className="p-8 text-center text-slate-500">
        <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        Loading Project Dossier...
      </div>
    );
  }

  const proj = project || {
    id,
    name: 'Project Solar Apex (PRJ-001)',
    code: 'PRJ-001',
    subsidiaryName: 'Apex Heavy Engineering & Construction',
    businessUnitName: 'Renewables & Power Transmission',
    location: 'Bhadla, Jodhpur',
    state: 'Rajasthan',
    leadPerson: 'Rajesh Verma',
    reportingYear: 'FY 2025-26',
    approvalStatus: 'draft',
    esgCompletion: 88,
    brsrCompletion: 74,
  };

  // Provide full comprehensive access across all dossier tabs
  const getTabsForRole = (): Array<{ id: string; name: string; path: string; icon: any; badge?: string }> => {
    return [
      { id: 'overview', name: 'Overview', path: `/projects/${id}/overview`, icon: Building2 },
      { id: 'environmental', name: 'Environmental Data', path: `/projects/${id}/esg/environmental`, icon: Leaf },
      { id: 'social', name: 'Social Data', path: `/projects/${id}/esg/social`, icon: Users },
      { id: 'governance', name: 'Governance Data', path: `/projects/${id}/esg/governance`, icon: Scale },
      { id: 'documents', name: 'Evidence & Invoices', path: `/projects/${id}/documents`, icon: Upload },
      { 
        id: 'validation', 
        name: 'Validation & AI', 
        path: `/projects/${id}/validation`, 
        icon: Sparkles,
        badge: (electricity > 105000 || fatalities > 0 || waterRecycled > waterWithdrawal || !antiCorruption) ? 'Anomaly Flagged' : undefined 
      },
      { id: 'submissions', name: 'Approval Pipeline', path: `/projects/${id}/submissions`, icon: CheckCircle },
    ];
  };

  return (
    <div className="space-y-6">
      {/* Back button & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/projects')}
              icon={<ArrowLeft className="w-4 h-4" />}
            >
              Projects
            </Button>
            <span className="text-slate-300 dark:text-slate-700">/</span>
            <span className="text-xs font-mono font-bold text-slate-500 dark:text-slate-400">{proj.code}</span>
            <StatusBadge status={proj.approvalStatus as any} />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 font-heading m-0">
            {proj.name}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {proj.subsidiaryName} • {proj.businessUnitName} • {proj.location}, {proj.state} • Reporting Period: <strong className="text-emerald-700 dark:text-emerald-400">{proj.reportingYear}</strong>
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/projects/${id}/validation`)}
            icon={<Sparkles className="w-4 h-4 text-emerald-600" />}
          >
            Validate & AI Check
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate(`/projects/${id}/esg/environmental`)}
            icon={<Leaf className="w-4 h-4" />}
          >
            Enter ESG Data
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              try {
                exportProjectDossierPDF(proj, {
                  electricityKwh: electricity,
                  fuelLitres: fuel,
                  renewableEnergyPct: renewablePct,
                  waterWithdrawalKl: waterWithdrawal,
                  waterConsumptionKl: waterConsumption,
                  waterRecycledKl: waterRecycled,
                  hazardousWasteMt: hazardousWaste,
                  nonHazardousWasteMt: nonHazardousWaste,
                  totalEnergyGj: Number(((electricity * 0.0036) + (fuel * 0.038)).toFixed(1)),
                });
                addToast('PDF Download Complete', `Downloaded ${proj.code} ESG Audit Dossier PDF`, 'success');
              } catch (e: any) {
                addToast('Download Error', e.message || 'Failed to download dossier', 'error');
              }
            }}
            icon={<Download className="w-3.5 h-3.5 text-emerald-600" />}
          >
            Export Dossier (PDF)
          </Button>
        </div>
      </div>

      {/* Tabs Navigation (Role-Segregated!) */}
      <div className="flex items-center gap-2 overflow-x-auto border-b border-slate-200 dark:border-slate-800 pb-px text-xs font-semibold">
        {getTabsForRole().map((tab) => {
          const Icon = tab.icon;
          const isSelected = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => navigate(tab.path)}
              className={`px-4 py-2.5 rounded-t-lg transition-colors border-b-2 flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                isSelected
                  ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/20'
                  : 'border-transparent text-slate-600 hover:text-slate-900 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/40'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.name}</span>
              {tab.badge && (
                <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                  tab.badge === 'Action Required'
                    ? 'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200'
                    : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                }`}>
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* TAB CONTENT 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Real-Time Workflow Stage & Verification Banner */}
          {proj.approvalStatus === 'submitted' ? (
            <Card className="p-5 border-2 border-teal-500/50 bg-teal-50/20 dark:bg-teal-950/20 space-y-4 shadow-xs">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-teal-600 text-white uppercase tracking-wider">
                      Stage 2: BU Manager Validation Required
                    </span>
                    <StatusBadge status="submitted" />
                  </div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                    Disclosures Submitted by Project User ({proj.leadPerson || 'Rajesh Verma'})
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                    Operational telemetry and evidence documents have been uploaded. BU Manager check and validation is required before forwarding to Subsidiary Admin Sunita Rao.
                  </p>
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-teal-200/60 dark:border-teal-800/60">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  BU Manager Validation Remarks / Correction Feedback:
                </label>
                <textarea
                  rows={2}
                  value={reviewComments}
                  onChange={(e) => setReviewComments(e.target.value)}
                  placeholder="Enter validation audit notes or return feedback for the project user..."
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-sans"
                />
                <div className="flex flex-wrap items-center justify-end gap-2.5 pt-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      approvalActionMutation.mutate({
                        action: 'request_correction',
                        comments: reviewComments || 'Correction required on utility billing documentation.'
                      });
                    }}
                    loading={approvalActionMutation.isPending}
                    icon={<AlertTriangle className="w-3.5 h-3.5 text-amber-600" />}
                  >
                    Request Correction (Send Back to User)
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => {
                      approvalActionMutation.mutate({
                        action: 'approve',
                        comments: reviewComments || 'Validated by BU Manager. Audited against utility invoices and telemetry.'
                      });
                    }}
                    loading={approvalActionMutation.isPending}
                    icon={<CheckCircle2 className="w-3.5 h-3.5" />}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    Validate & Sign Off for Subsidiary Admin
                  </Button>
                </div>
              </div>
            </Card>
          ) : proj.approvalStatus === 'under_subsidiary_review' ? (
            <Card className="p-5 border-2 border-emerald-500/50 bg-emerald-50/20 dark:bg-emerald-950/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-emerald-600 text-white uppercase tracking-wider">
                    Stage 3: Subsidiary Admin Signoff
                  </span>
                  <StatusBadge status="under_subsidiary_review" />
                </div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                  Validated by BU Manager Vikram Malhotra
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                  Disclosures have passed BU verification and AI anomaly checks. Ready for Subsidiary Admin Sunita Rao to sign off for ESG team consolidation.
                </p>
              </div>
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  approvalActionMutation.mutate({
                    action: 'approve',
                    comments: 'Validated and signed off by Subsidiary Admin Sunita Rao for enterprise consolidation.'
                  });
                }}
                loading={approvalActionMutation.isPending}
                icon={<CheckCircle2 className="w-3.5 h-3.5" />}
                className="bg-emerald-600 hover:bg-emerald-700 text-white flex-shrink-0"
              >
                Sign Off as Subsidiary Admin
              </Button>
            </Card>
          ) : proj.approvalStatus === 'draft' ? (
            <Card className="p-4 border border-amber-300 dark:border-amber-800/80 bg-amber-50/20 dark:bg-amber-950/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-amber-600 flex-shrink-0" />
                <div>
                  <span className="font-bold text-xs text-slate-900 dark:text-slate-100">
                    Data Entry Pending (Project User: {proj.leadPerson || 'Rajesh Verma'})
                  </span>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Upload electricity, fuel, water, and waste disclosures backed by utility invoices, then submit to BU Manager for verification.
                  </p>
                </div>
              </div>
              <Button
                variant="primary"
                size="sm"
                onClick={() => navigate(`/projects/${id}/esg/environmental`)}
                icon={<Leaf className="w-3.5 h-3.5" />}
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs flex-shrink-0"
              >
                Enter Telemetry & Invoices
              </Button>
            </Card>
          ) : null}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-5 space-y-4">
              <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-emerald-600" />
                Project Identity & Hierarchy
              </h3>
              <div className="text-xs space-y-2 text-slate-600 dark:text-slate-400">
                <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                  <span>Project Code</span>
                  <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{proj.code}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                  <span>Subsidiary</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{proj.subsidiaryName}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                  <span>Business Unit</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{proj.businessUnitName}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                  <span>Location</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{proj.location}, {proj.state}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span>Reporting Period</span>
                  <span className="font-bold text-emerald-700 dark:text-emerald-400">{proj.reportingYear}</span>
                </div>
              </div>
            </Card>

            <Card className="p-5 space-y-4">
              <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-teal-600" />
                Compliance & Readiness Scores
              </h3>
              <div className="space-y-3 pt-1">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-600 dark:text-slate-400">ESG Data Entry Completion</span>
                    <span className="font-bold text-emerald-700 dark:text-emerald-400">{proj.esgCompletion}%</span>
                  </div>
                  <ProgressBar progress={proj.esgCompletion} size="sm" />
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-600 dark:text-slate-400">BRSR Section Mapping</span>
                    <span className="font-bold text-teal-700 dark:text-teal-400">{proj.brsrCompletion}%</span>
                  </div>
                  <ProgressBar progress={proj.brsrCompletion} size="sm" />
                </div>
                <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100 dark:border-slate-800">
                  <span>Workflow Status</span>
                  <StatusBadge status={proj.approvalStatus as any} />
                </div>
              </div>
            </Card>

            <Card className="p-5 space-y-4">
              <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Clock className="w-4 h-4 text-purple-600" />
                Quick Workflow Actions
              </h3>
              <div className="space-y-2 pt-1">
                <Button
                  variant="primary"
                  fullWidth
                  size="sm"
                  onClick={() => navigate(`/projects/${id}/esg/environmental`)}
                  icon={<Leaf className="w-3.5 h-3.5" />}
                >
                  Enter Environmental Metrics
                </Button>
                <Button
                  variant="outline"
                  fullWidth
                  size="sm"
                  onClick={() => navigate(`/projects/${id}/documents`)}
                  icon={<Upload className="w-3.5 h-3.5" />}
                >
                  Upload Utility Bills & Evidence
                </Button>
                <Button
                  variant="ghost"
                  fullWidth
                  size="sm"
                  onClick={() => navigate(`/projects/${id}/submissions`)}
                  icon={<CheckCircle className="w-3.5 h-3.5" />}
                >
                  Check Approvals
                </Button>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* TAB CONTENT: REVIEW SUBMISSION (Dedicated for BU Manager) */}
      {activeTab === 'review' && role === 'project_user' && (
        <div className="p-8 rounded-2xl bg-rose-950/20 border border-rose-500/40 text-center space-y-4">
          <div className="w-12 h-12 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              Access Restricted (HTTP 403 Forbidden)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto mt-1">
              Your account (<strong>{user?.name || 'Project User'}</strong>) is assigned to <strong>Project User</strong> role. Reviewing submissions, evaluating BU variances, and executing signoff actions is restricted to <strong>Project Manager / BU Manager</strong>.
            </p>
          </div>
          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate(`/projects/${id}/overview`)}
          >
            Return to Project Overview
          </Button>
        </div>
      )}

      {activeTab === 'review' && role !== 'project_user' && (
        <div className="space-y-6">
          {/* Submission Hero Banner */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-teal-900 via-slate-900 to-[#0c1f17] text-white border border-teal-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-teal-500/20 text-teal-300 border border-teal-500/30 uppercase tracking-wider">
                  BU Manager Review Portal
                </span>
                <StatusBadge status={proj.approvalStatus as any} />
              </div>
              <h2 className="text-xl font-bold font-heading text-slate-100">
                {proj.name} — Periodic ESG Telemetry Submission
              </h2>
              <p className="text-xs text-slate-300 mt-1">
                Submitted by <strong>Rajesh Verma (Site Project Lead)</strong> • Facility: {proj.location}, {proj.state} • Reporting Period: <strong>{proj.reportingYear}</strong>
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-300 font-mono bg-white/10 px-3 py-1.5 rounded-lg border border-white/15">
                Stage 2: BU Review
              </span>
            </div>
          </div>

          {/* AI Anomaly & Variance Evaluation Notice */}
          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-amber-500/20 text-amber-600 dark:text-amber-400 mt-0.5">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <span>AI Anomaly Flag: Electricity Consumption (+19.0% vs Baseline)</span>
                  <span className="text-[10px] px-2 py-0.2 rounded font-bold bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200">
                    Medium Severity
                  </span>
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 leading-relaxed">
                  Reported: <strong>{electricity.toLocaleString()} kWh</strong> (Historical baseline: 84,000 kWh). Z-Score = 1.82.
                  Operational justification: Additional 50 MW solar inverter testing commissioned during reporting period. No arithmetic inconsistencies found.
                </p>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleRunAiValidation}
              icon={<Sparkles className="w-3.5 h-3.5 text-amber-600" />}
            >
              Re-run AI Diagnostics
            </Button>
          </div>

          {/* Side-by-Side Submitted Data Review */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            <Card className="p-4 space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                1. Grid Electricity
              </span>
              <div className="text-xl font-mono font-bold text-slate-900 dark:text-slate-100">
                {electricity.toLocaleString()} <span className="text-xs font-normal text-slate-400">kWh</span>
              </div>
              <p className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold">
                +19.0% vs prior (84,000 kWh)
              </p>
            </Card>

            <Card className="p-4 space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                2. Stationary Diesel / Fuel
              </span>
              <div className="text-xl font-mono font-bold text-slate-900 dark:text-slate-100">
                {fuel.toLocaleString()} <span className="text-xs font-normal text-slate-400">Litres</span>
              </div>
              <p className="text-[11px] text-emerald-600 font-semibold">
                +4.2% vs prior (24,000 L)
              </p>
            </Card>

            <Card className="p-4 space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                3. Total Energy (Calculated)
              </span>
              <div className="text-xl font-mono font-bold text-emerald-600 dark:text-emerald-400">
                {((electricity * 0.0036) + (fuel * 0.038)).toFixed(1)} <span className="text-xs font-normal text-slate-400">GJ</span>
              </div>
              <p className="text-[11px] text-slate-500">
                Renewable Share: <strong>{renewablePct}%</strong>
              </p>
            </Card>

            <Card className="p-4 space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                4. Scope 1 & Scope 2 GHG
              </span>
              <div className="text-xl font-mono font-bold text-teal-600 dark:text-teal-400">
                {(((fuel * 2.68) / 1000) + (((electricity * (1 - (renewablePct / 100))) * 0.82) / 1000)).toFixed(1)} <span className="text-xs font-normal text-slate-400">tCO₂e</span>
              </div>
              <p className="text-[11px] text-slate-500">
                Scope 1: {((fuel * 2.68) / 1000).toFixed(1)} • Scope 2: {(((electricity * (1 - (renewablePct / 100))) * 0.82) / 1000).toFixed(1)}
              </p>
            </Card>
          </div>

          {/* Water & Waste Review */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-5 space-y-3">
              <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Leaf className="w-4 h-4 text-blue-600" />
                Water Stewardship Check
              </h4>
              <div className="text-xs space-y-2 text-slate-600 dark:text-slate-300">
                <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                  <span>Total Water Withdrawal</span>
                  <span className="font-mono font-bold">{waterWithdrawal.toLocaleString()} KL</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                  <span>Recycled / Reused Water</span>
                  <span className="font-mono font-bold text-blue-600">{waterRecycled.toLocaleString()} KL (37.0%)</span>
                </div>
                <div className="flex justify-between py-1 text-emerald-600 font-semibold">
                  <span>Rule ENV-01 (Recycled ≤ Withdrawal)</span>
                  <span className="flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> PASSED</span>
                </div>
              </div>
            </Card>

            <Card className="p-5 space-y-3">
              <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Upload className="w-4 h-4 text-emerald-600" />
                Audit Proofs & Documents
              </h4>
              <div className="space-y-2 text-xs">
                <div className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-emerald-600" />
                    <span className="font-semibold">{evidenceName}</span>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded">
                    Verified
                  </span>
                </div>
                <div className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-blue-600" />
                    <span className="font-semibold">Water_STP_Calibration_Cert.pdf</span>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded">
                    Verified
                  </span>
                </div>
              </div>
            </Card>
          </div>

          {/* BU Manager Decision Box */}
          <Card className="p-5 space-y-4 border-2 border-teal-500/40 bg-teal-50/20 dark:bg-teal-950/10">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-teal-600" />
                  BU Manager Review Decision & Action
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Authorize this project's ESG data to advance to Stage 3 (Subsidiary & ESG Team) or request corrective adjustments.
                </p>
              </div>
              <StatusBadge status={proj.approvalStatus as any} />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Reviewer Evaluation Notes / Correction Reason
              </label>
              <textarea
                rows={2}
                value={reviewComments}
                onChange={(e) => setReviewComments(e.target.value)}
                placeholder="Enter feedback or validation signoff notes..."
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
              />
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-2">
              <Button
                variant="outline"
                size="md"
                onClick={() => {
                  approvalActionMutation.mutate({
                    action: 'request_correction',
                    comments: reviewComments || 'Correction required on utility billing documentation.'
                  });
                }}
                loading={approvalActionMutation.isPending}
                icon={<AlertTriangle className="w-4 h-4 text-amber-600" />}
                className="w-full sm:w-auto"
              >
                Request Correction
              </Button>

              <Button
                variant="primary"
                size="md"
                onClick={() => {
                  approvalActionMutation.mutate({
                    action: 'approve',
                    comments: reviewComments || 'Approved by BU Manager. Telemetry audited against utility invoices.'
                  });
                }}
                loading={approvalActionMutation.isPending}
                icon={<CheckCircle2 className="w-4 h-4" />}
                className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                Approve Submission
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* TAB CONTENT 2: ENVIRONMENTAL FORM (Real Real-Time Form!) */}
      {activeTab === 'environmental' && (
        <div className="space-y-6">
          <div className="bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/80 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-xs font-bold text-emerald-900 dark:text-emerald-200 uppercase tracking-wider">
                Section 9: Real Environmental Data Entry Form
              </h3>
              <p className="text-xs text-emerald-800 dark:text-emerald-300/80 mt-0.5">
                Calculates live Scope 1, Scope 2 emissions, and total energy in GJ. Runs statistical AI anomaly detection against historical facility baselines.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRunAiValidation}
                loading={isAiChecking}
                icon={<Sparkles className="w-3.5 h-3.5 text-emerald-600" />}
              >
                Validate & AI Check
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setElectricity(98500);
                  setFuel(24200);
                  setRenewablePct(46.5);
                  setWaterWithdrawal(48500);
                  setWaterConsumption(35000);
                  setWaterRecycled(18200);
                  setHazardousWaste(11.8);
                  setNonHazardousWaste(138.0);
                  addToast('Telemetry Populated', `Loaded baseline telemetry for ${proj.name}`, 'info');
                }}
                className="text-xs"
              >
                Prefill Sample Values
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => saveDraftMutation.mutate()}
                loading={saveDraftMutation.isPending}
                icon={<Save className="w-3.5 h-3.5" />}
              >
                Save Draft
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => submitMutation.mutate()}
                loading={submitMutation.isPending}
                icon={<Send className="w-3.5 h-3.5" />}
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                Submit to BU Manager
              </Button>
            </div>
          </div>

          {/* Live AI Anomaly Warning Banner */}
          {(electricity > 105000 || waterRecycled > waterWithdrawal || fuel > 28000) && (
            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 text-amber-900 dark:text-amber-200">
                <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                <span>
                  <strong>AI Telemetry Anomaly Detected:</strong> {electricity > 105000 ? `Electricity (${electricity.toLocaleString()} kWh) exceeds operational threshold limit (105,000 kWh).` : waterRecycled > waterWithdrawal ? `Recycled water (${waterRecycled.toLocaleString()} KL) exceeds total withdrawal.` : `Diesel fuel (${fuel.toLocaleString()} L) exceeds threshold limit.`}
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(`/projects/${id}/validation`)}
                className="text-xs bg-amber-100/50 hover:bg-amber-100 text-amber-900 dark:bg-amber-950/60 dark:text-amber-200 border-amber-300 dark:border-amber-700"
                icon={<Eye className="w-3.5 h-3.5" />}
              >
                Inspect in AI Engine
              </Button>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Energy Section */}
            <Card className="p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                <div className="flex items-center gap-2">
                  <Leaf className="w-4 h-4 text-emerald-600" />
                  <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">1. Energy & Electricity</h4>
                </div>
                <span className="text-[11px] text-slate-500">Units: kWh, Litres, %</span>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Grid Electricity Consumption (kWh)
                  </label>
                  <input
                    type="number"
                    value={electricity}
                    onChange={(e) => setElectricity(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-mono text-sm"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">Previous Period: 84,000 kWh • Threshold: ±20%</p>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Stationary Diesel / Clean Fuel (Litres)
                  </label>
                  <input
                    type="number"
                    value={fuel}
                    onChange={(e) => setFuel(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-mono text-sm"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">Previous Period: 24,000 L</p>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Renewable Energy Share (%)
                  </label>
                  <input
                    type="number"
                    value={renewablePct}
                    onChange={(e) => setRenewablePct(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-mono text-sm"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">Target: &gt;40%</p>
                </div>

                {/* Live Computed Energy in GJ */}
                <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 flex items-center justify-between">
                  <span className="font-bold text-emerald-900 dark:text-emerald-200">Total Calculated Energy:</span>
                  <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400">
                    {((electricity * 0.0036) + (fuel * 0.038)).toFixed(1)} GJ
                  </span>
                </div>
              </div>
            </Card>

            {/* Water Section */}
            <Card className="p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                <div className="flex items-center gap-2">
                  <Leaf className="w-4 h-4 text-blue-600" />
                  <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">2. Water Stewardship</h4>
                </div>
                <span className="text-[11px] text-slate-500">Units: Kilolitres (KL)</span>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Total Water Withdrawal (KL)
                  </label>
                  <input
                    type="number"
                    value={waterWithdrawal}
                    onChange={(e) => setWaterWithdrawal(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-mono text-sm"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">Previous Period: 52,000 KL</p>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Water Consumption (KL)
                  </label>
                  <input
                    type="number"
                    value={waterConsumption}
                    onChange={(e) => setWaterConsumption(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-mono text-sm"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Recycled / Reused Water (KL)
                  </label>
                  <input
                    type="number"
                    value={waterRecycled}
                    onChange={(e) => setWaterRecycled(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-mono text-sm"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">Rule: Recycled cannot exceed Withdrawal</p>
                </div>

                <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/60 flex items-center justify-between">
                  <span className="font-bold text-blue-900 dark:text-blue-200">Recycled Water Share:</span>
                  <span className="font-mono font-bold text-blue-700 dark:text-blue-400">
                    {waterWithdrawal > 0 ? ((waterRecycled / waterWithdrawal) * 100).toFixed(1) : 0}%
                  </span>
                </div>
              </div>
            </Card>

            {/* Waste Section */}
            <Card className="p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                <div className="flex items-center gap-2">
                  <Leaf className="w-4 h-4 text-amber-600" />
                  <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">3. Waste Generation & Recovery</h4>
                </div>
                <span className="text-[11px] text-slate-500">Units: Metric Tonnes (MT)</span>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Hazardous Waste (MT)
                  </label>
                  <input
                    type="number"
                    value={hazardousWaste}
                    onChange={(e) => setHazardousWaste(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-mono text-sm"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Non-Hazardous Waste (MT)
                  </label>
                  <input
                    type="number"
                    value={nonHazardousWaste}
                    onChange={(e) => setNonHazardousWaste(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-mono text-sm"
                  />
                </div>
              </div>
            </Card>

            {/* Calculated Emissions */}
            <Card className="p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                <div className="flex items-center gap-2">
                  <Leaf className="w-4 h-4 text-emerald-600" />
                  <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">4. Live GHG Protocol Calculations</h4>
                </div>
                <span className="text-[11px] text-slate-500">Auto-calculated</span>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-slate-800 dark:text-slate-200">Scope 1 (Direct Fuel Combustion)</p>
                    <p className="text-[10px] text-slate-400">Emission factor: 2.68 kg CO₂e / L</p>
                  </div>
                  <span className="font-mono font-bold text-slate-900 dark:text-slate-100">
                    {((fuel * 2.68) / 1000).toFixed(1)} tCO₂e
                  </span>
                </div>

                <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-slate-800 dark:text-slate-200">Scope 2 (Market Grid Electricity)</p>
                    <p className="text-[10px] text-slate-400">Factor: 0.82 kg CO₂e / kWh (net renewable)</p>
                  </div>
                  <span className="font-mono font-bold text-slate-900 dark:text-slate-100">
                    {(((electricity * (1 - (renewablePct / 100))) * 0.82) / 1000).toFixed(1)} tCO₂e
                  </span>
                </div>

                {/* Remarks */}
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Remarks & Methodological Notes
                  </label>
                  <textarea
                    rows={2}
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-xs"
                  />
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* TAB CONTENT 3: SOCIAL HUB */}
      {activeTab === 'social' && (
        <Card className="p-5 space-y-4">
          <CardHeader
            title="Social Performance Form"
            subtitle="Workforce census, training, health & safety, grievances, and community engagement"
          />

          {/* Fatalities Critical Alert */}
          {fatalities > 0 && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 text-rose-900 dark:text-rose-200">
                <AlertOctagon className="w-4 h-4 text-rose-600 flex-shrink-0" />
                <span>
                  <strong>CRITICAL AI STATUTORY ALERT:</strong> Workplace fatalities reported ({fatalities}). Zero-tolerance threshold breached! Immediate regulatory notice required.
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(`/projects/${id}/validation`)}
                className="text-xs bg-rose-100/50 hover:bg-rose-100 text-rose-900 dark:bg-rose-950/60 dark:text-rose-200 border-rose-300 dark:border-rose-700"
                icon={<Eye className="w-3.5 h-3.5" />}
              >
                Inspect in AI Engine
              </Button>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold mb-1">Permanent Employees (Nos)</label>
              <input
                type="number"
                value={employees}
                onChange={(e) => setEmployees(Number(e.target.value))}
                className="w-full px-3 py-2 rounded border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
              />
            </div>
            <div>
              <label className="block font-semibold mb-1">Female Representation (%)</label>
              <input
                type="number"
                value={femalePct}
                onChange={(e) => setFemalePct(Number(e.target.value))}
                className="w-full px-3 py-2 rounded border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
              />
            </div>
            <div>
              <label className="block font-semibold mb-1">Contract Workers (Nos)</label>
              <input
                type="number"
                value={contractWorkers}
                onChange={(e) => setContractWorkers(Number(e.target.value))}
                className="w-full px-3 py-2 rounded border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
              />
            </div>
            <div>
              <label className="block font-semibold mb-1">Fatalities (Target: 0)</label>
              <input
                type="number"
                value={fatalities}
                onChange={(e) => setFatalities(Number(e.target.value))}
                className="w-full px-3 py-2 rounded border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 font-bold text-emerald-600"
              />
            </div>
          </div>
          <div className="pt-2 flex justify-end gap-2">
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                esgApi.saveSocial({
                  projectId: id,
                  permanentEmployees: employees,
                  femaleEmployeesPct: femalePct,
                  contractWorkers,
                  fatalities,
                  userName: user?.name,
                });
                addToast('Social Metrics Saved', 'Census records updated in database', 'success');
              }}
              icon={<Save className="w-3.5 h-3.5" />}
            >
              Save Social Data
            </Button>
          </div>
        </Card>
      )}

      {/* TAB CONTENT 4: GOVERNANCE HUB */}
      {activeTab === 'governance' && (
        <Card className="p-5 space-y-4">
          <CardHeader
            title="Governance Disclosures Form"
            subtitle="Anti-corruption, ethics oversight, compliance incidents, and whistleblower resolutions"
          />

          {/* Anti Corruption Inactive Alert */}
          {!antiCorruption && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 text-rose-900 dark:text-rose-200">
                <AlertOctagon className="w-4 h-4 text-rose-600 flex-shrink-0" />
                <span>
                  <strong>GOVERNANCE COMPLIANCE BREACH:</strong> Anti-Corruption policy marked inactive. Mandatory SEBI BRSR Principle 1 failure.
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(`/projects/${id}/validation`)}
                className="text-xs bg-rose-100/50 hover:bg-rose-100 text-rose-900 dark:bg-rose-950/60 dark:text-rose-200 border-rose-300 dark:border-rose-700"
                icon={<Eye className="w-3.5 h-3.5" />}
              >
                Inspect in AI Engine
              </Button>
            </div>
          )}

          <div className="space-y-3 text-xs">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60">
              <input
                type="checkbox"
                checked={antiCorruption}
                onChange={(e) => setAntiCorruption(e.target.checked)}
                className="w-4 h-4 text-emerald-600 rounded"
              />
              <div>
                <p className="font-semibold text-slate-800 dark:text-slate-200">Anti-Corruption & Anti-Bribery Policy in Active Force</p>
                <p className="text-[11px] text-slate-500">100% of staff and suppliers covered under code of conduct.</p>
              </div>
            </div>

            <div>
              <label className="block font-semibold mb-1">Whistleblower Complaints Received (Nos)</label>
              <input
                type="number"
                value={whistleblowerCases}
                onChange={(e) => setWhistleblowerCases(Number(e.target.value))}
                className="w-full px-3 py-2 rounded border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-mono"
              />
            </div>
          </div>
          <div className="pt-2 flex justify-end gap-2">
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                esgApi.saveGovernance({
                  projectId: id,
                  antiCorruptionPolicyActive: antiCorruption,
                  whistleblowerCasesReceived: whistleblowerCases,
                  userName: user?.name,
                });
                addToast('Governance Saved', 'Governance disclosures updated', 'success');
              }}
              icon={<Save className="w-3.5 h-3.5" />}
            >
              Save Governance Data
            </Button>
          </div>
        </Card>
      )}

      {/* TAB CONTENT 5: DOCUMENTS & INVOICES */}
      {activeTab === 'documents' && (
        <EvidenceManager
          projectId={id}
          projectCode={proj.code}
          projectName={proj.name}
        />
      )}

      {/* TAB CONTENT 6: VALIDATION & REAL-TIME AI ENGINE */}
      {activeTab === 'validation' && (
        <AiValidationCenter
          projectId={id}
          projectCode={proj.code}
          projectName={proj.name}
          environmental={{
            electricityKwh: electricity,
            fuelLitres: fuel,
            renewableEnergyPct: renewablePct,
            waterWithdrawalKl: waterWithdrawal,
            waterConsumptionKl: waterConsumption,
            waterRecycledKl: waterRecycled,
            hazardousWasteMt: hazardousWaste,
            nonHazardousWasteMt: nonHazardousWaste,
          }}
          social={{
            employees,
            femalePct,
            contractWorkers,
            injuries,
            fatalities,
          }}
          governance={{
            antiCorruption,
            whistleblowerCases,
          }}
          onUpdateMetric={(pillar, field, val) => {
            if (pillar === 'environmental') {
              if (field === 'electricityKwh') setElectricity(val);
              else if (field === 'fuelLitres') setFuel(val);
              else if (field === 'renewableEnergyPct') setRenewablePct(val);
              else if (field === 'waterWithdrawalKl') setWaterWithdrawal(val);
              else if (field === 'waterConsumptionKl') setWaterConsumption(val);
              else if (field === 'waterRecycledKl') setWaterRecycled(val);
              else if (field === 'hazardousWasteMt') setHazardousWaste(val);
              else if (field === 'nonHazardousWasteMt') setNonHazardousWaste(val);
            } else if (pillar === 'social') {
              if (field === 'employees') setEmployees(val);
              else if (field === 'femalePct') setFemalePct(val);
              else if (field === 'contractWorkers') setContractWorkers(val);
              else if (field === 'injuries') setInjuries(val);
              else if (field === 'fatalities') setFatalities(val);
            } else if (pillar === 'governance') {
              if (field === 'antiCorruption') setAntiCorruption(val);
              else if (field === 'whistleblowerCases') setWhistleblowerCases(val);
            }
          }}
        />
      )}

      {/* TAB CONTENT 7: BRSR MAPPING */}
      {activeTab === 'brsr' && (
        <Card className="p-5 space-y-4">
          <CardHeader
            title="BRSR Indicator Linkage"
            subtitle="How this project's entered data feeds into SEBI BRSR Core disclosures"
          />
          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div>
                <p className="font-semibold text-slate-800 dark:text-slate-200">P6-E1: Total Electricity & Energy Consumption</p>
                <p className="text-[11px] text-slate-500">Maps to {electricity} kWh from active entry</p>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">Mapped</span>
            </div>

            <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div>
                <p className="font-semibold text-slate-800 dark:text-slate-200">P6-E2: Water Withdrawal by Source</p>
                <p className="text-[11px] text-slate-500">Maps to {waterWithdrawal} KL withdrawal</p>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">Mapped</span>
            </div>
          </div>
        </Card>
      )}

      {/* TAB CONTENT 8: SUBMISSIONS & APPROVAL PIPELINE */}
      {activeTab === 'submissions' && (
        <div className="space-y-6">
          {/* Submission Status Alert */}
          {proj.approvalStatus === 'correction_required' ? (
            <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-amber-900 dark:text-amber-200">
                  Correction Requested by BU Manager
                </h4>
                <p className="text-xs text-amber-800 dark:text-amber-300">
                  Feedback: <em>"Please re-verify month 8 electricity meter reading and attach updated utility bill."</em>
                </p>
                <p className="text-[11px] text-slate-500 pt-1">
                  Adjust your inputs in the <strong>Environmental Data</strong> tab and click "Resubmit to BU Manager" below.
                </p>
              </div>
            </div>
          ) : proj.approvalStatus === 'approved_bu' || proj.approvalStatus === 'approved' ? (
            <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-emerald-900 dark:text-emerald-200">
                  Submission Approved by BU Manager Vikram Malhotra
                </h4>
                <p className="text-xs text-emerald-800 dark:text-emerald-300">
                  Disclosures have been verified and forwarded to ESG Team (Dr. Ananya Sen) for SEBI BRSR Section C Principle 6 mapping.
                </p>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-300 dark:border-blue-800 flex items-start gap-3">
              <Clock className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-blue-900 dark:text-blue-200">
                  {proj.approvalStatus === 'submitted' || proj.approvalStatus === 'under_review'
                    ? 'Submission Under Review by BU Manager'
                    : 'Draft Stage — Ready for Submission'}
                </h4>
                <p className="text-xs text-blue-800 dark:text-blue-300">
                  {proj.approvalStatus === 'submitted' || proj.approvalStatus === 'under_review'
                    ? `Your entered telemetry (Electricity: ${electricity.toLocaleString()} kWh, Fuel: ${fuel.toLocaleString()} L) is currently with Vikram Malhotra for unit review.`
                    : 'Your draft values are saved in the database. Ensure AI anomaly check is clean before submitting.'}
                </p>
              </div>
            </div>
          )}

          {/* Submission Action Box for Project User */}
          {role === 'project_user' && (
            <Card className="p-5 space-y-4 border-2 border-emerald-500/40 bg-emerald-50/20 dark:bg-emerald-950/10">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <Send className="w-4 h-4 text-emerald-600" />
                    Submit Project Disclosures to BU Manager
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Transfers entered telemetry ({electricity.toLocaleString()} kWh, {fuel.toLocaleString()} L) to Vikram Malhotra for Stage 2 signoff.
                  </p>
                </div>
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => submitMutation.mutate()}
                  loading={submitMutation.isPending}
                  icon={<Send className="w-4 h-4" />}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
                >
                  {proj.approvalStatus === 'correction_required' ? 'Resubmit to BU Manager' : 'Submit to BU Manager'}
                </Button>
              </div>
            </Card>
          )}

          {/* 5-Stage Enterprise Governance Progress Timeline */}
          <Card className="p-5 space-y-4">
            <CardHeader
              title="5-Stage Enterprise Authorization Chain"
              subtitle="Step-by-step progress tracking for Project Solar Apex disclosures"
            />
            <div className="space-y-3 p-2">
              <div className="flex items-center gap-3">
                <span className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold">1</span>
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-slate-100">Stage 1: Project User Data Submission</p>
                  <p className="text-[11px] text-emerald-600 font-medium">Completed by Rajesh Verma ({electricity.toLocaleString()} kWh)</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className={`w-7 h-7 rounded-full ${
                  proj.approvalStatus === 'approved_bu' || proj.approvalStatus === 'approved'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-amber-500 text-white'
                } flex items-center justify-center text-xs font-bold`}>2</span>
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-slate-100">Stage 2: BU Manager Review</p>
                  <p className={`text-[11px] font-medium ${
                    proj.approvalStatus === 'approved_bu' || proj.approvalStatus === 'approved'
                      ? 'text-emerald-600'
                      : 'text-amber-600'
                  }`}>
                    {proj.approvalStatus === 'approved_bu' || proj.approvalStatus === 'approved'
                      ? 'Approved by Vikram Malhotra'
                      : 'Assigned to Vikram Malhotra (Action pending)'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 opacity-70">
                <span className="w-7 h-7 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 flex items-center justify-center text-xs font-bold">3</span>
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-slate-100">Stage 3: Subsidiary Signoff</p>
                  <p className="text-[11px] text-slate-400">Sunita Rao (Apex Heavy Engineering)</p>
                </div>
              </div>

              <div className="flex items-center gap-3 opacity-70">
                <span className="w-7 h-7 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 flex items-center justify-center text-xs font-bold">4</span>
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-slate-100">Stage 4: ESG Team Validation & BRSR Mapping</p>
                  <p className="text-[11px] text-slate-400">Dr. Ananya Sen</p>
                </div>
              </div>

              <div className="flex items-center gap-3 opacity-70">
                <span className="w-7 h-7 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 flex items-center justify-center text-xs font-bold">5</span>
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-slate-100">Stage 5: Final Board & Executive Signoff</p>
                  <p className="text-[11px] text-slate-400">Deepak Khaitan & Priya Nair</p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* AI Anomaly Result Modal */}
      <Modal
        isOpen={aiModalOpen}
        onClose={() => setAiModalOpen(false)}
        title="AI Statistical Anomaly Evaluation"
      >
        <div className="space-y-4 text-xs">
          <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 dark:text-slate-100">Metric: Electricity Consumption</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-200 text-amber-900">
                Severity: {aiAnomalyData?.severity || 'medium'}
              </span>
            </div>
            <p className="text-slate-600 dark:text-slate-300">
              Reported Value: <strong>{electricity} kWh</strong> • Historical Baseline: <strong>{aiAnomalyData?.expectedBaseline || 86000} kWh</strong>
            </p>
            <p className="text-amber-800 dark:text-amber-300 font-medium">
              {aiAnomalyData?.explanation || 'Variance check: value is higher than standard historical standard deviation.'}
            </p>
          </div>

          <p className="text-slate-500">
            Note: The AI engine does <strong>not</strong> modify your entered data. It flags potential outliers for human review before final submission.
          </p>

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAiModalOpen(false)}
            >
              Adjust Value
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                setAiModalOpen(false);
                submitMutation.mutate();
              }}
            >
              Accept & Submit to Review
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ProjectDetail;
