import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { 
  AlertTriangle, 
  Search, 
  Filter, 
  MessageSquare, 
  CheckCircle2, 
  Clock, 
  ExternalLink, 
  Building2, 
  FileText,
  Check,
  ArrowRight,
  ShieldAlert,
  Send
} from 'lucide-react';
import { Card, CardHeader } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { StatusBadge } from '../components/common/StatusBadge';
import { Modal } from '../components/common/Modal';
import { reviewsApi, projectsApi } from '../api';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { ReviewRequest } from '../types';

export const CorrectionRequests: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToast } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedPriority, setSelectedPriority] = useState('all');
  const [selectedSection, setSelectedSection] = useState('all');

  // Thread Modal state
  const [threadModalOpen, setThreadModalOpen] = useState(false);
  const [activeReviewThread, setActiveReviewThread] = useState<ReviewRequest | null>(null);
  const [resolutionNote, setResolutionNote] = useState('');

  // Load all review requests
  const { data: reviews = [], refetch: refetchReviews } = useQuery({
    queryKey: ['reviews'],
    queryFn: () => reviewsApi.getReviews(),
  });

  // Filter reviews
  const filteredReviews = useMemo(() => {
    return reviews.filter(r => {
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchMetric = r.metric.toLowerCase().includes(q);
        const matchProj = (r.projectName || '').toLowerCase().includes(q) || (r.projectCode || '').toLowerCase().includes(q);
        const matchComment = r.comment.toLowerCase().includes(q);
        if (!matchMetric && !matchProj && !matchComment) return false;
      }
      if (selectedStatus !== 'all' && r.status !== selectedStatus) return false;
      if (selectedPriority !== 'all' && r.priority !== selectedPriority) return false;
      if (selectedSection !== 'all' && r.section.toLowerCase() !== selectedSection.toLowerCase()) return false;
      return true;
    });
  }, [reviews, searchQuery, selectedStatus, selectedPriority, selectedSection]);

  // Mutation: Mark Resolved
  const resolveMutation = useMutation({
    mutationFn: async ({ id, note }: { id: string; note: string }) => {
      return await reviewsApi.resolveReview(id, {
        status: 'RESOLVED',
        resolutionComment: note || 'Correction reviewed and accepted by BU Manager.',
        reviewerName: user?.name || 'Vikram Malhotra'
      });
    },
    onSuccess: () => {
      refetchReviews();
      setThreadModalOpen(false);
      addToast('Correction Resolved', 'Review item marked resolved and verified', 'success');
    }
  });

  const openCount = reviews.filter(r => r.status === 'CORRECTION_REQUESTED' || r.status === 'OPEN').length;
  const submittedCount = reviews.filter(r => r.status === 'CORRECTION_SUBMITTED').length;
  const resolvedCount = reviews.filter(r => r.status === 'RESOLVED' || r.status === 'APPROVED').length;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-amber-900/80 via-slate-900 to-[#1c180a] rounded-2xl p-6 text-white border border-amber-500/30 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30 mb-2">
            <AlertTriangle className="w-3.5 h-3.5" />
            Correction Tracking Registry
          </div>
          <h1 className="text-2xl font-bold tracking-tight font-heading m-0">
            Dispatched Correction Requests
          </h1>
          <p className="text-xs md:text-sm text-amber-100/80 mt-1 max-w-2xl">
            Monitor all field-level correction requests dispatched to Project Managers across your Business Unit. Track resubmitted data, review responses, and authorize resolutions.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/review-center')}
            icon={<ExternalLink className="w-4 h-4" />}
            className="bg-white/10 hover:bg-white/20 text-white border-white/20 text-xs"
          >
            Open Review Center
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4 border-l-4 border-l-amber-500">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Awaiting PM Correction</span>
            <span className="p-1.5 rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400">
              <Clock className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-amber-600 dark:text-amber-400">{openCount}</span>
            <span className="text-[11px] text-slate-500">Requests with Project Managers</span>
          </div>
        </Card>

        <Card className="p-4 border-l-4 border-l-blue-500">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Corrections Resubmitted</span>
            <span className="p-1.5 rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400">
              <MessageSquare className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-blue-600 dark:text-blue-400">{submittedCount}</span>
            <span className="text-[11px] text-blue-600 font-medium">Ready for BU acceptance</span>
          </div>
        </Card>

        <Card className="p-4 border-l-4 border-l-emerald-500">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Resolved & Approved</span>
            <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400">{resolvedCount}</span>
            <span className="text-[11px] text-slate-500">Audit trail preserved</span>
          </div>
        </Card>
      </div>

      {/* Filter Toolbar */}
      <div className="p-4 bg-white dark:bg-[#0f1714] border border-slate-200/80 dark:border-slate-800 rounded-xl flex flex-wrap items-center justify-between gap-3 shadow-xs">
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 mr-1">
            <Filter className="w-4 h-4 text-amber-600" />
            <span>Filter Requests:</span>
          </div>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200"
          >
            <option value="all">All Statuses</option>
            <option value="CORRECTION_REQUESTED">Correction Requested</option>
            <option value="CORRECTION_SUBMITTED">Correction Submitted</option>
            <option value="RESOLVED">Resolved</option>
            <option value="APPROVED">Approved</option>
          </select>

          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200"
          >
            <option value="all">All Priorities</option>
            <option value="Critical">Critical</option>
            <option value="High">High Priority</option>
            <option value="Medium">Medium Priority</option>
            <option value="Low">Low Priority</option>
          </select>

          <select
            value={selectedSection}
            onChange={(e) => setSelectedSection(e.target.value)}
            className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200"
          >
            <option value="all">All Sections</option>
            <option value="environmental">Environmental</option>
            <option value="social">Social</option>
            <option value="governance">Governance</option>
            <option value="evidence">Evidence</option>
          </select>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search metric or project..."
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-amber-500"
          />
        </div>
      </div>

      {/* Requests List */}
      <div className="space-y-3">
        {filteredReviews.length === 0 ? (
          <Card className="p-8 text-center text-slate-400">
            <AlertTriangle className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">No correction requests found</p>
            <p className="text-xs text-slate-500 mt-1">Try adjusting the filters above.</p>
          </Card>
        ) : (
          filteredReviews.map((r) => {
            const isSubmitted = r.status === 'CORRECTION_SUBMITTED';
            const isResolved = r.status === 'RESOLVED' || r.status === 'APPROVED';

            return (
              <Card 
                key={r.id} 
                className={`p-4 transition-all ${
                  isSubmitted ? 'border-blue-400 bg-blue-50/15' :
                  isResolved ? 'border-emerald-300 dark:border-emerald-800/80 bg-emerald-50/10' :
                  'border-amber-300 dark:border-amber-800/80 bg-amber-50/10'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono font-bold text-xs px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                        {r.projectCode || 'PRJ'}
                      </span>
                      <span className="font-bold text-sm text-slate-900 dark:text-slate-100">
                        {r.projectName}
                      </span>
                      <span className="text-slate-300 dark:text-slate-700">•</span>
                      <span className="text-xs font-semibold text-teal-700 dark:text-teal-400">
                        {r.section} → {r.category} → {r.metric}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        r.priority === 'Critical' ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300' :
                        r.priority === 'High' ? 'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200' :
                        'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                      }`}>
                        {r.priority} Priority
                      </span>
                      <span className="font-mono text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                        {r.status}
                      </span>
                    </div>

                    <p className="text-xs text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900/60 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 italic">
                      Reviewer Note: "{r.comment}"
                    </p>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                      <span>Submitted Value: <strong className="font-mono text-slate-900 dark:text-slate-100">{r.currentValue}</strong></span>
                      <span>•</span>
                      <span>Assignee: <strong>{r.assigneeName}</strong></span>
                      <span>•</span>
                      <span>Dispatched: {r.createdAt}</span>
                    </div>

                    {/* Latest Response if any */}
                    {r.thread && r.thread.length > 1 && (
                      <div className="pt-1.5 text-xs text-blue-700 dark:text-blue-300">
                        <strong>Latest Response from {r.thread[r.thread.length - 1].author}:</strong> "{r.thread[r.thread.length - 1].message}"
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setActiveReviewThread(r);
                        setResolutionNote('');
                        setThreadModalOpen(true);
                      }}
                      icon={<MessageSquare className="w-3.5 h-3.5" />}
                      className="text-xs"
                    >
                      View Thread ({r.thread?.length || 1})
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => navigate(`/review-center/${r.projectId}`)}
                      icon={<ExternalLink className="w-3.5 h-3.5" />}
                      className="bg-teal-600 hover:bg-teal-700 text-white text-xs"
                    >
                      Open Workspace
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>

      {/* Review Thread Modal */}
      <Modal
        isOpen={threadModalOpen}
        onClose={() => setThreadModalOpen(false)}
        title={`Review Thread — ${activeReviewThread?.metric || ''}`}
        subtitle={`${activeReviewThread?.projectName} • ${activeReviewThread?.section} → ${activeReviewThread?.category}`}
        maxWidth="lg"
      >
        <div className="space-y-4 text-xs">
          <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
            {activeReviewThread?.thread?.map((msg, idx) => (
              <div 
                key={idx}
                className={`p-3 rounded-xl border ${
                  msg.role.includes('Business Unit') 
                    ? 'border-amber-200 dark:border-amber-800 bg-amber-50/20 dark:bg-amber-950/20' 
                    : 'border-blue-200 dark:border-blue-800 bg-blue-50/20 dark:bg-blue-950/20'
                }`}
              >
                <div className="flex items-center justify-between font-semibold text-slate-800 dark:text-slate-200 mb-1">
                  <span>{msg.author} ({msg.role})</span>
                  <span className="text-[10px] text-slate-400 font-normal">{msg.timestamp}</span>
                </div>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                  {msg.message}
                </p>
                {msg.attachment && (
                  <div className="flex items-center gap-1.5 text-[11px] text-teal-600 font-medium pt-1">
                    <FileText className="w-3.5 h-3.5" />
                    <span>Attached Document: {msg.attachment}</span>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-2">
            <label className="block font-semibold text-slate-700 dark:text-slate-300">
              Resolution Action Note:
            </label>
            <textarea
              rows={2}
              value={resolutionNote}
              onChange={(e) => setResolutionNote(e.target.value)}
              placeholder="Enter resolution notes..."
              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
            />
            <div className="flex items-center justify-end gap-2 pt-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setThreadModalOpen(false)}
              >
                Close
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  if (!activeReviewThread) return;
                  resolveMutation.mutate({
                    id: activeReviewThread.id,
                    note: resolutionNote || 'Correction accepted and resolved by BU Manager.'
                  });
                }}
                icon={<CheckCircle2 className="w-3.5 h-3.5" />}
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                Accept & Resolve
              </Button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default CorrectionRequests;
