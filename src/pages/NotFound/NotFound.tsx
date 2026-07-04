import React from 'react';
import { Link } from 'react-router-dom';
import { FileQuestion } from 'lucide-react';
import Button from '../../components/ui/Button';

const NotFound = () => {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-4">
      <div className="glass-panel max-w-md w-full p-8 text-center rounded-xl">
        <div className="w-16 h-16 bg-surface-elevated rounded-xl flex items-center justify-center mx-auto mb-6 border border-border">
          <FileQuestion className="w-8 h-8 text-text-muted" strokeWidth={1.5} />
        </div>
        <p className="text-5xl font-semibold text-text mb-2 tabular-nums">404</p>
        <h2 className="text-lg font-medium text-text-secondary mb-3">Page not found</h2>
        <p className="text-sm text-text-muted mb-8 leading-relaxed">
          The page you are looking for doesn&apos;t exist or has been moved.
        </p>
        <Link to="/">
          <Button fullWidth>Back to Dashboard</Button>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;