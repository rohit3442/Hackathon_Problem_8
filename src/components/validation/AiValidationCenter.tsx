import React, { useState } from 'react';
import { 
  Sparkles, 
  AlertTriangle, 
  CheckCircle2, 
  AlertOctagon, 
  Sliders, 
  RefreshCw, 
  RotateCcw, 
  ShieldCheck, 
  Zap, 
  Droplets, 
  Trash2, 
  Users, 
  Scale, 
  ArrowRight, 
  ExternalLink, 
  FileText,
  HelpCircle,
  Eye,
  Edit3
} from 'lucide-react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Modal } from '../common/Modal';
import { useApp } from '../../context/AppContext';

export interface ValidationRuleConfig {
  id: string;
  ruleCode: string;
  name: string;
  category: 'environmental' | 'social' | 'governance';
  fieldKey: string;
  unit: string;
  currentValue: number | boolean;
  baseline: number;
  upperLimit: number;
  lowerLimit?: number;
  criticalLimit?: number;
  regulatoryRef: string;
  rationale: string;
  customExplanation?: string;
}

interface AiValidationCenterProps {
  projectId: string;
  projectCode?: string;
  projectName?: string;
  environmental: {
    electricityKwh: number;
    fuelLitres: number;
    renewableEnergyPct: number;
    waterWithdrawalKl: number;
    waterConsumptionKl: number;
    waterRecycledKl: number;
    hazardousWasteMt: number;
    nonHazardousWasteMt: number;
  };
  social: {
    employees: number;
    femalePct: number;
    contractWorkers: number;
    injuries: number;
    fatalities: number;
  };
  governance: {
    antiCorruption: boolean;
    whistleblowerCases: number;
  };
  onUpdateMetric: (pillar: 'environmental' | 'social' | 'governance', field: string, value: any) => void;
  onSaveJustification?: (ruleCode: string, note: string) => void;
}

