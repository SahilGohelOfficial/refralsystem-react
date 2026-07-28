import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ClipboardList,
  FileText,
  Link2,
  UserPlus,
  Users,
  XCircle,
} from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader';
import Badge from '../../components/ui/Badge';
import Skeleton from '../../components/ui/Skeleton';
import { Card } from '../../components/ui/Card';
import StatCard from '../../components/dashboard/StatCard';
import StatCardSkeleton from '../../components/dashboard/StatCardSkeleton';
import DashboardSection from '../../components/dashboard/DashboardSection';
import QuickActions from '../../components/dashboard/QuickActions';
import { useAgentDashboard } from '../../hooks/queries';
import { useToastOnError } from '../../hooks/useToastOnError';
import { useAuth } from '../../stores/authStore';
import {
  paymentStatusBadgeVariant,
  paymentStatusLabel,
} from '../../lib/labels';
import { formatUserName } from '../../types/api';
import { formatLocalDate } from '../../lib/dates';

const AgentDashboardSkeleton = () => (
  <div className="page-shell space-y-6" aria-busy="true" aria-label="Loading dashboard">
    <div className="space-y-2">
      <Skeleton className="h-8 w-56" />
      <Skeleton className="h-4 w-72 max-w-full" />
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <StatCardSkeleton key={i} />
      ))}
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <Card padding="md" className="lg:col-span-2">
        <div className="flex items-center justify-between mb-4">
          <Skeleton className="h-5 w-36" />
          <Skeleton className="h-4 w-16" />
        </div>
        <ul className="divide-y divide-border">
          {Array.from({ length: 4 }).map((_, i) => (
            <li
              key={i}
              className="flex flex-wrap items-center justify-between gap-2 py-3"
            >
              <div className="min-w-0 space-y-2 flex-1">
                <Skeleton className="h-4 w-36" />
                <Skeleton className="h-3 w-48 max-w-full" />
              </div>
              <Skeleton className="h-6 w-20 rounded-full" />
            </li>
          ))}
        </ul>
      </Card>

      <Card padding="md">
        <Skeleton className="h-5 w-28 mb-4" />
        <div className="grid grid-cols-1 gap-2.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="flex items-start gap-3 rounded-xl border border-border p-3.5"
            >
              <Skeleton className="h-10 w-10 rounded-xl shrink-0" />
              <div className="min-w-0 flex-1 space-y-2 pt-0.5">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-full" />
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  </div>
);

const AgentDashboard = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { data, error, isLoading } = useAgentDashboard();
  useToastOnError(error);

  if (isLoading || !data) {
    return <AgentDashboardSkeleton />;
  }

  const { users, attention } = data;

  return (
    <div className="page-shell space-y-6">
      <PageHeader
        title={t('agent.dashboard.welcome', 'Welcome, {{name}}', {
          name: user?.name ?? t('nav.agent.dashboard', 'Dashboard'),
        })}
        description={t(
          'agent.dashboard.subtitle',
          'Overview of your users, requests, and next actions.',
        )}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title={t('agent.dashboard.pending', 'Pending requests')}
          value={users.pending}
          description={t(
            'agent.dashboard.pending_desc',
            'Awaiting review or payment',
          )}
          to="/agent/user-requests"
          icon={<ClipboardList size={18} />}
          accent="warning"
        />
        <StatCard
          title={t('agent.dashboard.rejected', 'Rejected')}
          value={users.rejected}
          description={t(
            'agent.dashboard.rejected_desc',
            'Need fixes or resubmit',
          )}
          to="/agent/user-requests"
          icon={<XCircle size={18} />}
          accent="error"
        />
        <StatCard
          title={t('agent.dashboard.my_users', 'My users')}
          value={users.all}
          description={t('agent.dashboard.my_users_desc', 'All assigned users')}
          to="/agent/users"
          icon={<Users size={18} />}
          accent="primary"
        />
        <StatCard
          title={t('agent.dashboard.ready_to_approve', 'Payment received')}
          value={users.paymentReceivedPending}
          description={t(
            'agent.dashboard.ready_to_approve_desc',
            'Pending users ready to approve',
          )}
          to="/agent/user-requests"
          icon={<ClipboardList size={18} />}
          accent="success"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <DashboardSection
          title={t('agent.dashboard.needs_attention', 'Needs attention')}
          actionLabel={t('agent.dashboard.view_all', 'View all')}
          actionTo="/agent/user-requests"
          className="lg:col-span-2"
        >
          {attention.length === 0 ? (
            <p className="text-sm text-text-secondary py-4">
              {t(
                'agent.dashboard.no_pending',
                'No pending user requests right now.',
              )}
            </p>
          ) : (
            <ul className="divide-y divide-border">
              {attention.map((u) => (
                <li key={u.id}>
                  <Link
                    to={`/agent/user-requests/${u.id}`}
                    className="flex flex-wrap items-center justify-between gap-2 py-3 hover:bg-surface/50 -mx-1 px-1 rounded-lg"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-text truncate">
                        {formatUserName(u)}
                      </p>
                      <p className="text-xs text-text-secondary mt-0.5">
                        {u.phoneNumber} · {formatLocalDate(u.createdAt)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {u.payment ? (
                        <Badge
                          variant={paymentStatusBadgeVariant(u.payment.status)}
                          dot
                        >
                          {paymentStatusLabel(u.payment.status)}
                        </Badge>
                      ) : (
                        <Badge variant="neutral" dot>
                          {t('agent.dashboard.no_payment', 'No payment')}
                        </Badge>
                      )}
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </DashboardSection>

        <QuickActions
          title={t('agent.dashboard.quick_actions', 'Quick actions')}
          actions={[
            {
              to: '/register',
              label: t('nav.agent.register_user', 'Register User'),
              description: t(
                'agent.dashboard.action_register_desc',
                'Add a new user under your account',
              ),
              icon: <UserPlus size={18} />,
              primary: true,
            },
            {
              to: '/agent/user-requests',
              label: t('nav.agent.user_requests', 'User Requests'),
              description: t(
                'agent.dashboard.action_requests_desc',
                'Review pending and rejected users',
              ),
              icon: <ClipboardList size={18} />,
            },
            {
              to: '/agent/users',
              label: t('nav.agent.my_users', 'My Users'),
              description: t(
                'agent.dashboard.action_users_desc',
                'Browse all assigned users',
              ),
              icon: <Users size={18} />,
            },
            {
              to: '/agent/forms',
              label: t('nav.agent.forms', 'Forms'),
              description: t(
                'agent.dashboard.action_forms_desc',
                'Open forms available to agents',
              ),
              icon: <FileText size={18} />,
            },
            {
              to: '/agent/your-chains',
              label: t('nav.agent.your_chains', 'Your Chains'),
              description: t(
                'agent.dashboard.action_chains_desc',
                'View referral chain positions',
              ),
              icon: <Link2 size={18} />,
            },
          ]}
        />
      </div>
    </div>
  );
};

export default AgentDashboard;
