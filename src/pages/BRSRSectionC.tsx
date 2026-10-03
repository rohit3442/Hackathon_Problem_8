import React, { useState } from 'react';
import { 
  FileSpreadsheet, 
  Leaf, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  FileUp, 
  Save, 
  Send, 
  ChevronRight,
  Eye,
  Sparkles,
  Search
} from 'lucide-react';
import { Card, CardHeader } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { StatusBadge } from '../components/common/StatusBadge';
import { ProgressBar } from '../components/common/ProgressBar';
import { Modal } from '../components/common/Modal';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { useQuery } from '@tanstack/react-query';
import { brsrApi, projectsApi } from '../api';
import { MOCK_BRSR_PRINCIPLES, MOCK_BRSR_INDICATORS } from '../services/mockData';
import { BRSRIndicator } from '../types';

export const BRSRSectionC: React.FC = () => {
  const { canEditData } = useAuth();
  const { reportingYear, addToast } = useApp();

  const [selectedPrincipleNum, setSelectedPrincipleNum] = useState<number>(6); // Default Principle 6 (Environment)
  const [activeTab, setActiveTab] = useState<'essential' | 'leadership'>('essential');
  const [editingIndicator, setEditingIndicator] = useState<BRSRIndicator | null>(null);

  // Load live project data from DB to dynamically reflect approved project submissions
  const { data: project } = useQuery({
    queryKey: ['project', 'proj-1'],
    queryFn: () => projectsApi.getProjectById('proj-1'),
  });

  const { data: liveIndicators = [] } = useQuery({
    queryKey: ['brsrIndicators'],
    queryFn: brsrApi.getIndicators,
  });

  const electricity = project?.environmentalData?.electricityKwh || 100000;
  const fuel = project?.environmentalData?.fuelLitres || 25000;
  const totalEnergyGj = ((electricity * 0.0036) + (fuel * 0.038)).toFixed(1);

  // Merge mock indicators with live calculated project values
  const [indicators, setIndicators] = useState<BRSRIndicator[]>(() => {
    return MOCK_BRSR_INDICATORS.map(ind => {
      if (ind.code === 'P6-E1') {
        return {
          ...ind,
          currentValue: `Total electricity consumed: 100,000 kWh (360.0 GJ). Total fuel consumed: 25,000 L (950.0 GJ). Total energy: 1,310.0 GJ across active sites.`,
          status: 'validated',
          evidenceAttached: 'DISCOM_Power_Invoices_FY26.pdf',
          reviewerNotes: 'Verified and approved by BU Manager Vikram Malhotra. Live mapped from Project Solar Apex.'
        };
      }
      return ind;
    });
  });

  // Re-sync when project telemetry changes
  React.useEffect(() => {
    if (project?.environmentalData) {
      setIndicators(prev => prev.map(ind => {
        if (ind.code === 'P6-E1') {
          return {
            ...ind,
            currentValue: `Total electricity consumed: ${electricity.toLocaleString()} kWh (${(electricity * 0.0036).toFixed(1)} GJ). Total fuel consumed: ${fuel.toLocaleString()} L (${(fuel * 0.038).toFixed(1)} GJ). Total energy: ${totalEnergyGj} GJ across active sites.`,
            status: project.approvalStatus === 'approved_bu' || project.approvalStatus === 'approved' ? 'validated' : 'under_review',
            evidenceAttached: 'DISCOM_Power_Invoices_FY26.pdf',
            reviewerNotes: `Verified & approved by BU Manager Vikram Malhotra. Live mapped from Project Solar Apex (${project.approvalStatus.replace('_', ' ')}).`
          };
        }
        return ind;
      }));
    }
  }, [project, electricity, fuel, totalEnergyGj]);

  const currentPrinciple = MOCK_BRSR_PRINCIPLES.find(p => p.number === selectedPrincipleNum) || MOCK_BRSR_PRINCIPLES[5];

  const filteredIndicators = indicators.filter(
    ind => ind.principle === selectedPrincipleNum && ind.type === activeTab
  );

  const handleSaveIndicator = (code: string, newCurrentVal: string) => {
    setIndicators(prev => prev.map(ind => ind.code === code ? { ...ind, currentValue: newCurrentVal, status: 'validated' } : ind));
    setEditingIndicator(null);
    addToast('Response Recorded', `Indicator ${code} updated successfully`, 'success');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 font-heading m-0">
              BRSR Section C — Principle-Wise Performance
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold border border-emerald-300/40">
              Essential & Leadership Disclosures
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Mandatory Essential and aspirational Leadership indicators aligned with NGRBC guidelines and BRSR Core attributes.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => addToast('Batch Saved', 'All indicator responses saved as draft', 'info')}
            disabled={!canEditData}
            icon={<Save className="w-3.5 h-3.5" />}
          >
            Save All Drafts
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => addToast('Submitted', 'Principle indicators submitted for ESG audit review', 'success')}
            disabled={!canEditData}
            icon={<Send className="w-3.5 h-3.5" />}
          >
            Submit Principle
          </Button>
        </div>
      </div>

      {/* Principle Selector Horizontal Carousel / Bar */}
      <div className="flex overflow-x-auto pb-2 border-b border-slate-200 dark:border-slate-800 gap-2">
        {MOCK_BRSR_PRINCIPLES.map(p => {
          const isSelected = selectedPrincipleNum === p.number;
          return (
            <button
              key={p.number}
              onClick={() => setSelectedPrincipleNum(p.number)}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                isSelected
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-white dark:bg-[#0f1714] text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
              }`}
            >
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${
                isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
              }`}>
                P{p.number}
              </span>
              <span>{p.shortName}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                isSelected ? 'bg-white/20' : 'bg-slate-100 dark:bg-slate-800'
              }`}>
                {p.totalCompletion}%
              </span>
            </button>
          );
        })}
      </div>

      {/* Active Principle Header Card */}
      <div className="p-4 bg-emerald-50/60 dark:bg-[#0f1d16] border border-emerald-200/80 dark:border-[#1c3d2e] rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">
            Principle {currentPrinciple.number} Active Workspace
          </span>
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 font-heading mt-0.5">
            {currentPrinciple.name}
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 max-w-3xl">
            {currentPrinciple.description}
          </p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-56 flex-shrink-0">
          <div className="w-full space-y-1">
            <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
              <span>Completion:</span>
              <strong className="text-emerald-700 dark:text-emerald-400">{currentPrinciple.totalCompletion}%</strong>
            </div>
            <ProgressBar value={currentPrinciple.totalCompletion} size="sm" variant="emerald" />
          </div>
        </div>
      </div>

      {/* Essential vs Leadership Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-3">
        <button
          onClick={() => setActiveTab('essential')}
          className={`px-4 py-2 text-xs font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === 'essential'
              ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400 bg-emerald-50/40 dark:bg-emerald-950/20'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          Essential Indicators (Mandatory Regulatory Filing)
        </button>

        <button
          onClick={() => setActiveTab('leadership')}
          className={`px-4 py-2 text-xs font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === 'leadership'
              ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400 bg-emerald-50/40 dark:bg-emerald-950/20'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          Leadership Indicators (Aspirational & Value Chain)
        </button>
      </div>

      {/* Indicators List */}
      <div className="space-y-4">
        {filteredIndicators.length === 0 ? (
          <Card className="text-center py-10 text-xs text-slate-400">
            No indicators in this category for Principle {selectedPrincipleNum}. Switch to Essential Indicators.
          </Card>
        ) : (
          filteredIndicators.map(ind => (
            <Card key={ind.code} className="space-y-3">
              {/* Question Header */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-start gap-2.5">
                  <span className="font-mono font-bold text-xs px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 flex-shrink-0">
                    {ind.code}
                  </span>
                  <div>
                    <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 leading-snug">
                      {ind.question}
                    </h3>
                    {ind.unit && (
                      <span className="text-[10px] text-slate-400 mt-0.5 block">
                        Mandated Unit: <strong className="text-slate-600 dark:text-slate-300">{ind.unit}</strong>
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0 self-end sm:self-auto">
                  <StatusBadge status={ind.status} size="sm" />
                </div>
              </div>

              {/* Response Block */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 text-xs">
                {/* Current Value Display / Editor */}
                <div className="md:col-span-8 p-3.5 bg-slate-50 dark:bg-slate-900/60 rounded-xl space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] uppercase font-bold text-slate-400">
                      Reported Disclosure Response ({reportingYear})
                    </span>
                    {ind.previousValue && (
                      <span className="text-[10px] text-slate-400">
                        Previous Period: <strong className="text-slate-700 dark:text-slate-300">{ind.previousValue}</strong>
                      </span>
                    )}
                  </div>

                  <p className="text-xs font-medium text-slate-800 dark:text-slate-100 leading-relaxed bg-white dark:bg-[#141f1b] p-3 rounded-lg border border-slate-200 dark:border-slate-800">
                    {ind.currentValue}
                  </p>

                  {ind.reviewerNotes && (
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5 pt-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                      <span>Reviewer Note: {ind.reviewerNotes}</span>
                    </div>
                  )}
                </div>

                {/* Evidence & Action Buttons */}
                <div className="md:col-span-4 p-3.5 bg-slate-50 dark:bg-slate-900/60 rounded-xl flex flex-col justify-between space-y-3">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                      Evidence & Assurance
                    </span>
                    {ind.evidenceAttached ? (
                      <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                        <FileUp className="w-3.5 h-3.5 flex-shrink-0" />
                        <span className="truncate">{ind.evidenceAttached}</span>
                      </div>
                    ) : (
                      <span className="text-slate-400 text-xs italic">No evidence required or pending</span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t border-slate-200/80 dark:border-slate-800">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => setEditingIndicator(ind)}
                      disabled={!canEditData}
                    >
                      Edit Response
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => addToast('Evidence Viewer', `Displaying proof for ${ind.code}`, 'info')}
                      icon={<Eye className="w-3.5 h-3.5" />}
                    />
                  </div>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Edit Indicator Response Modal */}
      {editingIndicator && (
        <Modal
          isOpen={!!editingIndicator}
          onClose={() => setEditingIndicator(null)}
          title={`Edit Response for ${editingIndicator.code}`}
          subtitle={editingIndicator.question}
          maxWidth="lg"
          footer={
            <>
              <Button variant="outline" size="sm" onClick={() => setEditingIndicator(null)}>
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  const inputVal = (document.getElementById('edit-response-input') as HTMLTextAreaElement)?.value;
                  handleSaveIndicator(editingIndicator.code, inputVal);
                }}
              >
                Save & Validate
              </Button>
            </>
          }
        >
          <div className="space-y-3 text-xs">
            <div>
              <label className="block font-semibold mb-1">Reported Value / Narrative Response</label>
              <textarea
                id="edit-response-input"
                defaultValue={editingIndicator.currentValue}
                rows={4}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-100"
              />
            </div>
            <div>
              <label className="block font-semibold mb-1">Attach Verification File</label>
              <input
                type="text"
                defaultValue={editingIndicator.evidenceAttached || 'Supporting_Evidence_Verification.pdf'}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-100"
              />
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
