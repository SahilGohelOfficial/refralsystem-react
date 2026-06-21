import React from 'react';

interface SkeletonProps {
  className?: string;
}

const Skeleton = ({ className = '' }: SkeletonProps) => {
  return (
    <div className={`animate-pulse bg-surface/80 rounded-md ${className}`}></div>
  );
};

export default Skeleton;
