import React from 'react';

interface ProgressBarProps {
  value?: number; // 0 to 100
  progress?: number; // alias for value
  size?: 'sm' | 'md' | 'lg';
  variant?: 'emerald' | 'teal' | 'blue' | 'amber' | 'rose';
  showLabel?: boolean;
  showPercentage?: boolean;
  label?: string;
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  progress,
  size = 'md',
  variant = 'emerald',
  showLabel = false,
  showPercentage = false,
  label,
  className = '',
}) => {
  const actualValue = value !== undefined ? value : (progress !== undefined ? progress : 0);
  const clampedValue = Math.min(Math.max(actualValue, 0), 100);

  const heightStyles = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4',
  };

  const fillColors = {
    emerald: 'bg-emerald-500 dark:bg-emerald-400',
    teal: 'bg-teal-500 dark:bg-teal-400',
    blue: 'bg-blue-500 dark:bg-blue-400',
    amber: 'bg-amber-500 dark:bg-amber-400',
    rose: 'bg-rose-500 dark:bg-rose-400',
  };

  return (
    <div className={`w-full ${className}`}>
      {(showLabel || label) && (
        <div className="flex justify-between items-center text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
          <span>{label || 'Progress'}</span>
          <span className="font-semibold text-slate-900 dark:text-slate-100">{Math.round(clampedValue)}%</span>
        </div>
      )}
      <div className={`w-full bg-slate-100 dark:bg-slate-800/80 rounded-full overflow-hidden ${heightStyles[size]}`}>
        <div
          className={`${fillColors[variant]} ${heightStyles[size]} rounded-full transition-all duration-500 ease-out`}
          style={{ width: `${clampedValue}%` }}
        />
      </div>
    </div>
  );
};
