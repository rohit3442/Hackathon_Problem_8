import React, { useState } from 'react';
import { 
  Globe2, 
  CheckCircle2, 
  Plus, 
  ArrowRight, 
  ExternalLink,
  Sparkles
} from 'lucide-react';
import { Card, CardHeader } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { ProgressBar } from '../components/common/ProgressBar';
import { Drawer } from '../components/common/Drawer';
import { Modal } from '../components/common/Modal';
import { useApp } from '../context/AppContext';
import { MOCK_SDGS } from '../services/mockData';
import { SDGItem } from '../types';

export const SDGMapping: React.FC = () => {
  const { reportingYear, addToast } = useApp();
  const [selectedSDG, setSelectedSDG] = useState<SDGItem | null>(null);
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 font-heading m-0">
              UN Sustainable Development Goals (SDG) Mapping
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold border border-emerald-300/40">
              Agenda 2030
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Harmonizing operational ESG initiatives and BRSR indicators with the 17 United Nations SDGs.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => setIsMapModalOpen(true)}
          icon={<Plus className="w-3.5 h-3.5" />}
        >
          Map New ESG Activity
        </Button>
      </div>

      {/* 17 SDG Interactive Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {MOCK_SDGS.map(sdg => (
          <div
            key={sdg.number}
            onClick={() => setSelectedSDG(sdg)}
            style={{ borderColor: sdg.color }}
            className="p-3 rounded-xl border-t-4 bg-white dark:bg-[#0f1714] border-x border-b border-slate-200 dark:border-slate-800 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between">
                <span
                  style={{ backgroundColor: sdg.color }}
                  className="w-6 h-6 rounded-md text-white font-bold flex items-center justify-center text-xs"
                >
                  {sdg.number}
                </span>
                <span className="text-[10px] font-bold text-slate-400">
                  {sdg.mappedMetricsCount} mapped
                </span>
              </div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 font-heading mt-2 line-clamp-1">
                {sdg.title}
              </h4>
            </div>

            <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800/80">
              <div className="flex justify-between text-[10px] text-slate-500 mb-1">
                <span>Contribution</span>
                <strong className="text-slate-800 dark:text-slate-200">{sdg.progressScore}%</strong>
              </div>
              <ProgressBar value={sdg.progressScore} size="sm" variant="emerald" />
            </div>
          </div>
        ))}
      </div>

      {/* SDG Details Drawer */}
      {selectedSDG && (
        <Drawer
          isOpen={!!selectedSDG}
          onClose={() => setSelectedSDG(null)}
          title={`SDG ${selectedSDG.number}: ${selectedSDG.title}`}
          subtitle={`${selectedSDG.mappedMetricsCount} active ESG metrics linked`}
          width="md"
        >
          <div className="space-y-4 text-xs">
            <div
              style={{ backgroundColor: `${selectedSDG.color}15`, borderColor: selectedSDG.color }}
              className="p-4 rounded-xl border space-y-1.5"
            >
              <span className="text-[10px] uppercase font-bold" style={{ color: selectedSDG.color }}>
                Overall Agenda Contribution Score
              </span>
              <div className="flex items-baseline gap-2">
                <strong className="text-2xl font-black font-heading text-slate-900 dark:text-slate-100">
                  {selectedSDG.progressScore}%
                </strong>
                <span className="text-[11px] text-slate-500">Target alignment</span>
              </div>
              <ProgressBar value={selectedSDG.progressScore} size="sm" variant="emerald" />
            </div>

            <div className="space-y-2">
              <h4 className="font-bold text-slate-900 dark:text-slate-100 text-xs">
                Active Corporate Initiatives
              </h4>
              <div className="space-y-2">
                {selectedSDG.initiatives.map((init, i) => (
                  <div key={i} className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-lg flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                    <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-xs">
                      {init}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => {
                setSelectedSDG(null);
                setIsMapModalOpen(true);
              }}
            >
              Map Additional Metric to SDG {selectedSDG.number}
            </Button>
          </div>
        </Drawer>
      )}

      {/* Map New Activity Modal */}
      <Modal
        isOpen={isMapModalOpen}
        onClose={() => setIsMapModalOpen(false)}
        title="Map ESG Metric to UN Sustainable Development Goal"
        subtitle="Establish verified linkage for stakeholder reporting"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setIsMapModalOpen(false)}>
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={() => {
                setIsMapModalOpen(false);
                addToast('SDG Linkage Created', 'Activity mapped to UN SDG framework', 'success');
              }}
            >
              Confirm Mapping
            </Button>
          </>
        }
      >
        <div className="space-y-3 text-xs">
          <div>
            <label className="block font-semibold mb-1">Select ESG Operational Initiative</label>
            <select className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200">
              <option>Renewable Open Access PPA (46.8% Clean Electricity)</option>
              <option>ZLD Effluent Treatment Plant Recirculation</option>
              <option>Zero Harm Safety Program & EHS Training</option>
              <option>Rural Community Potable Water Borewells</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold mb-1">Target UN SDG</label>
            <select className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200">
              {MOCK_SDGS.map(s => (
                <option key={s.number} value={s.number}>
                  SDG {s.number}: {s.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold mb-1">Reason & Alignment Justification</label>
            <textarea
              rows={3}
              placeholder="Explain how this initiative directly advances the selected SDG targets..."
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};
