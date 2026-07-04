import React from 'react';

interface SkeletonProps {
  className?: string;
}

const Skeleton = ({ className = '' }: SkeletonProps) => {
  return (
    <div
      className={`animate-pulse bg-surface-elevated rounded-md ${className}`}
      aria-hidden="true"
    />
  );
};

export default Skeleton;