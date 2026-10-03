import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowRight, 
  Sparkles, 
  UserCheck, 
  CheckCircle2, 
  Layers, 
  ChevronDown, 
  ChevronUp, 
  X,
  FileCheck2,
  Award,
  Leaf
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';

export const DataFlowTourBar: React.FC = () => {
  const navigate = useNavigate();
  const { user, switchRole } = useAuth();
  const [isExpanded, setIsExpanded] = useState(true);
  const [isDismissed, setIsDismissed] = useState(false);

  if (isDismissed) return null;

  const currentRole = user?.role || 'project_user';

  const steps: {
    num: number;
    title: string;
    role: UserRole;
    personaName: string;
    actionLabel: string;
    targetPath: string;
    desc: string;
    badge: string;
    icon: React.ComponentType<{ className?: string }>;
  }[] = [
    {
      num: 1,
      title: 'Project Data Entry & AI Check',
      role: 'project_user',
      personaName: 'Rajesh Verma (Project User)',
      actionLabel: 'Enter 100,000 kWh & Submit',
      targetPath: '/projects/proj-1/esg/environmental',
      desc: 'Enters 100,000 kWh into PostgreSQL DB, triggers statistical AI anomaly check, and submits.',
      badge: 'Step 1',
      icon: Leaf
    },
    {
      num: 2,
      title: 'Business Manager Review',
      role: 'bu_manager',
      personaName: 'Vikram Malhotra (Business Manager)',
      actionLabel: 'Review & Approve Submission',
      targetPath: '/projects/proj-1/review',
      desc: 'Inspects submitted metrics, evaluates AI flags & attached utility invoices, and approves.',
      badge: 'Step 2',
      icon: CheckCircle2
    },
    {
      num: 3,
      title: 'ESG Control Center & BRSR Mapping',
      role: 'esg_team',
      personaName: 'Dr. Ananya Sen (ESG Team)',
      actionLabel: 'Inspect BRSR Principle 6',
      targetPath: '/brsr/section-c',
      desc: 'BRSR Section C (P6) automatically updates with live 100,000 kWh / 1,310 GJ from DB.',
      badge: 'Step 3',
      icon: FileCheck2
    },
    {
      num: 4,
      title: 'Executive Dashboard & Final Reports',
      role: 'management',
      personaName: 'Priya Nair (Management)',
      actionLabel: 'View Board Pack & KPIs',
      targetPath: '/executive-dashboard',
      desc: 'Executive KPIs reflect aggregated Scope 2 emissions; generates statutory SEBI reports.',
      badge: 'Step 4',
      icon: Award
    }
  ];

  const handleStepJump = (role: UserRole, targetPath: string) => {
    switchRole(role);
    navigate(targetPath);
  };

  return (
    <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 border border-emerald-500/30 rounded-2xl p-4 text-white shadow-lg transition-all mb-6">
      {/* Top Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-300 flex-shrink-0">
            <Sparkles className="w-4 h-4 text-emerald-400 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold font-heading text-emerald-300 uppercase tracking-wider">
                Multi-Page Role Segregation & Living Data Flow
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-200 border border-emerald-500/30">
                End-to-End Pipeline
              </span>
            </div>
            <p className="text-[11px] text-slate-300 mt-0.5">
              Strict role isolation: each persona accesses dedicated pages and workflows while reading from the unified PostgreSQL database.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors text-xs flex items-center gap-1 cursor-pointer"
          >
            {isExpanded ? (
              <>
                <span className="text-[11px] hidden sm:inline">Minimize</span>
                <ChevronUp className="w-4 h-4" />
              </>
            ) : (
              <>
                <span className="text-[11px] hidden sm:inline">Show Steps</span>
                <ChevronDown className="w-4 h-4" />
              </>
            )}
          </button>
          <button
            onClick={() => setIsDismissed(true)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            title="Dismiss walkthrough banner"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Stepper Content */}
      {isExpanded && (
        <div className="mt-4 pt-3 border-t border-white/10 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
          {steps.map((step) => {
            const isCurrentActive = currentRole === step.role;
            const Icon = step.icon;

            return (
              <div
                key={step.num}
                className={`relative p-3.5 rounded-xl border transition-all flex flex-col justify-between ${
                  isCurrentActive
                    ? 'bg-emerald-500/15 border-emerald-400/80 shadow-md ring-1 ring-emerald-400/40'
                    : 'bg-white/5 border-white/10 hover:bg-white/10'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-white/10 text-emerald-300">
                      <Icon className="w-3 h-3 text-emerald-400" />
                      {step.badge}
                    </span>
                    {isCurrentActive && (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-500 text-slate-950 uppercase tracking-wider">
                        Active Persona
                      </span>
                    )}
                  </div>

                  <h4 className="text-xs font-bold text-slate-100 font-heading">
                    {step.title}
                  </h4>
                  <p className="text-[10px] text-emerald-300/90 font-medium mt-0.5">
                    {step.personaName}
                  </p>
                  <p className="text-[10px] text-slate-300 mt-1.5 leading-relaxed">
                    {step.desc}
                  </p>
                </div>

                <div className="mt-3 pt-2.5 border-t border-white/10">
                  <button
                    onClick={() => handleStepJump(step.role, step.targetPath)}
                    className={`w-full py-1.5 px-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      isCurrentActive
                        ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-sm'
                        : 'bg-white/10 hover:bg-white/20 text-slate-200'
                    }`}
                  >
                    <span>{step.actionLabel}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
