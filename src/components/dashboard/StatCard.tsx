import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../ui/Card';

type StatCardProps = {
  title: string;
  value: string | number;
  description?: string;
  to?: string;
  icon?: ReactNode;
  accent?: 'default' | 'warning' | 'success' | 'error' | 'primary';
};

const accentStyles: Record<NonNullable<StatCardProps['accent']>, string> = {
  default: 'border-border',
  primary: 'border-primary/25 bg-primary/5',
  warning: 'border-warning/30 bg-warning/5',
  success: 'border-success/30 bg-success/5',
  error: 'border-error/30 bg-error/5',
};

const StatCard = ({
  title,
  value,
  description,
  to,
  icon,
  accent = 'default',
}: StatCardProps) => {
  const content = (
    <Card
      padding="md"
      className={`h-full transition-colors ${accentStyles[accent]} ${
        to ? 'hover:border-primary/40 cursor-pointer' : ''
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wide text-text-secondary">
            {title}
          </p>
          <p className="mt-2 text-2xl font-bold text-text tabular-nums">{value}</p>
          {description ? (
            <p className="mt-1 text-xs text-text-muted leading-relaxed">{description}</p>
          ) : null}
        </div>
        {icon ? (
          <div className="w-10 h-10 rounded-xl bg-surface border border-border flex items-center justify-center text-primary shrink-0">
            {icon}
          </div>
        ) : null}
      </div>
    </Card>
  );

  if (to) {
    return (
      <Link to={to} className="block h-full no-underline">
        {content}
      </Link>
    );
  }

  return content;
};

export default StatCard;
