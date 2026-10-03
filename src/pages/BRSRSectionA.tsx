import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Building2, 
  Package, 
  MapPin, 
  Users, 
  Building, 
  HeartHandshake, 
  AlertCircle, 
  Save, 
  Send, 
  ChevronRight,
  ChevronDown,
  CheckCircle2
} from 'lucide-react';
import { Card, CardHeader } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { StatusBadge } from '../components/common/StatusBadge';
import { ProgressBar } from '../components/common/ProgressBar';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { MOCK_BRSR_SECTION_A } from '../services/mockData';

export const BRSRSectionA: React.FC = () => {
  const navigate = useNavigate();
  const { canEditData } = useAuth();
  const { reportingYear, addToast } = useApp();

  const [activeSubSection, setActiveSubSection] = useState<'entity' | 'products' | 'operations' | 'employees' | 'holdings' | 'csr' | 'grievances'>('entity');
  const [entityData, setEntityData] = useState(MOCK_BRSR_SECTION_A.entityDetails);

  const subSections = [
    { id: 'entity', label: '1. Details of Listed Entity', icon: Building2 },
    { id: 'products', label: '2. Products / Services', icon: Package },
    { id: 'operations', label: '3. Operations & Locations', icon: MapPin },
    { id: 'employees', label: '4. Employees & Workers', icon: Users },
    { id: 'holdings', label: '5. Holding / Subsidiary / JV', icon: Building },
    { id: 'csr', label: '6. CSR Details', icon: HeartHandshake },
    { id: 'grievances', label: '7. Transparency & Grievances', icon: AlertCircle },
  ];

  const handleSave = () => {
    addToast('Section A Saved', 'General disclosures draft updated', 'success');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 font-heading m-0">
              BRSR Section A — General Disclosures
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold border border-emerald-300/40">
              SEBI Annexure 1
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            General corporate identity, workforce demographics, CSR investments, and stakeholder grievance mechanisms.
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
            Save Draft
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => addToast('Section A Validated', 'All mandatory fields verified against MCA database', 'success')}
            disabled={!canEditData}
            icon={<Send className="w-3.5 h-3.5" />}
          >
            Validate Section
          </Button>
        </div>
      </div>

      {/* Navigation Pill Bar */}
      <div className="flex overflow-x-auto pb-2 border-b border-slate-200 dark:border-slate-800 gap-2">
        {subSections.map(sub => {
          const Icon = sub.icon;
          return (
            <button
              key={sub.id}
              onClick={() => setActiveSubSection(sub.id as any)}
              className={`flex items-center gap-2 px-3 py-1.5 text-xs font-bold rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
                activeSubSection === sub.id
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-white dark:bg-[#0f1714] text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{sub.label}</span>
            </button>
          );
        })}
      </div>

      {/* 1. Entity Details */}
      {activeSubSection === 'entity' && (
        <Card>
          <CardHeader
            title="I. Details of the Listed Entity (SEBI Annexure 1 Format)"
            subtitle="Statutory identity, exchange listings, and assurance provider details"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block text-slate-500 font-semibold mb-1">Corporate Identity Number (CIN)</label>
              <input
                type="text"
                value={entityData.cin}
                onChange={(e) => setEntityData({ ...entityData, cin: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg font-mono font-bold text-slate-900 dark:text-slate-100"
              />
            </div>

            <div>
              <label className="block text-slate-500 font-semibold mb-1">Name of the Listed Entity</label>
              <input
                type="text"
                value={entityData.name}
                onChange={(e) => setEntityData({ ...entityData, name: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg font-bold text-slate-900 dark:text-slate-100"
              />
            </div>

            <div>
              <label className="block text-slate-500 font-semibold mb-1">Year of Incorporation</label>
              <input
                type="text"
                value={entityData.incorporationYear}
                onChange={(e) => setEntityData({ ...entityData, incorporationYear: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-slate-500 font-semibold mb-1">Registered Office Address</label>
              <input
                type="text"
                value={entityData.registeredOffice}
                onChange={(e) => setEntityData({ ...entityData, registeredOffice: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
              />
            </div>

            <div>
              <label className="block text-slate-500 font-semibold mb-1">Stock Exchange(s) where shares are listed</label>
              <input
                type="text"
                value={entityData.stockExchanges}
                onChange={(e) => setEntityData({ ...entityData, stockExchanges: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
              />
            </div>

            <div>
              <label className="block text-slate-500 font-semibold mb-1">Paid-Up Capital</label>
              <input
                type="text"
                value={entityData.paidUpCapital}
                onChange={(e) => setEntityData({ ...entityData, paidUpCapital: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 font-bold"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-slate-500 font-semibold mb-1">Independent Assurance Provider</label>
              <input
                type="text"
                value={entityData.assuranceProvider}
                onChange={(e) => setEntityData({ ...entityData, assuranceProvider: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
              />
            </div>

            <div className="sm:col-span-3">
              <label className="block text-slate-500 font-semibold mb-1">Assurance Scope & Type</label>
              <input
                type="text"
                value={entityData.assuranceType}
                onChange={(e) => setEntityData({ ...entityData, assuranceType: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
              />
            </div>
          </div>
        </Card>
      )}

      {/* 2. Products / Services */}
      {activeSubSection === 'products' && (
        <Card>
          <CardHeader
            title="II. Products & Services Accounting for >90% of Turnover"
            subtitle="NIC Code classification pursuant to Ministry of Statistics"
          />
          <div className="overflow-x-auto text-xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 font-semibold text-slate-500 uppercase">
                  <th className="py-2.5 px-3">NIC Code</th>
                  <th className="py-2.5 px-3">Product / Service Description</th>
                  <th className="py-2.5 px-3 text-right">% of Total Turnover</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {MOCK_BRSR_SECTION_A.productsAndServices.map((prod, i) => (
                  <tr key={i}>
                    <td className="py-3 px-3 font-mono font-bold text-slate-800 dark:text-slate-200">{prod.nicCode}</td>
                    <td className="py-3 px-3 text-slate-700 dark:text-slate-300">{prod.productDescription}</td>
                    <td className="py-3 px-3 text-right font-bold text-emerald-600 dark:text-emerald-400">{prod.turnoverPct}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* 4. Employees & Workers */}
      {activeSubSection === 'employees' && (
        <Card>
          <CardHeader
            title="IV. Employees and Workers Demographics"
            subtitle="Permanent vs Contractual staff, gender ratio, and differently abled inclusion"
          />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl space-y-1">
              <span className="text-slate-400 text-[10px]">Total Permanent Staff</span>
              <strong className="text-xl font-bold block">{MOCK_BRSR_SECTION_A.employeesAndWorkers.totalEmployees.toLocaleString()}</strong>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl space-y-1">
              <span className="text-slate-400 text-[10px]">Female Staff</span>
              <strong className="text-xl font-bold text-emerald-600 block">{MOCK_BRSR_SECTION_A.employeesAndWorkers.femaleEmployeePct}%</strong>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl space-y-1">
              <span className="text-slate-400 text-[10px]">Contract Workers</span>
              <strong className="text-xl font-bold block">{MOCK_BRSR_SECTION_A.employeesAndWorkers.contractWorkers.toLocaleString()}</strong>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl space-y-1">
              <span className="text-slate-400 text-[10px]">Annual Turnover</span>
              <strong className="text-xl font-bold block">{MOCK_BRSR_SECTION_A.employeesAndWorkers.turnoverRate}%</strong>
            </div>
          </div>
        </Card>
      )}

      {/* 6. CSR Details */}
      {activeSubSection === 'csr' && (
        <Card>
          <CardHeader
            title="VI. Corporate Social Responsibility (CSR) Statutory Filing"
            subtitle="Compliance under Section 135 of the Companies Act, 2013"
          />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl space-y-1">
              <span className="text-slate-400 text-[10px]">Consolidated Turnover</span>
              <strong className="text-lg font-bold block">₹ {MOCK_BRSR_SECTION_A.csrDetails.turnoverCr.toLocaleString()} Cr</strong>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl space-y-1">
              <span className="text-slate-400 text-[10px]">Average Net Profit (3 Yrs)</span>
              <strong className="text-lg font-bold block">₹ {MOCK_BRSR_SECTION_A.csrDetails.netProfitCr.toLocaleString()} Cr</strong>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl space-y-1">
              <span className="text-slate-400 text-[10px]">Prescribed 2% CSR</span>
              <strong className="text-lg font-bold block">₹ {MOCK_BRSR_SECTION_A.csrDetails.prescribedCsrCr} Cr</strong>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl space-y-1">
              <span className="text-slate-400 text-[10px]">Actual CSR Outlay</span>
              <strong className="text-lg font-bold text-emerald-600 block">₹ {MOCK_BRSR_SECTION_A.csrDetails.actualCsrSpentCr} Cr</strong>
            </div>
          </div>
        </Card>
      )}

      {/* 7. Grievances */}
      {activeSubSection === 'grievances' && (
        <Card>
          <CardHeader
            title="VII. Complaints & Grievance Redressal Mechanisms"
            subtitle="Grievances received and resolved across key stakeholder groups"
          />
          <div className="overflow-x-auto text-xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 font-semibold text-slate-500 uppercase">
                  <th className="py-2.5 px-3">Stakeholder Group</th>
                  <th className="py-2.5 px-3">Received in FY26</th>
                  <th className="py-2.5 px-3">Resolved</th>
                  <th className="py-2.5 px-3">Pending Resolution</th>
                  <th className="py-2.5 px-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {MOCK_BRSR_SECTION_A.grievances.map((g, i) => (
                  <tr key={i}>
                    <td className="py-3 px-3 font-bold text-slate-800 dark:text-slate-200">{g.stakeholder}</td>
                    <td className="py-3 px-3 text-slate-700 dark:text-slate-300 font-mono">{g.received}</td>
                    <td className="py-3 px-3 text-emerald-600 dark:text-emerald-400 font-mono font-bold">{g.resolved}</td>
                    <td className="py-3 px-3 text-slate-500 font-mono">{g.pending}</td>
                    <td className="py-3 px-3 text-right">
                      <span className="px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold text-[10px]">
                        {g.pending === 0 ? '100% Resolved' : 'Active'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Default fallback for operations / holdings */}
      {(activeSubSection === 'operations' || activeSubSection === 'holdings') && (
        <Card>
          <CardHeader
            title={activeSubSection === 'operations' ? 'III. Operational Footprint' : 'V. Holdings & Subsidiaries in Reporting Scope'}
            subtitle="Verified against Group boundary definition"
          />
          <div className="p-4 bg-slate-50 dark:bg-slate-900/60 rounded-xl text-xs space-y-2">
            <div className="flex items-center gap-2 text-emerald-600 font-bold">
              <CheckCircle2 className="w-4 h-4" />
              <span>All 3 key operational subsidiaries included in BRSR boundary.</span>
            </div>
            <p className="text-slate-500 dark:text-slate-400">
              Covers 24 fabrication yards, 48 regional project site offices, and international joint ventures.
            </p>
          </div>
        </Card>
      )}
    </div>
  );
};
