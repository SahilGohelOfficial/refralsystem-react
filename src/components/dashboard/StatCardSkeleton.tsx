import Skeleton from '../ui/Skeleton';
import { Card } from '../ui/Card';

const StatCardSkeleton = () => (
  <Card padding="md" className="h-full">
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0 flex-1 space-y-2">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-8 w-14" />
        <Skeleton className="h-3 w-32" />
      </div>
      <Skeleton className="h-10 w-10 rounded-xl shrink-0" />
    </div>
  </Card>
);

export default StatCardSkeleton;
