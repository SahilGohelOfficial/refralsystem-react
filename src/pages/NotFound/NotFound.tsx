import React from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';
import Button from '../../components/ui/Button';

const NotFound = () => {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-4">
      <div className="glass-panel max-w-md w-full p-8 text-center border-primary/20">
        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="w-10 h-10 text-primary" />
        </div>
        <h1 className="text-4xl font-bold text-text mb-2">404</h1>
        <h2 className="text-xl font-semibold text-text-secondary mb-4">Page Not Found</h2>
        <p className="text-text-secondary/80 mb-8">
          The page you are looking for doesn't exist or has been moved.
        </p>
        <Link to="/">
          <Button fullWidth>Back to Dashboard</Button>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
