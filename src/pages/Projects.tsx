import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FolderKanban, 
  Search, 
  Filter, 
  Plus, 
  MapPin, 
  ExternalLink, 
  FileText, 
  CheckCircle, 
  AlertTriangle,
  Layers,
  ChevronRight,
  ArrowRight,
  FileEdit,
  CheckCircle2,
  Sparkles,
  FileSpreadsheet
} from 'lucide-react';
import { DataTable, Column } from '../components/common/DataTable';
import { Button } from '../components/common/Button';
import { StatusBadge } from '../components/common/StatusBadge';
import { ProgressBar } from '../components/common/ProgressBar';
import { Modal } from '../components/common/Modal';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { projectsApi, organizationApi } from '../api';

export const Projects: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { addToast } = useApp();
  const { user } = useAuth();
  const role = user?.role || 'project_user';

  const [selectedSub, setSelectedSub] = useState<string>('all');
  const [selectedBU, setSelectedBU] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);

  // New project form state
  const [newCode, setNewCode] = useState('');
  const [newName, setNewName] = useState('');
  const [newLocation, setNewLocation] = useState('');
  const [newState, setNewState] = useState('');
  const [newSubId, setNewSubId] = useState('sub-1');
  const [newBuId, setNewBuId] = useState('bu-1');

  // Load from backend API
  const { data: projects = [], isLoading: loadingProjects } = useQuery({
    queryKey: ['projects'],
    queryFn: projectsApi.getProjects,
  });

  const { data: orgData } = useQuery({
    queryKey: ['organization'],
    queryFn: organizationApi.getOrganization,
  });

  const subsidiaries = orgData?.subsidiaries || [];
  const businessUnits = orgData?.businessUnits || [];

  // Create project mutation
  const createMutation = useMutation({
    mutationFn: async () => {
      const selectedSubObj = subsidiaries.find(s => s.id === newSubId);
      const selectedBuObj = businessUnits.find(b => b.id === newBuId);

      return await projectsApi.createProject({
        code: newCode || `PRJ-${Math.floor(100 + Math.random() * 900)}`,
        name: newName,
        location: newLocation,
        state: newState,
        subsidiaryId: newSubId,
        subsidiaryName: selectedSubObj?.name || 'Apex Heavy Engineering & Construction',
        businessUnitId: newBuId,
        businessUnitName: selectedBuObj?.name || 'Renewables & Power Transmission',
      });
    },
    onSuccess: (newProj) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      setIsNewProjectModalOpen(false);
      setNewCode('');
      setNewName('');
      setNewLocation('');
      setNewState('');
      addToast('Project Registered', `Created ${newProj.name} in database`, 'success');
      navigate(`/projects/${newProj.id}/overview`);
    }
  });

  const filteredProjects = useMemo(() => {
    const list = Array.isArray(projects) ? projects : [];
    return list.filter(p => {
      if (selectedSub !== 'all' && p.subsidiaryId !== selectedSub) return false;
      if (selectedBU !== 'all' && p.businessUnitId !== selectedBU) return false;
      if (selectedStatus !== 'all' && p.approvalStatus !== selectedStatus) return false;
      return true;
    });
  }, [projects, selectedSub, selectedBU, selectedStatus]);

  const columns: Column<any>[] = [
    {
      key: 'code',
      header: 'Project Code',
      sortable: true,
      render: (row) => (
        <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
          {row.code}
        </span>
      ),
      width: '110px'
    },
    {
      key: 'name',
      header: 'Project Name & Unit',
      sortable: true,
      render: (row) => (
        <div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/projects/${row.id}/overview`);
            }}
            className="font-bold text-slate-900 dark:text-slate-100 hover:text-emerald-600 transition-colors text-left"
          >
            {row.name}
          </button>
          <div className="text-[11px] text-slate-400">
            {row.businessUnitName} • {row.leadPerson || 'Project Lead'}
          </div>
        </div>
      )
    },
    {
      key: 'location',
      header: 'Location & State',
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
          <MapPin className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
          <span>{row.location}, {row.state}</span>
        </div>
      )
    },
    {
      key: 'esgCompletion',
      header: 'ESG Data',
      sortable: true,
      render: (row) => (
        <div className="w-28">
          <ProgressBar progress={row.esgCompletion || 0} size="sm" showPercentage />
        </div>
      )
    },
    {
      key: 'approvalStatus',
      header: 'Stage Status',
      sortable: true,
      render: (row) => <StatusBadge status={row.approvalStatus as any} size="sm" />
    },
    {
      key: 'action',
      header: 'Actions',
      render: (row) => (
        <div className="flex items-center gap-1.5">
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/projects/${row.id}/overview`);
            }}
          >
            Overview
          </Button>

          {role === 'bu_manager' ? (
            <Button
              variant="primary"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/projects/${row.id}/review`);
              }}
              icon={<CheckCircle2 className="w-3.5 h-3.5" />}
              className="bg-teal-600 hover:bg-teal-700 text-white"
            >
              Review Submission
            </Button>
          ) : role === 'project_user' ? (
            <Button
              variant="primary"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/projects/${row.id}/esg/environmental`);
              }}
              icon={<FileEdit className="w-3.5 h-3.5" />}
            >
              Enter ESG
            </Button>
          ) : role === 'esg_team' ? (
            <Button
              variant="primary"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/projects/${row.id}/brsr`);
              }}
              icon={<FileSpreadsheet className="w-3.5 h-3.5" />}
            >
              BRSR Linkage
            </Button>
          ) : (
            <Button
              variant="primary"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/projects/${row.id}/overview`);
              }}
            >
              View Site
            </Button>
          )}
        </div>
      ),
      width: '210px'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 font-heading m-0">
            {role === 'project_user' 
              ? 'My Projects' 
              : role === 'bu_manager' 
              ? 'BU Projects & Submissions' 
              : role === 'esg_team' 
              ? 'Consolidated Projects Oversight' 
              : 'Projects Management Center'}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {role === 'project_user'
              ? 'Select your assigned project to enter ESG metrics, upload utility invoices, run AI validations, and submit to BU Manager.'
              : role === 'bu_manager'
              ? 'Review submitted periodic disclosures, inspect AI anomaly flags and utility invoices, and approve or request corrections.'
              : role === 'esg_team'
              ? 'Track verified operational project telemetry mapped directly into SEBI BRSR Section C Principle 1-9 disclosures.'
              : 'Tracking ESG reporting status, validation integrity, and approvals across operational sites.'}
          </p>
        </div>

        {role !== 'project_user' && (
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsNewProjectModalOpen(true)}
            icon={<Plus className="w-3.5 h-3.5" />}
          >
            Add New Project
          </Button>
        )}
      </div>

      {/* Filter Toolbar */}
      <div className="p-4 bg-white dark:bg-[#0f1714] border border-slate-200/80 dark:border-slate-800 rounded-xl flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300">
          <Filter className="w-4 h-4 text-emerald-600" />
          <span>Filters:</span>
        </div>

        {/* Subsidiary */}
        <select
          value={selectedSub}
          onChange={(e) => {
            setSelectedSub(e.target.value);
            setSelectedBU('all');
          }}
          className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200"
        >
          <option value="all">All Subsidiaries</option>
          {subsidiaries.map(s => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>

        {/* BU */}
        <select
          value={selectedBU}
          onChange={(e) => setSelectedBU(e.target.value)}
          className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200"
        >
          <option value="all">All Business Units</option>
          {businessUnits.filter(bu => selectedSub === 'all' || bu.subsidiaryId === selectedSub).map(b => (
            <option key={b.id} value={b.id}>{b.name}</option>
          ))}
        </select>

        {/* Status */}
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200"
        >
          <option value="all">All Approval Stages</option>
          <option value="draft">Draft</option>
          <option value="submitted">Submitted</option>
          <option value="under_review">Under Review</option>
          <option value="correction_required">Correction Required</option>
          <option value="approved">Approved</option>
        </select>

        {(selectedSub !== 'all' || selectedBU !== 'all' || selectedStatus !== 'all') && (
          <button
            onClick={() => {
              setSelectedSub('all');
              setSelectedBU('all');
              setSelectedStatus('all');
            }}
            className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline font-semibold ml-auto"
          >
            Reset Filters
          </button>
        )}
      </div>

      {/* Projects DataTable */}
      <DataTable
        data={filteredProjects}
        columns={columns}
        keyExtractor={(p) => p.id}
        searchPlaceholder="Search project code, name, location..."
        searchableKeys={['code', 'name', 'location', 'leadPerson', 'businessUnitName']}
        onRowClick={(row) => navigate(`/projects/${row.id}/overview`)}
      />

      {/* New Project Modal */}
      <Modal
        isOpen={isNewProjectModalOpen}
        onClose={() => setIsNewProjectModalOpen(false)}
        title="Register New Operational Facility / Project"
        subtitle="Provision site within Group ESG reporting boundary"
        maxWidth="lg"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setIsNewProjectModalOpen(false)}>
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={() => createMutation.mutate()}
              loading={createMutation.isPending}
            >
              Register Facility
            </Button>
          </>
        }
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div>
            <label className="block font-semibold mb-1">Project Code</label>
            <input 
              type="text" 
              value={newCode}
              onChange={(e) => setNewCode(e.target.value)}
              placeholder="e.g. PRJ-008" 
              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-mono" 
            />
          </div>
          <div>
            <label className="block font-semibold mb-1">Project Name</label>
            <input 
              type="text" 
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="e.g. Solar Wind Hybrid Park" 
              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs" 
            />
          </div>
          <div>
            <label className="block font-semibold mb-1">Subsidiary</label>
            <select 
              value={newSubId}
              onChange={(e) => setNewSubId(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
            >
              {subsidiaries.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block font-semibold mb-1">Business Unit</label>
            <select 
              value={newBuId}
              onChange={(e) => setNewBuId(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
            >
              {businessUnits.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block font-semibold mb-1">Location City / Site</label>
            <input 
              type="text" 
              value={newLocation}
              onChange={(e) => setNewLocation(e.target.value)}
              placeholder="e.g. Khavda" 
              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs" 
            />
          </div>
          <div>
            <label className="block font-semibold mb-1">State</label>
            <input 
              type="text" 
              value={newState}
              onChange={(e) => setNewState(e.target.value)}
              placeholder="e.g. Gujarat" 
              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs" 
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Projects;
