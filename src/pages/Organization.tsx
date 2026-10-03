import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Building2, 
  ChevronRight, 
  ChevronDown, 
  FolderKanban, 
  Layers, 
  MapPin, 
  Plus, 
  CheckCircle2, 
  User, 
  Leaf, 
  FileSpreadsheet,
  Edit3,
  ExternalLink
} from 'lucide-react';
import { Card, CardHeader } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { ProgressBar } from '../components/common/ProgressBar';
import { StatusBadge } from '../components/common/StatusBadge';
import { Modal } from '../components/common/Modal';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { MOCK_SUBSIDIARIES, MOCK_BUSINESS_UNITS, MOCK_PROJECTS } from '../services/mockData';

export const Organization: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToast } = useApp();

  const [expandedSubs, setExpandedSubs] = useState<Record<string, boolean>>({
    'sub-1': true,
    'sub-2': true,
    'sub-3': false,
  });

  const [expandedBUs, setExpandedBUs] = useState<Record<string, boolean>>({
    'bu-1': true,
    'bu-2': true,
  });

  // Selected node for right-side details panel
  const [selectedNode, setSelectedNode] = useState<{
    type: 'group' | 'subsidiary' | 'bu' | 'project';
    id: string;
    data: any;
  }>({
    type: 'group',
    id: 'grp-1',
    data: {
      name: 'Apex Infrastructure Group Limited',
      cin: 'L99999MH2002PLC138924',
      subsidiariesCount: MOCK_SUBSIDIARIES.length,
      totalProjects: MOCK_PROJECTS.length,
      headquarters: 'Bandra-Kurla Complex, Mumbai, Maharashtra',
      esgScore: 92.4,
      brsrScore: 87.0,
      leadOfficer: 'Arvind Mehra (Group Executive VP)'
    }
  });

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'subsidiary' | 'bu' | 'project'>('subsidiary');

  const toggleSub = (id: string) => {
    setExpandedSubs(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleBU = (id: string) => {
    setExpandedBUs(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleOpenAdd = (type: 'subsidiary' | 'bu' | 'project') => {
    setModalType(type);
    setIsAddModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 font-heading m-0">
            Organization & Hierarchy Management
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Enterprise boundary: Group → Subsidiary → Business Unit → Projects & Facilities.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleOpenAdd('bu')}
            icon={<Plus className="w-3.5 h-3.5" />}
          >
            Add Business Unit
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => handleOpenAdd('project')}
            icon={<Plus className="w-3.5 h-3.5" />}
          >
            Add Project
          </Button>
        </div>
      </div>

      {/* Main 2-Column Hierarchy Explorer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Hierarchy Tree (7 cols) */}
        <div className="lg:col-span-7 space-y-3">
          {/* Group Node */}
          <div
            onClick={() => setSelectedNode({
              type: 'group',
              id: 'grp-1',
              data: {
                name: 'Apex Infrastructure Group Limited',
                cin: 'L99999MH2002PLC138924',
                subsidiariesCount: MOCK_SUBSIDIARIES.length,
                totalProjects: MOCK_PROJECTS.length,
                headquarters: 'Bandra-Kurla Complex, Mumbai, Maharashtra',
                esgScore: 92.4,
                brsrScore: 87.0,
                leadOfficer: 'Arvind Mehra (Group Executive VP)'
              }
            })}
            className={`p-4 rounded-xl border transition-all cursor-pointer ${
              selectedNode.type === 'group'
                ? 'bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-500 shadow-sm'
                : 'bg-white dark:bg-[#0f1714] border-slate-200 dark:border-slate-800 hover:border-emerald-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-xs">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 font-heading">
                      Apex Infrastructure Group Limited
                    </h3>
                    <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300">
                      Listed Entity
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    CIN: L99999MH2002PLC138924 • Group Holding Body
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">92.4% ESG</span>
                <span className="text-[10px] text-slate-400 block">{MOCK_SUBSIDIARIES.length} Subsidiaries</span>
              </div>
            </div>
          </div>

          {/* Subsidiaries List */}
          <div className="pl-4 sm:pl-6 space-y-3 border-l-2 border-slate-200 dark:border-slate-800 ml-5">
            {MOCK_SUBSIDIARIES.map(sub => {
              const isExpanded = expandedSubs[sub.id];
              const isSelected = selectedNode.id === sub.id;
              const subBUs = MOCK_BUSINESS_UNITS.filter(bu => bu.subsidiaryId === sub.id);

              return (
                <div key={sub.id} className="space-y-2">
                  <div
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-teal-50/80 dark:bg-teal-950/40 border-teal-500 shadow-sm'
                        : 'bg-white dark:bg-[#0f1714] border-slate-200/90 dark:border-slate-800 hover:border-teal-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div
                        onClick={() => setSelectedNode({ type: 'subsidiary', id: sub.id, data: sub })}
                        className="flex items-center gap-2.5 flex-1 min-w-0"
                      >
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleSub(sub.id);
                          }}
                          className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                        >
                          {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                        </button>
                        <div className="w-8 h-8 rounded-lg bg-teal-50 dark:bg-teal-950 flex items-center justify-center text-teal-600 dark:text-teal-400 flex-shrink-0">
                          <Layers className="w-4 h-4" />
                        </div>
                        <div className="truncate">
                          <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                            {sub.name}
                          </h4>
                          <p className="text-[10px] text-slate-400">
                            Code: {sub.code} • Admin: {sub.leadAdmin}
                          </p>
                        </div>
                      </div>

                      <div className="text-right flex-shrink-0 pl-2">
                        <span className="text-xs font-bold text-teal-600 dark:text-teal-400">{sub.esgCompletion}%</span>
                        <span className="text-[10px] text-slate-400 block">{sub.projectsCount} Projects</span>
                      </div>
                    </div>
                  </div>

                  {/* Business Units under Subsidiary */}
                  {isExpanded && (
                    <div className="pl-4 sm:pl-6 space-y-2 border-l-2 border-teal-200/60 dark:border-teal-900/60 ml-4">
                      {subBUs.map(bu => {
                        const isBuExpanded = expandedBUs[bu.id];
                        const isBuSelected = selectedNode.id === bu.id;
                        const buProjects = MOCK_PROJECTS.filter(p => p.businessUnitId === bu.id);

                        return (
                          <div key={bu.id} className="space-y-2">
                            <div
                              className={`p-3 rounded-lg border transition-all cursor-pointer ${
                                isBuSelected
                                  ? 'bg-blue-50/80 dark:bg-blue-950/40 border-blue-500'
                                  : 'bg-white dark:bg-[#0f1714] border-slate-200/80 dark:border-slate-800 hover:border-blue-300'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <div
                                  onClick={() => setSelectedNode({ type: 'bu', id: bu.id, data: bu })}
                                  className="flex items-center gap-2 flex-1 min-w-0"
                                >
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      toggleBU(bu.id);
                                    }}
                                    className="p-0.5 rounded text-slate-400 hover:text-slate-600"
                                  >
                                    {isBuExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                                  </button>
                                  <FolderKanban className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
                                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                                    {bu.name}
                                  </span>
                                </div>
                                <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400">
                                  {bu.esgCompletion}%
                                </span>
                              </div>
                            </div>

                            {/* Projects under Business Unit */}
                            {isBuExpanded && (
                              <div className="pl-4 space-y-1.5 border-l-2 border-blue-200/50 dark:border-blue-900/50 ml-3">
                                {buProjects.map(proj => {
                                  const isProjSelected = selectedNode.id === proj.id;
                                  return (
                                    <div
                                      key={proj.id}
                                      onClick={() => setSelectedNode({ type: 'project', id: proj.id, data: proj })}
                                      className={`p-2.5 rounded-lg border transition-all cursor-pointer flex items-center justify-between ${
                                        isProjSelected
                                          ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500'
                                          : 'bg-white dark:bg-[#141f1b] border-slate-200/60 dark:border-slate-800/80 hover:border-emerald-300'
                                      }`}
                                    >
                                      <div className="flex items-center gap-2 min-w-0">
                                        <Leaf className="w-3 h-3 text-emerald-500 flex-shrink-0" />
                                        <span className="text-xs font-medium text-slate-800 dark:text-slate-200 truncate">
                                          {proj.name}
                                        </span>
                                      </div>
                                      <div className="flex items-center gap-2 flex-shrink-0">
                                        <StatusBadge status={proj.approvalStatus} size="sm" />
                                        <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                                          {proj.esgCompletion}%
                                        </span>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Details Panel (5 cols) */}
        <div className="lg:col-span-5">
          <Card className="sticky top-20">
            <CardHeader
              title="Hierarchy Node Details"
              subtitle={`Inspecting ${selectedNode.type.toUpperCase()} level configuration`}
              action={
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => addToast('Edit Mode Enabled', `Ready to update ${selectedNode.data.name}`, 'info')}
                  icon={<Edit3 className="w-3.5 h-3.5" />}
                >
                  Edit Node
                </Button>
              }
            />

            <div className="space-y-4 text-xs">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Node Name</span>
                <p className="text-sm font-bold text-slate-900 dark:text-slate-100 font-heading mt-0.5">
                  {selectedNode.data.name}
                </p>
              </div>

              {selectedNode.type === 'project' && (
                <>
                  <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 dark:bg-slate-900/60 rounded-lg">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Project Code</span>
                      <strong className="text-slate-800 dark:text-slate-200 font-mono">{selectedNode.data.code}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Site Location</span>
                      <strong className="text-slate-800 dark:text-slate-200 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-emerald-500" />
                        {selectedNode.data.location}
                      </strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Site ESG Lead</span>
                      <strong className="text-slate-800 dark:text-slate-200">{selectedNode.data.leadPerson}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Approval Status</span>
                      <StatusBadge status={selectedNode.data.approvalStatus} size="sm" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <ProgressBar value={selectedNode.data.esgCompletion} label="ESG Data Completion" showLabel variant="emerald" />
                    <ProgressBar value={selectedNode.data.brsrCompletion} label="BRSR Indicator Mapping" showLabel variant="teal" />
                  </div>
                </>
              )}

              {selectedNode.type === 'subsidiary' && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 dark:bg-slate-900/60 rounded-lg">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Subsidiary Code</span>
                      <strong className="text-slate-800 dark:text-slate-200 font-mono">{selectedNode.data.code}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Subsidiary Admin</span>
                      <strong className="text-slate-800 dark:text-slate-200">{selectedNode.data.leadAdmin}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Active Units</span>
                      <strong className="text-slate-800 dark:text-slate-200">{selectedNode.data.businessUnitsCount} BUs</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Projects Count</span>
                      <strong className="text-slate-800 dark:text-slate-200">{selectedNode.data.projectsCount} Sites</strong>
                    </div>
                  </div>

                  <ProgressBar value={selectedNode.data.esgCompletion} label="Subsidiary ESG Readiness" showLabel variant="emerald" />
                </div>
              )}

              {selectedNode.type === 'group' && (
                <div className="space-y-3">
                  <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-lg space-y-2">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Headquarters:</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedNode.data.headquarters}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Compliance Lead:</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedNode.data.leadOfficer}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Reporting Scope:</span>
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400">Top 1000 Listed Entity</span>
                    </div>
                  </div>

                  <ProgressBar value={selectedNode.data.esgScore} label="Overall ESG Coverage" showLabel variant="emerald" />
                  <ProgressBar value={selectedNode.data.brsrScore} label="BRSR Principles Readiness" showLabel variant="teal" />
                </div>
              )}

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-2">
                {selectedNode.type === 'subsidiary' && (
                  <Button
                    variant="primary"
                    size="sm"
                    fullWidth
                    onClick={() => navigate(`/subsidiaries/${selectedNode.id}`)}
                    icon={<ExternalLink className="w-3.5 h-3.5" />}
                  >
                    Open Subsidiary Dossier (/subsidiaries/{selectedNode.id})
                  </Button>
                )}
                {selectedNode.type === 'bu' && (
                  <Button
                    variant="primary"
                    size="sm"
                    fullWidth
                    onClick={() => navigate(`/business-units/${selectedNode.id}`)}
                    icon={<ExternalLink className="w-3.5 h-3.5" />}
                  >
                    Open Business Unit (/business-units/{selectedNode.id})
                  </Button>
                )}
                {selectedNode.type === 'project' && (
                  <Button
                    variant="primary"
                    size="sm"
                    fullWidth
                    onClick={() => navigate(`/projects/${selectedNode.id}/overview`)}
                    icon={<ExternalLink className="w-3.5 h-3.5" />}
                  >
                    Open Project Workspace (/projects/{selectedNode.id})
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  fullWidth
                  onClick={() => addToast('Entity Audited', 'All boundary checks validated successfully', 'success')}
                  icon={<CheckCircle2 className="w-3.5 h-3.5" />}
                >
                  Verify Boundary Scope
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Add Entity Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title={`Add New ${modalType.toUpperCase()}`}
        subtitle="Expand reporting boundary with full organizational inheritance"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={() => {
                setIsAddModalOpen(false);
                addToast('Entity Added', `New ${modalType} successfully added to reporting boundary`, 'success');
              }}
            >
              Confirm & Save
            </Button>
          </>
        }
      >
        <div className="space-y-3 text-xs">
          <div>
            <label className="block font-semibold mb-1">Entity Name</label>
            <input
              type="text"
              placeholder={`e.g. Apex Wind Energy Systems`}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
            />
          </div>
          <div>
            <label className="block font-semibold mb-1">Entity Code</label>
            <input
              type="text"
              placeholder="e.g. AWES-01"
              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
            />
          </div>
          <div>
            <label className="block font-semibold mb-1">Assigned Lead / Admin</label>
            <input
              type="text"
              placeholder="Enter designated EHS lead"
              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};
