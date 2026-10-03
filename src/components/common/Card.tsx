import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  hover = false,
  ...props
}) => {
  return (
    <div
      className={`esg-card ${hover ? 'esg-card-hover cursor-pointer' : ''} p-5 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader: React.FC<{
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  className?: string;
}> = ({ title, subtitle, action, className = '' }) => (
  <div className={`flex items-start justify-between gap-4 mb-4 pb-3 border-b border-slate-100 dark:border-slate-800/80 ${className}`}>
    <div>
      <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 font-heading">
        {title}
      </h3>
      {subtitle && (
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          {subtitle}
        </p>
      )}
    </div>
    {action && <div className="flex-shrink-0">{action}</div>}
  </div>
);
