import { useEffect, useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { AlertCircle, CheckCircle, Clock, RefreshCw, X } from 'lucide-react';
import { useAuth } from '../../stores/authStore';
import {
  selectHasPayment,
  selectPaymentLoaded,
  selectPaymentStatus,
  useUserPortalStore,
} from '../../stores/userPortalStore';
import { resubmitMyAccount } from '../../services/users.service';
import { formatApiError } from '../../lib/api';
import { queryClient } from '../../lib/queryClient';
import { queryKeys } from '../../lib/queryKeys';
import type { ApiError, UserStatus } from '../../types/api';
import Button from '../ui/Button';
import IconButton from '../ui/IconButton';

const APPROVAL_SHOWN_KEY = (userId: string) => `userPortalApprovalShown_${userId}`;
const LEGACY_APPROVAL_SHOWN_KEY = (userId: string) => `withdrawalApprovalShown_${userId}`;

const bannerStyles = {
  payment: {
    container: 'border-primary/30 bg-primary-muted',
    icon: 'text-primary',
    title: 'text-text',
  },
  pending: {
    container: 'border-warning/30 bg-warning-muted',
    icon: 'text-warning',
    title: 'text-text',
  },
  rejected: {
    container: 'border-error/30 bg-error-muted',
    icon: 'text-error',
    title: 'text-error',
  },
  approved: {
    container: 'border-success/30 bg-success-muted',
    icon: 'text-success',
    title: 'text-text',
  },
};

type BannerStyleKey = keyof typeof bannerStyles;

const StatusBanner = ({
  styleKey,
  icon: Icon,
  title,
  description,
  note,
  noteLabel,
  dismissible,
  onDismiss,
  dismissLabel,
  action,
}: {
  styleKey: BannerStyleKey;
  icon: typeof AlertCircle;
  title: string;
  description?: string;
  note?: string | null;
  noteLabel?: string;
  dismissible?: boolean;
  onDismiss?: () => void;
  dismissLabel?: string;
  action?: ReactNode;
}) => {
  const styles = bannerStyles[styleKey];

  return (
    <div className={`mb-6 rounded-xl border p-4 flex gap-3 items-start ${styles.container}`}>
      <Icon className={`${styles.icon} shrink-0 mt-0.5`} size={18} />
      <div className="flex-1 min-w-0">
        <p className={`font-medium text-sm ${styles.title}`}>{title}</p>
        {description && (
          <p className="text-sm text-text-secondary mt-1 leading-relaxed">{description}</p>
        )}
        {note && (
          <p className="text-sm text-text-secondary mt-2 leading-relaxed">
            {noteLabel && (
              <span className="font-medium text-text">{noteLabel} </span>
            )}
            {note}
          </p>
        )}
        {action ? <div className="mt-3">{action}</div> : null}
      </div>
      {dismissible && onDismiss && (
        <IconButton size="sm" onClick={onDismiss} aria-label={dismissLabel ?? 'Dismiss'}>
          <X size={16} />
        </IconButton>
      )}
    </div>
  );
};

const UserPortalStatusBanner = () => {
  const { t } = useTranslation();
  const { user, refreshUserProfile } = useAuth();
  const [dismissedApproved, setDismissedApproved] = useState(false);
  const [resubmitting, setResubmitting] = useState(false);

  const storeUserStatus = useUserPortalStore((state) => state.userStatus);
  const payment = useUserPortalStore((state) => state.payment);
  const hasPayment = useUserPortalStore(selectHasPayment);
  const paymentStatus = useUserPortalStore(selectPaymentStatus);
  const paymentLoaded = useUserPortalStore(selectPaymentLoaded);

  const status = (storeUserStatus ?? user?.status) as UserStatus | null | undefined;
  const note = user?.note;

  useEffect(() => {
    if (!user?.id || status !== 'approved') return;
    const shown =
      localStorage.getItem(APPROVAL_SHOWN_KEY(user.id)) === 'true' ||
      localStorage.getItem(LEGACY_APPROVAL_SHOWN_KEY(user.id)) === 'true';
    if (shown) {
      setDismissedApproved(true);
    }
  }, [user?.id, status]);

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
    } catch (error) {
      toast.error(formatApiError(error as ApiError));
    } finally {
      setResubmitting(false);
    }
  };

  if (!user || user.role !== 'user') {
    return null;
  }

  if (status === 'rejected') {
    return (
      <StatusBanner
        styleKey="rejected"
        icon={AlertCircle}
        title={t('user_portal.status.rejected', 'Your request was rejected by your agent')}
        description={t(
          'user_portal.status.rejected_desc',
          'Review the reason below. You can resubmit your account for your agent to review again, or contact your agent to update your details first.',
        )}
        note={note}
        noteLabel={t('user_portal.status.rejected_note', 'Reason:')}
        action={
          <Button
            type="button"
            size="sm"
            className="gap-2"
            onClick={() => void handleResubmit()}
            isLoading={resubmitting}
          >
            <RefreshCw size={14} />
            {t('user_portal.status.resubmit', 'Resubmit account for review')}
          </Button>
        }
      />
    );
  }

  if (status === 'approved' && !dismissedApproved) {
    return (
      <StatusBanner
        styleKey="approved"
        icon={CheckCircle}
        title={t('user_portal.status.approved_once', 'Your request has been approved!')}
        description={t(
          'user_portal.status.approved_once_desc',
          'Your registration has been approved. You now have full access.',
        )}
        dismissible
        dismissLabel={t('common.cancel', 'Dismiss')}
        onDismiss={() => {
          if (user.id) {
            localStorage.setItem(APPROVAL_SHOWN_KEY(user.id), 'true');
          }
          setDismissedApproved(true);
        }}
      />
    );
  }

  if ((status === 'pending' || status == null) && !hasPayment) {
    return (
      <StatusBanner
        styleKey="payment"
        icon={AlertCircle}
        title={t('user_portal.status.awaiting_agent_payment', 'Registration complete')}
        description={t(
          'user_portal.status.awaiting_agent_payment_desc',
          'Please contact your agent to submit your payment proof for verification.',
        )}
      />
    );
  }

  if (!paymentLoaded) {
    return null;
  }

  if (status === 'pending' && paymentStatus === 'not_received') {
    return (
      <StatusBanner
        styleKey="rejected"
        icon={AlertCircle}
        title={t('user_portal.status.payment_not_received', 'Payment not accepted')}
        description={t(
          'user_portal.status.payment_not_received_desc',
          'Admin could not verify your payment. Please contact your agent to submit payment proof again.',
        )}
        note={payment?.note}
        noteLabel={t('user_portal.status.rejected_note', 'Reason:')}
      />
    );
  }

  if (status === 'pending' && paymentStatus === 'pending') {
    return (
      <StatusBanner
        styleKey="pending"
        icon={Clock}
        title={t('user_portal.status.payment_verifying', 'Payment proof under review')}
        description={t(
          'user_portal.status.payment_verifying_desc',
          'Your agent submitted your payment proof. Admin verification is in progress.',
        )}
      />
    );
  }

  if (status === 'pending' && paymentStatus === 'received') {
    return (
      <StatusBanner
        styleKey="pending"
        icon={Clock}
        title={t('user_portal.status.payment_verified_pending', 'Payment verified')}
        description={t(
          'user_portal.status.payment_verified_pending_desc',
          'Your payment has been verified. Final registration approval is in progress.',
        )}
      />
    );
  }

  if (status === 'pending') {
    return (
      <StatusBanner
        styleKey="pending"
        icon={Clock}
        title={t('user_portal.status.pending', 'Your request is pending')}
        description={t(
          'user_portal.status.pending_desc',
          'Your registration request is awaiting admin review.',
        )}
      />
    );
  }

  return null;
};

export default UserPortalStatusBanner;
