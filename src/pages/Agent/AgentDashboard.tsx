import React from 'react';
import { Users, UserPlus, Link, FileText } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/Card';
import PageHeader from '../../components/ui/PageHeader';

const StatCard = ({
  title,
  value,
  icon: Icon,
  trend,
}: {
  title: string;
  value: string | number;
  icon: React.ElementType;
  trend: number;
}) => (
  <Card variant="interactive" padding="md">
    <div className="flex items-start justify-between gap-4">
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-text-secondary">{title}</p>
        <p className="stat-value mt-1">{value}</p>
        <p className="text-xs text-text-muted mt-2">
          <span className={trend > 0 ? 'text-success' : 'text-error'}>
            {trend > 0 ? '+' : ''}
            {trend}%
          </span>{' '}
          from last month
        </p>
      </div>
      <div className="w-10 h-10 rounded-lg bg-primary-muted border border-primary/20 flex items-center justify-center shrink-0">
        <Icon size={18} className="text-primary" strokeWidth={1.75} />
      </div>
    </div>
  </Card>
);

const AgentDashboard = () => {
  return (
    <div className="page-shell">
      <PageHeader
        title="Agent Dashboard"
        description="Welcome back. Here is your referral activity."
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 lg:gap-5">
        <StatCard title="My Users" value="42" icon={Users} trend={12} />
        <StatCard title="User Registrations" value="18" icon={UserPlus} trend={5} />
        <StatCard title="Referral Count" value="256" icon={Link} trend={24} />
        <StatCard title="Pending Documents" value="3" icon={FileText} trend={-1} />
      </div>

      <Card padding="lg" className="min-h-[360px] flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="w-14 h-14 rounded-xl bg-primary-muted border border-primary/20 flex items-center justify-center mx-auto mb-4">
            <Users size={28} className="text-primary" strokeWidth={1.5} />
          </div>
          <h3 className="text-lg font-semibold text-text mb-2">Referral Tree (Coming Soon)</h3>
          <p className="text-sm text-text-secondary leading-relaxed">
            The visual referral tree map will be implemented here. It will allow you to explore
            your user network dynamically.
          </p>
        </div>
      </Card>
    </div>
  );
};

export default AgentDashboard;