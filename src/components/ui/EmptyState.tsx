import React from 'react';
import { Inbox } from 'lucide-react';
import Button from './Button';

interface EmptyStateProps {
  icon?: React.ElementType;
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

const EmptyState = ({
  icon: Icon = Inbox,
  title = 'No data found',
  description = 'There is currently no data to display.',
  actionLabel,
  onAction,
}: EmptyStateProps) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="w-14 h-14 bg-surface-elevated rounded-xl flex items-center justify-center mb-4 border border-border">
        <Icon size={28} className="text-text-muted" strokeWidth={1.5} />
      </div>
      <h3 className="text-base font-semibold text-text mb-1.5">{title}</h3>
      <p className="text-sm text-text-secondary max-w-sm leading-relaxed mb-6">{description}</p>
      {actionLabel && onAction && (
        <Button onClick={onAction} size="sm">
          {actionLabel}
        </Button>
      )}
    </div>
  );
};

export default EmptyState;