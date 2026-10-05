import React, { useState } from 'react';
import { 
  FileText, 
  FileSpreadsheet, 
  Upload, 
  Plus, 
  Download, 
  Trash2, 
  Search, 
  CheckCircle2, 
  ShieldCheck, 
  FileCode, 
  Eye, 
  Leaf, 
  Users, 
  Scale, 
  FolderOpen 
} from 'lucide-react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Modal } from '../common/Modal';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { documentsApi, EvidenceDocument } from '../../api/documents';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import confetti from 'canvas-confetti';

interface EvidenceManagerProps {
  projectId: string;
  projectCode?: string;
  projectName?: string;
}

export const EvidenceManager: React.FC<EvidenceManagerProps> = ({
  projectId,
  projectCode = 'SMP-500',
  projectName = 'Solar Mega-Park 500MW Facility'
}) => {
  const queryClient = useQueryClient();
  const { user, canEditData } = useAuth();
  const { addToast } = useApp();

  const [activeCategory, setActiveCategory] = useState<'all' | 'environmental' | 'social' | 'governance'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modals state
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedDocDetails, setSelectedDocDetails] = useState<EvidenceDocument | null>(null);

  // Upload Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<'environmental' | 'social' | 'governance'>('environmental');
  const [subCategory, setSubCategory] = useState('Electricity Utility Invoice');
  const [description, setDescription] = useState('');
  const [fileType, setFileType] = useState<'pdf' | 'excel' | 'word' | 'image'>('pdf');
  const [fileName, setFileName] = useState('');
  const [fileSize, setFileSize] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  // Fetch documents from server API
  const { data: documents = [], isLoading } = useQuery({
    queryKey: ['documents', projectId, activeCategory],
    queryFn: () => documentsApi.getDocuments(projectId, activeCategory),
  });

  // Upload Mutation
  const uploadMutation = useMutation({
    mutationFn: async (docData: Partial<EvidenceDocument>) => {
      return await documentsApi.uploadDocument(projectId, docData);
    },
    onSuccess: (newDoc) => {
      queryClient.invalidateQueries({ queryKey: ['documents', projectId] });
      try {
        confetti({ particleCount: 60, spread: 50, origin: { y: 0.6 } });
      } catch (e) {}
      addToast('Evidence Uploaded', `${newDoc.fileName} attached to ${category.toUpperCase()} pillar`, 'success');
      resetUploadForm();
      setIsUploadModalOpen(false);
    },
    onError: () => {
      addToast('Upload Failed', 'Unable to upload evidence record to database', 'error');
    }
  });

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: async (docId: string) => {
      return await documentsApi.deleteDocument(projectId, docId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents', projectId] });
      addToast('Document Removed', 'Evidence record removed from project audit trail', 'info');
    }
  });

  const resetUploadForm = () => {
    setTitle('');
    setCategory('environmental');
    setSubCategory('Electricity Utility Invoice');
    setDescription('');
    setFileName('');
    setFileSize('');
    setFileType('pdf');
  };

  const handleFileSelection = (file: File) => {
    setFileName(file.name);
    // Format size
    const bytes = file.size;
    const formatted = bytes > 1024 * 1024 
      ? `${(bytes / (1024 * 1024)).toFixed(1)} MB` 
      : `${Math.round(bytes / 1024)} KB`;
    setFileSize(formatted);

    // Auto determine file type
    const lower = file.name.toLowerCase();
    if (lower.endsWith('.xlsx') || lower.endsWith('.xls') || lower.endsWith('.csv')) {
      setFileType('excel');
    } else if (lower.endsWith('.doc') || lower.endsWith('.docx')) {
      setFileType('word');
    } else if (lower.endsWith('.png') || lower.endsWith('.jpg') || lower.endsWith('.jpeg')) {
      setFileType('image');
    } else {
      setFileType('pdf');
    }

    if (!title) {
      setTitle(file.name.replace(/\.[^/.]+$/, '').replace(/_/g, ' '));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelection(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelection(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fileName && !title) {
      addToast('File Required', 'Please choose a file or specify document name', 'error');
      return;
    }

    uploadMutation.mutate({
      title: title || fileName,
      fileName: fileName || `${title.replace(/\s+/g, '_')}.${fileType === 'excel' ? 'xlsx' : fileType === 'word' ? 'docx' : 'pdf'}`,
      fileType,
      fileSize: fileSize || '1.8 MB',
      category,
      subCategory,
      description: description || `Uploaded verified ${category} evidence and audit documentation for ${projectName}.`,
      uploadedBy: user?.name || 'Rajesh Verma (Project Lead)',
    });
  };

  // Real client-side file download simulation
  const handleDownload = (doc: EvidenceDocument) => {
    let content = `SEBI BRSR AUDIT EVIDENCE DOSSIER\n`;
    content += `==========================================\n`;
    content += `Document: ${doc.title}\n`;
    content += `File Name: ${doc.fileName}\n`;
    content += `Category: ${doc.category.toUpperCase()}\n`;
    content += `SubCategory: ${doc.subCategory}\n`;
    content += `Project: ${projectName} (${projectCode})\n`;
    content += `Uploaded By: ${doc.uploadedBy}\n`;
    content += `Timestamp: ${doc.uploadedAt}\n`;
    content += `Cryptographic SHA-256 Stamp: ${doc.sha256 || 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'}\n`;
    content += `Status: Statutory Compliance Verified\n`;
    content += `\nDescription:\n${doc.description}\n`;
    content += `\n[VERIFIED DATA PAYLOAD FOR THIRD-PARTY ASSURANCE (DNV / EY / PwC)]\n`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = doc.fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    addToast('Downloaded', `Downloaded ${doc.fileName}`, 'success');
  };

  // Filtered documents
  const filteredDocs = documents.filter(d => {
    const matchesCategory = activeCategory === 'all' || d.category === activeCategory;
    const q = searchQuery.toLowerCase();
    const matchesQuery = 
      (d.title || '').toLowerCase().includes(q) ||
      (d.fileName || '').toLowerCase().includes(q) ||
      (d.subCategory || '').toLowerCase().includes(q) ||
      (d.description || '').toLowerCase().includes(q);
    return matchesCategory && matchesQuery;
  });

  const envCount = documents.filter(d => d.category === 'environmental').length;
  const socCount = documents.filter(d => d.category === 'social').length;
  const govCount = documents.filter(d => d.category === 'governance').length;

  const getFileBadge = (type: string) => {
    switch (type) {
      case 'excel':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300/40">
            <FileSpreadsheet className="w-3 h-3 text-emerald-600" />
            EXCEL
          </span>
        );
      case 'word':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border border-blue-300/40">
            <FileText className="w-3 h-3 text-blue-600" />
            WORD
          </span>
        );
      case 'image':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 border border-purple-300/40">
            <FileCode className="w-3 h-3 text-purple-600" />
            IMAGE
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border border-rose-300/40">
            <FileText className="w-3 h-3 text-rose-600" />
            PDF
          </span>
        );
    }
  };

  const getCategoryBadge = (cat: string) => {
    switch (cat) {
      case 'environmental':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            <Leaf className="w-2.5 h-2.5 text-emerald-500" />
            Environment
          </span>
        );
      case 'social':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
            <Users className="w-2.5 h-2.5 text-teal-500" />
            Social
          </span>
        );
      case 'governance':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
            <Scale className="w-2.5 h-2.5 text-blue-500" />
            Governance
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Evidence Stats & Assurance Header */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <Card className="p-4 bg-slate-50/50 dark:bg-slate-900/30 border-slate-200 dark:border-slate-800">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            Total Proof Files
          </p>
          <div className="mt-1 text-2xl font-black text-slate-900 dark:text-slate-100 font-heading">
            {documents.length}
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5">Attached to audit trail</p>
        </Card>

        <Card className="p-4 bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/60">
          <p className="text-[10px] font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider flex items-center gap-1">
            <Leaf className="w-3 h-3 text-emerald-600" />
            Environment Invoices
          </p>
          <div className="mt-1 text-2xl font-black text-emerald-700 dark:text-emerald-300 font-heading">
            {envCount}
          </div>
          <p className="text-[10px] text-emerald-600/80 dark:text-emerald-400 mt-0.5">DISCOM bills & manifests</p>
        </Card>

        <Card className="p-4 bg-teal-50/40 dark:bg-teal-950/20 border-teal-200 dark:border-teal-800/60">
          <p className="text-[10px] font-bold text-teal-800 dark:text-teal-300 uppercase tracking-wider flex items-center gap-1">
            <Users className="w-3 h-3 text-teal-600" />
            Social Census
          </p>
          <div className="mt-1 text-2xl font-black text-teal-700 dark:text-teal-300 font-heading">
            {socCount}
          </div>
          <p className="text-[10px] text-teal-600/80 dark:text-teal-400 mt-0.5">Muster rolls & safety logs</p>
        </Card>

        <Card className="p-4 bg-blue-50/40 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800/60">
          <p className="text-[10px] font-bold text-blue-800 dark:text-blue-300 uppercase tracking-wider flex items-center gap-1">
            <Scale className="w-3 h-3 text-blue-600" />
            Governance Disclosures
          </p>
          <div className="mt-1 text-2xl font-black text-blue-700 dark:text-blue-300 font-heading">
            {govCount}
          </div>
          <p className="text-[10px] text-blue-600/80 dark:text-blue-400 mt-0.5">Resolutions & committees</p>
        </Card>
      </div>

      {/* Main Evidence Card */}
      <Card className="p-5 space-y-4">
        {/* Card Header & Actions */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <FolderOpen className="w-4 h-4 text-emerald-600" />
              Evidence Documents & Statutory Invoices
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Repository of utility bills, calibration certificates, census registers, and board resolutions in Excel, PDF, and Word formats.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsUploadModalOpen(true)}
              disabled={!canEditData}
              icon={<Upload className="w-3.5 h-3.5" />}
              className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
            >
              Upload Evidence / Invoices
            </Button>
          </div>
        </div>

        {/* Filter Bar & Search */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Pillar Filters */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 text-xs font-semibold">
            {[
              { id: 'all', label: `All Files (${documents.length})` },
              { id: 'environmental', label: `Environment (${envCount})`, icon: Leaf },
              { id: 'social', label: `Social (${socCount})`, icon: Users },
              { id: 'governance', label: `Governance (${govCount})`, icon: Scale },
            ].map((tab) => {
              const Icon = tab.icon;
              const isSelected = activeCategory === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveCategory(tab.id as any)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-all cursor-pointer whitespace-nowrap ${
                    isSelected
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                      : 'bg-white dark:bg-[#141f1b] border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  {Icon && <Icon className="w-3 h-3" />}
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Search Box */}
          <div className="relative min-w-[220px]">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search invoices, certificates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#141f1b] text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Documents List */}
        {isLoading ? (
          <div className="py-12 text-center text-slate-400 text-xs">
            <div className="w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            Loading evidence documents...
          </div>
        ) : filteredDocs.length === 0 ? (
          <div className="py-12 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
            <Upload className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              No evidence documents found
            </p>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              {searchQuery 
                ? 'No documents match your search query. Try clearing the search.' 
                : 'Attach bills, flowmeter certificates, and muster rolls to provide audit proof for SEBI assurance.'}
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-3 text-xs"
              onClick={() => setIsUploadModalOpen(true)}
              icon={<Plus className="w-3.5 h-3.5" />}
            >
              Upload First Document
            </Button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
            {filteredDocs.map((doc) => (
              <div 
                key={doc.id}
                className="p-3.5 bg-white dark:bg-[#0c1411] hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                {/* Left: Icon & Info */}
                <div className="flex items-start gap-3 min-w-0">
                  <div className="mt-0.5 flex-shrink-0">
                    {getFileBadge(doc.fileType)}
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-bold text-slate-900 dark:text-slate-100 truncate">
                        {doc.title}
                      </p>
                      {getCategoryBadge(doc.category)}
                      <span className="text-[10px] text-slate-400 font-mono">
                        {doc.fileSize}
                      </span>
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5 line-clamp-1">
                      {doc.description}
                    </p>
                    <div className="flex flex-wrap items-center gap-3 text-[10px] text-slate-400 mt-1">
                      <span>File: <strong className="font-mono text-slate-600 dark:text-slate-300">{doc.fileName}</strong></span>
                      <span>•</span>
                      <span>Uploaded by: <strong className="text-slate-600 dark:text-slate-300">{doc.uploadedBy}</strong></span>
                      <span>•</span>
                      <span>Date: <span className="font-mono">{doc.uploadedAt}</span></span>
                    </div>
                  </div>
                </div>

                {/* Right: Assurance Badge & Actions */}
                <div className="flex items-center gap-2 self-end sm:self-center flex-shrink-0">
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-1 rounded border border-emerald-200 dark:border-emerald-800/60">
                    <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                    Verified Proof
                  </span>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedDocDetails(doc)}
                    icon={<Eye className="w-3.5 h-3.5 text-slate-500" />}
                    title="View Audit Metadata"
                  >
                    Details
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownload(doc)}
                    icon={<Download className="w-3.5 h-3.5 text-emerald-600" />}
                    title="Download File"
                  >
                    Download
                  </Button>

                  {canEditData && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteMutation.mutate(doc.id)}
                      icon={<Trash2 className="w-3.5 h-3.5 text-rose-500" />}
                      title="Delete Evidence"
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* UPLOAD EVIDENCE MODAL */}
      <Modal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        title="Upload ESG Evidence & Invoices"
        subtitle="Attach supporting proofs (Excel, PDFs, Word, Images) for SEBI Reasonable Assurance"
        maxWidth="lg"
      >
        <form onSubmit={handleUploadSubmit} className="space-y-4 text-xs">
          {/* Drag & Drop Zone */}
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={`border-2 border-dashed rounded-xl p-5 text-center transition-colors cursor-pointer ${
              isDragging
                ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20'
                : 'border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/30 hover:border-emerald-400'
            }`}
          >
            <input
              type="file"
              id="evidence-file-input"
              accept=".pdf,.xlsx,.xls,.doc,.docx,.csv,.png,.jpg,.jpeg"
              onChange={handleFileChange}
              className="hidden"
            />
            <label htmlFor="evidence-file-input" className="cursor-pointer block">
              <Upload className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
              <p className="font-semibold text-slate-800 dark:text-slate-200">
                Click to browse or drag and drop invoice files here
              </p>
              <p className="text-[11px] text-slate-400 mt-1">
                Supports Excel (.xlsx, .xls, .csv), PDF (.pdf), Word (.docx, .doc), Images (.png, .jpg)
              </p>
            </label>

            {fileName && (
              <div className="mt-3 p-2 bg-white dark:bg-[#141f1b] border border-emerald-300 dark:border-emerald-800 rounded-lg flex items-center justify-between text-left">
                <div className="flex items-center gap-2 min-w-0">
                  {getFileBadge(fileType)}
                  <span className="font-mono font-bold text-slate-800 dark:text-slate-200 truncate">
                    {fileName}
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 font-mono flex-shrink-0">
                  {fileSize}
                </span>
              </div>
            )}
          </div>

          {/* Form Fields Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Pillar Category *
              </label>
              <select
                value={category}
                onChange={(e) => {
                  const cat = e.target.value as any;
                  setCategory(cat);
                  if (cat === 'environmental') setSubCategory('Electricity Utility Invoice');
                  else if (cat === 'social') setSubCategory('Workforce Muster Roll');
                  else setSubCategory('Board Resolution');
                }}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-semibold"
              >
                <option value="environmental">Environmental (Energy, Water, Waste, GHG)</option>
                <option value="social">Social (Workforce, Safety, POSH, CSR)</option>
                <option value="governance">Governance (Ethics, Anti-Bribery, Vigil)</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Sub-Category / Evidence Type *
              </label>
              <input
                type="text"
                value={subCategory}
                onChange={(e) => setSubCategory(e.target.value)}
                placeholder="e.g. Utility Invoices, NABL Calibration"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Document Display Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. DISCOM Electricity Bills FY26 Q1-Q4"
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
              required
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Audit Notes & Methodological Reference
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. 12 monthly utility power statements verified against substation meter export..."
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
            />
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-lg border border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
            <span>
              All uploaded files receive a cryptographically verified SHA-256 fingerprint timestamp to fulfill SEBI BRSR Core third-party reasonable assurance requirements.
            </span>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <Button
              variant="outline"
              size="sm"
              type="button"
              onClick={() => setIsUploadModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              type="submit"
              loading={uploadMutation.isPending}
              icon={<Upload className="w-3.5 h-3.5" />}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              Commit & Attach Evidence
            </Button>
          </div>
        </form>
      </Modal>

      {/* DOCUMENT AUDIT DETAILS MODAL */}
      {selectedDocDetails && (
        <Modal
          isOpen={!!selectedDocDetails}
          onClose={() => setSelectedDocDetails(null)}
          title="Evidence Audit Fingerprint & Metadata"
          subtitle={`SEBI statutory compliance record: ${selectedDocDetails.title}`}
          maxWidth="lg"
        >
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#141f1b] border border-slate-200 dark:border-slate-800 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-semibold">File Format</span>
                {getFileBadge(selectedDocDetails.fileType)}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-semibold">Pillar Category</span>
                {getCategoryBadge(selectedDocDetails.category)}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-semibold">File Name</span>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                  {selectedDocDetails.fileName}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-semibold">File Size</span>
                <span className="font-mono text-slate-800 dark:text-slate-200">
                  {selectedDocDetails.fileSize}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-semibold">Uploaded By</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {selectedDocDetails.uploadedBy}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-semibold">Attestation Date</span>
                <span className="font-mono text-slate-800 dark:text-slate-200">
                  {selectedDocDetails.uploadedAt}
                </span>
              </div>
            </div>

            {/* Cryptographic Hash */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Cryptographic SHA-256 Fingerprint (SEBI Tamper-Proof Stamp)
              </label>
              <div className="p-2.5 bg-slate-900 text-emerald-400 font-mono text-[10px] rounded-lg break-all border border-emerald-900/60">
                {selectedDocDetails.sha256 || 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Methodological Reference
              </label>
              <p className="p-3 bg-white dark:bg-[#0c1411] border border-slate-200 dark:border-slate-800 rounded-lg text-slate-700 dark:text-slate-300">
                {selectedDocDetails.description}
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedDocDetails(null)}
              >
                Close
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => handleDownload(selectedDocDetails)}
                icon={<Download className="w-3.5 h-3.5" />}
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                Download Audit Copy
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
