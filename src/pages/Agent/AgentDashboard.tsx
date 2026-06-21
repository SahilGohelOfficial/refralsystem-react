import React from 'react';
import { Users, UserPlus, Link, FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';

const StatCard = ({ title, value, icon: Icon, trend }: { title: string, value: string | number, icon: any, trend: number }) => (
  <Card className="relative overflow-hidden group">
    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
      <Icon size={64} className="text-primary transform rotate-12 group-hover:scale-110 transition-transform duration-500" />
    </div>
    <CardHeader className="pb-2">
      <CardTitle className="text-text-secondary text-sm font-medium">{title}</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="text-3xl font-bold text-text mb-2">{value}</div>
      <p className="text-xs text-text-secondary">
        <span className={trend > 0 ? 'text-success' : 'text-error'}>
          {trend > 0 ? '+' : ''}{trend}%
        </span> from last month
      </p>
    </CardContent>
  </Card>
);

const AgentDashboard = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text">Agent Dashboard</h1>
          <p className="text-sm text-text-secondary mt-1">Welcome back. Here is your referral activity.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="My Users" value="42" icon={Users} trend={12} />
        <StatCard title="User Registrations" value="18" icon={UserPlus} trend={5} />
        <StatCard title="Referral Count" value="256" icon={Link} trend={24} />
        <StatCard title="Pending Documents" value="3" icon={FileText} trend={-1} />
      </div>

      <div className="glass-panel p-8 rounded-2xl border border-border flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Users size={48} className="text-primary mx-auto mb-4 opacity-50" />
          <h3 className="text-xl font-bold text-text mb-2">Referral Tree (Coming Soon)</h3>
          <p className="text-text-secondary max-w-md mx-auto">The visual referral tree map will be implemented here. It will allow you to explore your user network dynamically.</p>
        </div>
      </div>
    </div>
  );
};

export default AgentDashboard;