export const AiValidationCenter: React.FC<AiValidationCenterProps> = ({
  projectCode = 'SMP-500',
  projectName = 'Solar Mega-Park 500MW Facility',
  environmental,
  social,
  governance,
  onUpdateMetric,
}) => {
  const { addToast } = useApp();

  const [activeCategory, setActiveCategory] = useState<'all' | 'environmental' | 'social' | 'governance'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'anomalies' | 'passed'>('all');
  const [showConfigDrawer, setShowConfigDrawer] = useState(false);

  // User-adjustable operational limits
  const [limits, setLimits] = useState<Record<string, number>>({
    electricityUpper: 105000,
    fuelUpper: 28000,
    renewableLower: 35.0,
    waterWithdrawalUpper: 60000,
    hazardousWasteUpper: 18.0,
    contractWorkersUpper: 5500,
    injuriesUpper: 3,
    fatalitiesUpper: 0,
    whistleblowerUpper: 2
  });

  // Justifications stored in-memory/session
  const [justifications, setJustifications] = useState<Record<string, string>>({
    'ENV-ELEC-01': 'Commissioning of auxiliary battery storage cooling fans and string inverters during testing.'
  });

  // Modal State for Inspection
  const [inspectedRule, setInspectedRule] = useState<any | null>(null);
  const [editValue, setEditValue] = useState<number | string>('');
  const [justificationText, setJustificationText] = useState('');

  // Define comprehensive rules across Environmental, Social, and Governance
  const rulesList = [
    // --- ENVIRONMENTAL RULES ---
    {
      id: 'env-1',
      ruleCode: 'ENV-ELEC-01',
      name: 'Grid Electricity Consumption',
      category: 'environmental' as const,
      fieldKey: 'electricityKwh',
      unit: 'kWh',
      currentValue: environmental.electricityKwh,
      baseline: 84000,
      upperLimit: limits.electricityUpper,
      criticalLimit: limits.electricityUpper * 1.25,
      regulatoryRef: 'SEBI BRSR Core Principle 6 Indicator E1',
      rationale: 'Upper limit threshold prevents reporting unverified electricity spikes before utility bill reconciliation.',
      evaluate: (val: number) => {
        if (val < 0) return { status: 'critical', msg: 'Negative consumption is physically impossible.', variance: -100 };
        if (val > limits.electricityUpper * 1.25) return { status: 'critical', msg: `Critical outlier: Exceeds upper limit (${limits.electricityUpper.toLocaleString()} kWh) by >25%. High risk of billing distortion.`, variance: Math.round(((val - 84000) / 84000) * 100) };
        if (val > limits.electricityUpper) return { status: 'warning', msg: `Statistical variance detected: Value is ${Math.round(((val - 84000) / 84000) * 100)}% above baseline (84,000 kWh). Requires operational confirmation.`, variance: Math.round(((val - 84000) / 84000) * 100) };
        return { status: 'clean', msg: 'Value is within safe operational boundary.', variance: Math.round(((val - 84000) / 84000) * 100) };
      }
    },
    {
      id: 'env-2',
      ruleCode: 'ENV-FUEL-02',
      name: 'Stationary Diesel / Fuel',
      category: 'environmental' as const,
      fieldKey: 'fuelLitres',
      unit: 'Litres',
      currentValue: environmental.fuelLitres,
      baseline: 24000,
      upperLimit: limits.fuelUpper,
      regulatoryRef: 'GHG Protocol Scope 1 Direct Emissions',
      rationale: 'Monitors backup diesel generator runtime against environmental clearance limits.',
      evaluate: (val: number) => {
        if (val < 0) return { status: 'critical', msg: 'Negative fuel consumption entered.', variance: -100 };
        if (val > limits.fuelUpper * 1.3) return { status: 'critical', msg: `Excessive diesel consumption (>30% over limit of ${limits.fuelUpper.toLocaleString()} L). Severe Scope 1 surge.`, variance: Math.round(((val - 24000) / 24000) * 100) };
        if (val > limits.fuelUpper) return { status: 'warning', msg: `Elevated diesel runtime: Exceeds threshold limit (${limits.fuelUpper.toLocaleString()} L). Verify backup generator logs.`, variance: Math.round(((val - 24000) / 24000) * 100) };
        return { status: 'clean', msg: 'Fuel usage is normal and aligned with monthly delivery challans.', variance: Math.round(((val - 24000) / 24000) * 100) };
      }
    },
    {
      id: 'env-3',
      ruleCode: 'ENV-RENEW-03',
      name: 'Renewable Electricity Share',
      category: 'environmental' as const,
      fieldKey: 'renewableEnergyPct',
      unit: '%',
      currentValue: environmental.renewableEnergyPct,
      baseline: 45.0,
      upperLimit: 100,
      lowerLimit: limits.renewableLower,
      regulatoryRef: 'SEBI BRSR Core Principle 6 Indicator E2',
      rationale: 'Ensures facility meets corporate decarbonization targets (minimum 35% clean mix).',
      evaluate: (val: number) => {
        if (val < 0 || val > 100) return { status: 'critical', msg: 'Percentage must be between 0.0% and 100.0%. Mathematical impossibility.', variance: 0 };
        if (val < limits.renewableLower) return { status: 'warning', msg: `Clean energy deficit: ${val}% falls below minimum commitment limit (${limits.renewableLower}%). Triggers variance review.`, variance: Math.round(((val - 45) / 45) * 100) };
        return { status: 'clean', msg: `Clean electricity share (${val}%) exceeds minimum threshold (${limits.renewableLower}%).`, variance: Math.round(((val - 45) / 45) * 100) };
      }
    },
    {
      id: 'env-4',
      ruleCode: 'ENV-WATER-BAL-01',
      name: 'Water Stewardship: Recycled Balance',
      category: 'environmental' as const,
      fieldKey: 'waterRecycledKl',
      unit: 'KL',
      currentValue: environmental.waterRecycledKl,
      baseline: 18500,
      upperLimit: environmental.waterWithdrawalKl,
      regulatoryRef: 'CPCB Guidelines on Zero Liquid Discharge (ZLD)',
      rationale: 'Volume of recycled water cannot physically exceed total raw water withdrawal.',
      evaluate: (val: number) => {
        if (val > environmental.waterWithdrawalKl) {
          return { status: 'critical', msg: `Physical arithmetic violation: Recycled water (${val.toLocaleString()} KL) exceeds total withdrawal (${environmental.waterWithdrawalKl.toLocaleString()} KL).`, variance: 100 };
        }
        return { status: 'clean', msg: 'Recycled water is mathematically consistent with withdrawal volume.', variance: 0 };
      }
    },
    {
      id: 'env-5',
      ruleCode: 'ENV-WATER-BAL-02',
      name: 'Water Stewardship: Consumption Balance',
      category: 'environmental' as const,
      fieldKey: 'waterConsumptionKl',
      unit: 'KL',
      currentValue: environmental.waterConsumptionKl,
      baseline: 38000,
      upperLimit: environmental.waterWithdrawalKl,
      regulatoryRef: 'ISO 14046 Water Footprint Standard',
      rationale: 'Net water consumed must not exceed gross water withdrawn from sources.',
      evaluate: (val: number) => {
        if (val > environmental.waterWithdrawalKl) {
          return { status: 'critical', msg: `Logical error: Water consumption (${val.toLocaleString()} KL) is greater than total withdrawal (${environmental.waterWithdrawalKl.toLocaleString()} KL).`, variance: 100 };
        }
        return { status: 'clean', msg: 'Water consumption is balanced with withdrawal records.', variance: 0 };
      }
    },
    {
      id: 'env-6',
      ruleCode: 'ENV-WATER-WITH-03',
      name: 'Gross Water Withdrawal Spike',
      category: 'environmental' as const,
      fieldKey: 'waterWithdrawalKl',
      unit: 'KL',
      currentValue: environmental.waterWithdrawalKl,
      baseline: 50000,
      upperLimit: limits.waterWithdrawalUpper,
      regulatoryRef: 'State Groundwater Authority Pumping Quota',
      rationale: 'Monitors borewell pumping vs statutory allocation quota.',
      evaluate: (val: number) => {
        if (val > limits.waterWithdrawalUpper) {
          return { status: 'warning', msg: `Pumping quota threshold exceeded: Withdrawal (${val.toLocaleString()} KL) exceeds upper limit (${limits.waterWithdrawalUpper.toLocaleString()} KL).`, variance: Math.round(((val - 50000) / 50000) * 100) };
        }
        return { status: 'clean', msg: 'Water extraction is safely below consent limit.', variance: Math.round(((val - 50000) / 50000) * 100) };
      }
    },
    {
      id: 'env-7',
      ruleCode: 'ENV-WASTE-01',
      name: 'Hazardous Waste Generation',
      category: 'environmental' as const,
      fieldKey: 'hazardousWasteMt',
      unit: 'MT',
      currentValue: environmental.hazardousWasteMt,
      baseline: 12.5,
      upperLimit: limits.hazardousWasteUpper,
      regulatoryRef: 'Hazardous & Other Wastes Management Rules (CPCB)',
      rationale: 'Threshold monitors PCB TSDF disposal manifest limits.',
      evaluate: (val: number) => {
        if (val > limits.hazardousWasteUpper) {
          return { status: 'warning', msg: `Hazardous generation (${val} MT) exceeds authorization threshold (${limits.hazardousWasteUpper} MT). Inspect transformer oil and chemical scrap manifests.`, variance: Math.round(((val - 12.5) / 12.5) * 100) };
        }
        return { status: 'clean', msg: 'Hazardous waste is within state pollution control board allowance.', variance: Math.round(((val - 12.5) / 12.5) * 100) };
      }
    },

    // --- SOCIAL RULES ---
    {
      id: 'soc-1',
      ruleCode: 'SOC-FATAL-01',
      name: 'Workplace Fatalities (Zero-Tolerance)',
      category: 'social' as const,
      fieldKey: 'fatalities',
      unit: 'Count',
      currentValue: social.fatalities,
      baseline: 0,
      upperLimit: 0,
      regulatoryRef: 'Factories Act 1948 & SEBI BRSR Core Principle 3',
      rationale: 'Absolute zero-tolerance statutory compliance standard. Any reported death is an emergency audit event.',
      evaluate: (val: number) => {
        if (val > 0) {
          return { status: 'critical', msg: `CRITICAL STATUTORY ALERT: ${val} fatality reported. Zero-tolerance EHS violation triggering immediate board inquiry and regulatory intimation.`, variance: 100 };
        }
        return { status: 'clean', msg: 'Zero fatalities maintained across facility operations.', variance: 0 };
      }
    },
    {
      id: 'soc-2',
      ruleCode: 'SOC-INJ-02',
      name: 'Recordable Workplace Injuries (LTIFR)',
      category: 'social' as const,
      fieldKey: 'injuries',
      unit: 'Incidents',
      currentValue: social.injuries,
      baseline: 2,
      upperLimit: limits.injuriesUpper,
      regulatoryRef: 'OSHA / ISO 45001 Occupational Health & Safety',
      rationale: 'Triggers safety audit if lost-time injuries exceed annual threshold limit.',
      evaluate: (val: number) => {
        if (val > limits.injuriesUpper * 2) {
          return { status: 'critical', msg: `Severe safety surge: ${val} injuries reported (>2x threshold limit of ${limits.injuriesUpper}). Immediate factory safety audit mandated.`, variance: Math.round(((val - 2) / 2) * 100) };
        }
        if (val > limits.injuriesUpper) {
          return { status: 'warning', msg: `Elevated injury incidents (${val}) exceed safe limit (${limits.injuriesUpper}). Verify contractor PPE compliance and toolbox talks.`, variance: Math.round(((val - 2) / 2) * 100) };
        }
        return { status: 'clean', msg: 'Injuries within expected safe construction zone parameters.', variance: Math.round(((val - 2) / 2) * 100) };
      }
    },
    {
      id: 'soc-3',
      ruleCode: 'SOC-DIVERS-03',
      name: 'Female Workforce Diversity',
      category: 'social' as const,
      fieldKey: 'femalePct',
      unit: '%',
      currentValue: social.femalePct,
      baseline: 24.2,
      upperLimit: 100,
      lowerLimit: 15.0,
      regulatoryRef: 'SEBI BRSR Core Principle 3 Indicator 1',
      rationale: 'Monitors gender representation against minimum corporate diversity threshold (15%).',
      evaluate: (val: number) => {
        if (val < 15.0) {
          return { status: 'warning', msg: `Diversity deficiency: Female workforce (${val}%) is below minimum benchmark (15.0%).`, variance: Math.round(((val - 24.2) / 24.2) * 100) };
        }
        return { status: 'clean', msg: `Workforce diversity (${val}%) conforms to corporate ESG targets.`, variance: Math.round(((val - 24.2) / 24.2) * 100) };
      }
    },
    {
      id: 'soc-4',
      ruleCode: 'SOC-LABOR-04',
      name: 'Contractual Labor Headcount Surge',
      category: 'social' as const,
      fieldKey: 'contractWorkers',
      unit: 'Workers',
      currentValue: social.contractWorkers,
      baseline: 4200,
      upperLimit: limits.contractWorkersUpper,
      regulatoryRef: 'Contract Labour (Regulation & Abolition) Act',
      rationale: 'Monitors sudden contractual workforce spikes against statutory contractor license capacity.',
      evaluate: (val: number) => {
        if (val > limits.contractWorkersUpper) {
          return { status: 'warning', msg: `Contractor labor surge: ${val.toLocaleString()} workers exceeds licensed site threshold (${limits.contractWorkersUpper.toLocaleString()}). Confirm PF & ESI compliance.`, variance: Math.round(((val - 4200) / 4200) * 100) };
        }
        return { status: 'clean', msg: 'Contractual manpower is within contractor license capacity.', variance: Math.round(((val - 4200) / 4200) * 100) };
      }
    },

    // --- GOVERNANCE RULES ---
    {
      id: 'gov-1',
      ruleCode: 'GOV-ETHIC-01',
      name: 'Anti-Corruption & Anti-Bribery Code',
      category: 'governance' as const,
      fieldKey: 'antiCorruption',
      unit: 'Policy Status',
      currentValue: governance.antiCorruption,
      baseline: 1,
      upperLimit: 1,
      regulatoryRef: 'SEBI BRSR Core Principle 1 & Companies Act 2013',
      rationale: 'Requires continuous 100% active enforcement of anti-corruption code.',
      evaluate: (val: boolean) => {
        if (!val) {
          return { status: 'critical', msg: 'CRITICAL COMPLIANCE BREACH: Anti-Corruption policy marked inactive. Violates SEBI mandatory listing requirements.', variance: 100 };
        }
        return { status: 'clean', msg: 'Anti-corruption policy active across all operations and supply chain tiers.', variance: 0 };
      }
    },
    {
      id: 'gov-2',
      ruleCode: 'GOV-VIGIL-02',
      name: 'Whistleblower Unresolved Inquiries',
      category: 'governance' as const,
      fieldKey: 'whistleblowerCases',
      unit: 'Cases',
      currentValue: governance.whistleblowerCases,
      baseline: 1,
      upperLimit: limits.whistleblowerUpper,
      regulatoryRef: 'SEBI LODR Regulation 22 (Vigil Mechanism)',
      rationale: 'Flags unresolved whistleblower complaints exceeding acceptable committee backlog.',
      evaluate: (val: number) => {
        if (val > limits.whistleblowerUpper * 2) {
          return { status: 'critical', msg: `Severe grievance backlog: ${val} complaints exceeds maximum limit (${limits.whistleblowerUpper}). Triggers Audit Committee intervention.`, variance: Math.round(((val - 1) / 1) * 100) };
        }
        if (val > limits.whistleblowerUpper) {
          return { status: 'warning', msg: `Elevated complaints: ${val} cases exceeds normal operational threshold (${limits.whistleblowerUpper}).`, variance: Math.round(((val - 1) / 1) * 100) };
        }
        return { status: 'clean', msg: 'Whistleblower complaints managed within statutory resolution timelines.', variance: 0 };
      }
    }
  ];

  // Run evaluation across all configured rules
  const evaluatedRules = rulesList.map(rule => {
    const evalResult = (rule.evaluate as any)(rule.currentValue);
    const hasJustification = !!justifications[rule.ruleCode];
    const effectiveStatus = (evalResult.status === 'warning' && hasJustification) ? 'justified' : evalResult.status;

    return {
      ...rule,
      status: effectiveStatus,
      rawStatus: evalResult.status,
      message: evalResult.msg,
      variancePct: evalResult.variance,
      hasJustification,
      justificationNote: justifications[rule.ruleCode] || ''
    };
  });

  // Calculate Aggregates
  const totalRules = evaluatedRules.length;
  const criticalCount = evaluatedRules.filter(r => r.status === 'critical').length;
  const warningCount = evaluatedRules.filter(r => r.status === 'warning').length;
  const justifiedCount = evaluatedRules.filter(r => r.status === 'justified').length;
  const passedCount = evaluatedRules.filter(r => r.status === 'clean').length;

  const totalAnomalies = criticalCount + warningCount;
  const healthScore = Math.max(0, Math.min(100, Math.round(100 - (criticalCount * 25) - (warningCount * 10))));

  // Filter based on pillar and status
  const filteredRules = evaluatedRules.filter(r => {
    const matchesCategory = activeCategory === 'all' || r.category === activeCategory;
    if (!matchesCategory) return false;
    if (statusFilter === 'anomalies') return r.status === 'warning' || r.status === 'critical';
    if (statusFilter === 'passed') return r.status === 'clean' || r.status === 'justified';
    return true;
  });

  // Handle Inspection Open
  const handleOpenInspect = (rule: any) => {
    setInspectedRule(rule);
    setEditValue(rule.currentValue);
    setJustificationText(justifications[rule.ruleCode] || '');
  };

  // Handle Value Adjustment from inside modal
  const handleApplyValueEdit = () => {
    if (!inspectedRule) return;
    const num = Number(editValue);
    if (isNaN(num)) {
      addToast('Invalid Value', 'Please provide a valid numeric value', 'error');
      return;
    }
    onUpdateMetric(inspectedRule.category, inspectedRule.fieldKey, num);
    addToast('Metric Updated', `${inspectedRule.name} set to ${num} ${inspectedRule.unit}. AI checks re-evaluated!`, 'success');
    setInspectedRule(null);
  };

  // Handle Justification Save
  const handleSaveJustification = () => {
    if (!inspectedRule) return;
    if (!justificationText.trim()) {
      addToast('Remarks Required', 'Please enter an operational explanation for the variance', 'error');
      return;
    }
    setJustifications(prev => ({
      ...prev,
      [inspectedRule.ruleCode]: justificationText.trim()
    }));
    addToast('Justification Recorded', `Operational remarks attached to ${inspectedRule.ruleCode}`, 'info');
    setInspectedRule(null);
  };

  // Quick Preset Simulations for Demo Testing
  const handleSimulate = (type: 'elec_spike' | 'fatal_breach' | 'water_inversion' | 'clean_reset') => {
    if (type === 'elec_spike') {
      onUpdateMetric('environmental', 'electricityKwh', 119500);
      addToast('Simulation Active', 'Electricity set to 119,500 kWh (+42% vs baseline). AI Anomaly triggered!', 'warning');
    } else if (type === 'fatal_breach') {
      onUpdateMetric('social', 'fatalities', 1);
      addToast('Simulation Active', 'Workplace fatality entered (1). CRITICAL Statutory Breach triggered!', 'error');
    } else if (type === 'water_inversion') {
      onUpdateMetric('environmental', 'waterRecycledKl', 65000);
      onUpdateMetric('environmental', 'waterWithdrawalKl', 48000);
      addToast('Simulation Active', 'Recycled water (65,000 KL) > Withdrawal (48,000 KL). Arithmetic breach triggered!', 'error');
    } else {
      // Clean reset
      onUpdateMetric('environmental', 'electricityKwh', 86000);
      onUpdateMetric('environmental', 'fuelLitres', 24500);
      onUpdateMetric('environmental', 'renewableEnergyPct', 46.0);
      onUpdateMetric('environmental', 'waterWithdrawalKl', 50000);
      onUpdateMetric('environmental', 'waterConsumptionKl', 38000);
      onUpdateMetric('environmental', 'waterRecycledKl', 18500);
      onUpdateMetric('environmental', 'hazardousWasteMt', 12.0);
      onUpdateMetric('social', 'fatalities', 0);
      onUpdateMetric('social', 'injuries', 2);
      onUpdateMetric('social', 'femalePct', 25.0);
      onUpdateMetric('social', 'contractWorkers', 4100);
      onUpdateMetric('governance', 'antiCorruption', true);
      onUpdateMetric('governance', 'whistleblowerCases', 1);
      addToast('Reset Complete', 'All metrics reset to verified safe operational baselines.', 'success');
    }
  };

  const getPillarIcon = (cat: string) => {
    switch (cat) {
      case 'environmental': return <Zap className="w-3.5 h-3.5 text-emerald-600" />;
      case 'social': return <Users className="w-3.5 h-3.5 text-teal-600" />;
      case 'governance': return <Scale className="w-3.5 h-3.5 text-blue-600" />;
      default: return <Sparkles className="w-3.5 h-3.5 text-emerald-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top AI Health Index & Summary */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-[#0c1f17] via-slate-900 to-[#122b22] text-white border border-emerald-500/30 flex flex-col lg:flex-row lg:items-center justify-between gap-5 shadow-sm">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-emerald-400" />
              Real-Time AI Multi-Pillar Anomaly Engine
            </span>
            <span className="text-xs text-slate-300 font-mono">
              Project: {projectCode}
            </span>
          </div>
          <h2 className="text-lg font-bold text-slate-100 font-heading">
            Automated Rules & Threshold Variance Engine
          </h2>
          <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
            Continuously audits operational disclosures across <strong>Environmental</strong>, <strong>Social</strong>, and <strong>Governance</strong> data. Detects statistical outliers, statutory breaches, and arithmetic inconsistencies before BU submission.
          </p>
        </div>

        {/* Health Score Pill */}
        <div className="flex items-center gap-4 bg-white/5 border border-white/10 p-3 rounded-xl flex-shrink-0">
          <div className="text-center px-2">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">AI Health Index</p>
            <div className={`text-3xl font-black font-heading ${
              healthScore >= 90 ? 'text-emerald-400' : healthScore >= 70 ? 'text-amber-400' : 'text-rose-400'
            }`}>
              {healthScore}%
            </div>
            <p className="text-[10px] text-slate-300">
              {criticalCount > 0 ? 'Critical Breach' : warningCount > 0 ? 'Variances Detected' : 'All Clear'}
            </p>
          </div>

          <div className="h-10 w-px bg-white/10" />

          <div className="space-y-1 text-xs">
            <div className="flex items-center justify-between gap-4">
              <span className="text-slate-400 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Passed:
              </span>
              <strong className="text-emerald-300">{passedCount + justifiedCount} / {totalRules}</strong>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-slate-400 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3 text-amber-400" /> Warnings:
              </span>
              <strong className="text-amber-300">{warningCount}</strong>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-slate-400 flex items-center gap-1">
                <AlertOctagon className="w-3 h-3 text-rose-400" /> Critical:
              </span>
              <strong className="text-rose-300">{criticalCount}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Simulator & Limit Configuration Banner */}
      <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <div>
            <span className="font-bold text-slate-900 dark:text-slate-100">
              Test Real-Time Logic & Limit Thresholds
            </span>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Simulate live data entry above the set limits to watch the AI flag anomalies and open the inspector.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleSimulate('elec_spike')}
            className="text-[11px] hover:border-amber-400"
            icon={<Zap className="w-3 h-3 text-amber-500" />}
          >
            Spike Electricity (+42%)
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => handleSimulate('water_inversion')}
            className="text-[11px] hover:border-rose-400"
            icon={<Droplets className="w-3 h-3 text-rose-500" />}
          >
            Water Inversion (Recycled &gt; Withdrawal)
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => handleSimulate('fatal_breach')}
            className="text-[11px] text-rose-600 dark:text-rose-400 hover:border-rose-400"
            icon={<AlertOctagon className="w-3 h-3 text-rose-500" />}
          >
            Workplace Fatality
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleSimulate('clean_reset')}
            className="text-[11px] text-slate-600 dark:text-slate-300"
            icon={<RotateCcw className="w-3 h-3" />}
          >
            Reset
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => setShowConfigDrawer(!showConfigDrawer)}
            className="text-[11px] bg-slate-800 hover:bg-slate-700 text-white"
            icon={<Sliders className="w-3 h-3 text-emerald-400" />}
          >
            {showConfigDrawer ? 'Hide Limits' : 'Configure Limits'}
          </Button>
        </div>
      </div>

      {/* Expandable Limits Configuration Panel */}
      {showConfigDrawer && (
        <Card className="p-4 bg-emerald-50/20 dark:bg-emerald-950/10 border-emerald-300/60 dark:border-emerald-800/60 space-y-3">
          <div className="flex items-center justify-between border-b border-emerald-200/50 dark:border-emerald-800/50 pb-2">
            <div>
              <h4 className="font-bold text-xs text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-emerald-600" />
                Configurable Upper/Lower Threshold Limits (Per Facility Operational Envelope)
              </h4>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">
                Any value entered above these thresholds will immediately be caught by the AI anomaly engine.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Electricity Upper Limit (kWh)
              </label>
              <input
                type="number"
                value={limits.electricityUpper}
                onChange={(e) => setLimits(prev => ({ ...prev, electricityUpper: Number(e.target.value) }))}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono text-xs"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Stationary Diesel Upper Limit (L)
              </label>
              <input
                type="number"
                value={limits.fuelUpper}
                onChange={(e) => setLimits(prev => ({ ...prev, fuelUpper: Number(e.target.value) }))}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono text-xs"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Renewable Share Minimum Target (%)
              </label>
              <input
                type="number"
                value={limits.renewableLower}
                onChange={(e) => setLimits(prev => ({ ...prev, renewableLower: Number(e.target.value) }))}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono text-xs"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Water Extraction Limit (KL)
              </label>
              <input
                type="number"
                value={limits.waterWithdrawalUpper}
                onChange={(e) => setLimits(prev => ({ ...prev, waterWithdrawalUpper: Number(e.target.value) }))}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono text-xs"
              />
            </div>
          </div>
        </Card>
      )}

      {/* Main Validation Rules Table Card */}
      <Card className="p-5 space-y-4">
        {/* Filter Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
          {/* Pillar Filters */}
          <div className="flex items-center gap-1.5 overflow-x-auto text-xs font-semibold">
            {[
              { id: 'all', label: `All Checks (${totalRules})` },
              { id: 'environmental', label: 'Environmental (7)', icon: Zap },
              { id: 'social', label: 'Social (4)', icon: Users },
              { id: 'governance', label: 'Governance (2)', icon: Scale },
            ].map(tab => {
              const isSelected = activeCategory === tab.id;
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveCategory(tab.id as any)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-all cursor-pointer whitespace-nowrap ${
                    isSelected
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                      : 'bg-white dark:bg-[#141f1b] border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50'
                  }`}
                >
                  {Icon && <Icon className="w-3 h-3" />}
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5 text-xs">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-semibold border ${
                statusFilter === 'all'
                  ? 'bg-slate-900 text-white border-slate-900 dark:bg-slate-100 dark:text-slate-900'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
              }`}
            >
              All Rules
            </button>
            <button
              onClick={() => setStatusFilter('anomalies')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-semibold border flex items-center gap-1 ${
                statusFilter === 'anomalies'
                  ? 'bg-amber-600 text-white border-amber-600'
                  : 'bg-white dark:bg-slate-900 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800'
              }`}
            >
              <AlertTriangle className="w-3 h-3" />
              Anomalies ({totalAnomalies})
            </button>
            <button
              onClick={() => setStatusFilter('passed')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-semibold border flex items-center gap-1 ${
                statusFilter === 'passed'
                  ? 'bg-emerald-600 text-white border-emerald-600'
                  : 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
              }`}
            >
              <CheckCircle2 className="w-3 h-3" />
              Passed ({passedCount})
            </button>
          </div>
        </div>

        {/* Rules List / Cards */}
        <div className="divide-y divide-slate-100 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
          {filteredRules.map((rule) => {
            const isAnomaly = rule.status === 'warning' || rule.status === 'critical';
            const isCritical = rule.status === 'critical';
            const isJustified = rule.status === 'justified';

            return (
              <div
                key={rule.id}
                className={`p-4 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs ${
                  isCritical 
                    ? 'bg-rose-50/60 dark:bg-rose-950/20' 
                    : isAnomaly 
                      ? 'bg-amber-50/60 dark:bg-amber-950/20' 
                      : isJustified
                        ? 'bg-blue-50/40 dark:bg-blue-950/20'
                        : 'bg-white dark:bg-[#0c1411] hover:bg-slate-50/60 dark:hover:bg-slate-800/40'
                }`}
              >
                {/* Left: Code, Name, Value */}
                <div className="flex items-start gap-3 min-w-0">
                  <div className="mt-0.5 flex-shrink-0">
                    {isCritical ? (
                      <div className="w-7 h-7 rounded-lg bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 flex items-center justify-center">
                        <AlertOctagon className="w-4 h-4" />
                      </div>
                    ) : isAnomaly ? (
                      <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300 flex items-center justify-center">
                        <AlertTriangle className="w-4 h-4" />
                      </div>
                    ) : isJustified ? (
                      <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 flex items-center justify-center">
                        <FileText className="w-4 h-4" />
                      </div>
                    ) : (
                      <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 flex items-center justify-center">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-[10px] font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                        {rule.ruleCode}
                      </span>
                      <p className="font-bold text-slate-900 dark:text-slate-100">
                        {rule.name}
                      </p>
                      <span className="text-[10px] text-slate-400">
                        ({rule.regulatoryRef})
                      </span>
                    </div>

                    <p className={`text-[11px] leading-relaxed ${
                      isCritical 
                        ? 'text-rose-900 dark:text-rose-200 font-medium' 
                        : isAnomaly 
                          ? 'text-amber-900 dark:text-amber-200 font-medium' 
                          : isJustified
                            ? 'text-blue-900 dark:text-blue-200'
                            : 'text-slate-600 dark:text-slate-400'
                    }`}>
                      {rule.message}
                    </p>

                    {isJustified && (
                      <p className="text-[10px] text-blue-700 dark:text-blue-300 italic bg-blue-100/50 dark:bg-blue-950/40 px-2 py-0.5 rounded inline-block">
                        Engineering note: "{rule.justificationNote}"
                      </p>
                    )}

                    <div className="flex flex-wrap items-center gap-3 text-[10px] text-slate-400 pt-0.5">
                      <span>Entered: <strong className="font-mono text-slate-800 dark:text-slate-200">{typeof rule.currentValue === 'boolean' ? (rule.currentValue ? 'Active' : 'Inactive') : `${Number(rule.currentValue).toLocaleString()} ${rule.unit}`}</strong></span>
                      <span>•</span>
                      <span>Baseline: <span className="font-mono">{typeof rule.baseline === 'boolean' ? 'Active' : `${rule.baseline.toLocaleString()} ${rule.unit}`}</span></span>
                      <span>•</span>
                      <span>Allowed Threshold: <span className="font-mono">{typeof rule.upperLimit === 'boolean' ? 'Active' : `${rule.upperLimit.toLocaleString()} ${rule.unit}`}</span></span>
                    </div>
                  </div>
                </div>

                {/* Right: Badge & Inspect Action */}
                <div className="flex items-center gap-2 self-end md:self-center flex-shrink-0">
                  {isCritical ? (
                    <span className="px-2.5 py-1 rounded text-[10px] font-bold bg-rose-100 text-rose-900 dark:bg-rose-950 dark:text-rose-200 border border-rose-300/60 uppercase tracking-wider flex items-center gap-1">
                      <AlertOctagon className="w-3 h-3 text-rose-600" />
                      Critical Outlier
                    </span>
                  ) : isAnomaly ? (
                    <span className="px-2.5 py-1 rounded text-[10px] font-bold bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200 border border-amber-300/60 uppercase tracking-wider flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3 text-amber-600" />
                      Variance Flag
                    </span>
                  ) : isJustified ? (
                    <span className="px-2.5 py-1 rounded text-[10px] font-bold bg-blue-100 text-blue-900 dark:bg-blue-950 dark:text-blue-200 border border-blue-300/60 uppercase tracking-wider flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-blue-600" />
                      Justified
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 rounded text-[10px] font-bold bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200 border border-emerald-300/60 uppercase tracking-wider flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      Pass
                    </span>
                  )}

                  <Button
                    variant={isAnomaly ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => handleOpenInspect(rule)}
                    className={isAnomaly ? 'bg-amber-600 hover:bg-amber-700 text-white' : ''}
                    icon={<Eye className="w-3.5 h-3.5" />}
                  >
                    Inspect
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* INSPECT ANOMALY MODAL */}
      {inspectedRule && (
        <Modal
          isOpen={!!inspectedRule}
          onClose={() => setInspectedRule(null)}
          title={`AI Anomaly Inspection: ${inspectedRule.name}`}
          subtitle={`Rule Code: ${inspectedRule.ruleCode} • ${inspectedRule.regulatoryRef}`}
          maxWidth="lg"
        >
          <div className="space-y-4 text-xs">
            {/* Status & Diagnostic Card */}
            <div className={`p-4 rounded-xl border space-y-2 ${
              inspectedRule.rawStatus === 'critical'
                ? 'bg-rose-50 dark:bg-rose-950/30 border-rose-300 dark:border-rose-800'
                : inspectedRule.rawStatus === 'warning'
                  ? 'bg-amber-50 dark:bg-amber-950/30 border-amber-300 dark:border-amber-800'
                  : 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800'
            }`}>
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                  {getPillarIcon(inspectedRule.category)}
                  {inspectedRule.name}
                </span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                  inspectedRule.rawStatus === 'critical' 
                    ? 'bg-rose-200 text-rose-900' 
                    : inspectedRule.rawStatus === 'warning' 
                      ? 'bg-amber-200 text-amber-900' 
                      : 'bg-emerald-200 text-emerald-900'
                }`}>
                  Severity: {inspectedRule.rawStatus === 'critical' ? 'High / Critical' : inspectedRule.rawStatus === 'warning' ? 'Medium Variance' : 'Compliant'}
                </span>
              </div>

              <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                {inspectedRule.message}
              </p>

              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-black/5 dark:border-white/5 font-mono text-[11px]">
                <div>
                  <span className="text-slate-400 block text-[10px]">CURRENT VALUE</span>
                  <span className="font-bold text-slate-900 dark:text-slate-100">
                    {typeof inspectedRule.currentValue === 'boolean' ? (inspectedRule.currentValue ? 'Active' : 'Inactive') : `${Number(inspectedRule.currentValue).toLocaleString()} ${inspectedRule.unit}`}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">HISTORICAL BASELINE</span>
                  <span className="text-slate-700 dark:text-slate-300">
                    {typeof inspectedRule.baseline === 'boolean' ? 'Active' : `${inspectedRule.baseline.toLocaleString()} ${inspectedRule.unit}`}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">ALLOWED THRESHOLD</span>
                  <span className="text-slate-700 dark:text-slate-300">
                    {typeof inspectedRule.upperLimit === 'boolean' ? 'Active' : `${inspectedRule.upperLimit.toLocaleString()} ${inspectedRule.unit}`}
                  </span>
                </div>
              </div>
            </div>

            {/* Regulatory Rationale */}
            <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-800 text-[11px] space-y-1">
              <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                Statutory Compliance & Assurance Context:
              </span>
              <p className="text-slate-600 dark:text-slate-400">
                {inspectedRule.rationale}
              </p>
            </div>

            {/* Interactive Option 1: Recheck & Modify Value Right Here */}
            {typeof inspectedRule.currentValue !== 'boolean' && (
              <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#141f1b] space-y-2">
                <label className="block font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <Edit3 className="w-3.5 h-3.5 text-emerald-600" />
                  Option A: Recheck & Correct Value Directly
                </label>
                <p className="text-[11px] text-slate-500">
                  If an erroneous value was entered due to a transcription error, adjust it here to instantly re-test against the threshold.
                </p>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-mono text-sm"
                  />
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleApplyValueEdit}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    Apply Value
                  </Button>
                </div>
              </div>
            )}

            {/* Interactive Option 2: Provide Engineering & Operational Justification */}
            <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#141f1b] space-y-2">
              <label className="block font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-blue-600" />
                Option B: Provide Engineering Justification for Outlier
              </label>
              <p className="text-[11px] text-slate-500">
                If this spike is operational (e.g., equipment testing, plant expansion), provide an engineering rationale to clear the warning for BU review.
              </p>
              <textarea
                rows={2}
                value={justificationText}
                onChange={(e) => setJustificationText(e.target.value)}
                placeholder="e.g. Additional 50 MW solar inverter string commissioned in Q4, causing transient auxiliary power consumption..."
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-xs"
              />
              <div className="flex justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSaveJustification}
                  className="text-xs"
                >
                  Save Justification Note
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setInspectedRule(null)}
              >
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
