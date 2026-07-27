import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import {
  FileText,
  Mail,
  MapPin,
  Phone,
  RefreshCw,
  Settings,
  User as UserIcon,
  Users,
} from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Loader from '../../components/ui/Loader';
import DashboardSection from '../../components/dashboard/DashboardSection';
import StatCard from '../../components/dashboard/StatCard';
import { useMyProfile } from '../../hooks/queries';
import { useForms } from '../../hooks/queries';
import { useToastOnError } from '../../hooks/useToastOnError';
import { useAuth } from '../../stores/authStore';
import {
  selectHasPayment,
  selectPaymentLoaded,
  selectPaymentStatus,
  useUserPortalStore,
} from '../../stores/userPortalStore';
import { resubmitMyAccount } from '../../services/users.service';
import { formatApiError } from '../../lib/api';
import { paymentStatusBadgeVariant, paymentStatusLabel } from '../../lib/labels';
import { formatUserName, type ApiError, type UserStatus } from '../../types/api';
import { queryClient } from '../../lib/queryClient';
import { queryKeys } from '../../lib/queryKeys';

const statusBadge = (status: UserStatus | null | undefined) => {
  if (status === 'approved') return 'success' as const;
  if (status === 'rejected') return 'error' as const;
  return 'warning' as const;
};

