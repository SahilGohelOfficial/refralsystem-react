import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoaderProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  className?: string;
}

const Loader = ({ size = 'md', text, className = '' }: LoaderProps) => {
  const sizes = {
    sm: 'w-5 h-5',
    md: 'w-8 h-8',
    lg: 'w-10 h-10',
  };

  return (
    <div className={`flex flex-col items-center justify-center py-12 ${className}`}>
      <Loader2 className={`${sizes[size]} animate-spin text-primary`} strokeWidth={2} />
      {text && <p className="text-text-secondary text-sm mt-3">{text}</p>}
    </div>
  );
};

export default Loader;