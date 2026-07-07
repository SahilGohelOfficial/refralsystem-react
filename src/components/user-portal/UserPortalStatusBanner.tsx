import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AlertCircle, CheckCircle, Clock, X } from 'lucide-react';
import { useAuth } from '../../stores/authStore';
import {
  selectNeedsPaymentSubmission,
  selectPaymentStatus,
  useUserPortalStore,
} from '../../stores/userPortalStore';
import type { UserStatus } from '../../types/api';
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

const UserPortalStatusBanner = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [dismissedApproved, setDismissedApproved] = useState(false);

  const storeUserStatus = useUserPortalStore((state) => state.userStatus);
  const paymentStatus = useUserPortalStore(selectPaymentStatus);
  const needsPaymentSubmission = useUserPortalStore(selectNeedsPaymentSubmission);

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

  if (!user || user.role !== 'user') {
    return null;
  }

  if (needsPaymentSubmission && status == null) {
    const styles = bannerStyles.payment;
    return (
      <div className={`mb-6 rounded-xl border p-4 flex gap-3 items-start ${styles.container}`}>
        <AlertCircle className={`${styles.icon} shrink-0 mt-0.5`} size={18} />
        <div className="flex-1 min-w-0">
          <p className={`font-medium text-sm ${styles.title}`}>
            {t('user_portal.status.payment_required', 'Complete your payment to submit your request')}
          </p>
          <p className="text-sm text-text-secondary mt-1 leading-relaxed">
            {t(
              'user_portal.status.payment_required_desc',
              'Upload your payment screenshot to send your registration request to your agent.',
            )}
          </p>
          <Link
            to="/user/payment"
            className="inline-block mt-3 text-sm font-medium text-primary hover:underline"
          >
            {t('user_portal.status.go_to_payment', 'Submit payment')}
          </Link>
        </div>
      </div>
    );
  }

  if (status === 'pending' && paymentStatus === 'not_received') {
    const styles = bannerStyles.rejected;
    return (
      <div className={`mb-6 rounded-xl border p-4 flex gap-3 items-start ${styles.container}`}>
        <AlertCircle className={`${styles.icon} shrink-0 mt-0.5`} size={18} />
        <div className="flex-1 min-w-0">
          <p className={`font-medium text-sm ${styles.title}`}>
            {t(
              'user_portal.status.payment_not_received',
              'Payment not verified — please upload again',
            )}
          </p>
          <p className="text-sm text-text-secondary mt-1 leading-relaxed">
            {t(
              'user_portal.status.payment_not_received_desc',
              'Your agent could not verify your payment. Upload a new screenshot to continue.',
            )}
          </p>
          <Link
            to="/user/payment"
            className="inline-block mt-3 text-sm font-medium text-primary hover:underline"
          >
            {t('user_portal.status.go_to_payment', 'Submit payment')}
          </Link>
        </div>
      </div>
    );
  }

  if (status === 'pending') {
    const styles = bannerStyles.pending;
    return (
      <div className={`mb-6 rounded-xl border p-4 flex gap-3 items-start ${styles.container}`}>
        <Clock className={`${styles.icon} shrink-0 mt-0.5`} size={18} />
        <div>
          <p className={`font-medium text-sm ${styles.title}`}>
            {t('user_portal.status.pending', 'Your request is pending')}
          </p>
          <p className="text-sm text-text-secondary mt-1 leading-relaxed">
            {t(
              'user_portal.status.pending_desc',
              'Your registration request is awaiting review by your assigned agent.',
            )}
          </p>
        </div>
      </div>
    );
  }

  if (status === 'rejected') {
    const styles = bannerStyles.rejected;
    return (
      <div className={`mb-6 rounded-xl border p-4 flex gap-3 items-start ${styles.container}`}>
        <AlertCircle className={`${styles.icon} shrink-0 mt-0.5`} size={18} />
        <div className="flex-1 min-w-0">
          <p className={`font-medium text-sm ${styles.title}`}>
            {t('user_portal.status.rejected', 'Your request was rejected by your agent')}
          </p>
          {note && (
            <p className="text-sm text-text-secondary mt-2 leading-relaxed">
              <span className="font-medium text-text">
                {t('user_portal.status.rejected_note', 'Reason:')}
              </span>{' '}
              {note}
            </p>
          )}
        </div>
      </div>
    );
  }

  if (status === 'approved' && !dismissedApproved) {
    const styles = bannerStyles.approved;
    return (
      <div className={`mb-6 rounded-xl border p-4 flex gap-3 items-start ${styles.container}`}>
        <CheckCircle className={`${styles.icon} shrink-0 mt-0.5`} size={18} />
        <div className="flex-1 min-w-0">
          <p className={`font-medium text-sm ${styles.title}`}>
            {t('user_portal.status.approved_once', 'Your request has been approved!')}
          </p>
          <p className="text-sm text-text-secondary mt-1 leading-relaxed">
            {t(
              'user_portal.status.approved_once_desc',
              'Your agent has approved your registration. You now have full access.',
            )}
          </p>
        </div>
        <IconButton
          size="sm"
          onClick={() => {
            if (user.id) {
              localStorage.setItem(APPROVAL_SHOWN_KEY(user.id), 'true');
            }
            setDismissedApproved(true);
          }}
          aria-label={t('common.cancel', 'Dismiss')}
        >
          <X size={16} />
        </IconButton>
      </div>
    );
  }

  return null;
};

export default UserPortalStatusBanner;