const UserDashboard = () => {
  const { t } = useTranslation();
  const { user, refreshUserProfile } = useAuth();
  const { data: profile, isLoading, error } = useMyProfile();
  const { data: forms = [] } = useForms('user');
  useToastOnError(error);

  const payment = useUserPortalStore((s) => s.payment);
  const paymentStatus = useUserPortalStore(selectPaymentStatus);
  const paymentLoaded = useUserPortalStore(selectPaymentLoaded);
  const hasPayment = useUserPortalStore(selectHasPayment);
  const fetchPayment = useUserPortalStore((s) => s.fetchPayment);

  const [resubmitting, setResubmitting] = useState(false);

  useEffect(() => {
    void fetchPayment();
  }, [fetchPayment]);

  if (isLoading) {
    return <Loader text={t('common.loading', 'Loading...')} />;
  }

  const status = profile?.status ?? user?.status ?? null;
  const note = profile?.note ?? user?.note;
  const displayName = profile ? formatUserName(profile) : user?.name ?? '';
  const agent = profile?.agent ?? null;
  const formsTotal = forms.length;
  const formsDone = forms.filter((f) => f.isSubmitted).length;

  const handleResubmit = async () => {
    setResubmitting(true);
    try {
      await resubmitMyAccount();
      await refreshUserProfile();
      await queryClient.invalidateQueries({ queryKey: queryKeys.users.me });
      toast.success(
        t(
          'user_portal.status.resubmit_success',
          'Account resubmitted for review successfully',
        ),
      );
    } catch (err) {
      toast.error(formatApiError(err as ApiError));
    } finally {
      setResubmitting(false);
    }
  };

  // Status messaging lives only in this card (global banner is hidden on dashboard).
  const statusTitle =
    status === 'approved'
      ? t('user_portal.dashboard.status_approved', 'Your account is approved')
      : status === 'rejected'
        ? t('user_portal.dashboard.status_rejected', 'Your registration was rejected')
        : !hasPayment
          ? t('user_portal.status.awaiting_agent_payment', 'Registration complete')
          : paymentStatus === 'not_received'
            ? t('user_portal.status.payment_not_received', 'Payment not accepted')
            : paymentStatus === 'received'
              ? t('user_portal.status.payment_verified_pending', 'Payment verified')
              : paymentStatus === 'pending'
                ? t('user_portal.status.payment_verifying', 'Payment proof under review')
                : t('user_portal.dashboard.status_pending', 'Your registration is pending');

  const statusDesc =
    status === 'approved'
      ? t(
          'user_portal.dashboard.status_approved_desc',
          'You have full access to forms and your referral code.',
        )
      : status === 'rejected'
        ? t(
            'user_portal.dashboard.status_rejected_desc',
            'Review the reason below. Contact your agent or resubmit for review.',
          )
        : !hasPayment
          ? t(
              'user_portal.status.awaiting_agent_payment_desc',
              'Please contact your agent to submit your payment proof for verification.',
            )
          : paymentStatus === 'not_received'
            ? t(
                'user_portal.status.payment_not_received_desc',
                'Admin could not verify your payment. Please contact your agent to submit payment proof again.',
              )
            : paymentStatus === 'received'
              ? t(
                  'user_portal.status.payment_verified_pending_desc',
                  'Your payment has been verified. Final registration approval is in progress.',
                )
              : paymentStatus === 'pending'
                ? t(
                    'user_portal.status.payment_verifying_desc',
                    'Your agent submitted your payment proof. Admin verification is in progress.',
                  )
                : t(
                    'user_portal.dashboard.status_pending_desc',
                    'Your registration request is awaiting review.',
                  );

  return (
    <div className="page-shell space-y-6">
      <PageHeader
        title={t('user_portal.dashboard.welcome', 'Welcome, {{name}}', {
          name: displayName || t('nav.user_portal.dashboard', 'Dashboard'),
        })}
        description={t(
          'user_portal.dashboard.subtitle',
          'Track your registration status and contact your agent.',
        )}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card
          padding="md"
          className={`lg:col-span-2 ${
            status === 'rejected'
              ? 'border-error/30 bg-error/5'
              : status === 'approved'
                ? 'border-success/30 bg-success/5'
                : 'border-warning/30 bg-warning/5'
          }`}
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-lg font-semibold text-text">{statusTitle}</h2>
                <Badge variant={statusBadge(status)} dot>
                  {status ?? t('user_portal.dashboard.status_unknown', 'Pending')}
                </Badge>
              </div>
              <p className="mt-2 text-sm text-text-secondary leading-relaxed">{statusDesc}</p>
              {status === 'rejected' && note ? (
                <p className="mt-3 text-sm text-text">
                  <span className="font-medium text-error">
                    {t('user_portal.status.rejected_note', 'Reason:')}{' '}
                  </span>
                  {note}
                </p>
              ) : null}
              {paymentLoaded && payment && payment.status === 'not_received' && payment.note ? (
                <p className="mt-3 text-sm text-text">
                  <span className="font-medium text-error">
                    {t('user_portal.status.rejected_note', 'Reason:')}{' '}
                  </span>
                  {payment.note}
                </p>
              ) : null}
              {paymentLoaded && payment ? (
                <p className="mt-3 text-sm text-text-secondary">
                  {t('user_portal.dashboard.payment_label', 'Payment')}:{' '}
                  <Badge variant={paymentStatusBadgeVariant(payment.status)} dot>
                    {paymentStatusLabel(payment.status)}
                  </Badge>
                </p>
              ) : null}
            </div>
            {status === 'rejected' ? (
              <Button
                type="button"
                size="sm"
                className="gap-2"
                isLoading={resubmitting}
                onClick={() => void handleResubmit()}
              >
                <RefreshCw size={14} />
                {t('user_portal.status.resubmit', 'Resubmit account for review')}
              </Button>
            ) : null}
          </div>
        </Card>

        <Card padding="md" className="h-full">
          <CardHeader className="mb-3">
            <CardTitle className="text-base">
              {t('user_portal.dashboard.your_agent', 'Your agent')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {agent ? (
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-11 h-11 rounded-full bg-primary/15 text-primary flex items-center justify-center font-semibold shrink-0">
                    {agent.fullName.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-text truncate">{agent.fullName}</p>
                    {agent.agentLoginId ? (
                      <p className="text-xs text-text-muted mt-0.5">
                        {t('user_portal.dashboard.agent_id', 'ID')}: {agent.agentLoginId}
                      </p>
                    ) : null}
                  </div>
                </div>
                {agent.phoneNumber ? (
                  <p className="flex items-center gap-2 text-sm text-text-secondary">
                    <Phone size={14} className="shrink-0" />
                    <a href={`tel:${agent.phoneNumber}`} className="hover:text-primary">
                      {agent.phoneNumber}
                    </a>
                  </p>
                ) : null}
                {agent.email ? (
                  <p className="flex items-center gap-2 text-sm text-text-secondary">
                    <Mail size={14} className="shrink-0" />
                    <a
                      href={`mailto:${agent.email}`}
                      className="hover:text-primary break-all"
                    >
                      {agent.email}
                    </a>
                  </p>
                ) : null}
                {(agent.city || agent.state) && (
                  <p className="flex items-center gap-2 text-sm text-text-secondary">
                    <MapPin size={14} className="shrink-0" />
                    {[agent.city, agent.state].filter(Boolean).join(', ')}
                  </p>
                )}
                <div className="flex flex-wrap gap-2 pt-1">
                  {agent.phoneNumber ? (
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      className="gap-1.5"
                      onClick={() => {
                        window.location.href = `tel:${agent.phoneNumber}`;
                      }}
                    >
                      <Phone size={14} />
                      {t('user_portal.dashboard.call', 'Call')}
                    </Button>
                  ) : null}
                  {agent.email ? (
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      className="gap-1.5"
                      onClick={() => {
                        window.location.href = `mailto:${agent.email}`;
                      }}
                    >
                      <Mail size={14} />
                      {t('user_portal.dashboard.email_action', 'Email')}
                    </Button>
                  ) : null}
                </div>
              </div>
            ) : (
              <p className="text-sm text-text-secondary">
                {t(
                  'user_portal.dashboard.no_agent',
                  'No agent assigned yet. Contact support if you need help.',
                )}
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          title={t('user_portal.dashboard.forms', 'Forms')}
          value={`${formsDone}/${formsTotal}`}
          description={t(
            'user_portal.dashboard.forms_desc',
            'Completed / available',
          )}
          to="/user/forms"
          icon={<FileText size={18} />}
          accent="primary"
        />
        <StatCard
          title={t('user_portal.dashboard.referral', 'Referral code')}
          value={
            profile?.referralCode ??
            t('user_portal.dashboard.referral_none', '—')
          }
          description={
            status === 'approved'
              ? t(
                  'user_portal.dashboard.referral_ready',
                  'Share this code with new users.',
                )
              : t(
                  'user_portal.dashboard.referral_locked',
                  'Available after approval.',
                )
          }
          icon={<Users size={18} />}
          accent={status === 'approved' ? 'success' : 'default'}
        />
        <StatCard
          title={t('user_portal.dashboard.account', 'Account')}
          value={status ?? 'pending'}
          description={t('user_portal.dashboard.account_desc', 'Registration status')}
          to="/user/profile"
          icon={<UserIcon size={18} />}
        />
      </div>

      <DashboardSection title={t('user_portal.dashboard.quick_actions', 'Quick actions')}>
        <div className="flex flex-wrap gap-2">
          <Link to="/user/profile">
            <Button type="button" variant="secondary" className="gap-2">
              <UserIcon size={16} />
              {t('nav.user_portal.profile', 'Profile')}
            </Button>
          </Link>
          <Link to="/user/forms">
            <Button type="button" variant="secondary" className="gap-2">
              <FileText size={16} />
              {t('nav.user_portal.forms', 'Forms')}
            </Button>
          </Link>
          <Link to="/user/settings">
            <Button type="button" variant="secondary" className="gap-2">
              <Settings size={16} />
              {t('nav.user_portal.settings', 'Settings')}
            </Button>
          </Link>
        </div>
      </DashboardSection>
    </div>
  );
};

export default UserDashboard;
