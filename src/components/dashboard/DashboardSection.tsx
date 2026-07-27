import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';

type DashboardSectionProps = {
  title: string;
  children: ReactNode;
  actionLabel?: string;
  actionTo?: string;
  className?: string;
};

const DashboardSection = ({
  title,
  children,
  actionLabel,
  actionTo,
  className = '',
}: DashboardSectionProps) => (
  <Card padding="md" className={className}>
    <CardHeader className="mb-4">
      <CardTitle className="text-base">{title}</CardTitle>
      {actionLabel && actionTo ? (
        <Link
          to={actionTo}
          className="text-sm font-medium text-primary hover:underline"
        >
          {actionLabel}
        </Link>
      ) : null}
    </CardHeader>
    <CardContent className="!p-0">{children}</CardContent>
  </Card>
);

export default DashboardSection;
