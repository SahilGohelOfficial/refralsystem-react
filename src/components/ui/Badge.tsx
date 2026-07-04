import React, { ReactNode } from 'react';

interface BadgeProps {
  children: ReactNode;
  variant?: 'primary' | 'success' | 'warning' | 'error' | 'neutral' | 'info';
  dot?: boolean;
  className?: string;
}

const Badge = ({ children, variant = 'primary', dot = false, className = '' }: BadgeProps) => {
  const variants = {
    primary: 'bg-primary-muted text-primary border-primary/20',
    success: 'bg-success-muted text-success border-success/20',
    warning: 'bg-warning-muted text-warning border-warning/20',
    error: 'bg-error-muted text-error border-error/20',
    info: 'bg-info-muted text-info border-info/20',
    neutral: 'bg-surface-elevated text-text-secondary border-border',
  };

  const dotColors = {
    primary: 'bg-primary',
    success: 'bg-success',
    warning: 'bg-warning',
    error: 'bg-error',
    info: 'bg-info',
    neutral: 'bg-text-muted',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-medium border ${variants[variant]} ${className}`}
    >
      {dot && (
        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotColors[variant]}`} />
      )}
      {children}
    </span>
  );
};

export default Badge;