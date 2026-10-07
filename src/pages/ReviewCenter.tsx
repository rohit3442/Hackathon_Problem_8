import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { 
  FileCheck2, 
  Search, 
  Filter, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  ArrowRight, 
  Building2, 
  ChevronRight,
  ShieldCheck,
  Eye,
  FileText,
  UserCheck
} from 'lucide-react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { StatusBadge } from '../components/common/StatusBadge';
import { ProgressBar } from '../components/common/ProgressBar';
import { projectsApi, reviewsApi, organizationApi } from '../api';
import { isAwaitingBUReview, isPastBUReview } from '../utils/workflow';
import { useAuth } from '../context/AuthContext';

export const ReviewCenter: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedBU, setSelectedBU] = useState('all');

  // Load projects
  const { data: projects = [], isLoading: loadingProjects } = useQuery({
    queryKey: ['projects'],
    queryFn: projectsApi.getProjects,
  });

  // Load all review requests
  const { data: reviews = [] } = useQuery({
    queryKey: ['reviews'],
    queryFn: () => reviewsApi.getReviews(),
  });

  // Load organization for BU filter
  const { data: orgData } = useQuery({
    queryKey: ['organization'],
    queryFn: organizationApi.getOrganization,
  });
  const businessUnits = orgData?.businessUnits || [];

  // Filter projects awaiting or undergoing BU review
  const filteredSubmissions = useMemo(() => {
    return projects.filter(p => {
      // Filter by text search
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchName = p.name.toLowerCase().includes(q);
        const matchCode = p.code.toLowerCase().includes(q);
        const matchBU = (p.businessUnitName || '').toLowerCase().includes(q);
        if (!matchName && !matchCode && !matchBU) return false;
      }
      // Filter by Period
      if (selectedPeriod !== 'all' && p.reportingYear !== selectedPeriod) return false;
      // Filter by BU
      if (selectedBU !== 'all' && p.businessUnitId !== selectedBU) return false;
      // Filter by Status
      if (selectedStatus !== 'all') {
        if (selectedStatus === 'pending' && !isAwaitingBUReview(p.approvalStatus)) return false;
        if (selectedStatus === 'correction' && p.approvalStatus !== 'correction_required') return false;
        if (selectedStatus === 'approved' && !isPastBUReview(p.approvalStatus)) return false;
      }
      return true;
    });
  }, [projects, searchQuery, selectedPeriod, selectedStatus, selectedBU]);

  // Aggregate Stats
  const pendingCount = projects.filter(p => isAwaitingBUReview(p.approvalStatus)).length;
  const correctionCount = reviews.filter(r => r.status === 'CORRECTION_REQUESTED' || r.status === 'CORRECTION_SUBMITTED').length;
  const resolvedCount = reviews.filter(r => r.status === 'RESOLVED' || r.status === 'APPROVED').length;
  const approvedCount = projects.filter(p => isPastBUReview(p.approvalStatus)).length;

  return (
    <div className="space-y-6">
      {/* Top Welcome / Header Banner */}
      <div className="bg-gradient-to-r from-teal-900 via-slate-900 to-[#0c1f17] rounded-2xl p-6 text-white border border-teal-500/30 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-500/20 text-teal-300 border border-teal-500/30 mb-2">
            <FileCheck2 className="w-3.5 h-3.5" />
            Dedicated BU Review Center
          </div>
          <h1 className="text-2xl font-bold tracking-tight font-heading m-0">
            ESG Review & Quality Assurance Center
          </h1>
          <p className="text-xs md:text-sm text-teal-100/80 mt-1 max-w-2xl">
            Logged in as <strong>{user?.name || 'Vikram Malhotra (BU Manager)'}</strong>. Review submitted facility disclosures in read-only mode, inspect AI anomalies against baselines, dispatch targeted field-level correction requests, and authorize verified packages for Subsidiary Admin signoff.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/correction-requests')}
            icon={<AlertTriangle className="w-4 h-4 text-amber-400" />}
            className="bg-white/10 hover:bg-white/20 text-white border-white/20 text-xs"
          >
            All Correction Requests ({correctionCount})
          </Button>
        </div>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 border-l-4 border-l-teal-500">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Pending BU Review
            </span>
            <span className="p-1.5 rounded-lg bg-teal-50 text-teal-600 dark:bg-teal-950 dark:text-teal-400">
              <Clock className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-slate-900 dark:text-slate-100">
              {pendingCount}
            </span>
            <span className="text-[11px] text-teal-600 font-medium">Submissions awaiting signoff</span>
          </div>
        </Card>

        <Card className="p-4 border-l-4 border-l-amber-500">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Active Correction Requests
            </span>
            <span className="p-1.5 rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400">
              <AlertTriangle className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-amber-600 dark:text-amber-400">
              {correctionCount}
            </span>
            <span className="text-[11px] text-slate-500">Dispatched to Project Managers</span>
          </div>
        </Card>

        <Card className="p-4 border-l-4 border-l-emerald-500">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Resolved Review Items
            </span>
            <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
              {resolvedCount}
            </span>
            <span className="text-[11px] text-slate-500">Verified & accepted</span>
          </div>
        </Card>

        <Card className="p-4 border-l-4 border-l-blue-500">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              BU Approved Packages
            </span>
            <span className="p-1.5 rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400">
              <ShieldCheck className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-blue-600 dark:text-blue-400">
              {approvedCount}
            </span>
            <span className="text-[11px] text-slate-500">Advanced to Subsidiary Admin</span>
          </div>
        </Card>
      </div>

      {/* Filter Toolbar */}
      <div className="p-4 bg-white dark:bg-[#0f1714] border border-slate-200/80 dark:border-slate-800 rounded-xl flex flex-wrap items-center justify-between gap-3 shadow-xs">
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 mr-1">
            <Filter className="w-4 h-4 text-teal-600" />
            <span>Filters:</span>
          </div>

          {/* Reporting Period */}
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200"
          >
            <option value="all">All Reporting Periods</option>
            <option value="FY 2025-26">FY 2025-26</option>
            <option value="FY 2024-25">FY 2024-25</option>
          </select>

          {/* Business Unit */}
          <select
            value={selectedBU}
            onChange={(e) => setSelectedBU(e.target.value)}
            className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200"
          >
            <option value="all">All Business Units</option>
            {businessUnits.map(b => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200"
          >
            <option value="all">All Submission Statuses</option>
            <option value="pending">Under Review / Pending Signoff</option>
            <option value="correction">Correction Requested</option>
            <option value="approved">Approved & Forwarded</option>
          </select>
        </div>

        {/* Search Bar */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search project or code..."
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-teal-500"
          />
        </div>
      </div>

      {/* Submissions Table / Cards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <span>Submitted Facility Disclosures</span>
            <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              {filteredSubmissions.length}
            </span>
          </h2>
          <span className="text-xs text-slate-500">Stage 2 Review Queue</span>
        </div>

        {filteredSubmissions.length === 0 ? (
          <Card className="p-8 text-center text-slate-400">
            <FileCheck2 className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">No submissions matching criteria</p>
            <p className="text-xs text-slate-500 mt-1">Try adjusting the filter toolbar or search query.</p>
          </Card>
        ) : (
          <div className="space-y-3">
            {filteredSubmissions.map((p) => {
              // Find related review requests for this project
              const projectReviews = reviews.filter(r => r.projectId === p.id || r.projectCode === p.code);
              const activeIssues = projectReviews.filter(r => r.status === 'CORRECTION_REQUESTED' || r.status === 'CORRECTION_SUBMITTED' || r.status === 'OPEN').length;
              const resolvedCount = projectReviews.filter(r => r.status === 'RESOLVED' || r.status === 'APPROVED').length;
              const totalItems = Math.max(projectReviews.length, 6);
              const reviewProgress = Math.round((resolvedCount / totalItems) * 100);

              const isAwaitingSignoff = isAwaitingBUReview(p.approvalStatus);
              const isCorrectionRequired = p.approvalStatus === 'correction_required';
              const isApproved = isPastBUReview(p.approvalStatus);

              return (
                <Card 
                  key={p.id}
                  className={`p-5 transition-all hover:border-teal-500/60 cursor-pointer ${
                    isCorrectionRequired ? 'border-amber-300 dark:border-amber-800/80 bg-amber-50/10' :
                    isAwaitingSignoff ? 'border-teal-300 dark:border-teal-800/80 bg-teal-50/10' : ''
                  }`}
                  onClick={() => navigate(`/review-center/${p.id}`)}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    {/* Left: Project Identity & Submitter */}
                    <div className="space-y-1.5 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono font-bold text-xs px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                          {p.code}
                        </span>
                        <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 font-heading">
                          {p.name}
                        </h3>
                        <StatusBadge status={p.approvalStatus as any} />
                        {activeIssues > 0 && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200">
                            <AlertTriangle className="w-3 h-3 text-amber-600" />
                            {activeIssues} {activeIssues === 1 ? 'Issue' : 'Issues'}
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-slate-500 dark:text-slate-400">
                        <span className="flex items-center gap-1">
                          <Building2 className="w-3.5 h-3.5 text-slate-400" />
                          {p.subsidiaryName} • {p.businessUnitName}
                        </span>
                        <span>•</span>
                        <span>Facility: <strong>{p.location}, {p.state}</strong></span>
                        <span>•</span>
                        <span>Reporting Period: <strong className="text-teal-700 dark:text-teal-300">{p.reportingYear}</strong></span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                          Submitted by: <strong>{p.leadPerson || 'Rajesh Verma (Project Manager)'}</strong>
                        </span>
                      </div>
                    </div>

                    {/* Middle: Review Status & Progress */}
                    <div className="w-full lg:w-48 space-y-1.5 flex-shrink-0">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-500">Review Items Checked</span>
                        <span className="font-mono font-bold text-teal-700 dark:text-teal-400">
                          {resolvedCount}/{totalItems} ({reviewProgress}%)
                        </span>
                      </div>
                      <ProgressBar progress={reviewProgress} size="sm" />
                      <div className="text-[10px] text-slate-400 flex justify-between">
                        <span>Stage 2 Review</span>
                        <span className="font-semibold text-slate-600 dark:text-slate-300">
                          {isApproved ? 'Approved by BU' : isCorrectionRequired ? 'Correction Sent' : 'Verification In-Progress'}
                        </span>
                      </div>
                    </div>

                    {/* Right: Action Button */}
                    <div className="flex items-center justify-end gap-2 flex-shrink-0">
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/review-center/${p.id}`);
                        }}
                        icon={<Eye className="w-4 h-4" />}
                        className="bg-teal-600 hover:bg-teal-700 text-white font-medium text-xs shadow-xs"
                      >
                        Open Review
                        <ArrowRight className="w-3.5 h-3.5 ml-1" />
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ReviewCenter;
