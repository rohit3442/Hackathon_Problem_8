import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Check, 
  X, 
  HelpCircle, 
  Save, 
  Send, 
  ExternalLink, 
  ChevronRight,
  ShieldCheck,
  Target,
  FileCheck2
} from 'lucide-react';
import { Card, CardHeader } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Drawer } from '../components/common/Drawer';
import { StatusBadge } from '../components/common/StatusBadge';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';

export const BRSRSectionB: React.FC = () => {
  const navigate = useNavigate();
  const { canEditData } = useAuth();
  const { addToast } = useApp();

  const principles = [
    { id: 1, name: 'P1: Ethics & Integrity' },
    { id: 2, name: 'P2: Product Stewardship' },
    { id: 3, name: 'P3: Employee Well-being' },
    { id: 4, name: 'P4: Stakeholder Engagement' },
    { id: 5, name: 'P5: Human Rights' },
    { id: 6, name: 'P6: Environment & Climate' },
    { id: 7, name: 'P7: Public Policy Advocacy' },
    { id: 8, name: 'P8: Inclusive Growth' },
    { id: 9, name: 'P9: Consumer Value' },
  ];

  const matrixRows = [
    {
      label: '1. Does entity have a policy covering this Principle?',
      values: [true, true, true, true, true, true, true, true, true],
    },
    {
      label: '2. Has the policy been approved by the Board?',
      values: [true, true, true, true, true, true, true, true, true],
    },
    {
      label: '3. Web link to the policy document',
      values: [true, true, true, true, true, true, true, true, true],
    },
    {
      label: '4. Do policies translate into detailed operational procedures?',
      values: [true, true, true, true, true, true, false, true, true],
    },
    {
      label: '5. Does policy extend to the value chain partners?',
      values: [true, true, true, false, true, true, false, true, true],
    },
    {
      label: '6. National / International Codes / Certifications held',
      values: ['ISO 37001', 'GreenPro', 'ISO 45001', 'AA1000', 'UNGC', 'ISO 14001', 'CII Code', 'CSR Gold', 'ISO 27001'],
      isText: true
    },
    {
      label: '7. Specific commitments, goals and targets set by entity',
      values: [true, true, true, true, true, true, true, true, true],
    },
    {
      label: '8. Performance against commitments reviewed by Director',
      values: [true, true, true, true, true, true, true, true, true],
    }
  ];

  const [selectedPrincipleDrawer, setSelectedPrincipleDrawer] = useState<number | null>(null);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 font-heading m-0">
              BRSR Section B — Management & Process Disclosures
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold border border-emerald-300/40">
              NGRBC 9-Principle Policy Matrix
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Governance, leadership oversight, board approvals, and commitments across all 9 Principles.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => addToast('Section B Saved', 'Policy matrix verified and stored', 'success')}
            disabled={!canEditData}
            icon={<Save className="w-3.5 h-3.5" />}
          >
            Save Matrix
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => addToast('Validated', 'Matrix validated against SEBI rulebook', 'success')}
            disabled={!canEditData}
            icon={<Send className="w-3.5 h-3.5" />}
          >
            Validate Disclosures
          </Button>
        </div>
      </div>

      {/* Principle Matrix Card */}
      <Card className="overflow-hidden p-0">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 font-heading">
              SEBI NGRBC Principles Policy & Governance Matrix
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Click any Principle header to inspect commitments and targets</p>
          </div>
          <span className="text-xs text-emerald-600 font-bold bg-emerald-50 dark:bg-emerald-950 px-2.5 py-1 rounded-full">
            100% Policy Coverage
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800 text-[11px] font-semibold text-slate-500 uppercase">
                <th className="py-3 px-4 min-w-[280px]">Disclosure Item</th>
                {principles.map(p => (
                  <th
                    key={p.id}
                    onClick={() => setSelectedPrincipleDrawer(p.id)}
                    className="py-3 px-2 text-center cursor-pointer hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-slate-800 dark:text-slate-200 transition-colors"
                    title={p.name}
                  >
                    <span className="block font-bold">P{p.id}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {matrixRows.map((row, rowIdx) => (
                <tr key={rowIdx} className="hover:bg-slate-50/60 dark:hover:bg-[#141f1b]/60 transition-colors">
                  <td className="py-3 px-4 font-medium text-slate-800 dark:text-slate-200">
                    {row.label}
                  </td>
                  {row.values.map((val, colIdx) => (
                    <td key={colIdx} className="py-3 px-2 text-center">
                      {row.isText ? (
                        <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                          {val}
                        </span>
                      ) : val === true ? (
                        <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                          <Check className="w-3.5 h-3.5" />
                        </span>
                      ) : (
                        <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400">
                          <X className="w-3.5 h-3.5" />
                        </span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Target & Commitment Detail Drawer */}
      {selectedPrincipleDrawer && (
        <Drawer
          isOpen={!!selectedPrincipleDrawer}
          onClose={() => setSelectedPrincipleDrawer(null)}
          title={`Principle ${selectedPrincipleDrawer} Commitments & Targets`}
          subtitle="Specific goals, baseline year, and FY26 performance milestones"
          width="md"
        >
          <div className="space-y-4 text-xs">
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl space-y-1">
              <span className="text-[10px] uppercase font-bold text-emerald-800 dark:text-emerald-300">Target Statement</span>
              <p className="font-bold text-slate-900 dark:text-slate-100 text-xs">
                Reduce greenhouse gas emission intensity by 30% per rupee of turnover by 2030 (Baseline FY 2020-21).
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 dark:bg-slate-900/60 rounded-lg">
              <div>
                <span className="text-slate-400 block text-[10px]">Baseline (FY21)</span>
                <strong className="text-slate-800 dark:text-slate-200">1.45 tCO2e / Cr</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Target (FY30)</span>
                <strong className="text-slate-800 dark:text-slate-200">1.01 tCO2e / Cr</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Current (FY26)</span>
                <strong className="text-emerald-600 dark:text-emerald-400">0.89 tCO2e / Cr</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Milestone Status</span>
                <StatusBadge status="validated" size="sm" />
              </div>
            </div>

            <div>
              <label className="block font-semibold mb-1">Director Responsible for Oversight</label>
              <input
                type="text"
                readOnly
                value="Priya Nair (Board ESG Chairperson)"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 font-bold"
              />
            </div>
          </div>
        </Drawer>
      )}
    </div>
  );
};
