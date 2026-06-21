import React from 'react';
import { FolderOpen } from 'lucide-react';
import Button from './Button';

interface EmptyStateProps {
  icon?: React.ElementType;
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

const EmptyState = ({ 
  icon: Icon = FolderOpen, 
  title = 'No Data Found', 
  description = 'There is currently no data to display.', 
  actionLabel, 
  onAction 
}: EmptyStateProps) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center border border-dashed border-border rounded-2xl bg-surface/30">
      <div className="w-16 h-16 bg-card rounded-full flex items-center justify-center mb-4 border border-border">
        <Icon size={32} className="text-text-secondary" />
      </div>
      <h3 className="text-lg font-semibold text-text mb-2">{title}</h3>
      <p className="text-text-secondary max-w-sm mb-6">{description}</p>
      {actionLabel && onAction && (
        <Button onClick={onAction}>{actionLabel}</Button>
      )}
    </div>
  );
};

export default EmptyState;
