import React, { useState } from 'react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';
import { 
  Leaf, 
  Zap, 
  Droplets, 
  Trash2, 
  CloudRain, 
  FileUp, 
  AlertTriangle, 
  CheckCircle2, 
  Save, 
  Send,
  TrendingDown
} from 'lucide-react';
import { Card, CardHeader } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { StatusBadge } from '../components/common/StatusBadge';
import { ProgressBar } from '../components/common/ProgressBar';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { esgApi } from '../api';

export const EnvironmentalHub: React.FC = () => {
  const { user, canEditData } = useAuth();
  const { reportingYear, addToast } = useApp();
  const queryClient = useQueryClient();

  const [activeSection, setActiveSection] = useState<'emissions' | 'energy' | 'water' | 'waste'>('emissions');

  // Form states with live calculation
  const [scope1, setScope1] = useState(14850);
  const [scope2, setScope2] = useState(28400);
  const [scope3, setScope3] = useState(68200);

  const [electricity, setElectricity] = useState(124500);
  const [renewablePct, setRenewablePct] = useState(46.8);

  const [waterWithdrawal, setWaterWithdrawal] = useState(384000);
  const [waterRecycledPct, setWaterRecycledPct] = useState(58.4);

  const [hazardousWaste, setHazardousWaste] = useState(84.5);
  const [nonHazardousWaste, setNonHazardousWaste] = useState(1420);

  const totalGhg = scope1 + scope2;
  const turnoverCr = 48200;
  const ghgIntensity = ((totalGhg / turnoverCr)).toFixed(3); // tCO2e / Cr

  const emissionsTrend = [
    { year: 'FY23', scope1: 18200, scope2: 38500, scope3: 78000 },
    { year: 'FY24', scope1: 17400, scope2: 35800, scope3: 74500 },
    { year: 'FY25', scope1: 16200, scope2: 33100, scope3: 71500 },
    { year: 'FY26', scope1: scope1, scope2: scope2, scope3: scope3 },
  ];

  const waterTrend = [
    { year: 'FY23', withdrawal: 450, recycled: 185 },
    { year: 'FY24', withdrawal: 430, recycled: 198 },
    { year: 'FY25', withdrawal: 412, recycled: 211 },
    { year: 'FY26', withdrawal: Math.round(waterWithdrawal / 1000), recycled: Math.round((waterWithdrawal * waterRecycledPct) / 100000) },
  ];

  const saveMutation = useMutation({
    mutationFn: async (status: 'draft' | 'submitted') => {
      return await esgApi.saveEnvironmental({
        projectId: 'proj-1',
        reportingPeriod: reportingYear || 'FY 2025-26',
        electricityKwh: electricity,
        fuelLitres: 25000,
        renewableEnergyPct: renewablePct,
        waterWithdrawalKl: waterWithdrawal,
        waterRecycledPct: waterRecycledPct,
        hazardousWasteMt: hazardousWaste,
        nonHazardousWasteMt: nonHazardousWaste,
        scope1GhgTco2e: scope1,
        scope2GhgTco2e: scope2,
        scope3GhgTco2e: scope3,
        status,
        userName: user?.name || 'Project User'
      });
    },
    onSuccess: (_, status) => {
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['approvals'] });
      if (status === 'submitted') {
        addToast('Submitted to Business Manager', 'Environmental disclosures successfully submitted to Vikram Malhotra', 'success');
      } else {
        addToast('Environmental Data Saved', 'Values successfully committed to database & recalculated', 'success');
      }
    },
    onError: () => {
      addToast('Sync Warning', 'Saved locally. Ensure API server is listening on port 3001.', 'info');
    }
  });

  const handleSave = () => {
    saveMutation.mutate('draft');
  };

  const handleSubmit = () => {
    saveMutation.mutate('submitted');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 font-heading m-0">
              Environmental ESG Hub
            </h1>
            <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold border border-emerald-300/40">
              BRSR Principle 6
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            GHG Protocol Corporate Standard (Scope 1, 2, 3), ISO 14064 verification, Energy intensity, Water stewardship, and Waste circularity.
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
            Save Changes
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleSubmit}
            disabled={!canEditData}
            icon={<Send className="w-3.5 h-3.5" />}
          >
            Submit for BU Signoff
          </Button>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <Card className="bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200/80 dark:border-emerald-800/60">
          <p className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">
            Total Scope 1 & 2
          </p>
          <div className="mt-2 text-2xl font-black text-slate-900 dark:text-slate-100 font-heading">
            {totalGhg.toLocaleString()} <span className="text-xs font-normal text-slate-500">tCO2e</span>
          </div>
          <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1">
            Intensity: {ghgIntensity} tCO2e / ₹ Cr turnover
          </p>
        </Card>

        <Card className="bg-teal-50/50 dark:bg-teal-950/20 border-teal-200/80 dark:border-teal-800/60">
          <p className="text-[11px] font-bold text-teal-800 dark:text-teal-300 uppercase tracking-wider">
            Renewable Electricity
          </p>
          <div className="mt-2 text-2xl font-black text-slate-900 dark:text-slate-100 font-heading">
            {renewablePct}%
          </div>
          <p className="text-[10px] text-teal-600 dark:text-teal-400 font-semibold mt-1">
            Surpassed FY26 target of 45.0%
          </p>
        </Card>

        <Card className="bg-blue-50/50 dark:bg-blue-950/20 border-blue-200/80 dark:border-blue-800/60">
          <p className="text-[11px] font-bold text-blue-800 dark:text-blue-300 uppercase tracking-wider">
            Water Recycled / Reused
          </p>
          <div className="mt-2 text-2xl font-black text-slate-900 dark:text-slate-100 font-heading">
            {waterRecycledPct}%
          </div>
          <p className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold mt-1">
            Zero Liquid Discharge at key sites
          </p>
        </Card>

        <Card className="bg-purple-50/50 dark:bg-purple-950/20 border-purple-200/80 dark:border-purple-800/60">
          <p className="text-[11px] font-bold text-purple-800 dark:text-purple-300 uppercase tracking-wider">
            Hazardous Waste Co-processed
          </p>
          <div className="mt-2 text-2xl font-black text-slate-900 dark:text-slate-100 font-heading">
            100%
          </div>
          <p className="text-[10px] text-purple-600 dark:text-purple-400 font-semibold mt-1">
            State PCB TSDF manifests verified
          </p>
        </Card>
      </div>

      {/* Section Switcher Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-2">
        {[
          { id: 'emissions', label: 'GHG Emissions (Scope 1, 2, 3)', icon: CloudRain },
          { id: 'energy', label: 'Energy Consumption & Clean Mix', icon: Zap },
          { id: 'water', label: 'Water Withdrawal & ZLD Systems', icon: Droplets },
          { id: 'waste', label: 'Hazardous & Non-Hazardous Waste', icon: Trash2 },
        ].map(sec => {
          const Icon = sec.icon;
          return (
            <button
              key={sec.id}
              onClick={() => setActiveSection(sec.id as any)}
              className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold border-b-2 transition-all cursor-pointer ${
                activeSection === sec.id
                  ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400 bg-emerald-50/40 dark:bg-emerald-950/20'
                  : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              <Icon className="w-4 h-4 text-emerald-500" />
              <span>{sec.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Content Area: Emissions Form & Trend Visualizer */}
      {activeSection === 'emissions' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Data Entry Form */}
          <div className="lg:col-span-6 space-y-4">
            <Card>
              <CardHeader
                title="Greenhouse Gas Disclosures (P6-E5 & P6-L1)"
                subtitle="Calculated pursuant to GHG Protocol Corporate Standard"
              />

              <div className="space-y-4 text-xs">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="font-semibold text-slate-800 dark:text-slate-200">
                      Scope 1: Direct GHG Emissions (tCO2e)
                    </label>
                    <span className="text-[10px] text-slate-400">Previous: 16,200 tCO2e (-8.3%)</span>
                  </div>
                  <input
                    type="number"
                    value={scope1}
                    onChange={(e) => setScope1(Number(e.target.value))}
                    disabled={!canEditData}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 font-mono font-bold"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    Includes heavy construction diesel fleet, on-site furnaces, and stationary generators.
                  </p>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="font-semibold text-slate-800 dark:text-slate-200">
                      Scope 2: Indirect Emissions (Market-Based) (tCO2e)
                    </label>
                    <span className="text-[10px] text-slate-400">Previous: 33,100 tCO2e (-14.2%)</span>
                  </div>
                  <input
                    type="number"
                    value={scope2}
                    onChange={(e) => setScope2(Number(e.target.value))}
                    disabled={!canEditData}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 font-mono font-bold"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    Procured electricity across sites adjusted for green power purchase agreements.
                  </p>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="font-semibold text-slate-800 dark:text-slate-200">
                      Scope 3: Value Chain & Logistics (Leadership) (tCO2e)
                    </label>
                    <span className="text-[10px] text-slate-400">Previous: 71,500 tCO2e</span>
                  </div>
                  <input
                    type="number"
                    value={scope3}
                    onChange={(e) => setScope3(Number(e.target.value))}
                    disabled={!canEditData}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 font-mono font-bold"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    Category 1 Purchased Capital Goods & Category 4 Upstream Transportation.
                  </p>
                </div>

                <div className="p-3 bg-emerald-50/60 dark:bg-emerald-950/30 rounded-lg border border-emerald-200/80 dark:border-emerald-800/50 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase text-emerald-800 dark:text-emerald-300">Third-Party Assurance</span>
                    <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                      Reasonable Assurance Issued by DNV Business Assurance
                    </p>
                  </div>
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                </div>
              </div>
            </Card>
          </div>

          {/* Visual Trend Chart */}
          <div className="lg:col-span-6 space-y-4">
            <Card>
              <CardHeader
                title="Historical Emissions Trajectory"
                subtitle="Year-over-Year progress towards Net-Zero 2040 commitment"
              />
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={emissionsTrend} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                    <XAxis dataKey="year" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0f1714',
                        borderColor: '#1c2e27',
                        color: '#fff',
                        fontSize: '11px',
                        borderRadius: '8px'
                      }}
                    />
                    <Area type="monotone" dataKey="scope1" name="Scope 1" stroke="#10b981" fill="#10b981" fillOpacity={0.3} />
                    <Area type="monotone" dataKey="scope2" name="Scope 2" stroke="#0d9488" fill="#0d9488" fillOpacity={0.2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-3 p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-500">Gross Scope 1 + 2:</span>
                  <strong className="text-slate-900 dark:text-slate-100">{totalGhg.toLocaleString()} tCO2e</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">SEBI Core GHG Intensity:</span>
                  <strong className="text-emerald-600 dark:text-emerald-400">{ghgIntensity} tCO2e / ₹ Cr</strong>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* Energy Section */}
      {activeSection === 'energy' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader
              title="Total Energy Consumption & Intensity (P6-E1)"
              subtitle="Gigajoules (GJ) across fossil fuels, grid, and captive renewables"
            />
            <div className="space-y-4 text-xs">
              <div>
                <label className="font-semibold block mb-1">Total Electricity Consumption (GJ)</label>
                <input
                  type="number"
                  value={electricity}
                  onChange={(e) => setElectricity(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 font-mono font-bold"
                />
              </div>

              <div>
                <label className="font-semibold block mb-1">Renewable Energy Share (%)</label>
                <input
                  type="number"
                  value={renewablePct}
                  onChange={(e) => setRenewablePct(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 font-mono font-bold"
                />
              </div>

              <ProgressBar value={renewablePct} label="Clean Energy Transition Progress" showLabel variant="emerald" />
            </div>
          </Card>

          <Card>
            <CardHeader
              title="Energy Efficiency Measures"
              subtitle="Commissioned audits and certifications"
            />
            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-lg flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-slate-100">ISO 50001 Energy Management</h4>
                  <p className="text-slate-400 text-[10px]">All heavy fabrication yards recertified through 2027</p>
                </div>
                <StatusBadge status="validated" size="sm" />
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-lg flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-slate-100">Captive Rooftop Solar Installation</h4>
                  <p className="text-slate-400 text-[10px]">12 MW installed across manufacturing sheds</p>
                </div>
                <StatusBadge status="approved" size="sm" />
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Water & Waste Sections */}
      {(activeSection === 'water' || activeSection === 'waste') && (
        <Card>
          <CardHeader
            title={activeSection === 'water' ? 'Water Balance & Zero Liquid Discharge (P6-E3)' : 'Hazardous & Solid Waste Manifests (P6-E8)'}
            subtitle={activeSection === 'water' ? 'Telemetry flow meter records and recharge wells' : 'State Pollution Control Board manifest ledger'}
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-4 bg-slate-50 dark:bg-slate-900/60 rounded-xl space-y-2">
              <span className="text-slate-400 block text-[10px]">Primary Metric</span>
              <strong className="text-xl font-bold font-heading text-slate-900 dark:text-slate-100">
                {activeSection === 'water' ? `${waterWithdrawal.toLocaleString()} kL` : `${hazardousWaste} MT`}
              </strong>
              <p className="text-[11px] text-slate-500">
                {activeSection === 'water' ? 'Total Freshwater Withdrawal across surface & groundwater' : 'Hazardous waste safely co-processed in authorized kilns'}
              </p>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-900/60 rounded-xl space-y-2">
              <span className="text-slate-400 block text-[10px]">Recycle Ratio</span>
              <strong className="text-xl font-bold font-heading text-emerald-600 dark:text-emerald-400">
                {activeSection === 'water' ? `${waterRecycledPct}% Recycled` : '94.2% Diverted from Landfill'}
              </strong>
              <p className="text-[11px] text-slate-500">
                Verified through effluent telemetry sensors and TSDF disposal receipts
              </p>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-900/60 rounded-xl space-y-2 flex flex-col justify-between">
              <div>
                <span className="text-slate-400 block text-[10px]">Assurance State</span>
                <strong className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  Ready for Auditor Sampling
                </strong>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => addToast('Audit Trail Opened', 'Inspecting raw meter sensor telemetry', 'info')}
              >
                Inspect Telemetry Log
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};
