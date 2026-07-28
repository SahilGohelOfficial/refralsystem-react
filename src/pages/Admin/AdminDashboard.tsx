import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  FileText,
  Link2,
  Plus,
  ShieldCheck,
  UserCheck,
  Users,
  Wallet,
} from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader';
import Badge from '../../components/ui/Badge';
import Skeleton from '../../components/ui/Skeleton';
import { Card } from '../../components/ui/Card';
import StatCard from '../../components/dashboard/StatCard';
import StatCardSkeleton from '../../components/dashboard/StatCardSkeleton';
import DashboardSection from '../../components/dashboard/DashboardSection';
import QuickActions, {
  type QuickActionItem,
} from '../../components/dashboard/QuickActions';
import { useAdminDashboard } from '../../hooks/queries';
import { useToastOnError } from '../../hooks/useToastOnError';
import { useAuth } from '../../stores/authStore';
import { isSuperAdmin } from '../../lib/roles';
import { paymentStatusBadgeVariant, paymentStatusLabel } from '../../lib/labels';
import { formatLocalDateTime } from '../../lib/dates';

const AdminDashboardSkeleton = () => (
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

    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <StatCardSkeleton key={i} />
      ))}
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <Card padding="md" className="lg:col-span-2">
        <div className="flex items-center justify-between mb-4">
          <Skeleton className="h-5 w-48" />
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
                <Skeleton className="h-3 w-56 max-w-full" />
              </div>
              <Skeleton className="h-6 w-20 rounded-full" />
            </li>
          ))}
        </ul>
      </Card>

      <Card padding="md">
        <Skeleton className="h-5 w-28 mb-4" />
        <div className="grid grid-cols-1 gap-2.5">
          {Array.from({ length: 4 }).map((_, i) => (
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

const AdminDashboard = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const superAdmin = isSuperAdmin(user?.role);

  const { data, isLoading, error } = useAdminDashboard();
  useToastOnError(error);

  // Hooks must run unconditionally (before any early return).
  const quickActions = useMemo((): QuickActionItem[] => {
    const items: QuickActionItem[] = [
      {
        to: '/admin/payment-requests',
        label: t('nav.admin.user_payment_requests', 'User Payment Requests'),
        description: t(
          'admin.dashboard.action_payments_desc',
          'Review and verify payment screenshots',
        ),
        icon: <Wallet size={18} />,
        primary: true,
      },
      {
        to: '/admin/agents',
        label: t('nav.admin.agents', 'Agents'),
        description: t(
          'admin.dashboard.action_agents_desc',
          'Manage agent accounts and status',
        ),
        icon: <Users size={18} />,
      },
      {
        to: '/admin/forms',
        label: t('nav.admin.forms', 'Forms'),
        description: t(
          'admin.dashboard.action_forms_desc',
          'Browse forms and view responses',
        ),
        icon: <FileText size={18} />,
      },
      {
        to: '/admin/chains',
        label: t('nav.admin.chains', 'Chains'),
        description: t(
          'admin.dashboard.action_chains_desc',
          'View referral chain structure',
        ),
        icon: <Link2 size={18} />,
      },
    ];

    if (superAdmin) {
      items.push(
        {
          to: '/admin/admins',
          label: t('nav.admin.admins', 'Admins'),
          description: t(
            'admin.dashboard.action_admins_desc',
            'Manage admin and super admin accounts',
          ),
          icon: <ShieldCheck size={18} />,
        },
        {
          to: '/admin/forms/new',
          label: t('forms.create', 'Create Form'),
          description: t(
            'admin.dashboard.action_create_form_desc',
            'Build a new dynamic form',
          ),
          icon: <Plus size={18} />,
        },
      );
    }

    return items;
  }, [superAdmin, t]);

  if (isLoading || !data) {
    return <AdminDashboardSkeleton />;
  }

  const { agents, payments, forms, pendingPayments } = data;

  return (
    <div className="page-shell space-y-6">
      <PageHeader
        title={t('admin.dashboard.welcome', 'Welcome, {{name}}', {
          name: user?.name ?? t('nav.admin.dashboard', 'Dashboard'),
        })}
        description={t(
          'admin.dashboard.subtitle',
          'Overview of agents, payments, and forms.',
        )}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title={t('admin.dashboard.pending_agents', 'Pending agents')}
          value={agents.pending}
          description={t(
            'admin.dashboard.pending_agents_desc',
            'Awaiting approval',
          )}
          to="/admin/agents"
          icon={<UserCheck size={18} />}
          accent="warning"
        />
        <StatCard
          title={t('admin.dashboard.active_agents', 'Active agents')}
          value={agents.active}
          description={t('admin.dashboard.active_agents_desc', 'Network size')}
          to="/admin/agents"
          icon={<Users size={18} />}
          accent="success"
        />
        <StatCard
          title={t('admin.dashboard.pending_payments', 'Pending payments')}
          value={payments.pending}
          description={t(
            'admin.dashboard.pending_payments_desc',
            'Need verification',
          )}
          to="/admin/payment-requests"
          icon={<Wallet size={18} />}
          accent="warning"
        />
        <StatCard
          title={t('admin.dashboard.forms', 'Forms')}
          value={forms.total}
          description={t('admin.dashboard.forms_desc', '{{count}} submissions', {
            count: forms.totalSubmissions,
          })}
          to="/admin/forms"
          icon={<FileText size={18} />}
          accent="primary"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title={t('admin.dashboard.payments_received', 'Payments received')}
          value={payments.received}
          to="/admin/payment-requests"
          accent="success"
        />
        <StatCard
          title={t('admin.dashboard.payments_not_received', 'Not received')}
          value={payments.notReceived}
          to="/admin/payment-requests"
          accent="error"
        />
        <StatCard
          title={t('admin.dashboard.payments_all', 'All payment requests')}
          value={payments.all}
          to="/admin/payment-requests"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <DashboardSection
          title={t('admin.dashboard.needs_attention', 'Pending payment requests')}
          actionLabel={t('admin.dashboard.view_all', 'View all')}
          actionTo="/admin/payment-requests"
          className="lg:col-span-2"
        >
          {pendingPayments.length === 0 ? (
            <p className="text-sm text-text-secondary py-4">
              {t(
                'admin.dashboard.no_pending_payments',
                'No pending payment requests.',
              )}
            </p>
          ) : (
            <ul className="divide-y divide-border">
              {pendingPayments.map((req) => (
                <li
                  key={req.id}
                  className="flex flex-wrap items-center justify-between gap-2 py-3"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-text truncate">
                      {req.userName || t('admin.dashboard.unknown_user', 'User')}
                    </p>
                    <p className="text-xs text-text-secondary mt-0.5">
                      {req.userPhoneNumber}
                      {req.agentName ? ` · ${req.agentName}` : ''}
                      {' · '}
                      {formatLocalDateTime(req.createdAt)}
                    </p>
                  </div>
                  <Badge variant={paymentStatusBadgeVariant(req.status)} dot>
                    {paymentStatusLabel(req.status)}
                  </Badge>
                </li>
              ))}
            </ul>
          )}
        </DashboardSection>

        <QuickActions
          title={t('admin.dashboard.quick_actions', 'Quick actions')}
          actions={quickActions}
        />
      </div>
    </div>
  );
};

export default AdminDashboard;
