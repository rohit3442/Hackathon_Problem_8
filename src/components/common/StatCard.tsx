import React from 'react';
import { Card } from './Card';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  change?: number | string;
  changeLabel?: string;
  trend?: 'up' | 'down' | 'neutral' | string;
  icon: React.ReactNode;
  iconBgColor?: string;
  iconTextColor?: string;
  onClick?: () => void;
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  change,
  changeLabel = 'vs last period',
  icon,
  iconBgColor = 'bg-emerald-50 dark:bg-emerald-950/60',
  iconTextColor = 'text-emerald-600 dark:text-emerald-400',
  onClick,
  className = '',
}) => {
  return (
    <Card
      hover={!!onClick}
      onClick={onClick}
      className={`relative overflow-hidden transition-all duration-200 ${className}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            {title}
          </p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50 font-heading">
              {value}
            </span>
          </div>

          {(change !== undefined || subtitle) && (
            <div className="mt-2.5 flex items-center gap-1.5 text-xs">
              {typeof change === 'number' ? (
                <span
                  className={`inline-flex items-center font-medium ${
                    change > 0
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : change < 0
                      ? 'text-rose-600 dark:text-rose-400'
                      : 'text-slate-500 dark:text-slate-400'
                  }`}
                >
                  {change > 0 ? (
                    <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
                  ) : change < 0 ? (
                    <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" />
                  ) : (
                    <Minus className="w-3 h-3 mr-0.5" />
                  )}
                  {Math.abs(change)}%
                </span>
              ) : typeof change === 'string' ? (
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                  {change}
                </span>
              ) : null}
              <span className="text-slate-500 dark:text-slate-400">
                {changeLabel || subtitle}
              </span>
            </div>
          )}
        </div>

        <div className={`p-2.5 rounded-xl ${iconBgColor} ${iconTextColor} flex-shrink-0 shadow-xs`}>
          {icon}
        </div>
      </div>
    </Card>
  );
};
