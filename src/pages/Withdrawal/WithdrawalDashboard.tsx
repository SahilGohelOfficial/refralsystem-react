import React from 'react';
import { Wallet, Clock, CheckCircle, ArrowDownCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import Button from '../../components/ui/Button';

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

const WithdrawalDashboard = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text">Wallet Dashboard</h1>
          <p className="text-sm text-text-secondary mt-1">Manage your funds and withdrawal requests.</p>
        </div>
        <Button className="shrink-0 gap-2">
          <ArrowDownCircle size={16} />
          Request Withdrawal
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="relative overflow-hidden group bg-gradient-to-br from-primary/20 to-primary/5 border-primary/30">
          <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:opacity-30 transition-opacity">
            <Wallet size={64} className="text-primary transform rotate-12 group-hover:scale-110 transition-transform duration-500" />
          </div>
          <CardHeader className="pb-2">
            <CardTitle className="text-primary text-sm font-medium">Wallet Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-text mb-2">$12,450.00</div>
            <p className="text-xs text-text-secondary">Available for withdrawal</p>
          </CardContent>
        </Card>
        
        <StatCard title="Total Withdrawals" value="$45,200.00" icon={CheckCircle} trend={12} />
        <StatCard title="Pending Requests" value="2" icon={Clock} trend={0} />
        <StatCard title="Approved Withdrawals" value="18" icon={CheckCircle} trend={5} />
      </div>

      <div className="glass-panel p-8 rounded-2xl border border-border flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Clock size={48} className="text-primary mx-auto mb-4 opacity-50" />
          <h3 className="text-xl font-bold text-text mb-2">Recent Transactions (Coming Soon)</h3>
          <p className="text-text-secondary max-w-md mx-auto">Your withdrawal history table will appear here, showing all your past and pending requests.</p>
        </div>
      </div>
    </div>
  );
};

export default WithdrawalDashboard;
