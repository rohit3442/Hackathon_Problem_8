import React, { useState } from 'react';
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  BarChart3, 
  TrendingDown, 
  TrendingUp, 
  Leaf, 
  Users, 
  Scale, 
  Download,
  Filter
} from 'lucide-react';
import { Card, CardHeader } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { useApp } from '../context/AppContext';

export const Analytics: React.FC = () => {
  const { reportingYear, addToast } = useApp();

  const [activeCategory, setActiveCategory] = useState<'all' | 'environmental' | 'social' | 'governance'>('all');

  // Emission trends FY22-FY26
  const emissionsData = [
    { year: 'FY 2022-23', Scope1: 18200, Scope2: 38500, Scope3: 78000 },
    { year: 'FY 2023-24', Scope1: 17400, Scope2: 35800, Scope3: 74500 },
    { year: 'FY 2024-25', Scope1: 16200, Scope2: 33100, Scope3: 71500 },
    { year: 'FY 2025-26', Scope1: 14850, Scope2: 28400, Scope3: 68200 },
  ];

  // Water intensity vs recycling
  const waterData = [
    { year: 'FY23', withdrawal: 450, recycled: 185 },
    { year: 'FY24', withdrawal: 430, recycled: 198 },
    { year: 'FY25', withdrawal: 412, recycled: 211 },
    { year: 'FY26', withdrawal: 384, recycled: 224 },
  ];

  // Diversity & safety benchmark
  const diversityData = [
    { year: 'FY23', womenPct: 16.5, ltifr: 0.28 },
    { year: 'FY24', womenPct: 18.4, ltifr: 0.22 },
    { year: 'FY25', womenPct: 20.8, ltifr: 0.18 },
    { year: 'FY26', womenPct: 24.2, ltifr: 0.12 },
  ];

  const handleExport = () => {
    addToast('Analytics Exported', 'Downloaded multi-year ESG trends data book (XLSX)', 'success');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 font-heading m-0">
              ESG Analytics & Benchmark Suite
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold border border-emerald-300/40">
              Multi-Year Trends
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Historical comparisons (FY23–FY26), GHG intensity trajectories, clean energy mix, and peer benchmarks.
          </p>
        </div>

        <Button
          variant="secondary"
          size="sm"
          onClick={handleExport}
          icon={<Download className="w-3.5 h-3.5" />}
        >
          Export Analytics Data Book
        </Button>
      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* GHG Decarbonization Trajectory */}
        <Card>
          <CardHeader
            title="Consolidated Greenhouse Gas Reduction Trajectory"
            subtitle="Scope 1, Scope 2, and Scope 3 emissions (tCO2e)"
          />
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={emissionsData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
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
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Area type="monotone" dataKey="Scope1" stroke="#10b981" fill="#10b981" fillOpacity={0.4} />
                <Area type="monotone" dataKey="Scope2" stroke="#0d9488" fill="#0d9488" fillOpacity={0.3} />
                <Area type="monotone" dataKey="Scope3" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Freshwater Withdrawal vs Recycled Water Ratio */}
        <Card>
          <CardHeader
            title="Water Stewardship: Withdrawal vs Reclamation"
            subtitle="Volume in thousands of kilo-litres (kL)"
          />
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={waterData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
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
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Bar dataKey="withdrawal" name="Freshwater Withdrawal (kL)" fill="#0284c7" radius={[4, 4, 0, 0]} />
                <Bar dataKey="recycled" name="Recycled / Reused (kL)" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Diversity & Safety Parity */}
        <Card className="lg:col-span-2">
          <CardHeader
            title="Social Performance: Diversity Gain vs Safety LTIFR Reduction"
            subtitle="Female representation growth % alongside lowering lost-time injury incident rate"
          />
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={diversityData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="year" tick={{ fontSize: 11 }} />
                <YAxis yAxisId="left" tick={{ fontSize: 11 }} />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f1714',
                    borderColor: '#1c2e27',
                    color: '#fff',
                    fontSize: '11px',
                    borderRadius: '8px'
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Line yAxisId="left" type="monotone" dataKey="womenPct" name="Female Workforce Share (%)" stroke="#10b981" strokeWidth={2.5} />
                <Line yAxisId="right" type="monotone" dataKey="ltifr" name="Safety LTIFR (Per mn hrs)" stroke="#f43f5e" strokeWidth={2.5} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
};
