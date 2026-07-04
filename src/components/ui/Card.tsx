import React, { HTMLAttributes, ReactNode } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  variant?: 'default' | 'interactive' | 'flat';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const paddingClasses = {
  none: 'p-0',
  sm: 'p-4',
  md: 'p-5',
  lg: 'p-6',
};

const variantClasses = {
  default: 'glass-card',
  interactive: 'glass-card-interactive',
  flat: 'bg-surface/50 border border-border rounded-xl',
};

export const Card = ({
  children,
  className = '',
  variant = 'default',
  padding = 'lg',
  ...props
}: CardProps) => (
  <div
    className={`${variantClasses[variant]} ${paddingClasses[padding]} ${className}`}
    {...props}
  >
    {children}
  </div>
);

export const CardHeader = ({ children, className = '', ...props }: CardProps) => (
  <div className={`flex items-center justify-between mb-5 ${className}`} {...props}>
    {children}
  </div>
);

export const CardTitle = ({ children, className = '', ...props }: CardProps) => (
  <h3 className={`section-title ${className}`} {...props}>
    {children}
  </h3>
);

export const CardDescription = ({ children, className = '', ...props }: CardProps) => (
  <p className={`text-sm text-text-secondary mt-0.5 ${className}`} {...props}>
    {children}
  </p>
);

export const CardContent = ({ children, className = '', ...props }: CardProps) => (
  <div className={className} {...props}>
    {children}
  </div>
);

export const CardFooter = ({ children, className = '', ...props }: CardProps) => (
  <div
    className={`flex items-center justify-end gap-3 pt-5 mt-5 border-t border-border ${className}`}
    {...props}
  >
    {children}
  </div>
);