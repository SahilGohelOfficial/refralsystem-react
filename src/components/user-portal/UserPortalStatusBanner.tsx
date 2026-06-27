import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AlertCircle, CheckCircle, Clock, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import type { UserStatus } from '../../types/api';

const APPROVAL_SHOWN_KEY = (userId: string) => `userPortalApprovalShown_${userId}`;
const LEGACY_APPROVAL_SHOWN_KEY = (userId: string) => `withdrawalApprovalShown_${userId}`;

const UserPortalStatusBanner = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [dismissedApproved, setDismissedApproved] = useState(false);

  const status = user?.status as UserStatus | undefined;
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

  if (!user || user.role !== 'user' || !status) {
    return null;
  }

  if (status === 'pending') {
    return (
      <div className="mb-6 rounded-xl border border-warning/40 bg-warning/10 p-4 flex gap-3 items-start">
        <Clock className="text-warning shrink-0 mt-0.5" size={20} />
        <div>
          <p className="font-semibold text-text">
            {t('user_portal.status.pending', 'Your request is pending')}
          </p>
          <p className="text-sm text-text-secondary mt-1">
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
    return (
      <div className="mb-6 rounded-xl border border-error/50 bg-error/10 p-4 flex gap-3 items-start">
        <AlertCircle className="text-error shrink-0 mt-0.5" size={20} />
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-error">
            {t('user_portal.status.rejected', 'Your request was rejected by your agent')}
          </p>
          {note && (
            <p className="text-sm text-text mt-2">
              <span className="font-medium">
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
    return (
      <div className="mb-6 rounded-xl border border-success/40 bg-success/10 p-4 flex gap-3 items-start">
        <CheckCircle className="text-success shrink-0 mt-0.5" size={20} />
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-text">
            {t('user_portal.status.approved_once', 'Your request has been approved!')}
          </p>
          <p className="text-sm text-text-secondary mt-1">
            {t(
              'user_portal.status.approved_once_desc',
              'Your agent has approved your registration. You now have full access.',
            )}
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            if (user.id) {
              localStorage.setItem(APPROVAL_SHOWN_KEY(user.id), 'true');
            }
            setDismissedApproved(true);
          }}
          className="text-text-secondary hover:text-text shrink-0 p-1"
          aria-label={t('common.cancel', 'Dismiss')}
        >
          <X size={16} />
        </button>
      </div>
    );
  }

  return null;
};

export default UserPortalStatusBanner;
