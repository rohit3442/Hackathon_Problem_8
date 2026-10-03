import React from 'react';
import { Badge } from './Badge';
import { SubmissionStatus, ValidationSeverity } from '../../types';

interface StatusBadgeProps {
  status: SubmissionStatus | ValidationSeverity | string;
  size?: 'sm' | 'md';
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = 'md',
  className = '',
}) => {
  const normalized = status.toLowerCase();

  switch (normalized) {
    case 'draft':
      return <Badge variant="slate" size={size} dot className={className}>Draft</Badge>;
    case 'submitted':
      return <Badge variant="blue" size={size} dot className={className}>Submitted</Badge>;
    case 'under_review':
      return <Badge variant="amber" size={size} dot className={className}>Under Review</Badge>;
    case 'correction_required':
      return <Badge variant="rose" size={size} dot className={className}>Correction Required</Badge>;
    case 'validated':
      return <Badge variant="teal" size={size} dot className={className}>Validated</Badge>;
    case 'approved':
      return <Badge variant="emerald" size={size} dot className={className}>Approved</Badge>;
    case 'final':
      return <Badge variant="purple" size={size} dot className={className}>Final</Badge>;
    
    // Validation specific
    case 'error':
      return <Badge variant="rose" size={size} dot className={className}>Error</Badge>;
    case 'warning':
      return <Badge variant="amber" size={size} dot className={className}>Warning</Badge>;
    case 'info':
      return <Badge variant="blue" size={size} dot className={className}>Info</Badge>;
    case 'clean':
      return <Badge variant="emerald" size={size} dot className={className}>Clean</Badge>;
    case 'has_warnings':
      return <Badge variant="amber" size={size} dot className={className}>Warnings</Badge>;
    case 'has_errors':
      return <Badge variant="rose" size={size} dot className={className}>Errors</Badge>;

    default:
      return <Badge variant="slate" size={size} className={className}>{status}</Badge>;
  }
};
