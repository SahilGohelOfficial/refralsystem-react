import { useState, useEffect, useCallback, FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, CheckCircle, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Textarea from '../../components/forms/form/Textarea';
import { getMyUser, updateMyUserStatus } from '../../services/agents.service';
import { formatApiError } from '../../lib/api';
import type { ApiError, ReferralUser } from '../../types/api';
import { formatUserName } from '../../types/api';

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

const UserRequestDetail = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { userId } = useParams<{ userId: string }>();
  const [user, setUser] = useState<ReferralUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectNote, setRejectNote] = useState('');

  const fetchUser = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const data = await getMyUser(userId);
      setUser(data);
    } catch (error) {
      toast.error(formatApiError(error as ApiError));
      navigate('/agent/user-requests');
    } finally {
      setLoading(false);
    }
  }, [userId, navigate]);

  useEffect(() => {
    void fetchUser();
  }, [fetchUser]);

  const handleApprove = async () => {
    if (!user) return;
    if (!window.confirm(t('agent.user_request_detail.approve_confirm', 'Approve this user request?'))) {
      return;
    }

    setSubmitting(true);
    try {
      await updateMyUserStatus(user.id, { status: 'approved' });
      toast.success(t('agent.user_request_detail.approve_success', 'User approved successfully'));
      navigate('/agent/user-requests');
    } catch (error) {
      toast.error(formatApiError(error as ApiError));
    } finally {
      setSubmitting(false);
    }
  };

  const handleReject = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const note = rejectNote.trim();
    if (!note) {
      toast.error(t('agent.user_request_detail.note_required', 'Rejection note is required'));
      return;
    }

    setSubmitting(true);
    try {
      await updateMyUserStatus(user.id, { status: 'rejected', note });
      toast.success(t('agent.user_request_detail.reject_success', 'User rejected successfully'));
      setRejectOpen(false);
      setRejectNote('');
      navigate('/agent/user-requests');
    } catch (error) {
      toast.error(formatApiError(error as ApiError));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const statusVariant =
    user.status === 'pending' ? 'warning' : user.status === 'rejected' ? 'error' : 'success';

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="secondary"
            className="gap-2"
            onClick={() => navigate('/agent/user-requests')}
          >
            <ArrowLeft size={16} />
            {t('agent.user_request_detail.back', 'Back')}
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-text">{formatUserName(user)}</h1>
            <p className="text-sm text-text-secondary mt-1">
              {t('agent.user_request_detail.subtitle', 'Review user request details')}
            </p>
          </div>
        </div>
        <div className="flex gap-2 shrink-0">
          <Button
            type="button"
            variant="secondary"
            className="gap-2 text-error border-error/30 hover:bg-error/10"
            onClick={() => setRejectOpen(true)}
            disabled={submitting}
          >
            <XCircle size={16} />
            {t('agent.user_request_detail.reject', 'Reject')}
          </Button>
          <Button
            type="button"
            className="gap-2"
            onClick={() => void handleApprove()}
            isLoading={submitting}
          >
            <CheckCircle size={16} />
            {t('agent.user_request_detail.approve', 'Approve')}
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('agent.user_request_detail.details', 'User Details')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-text-secondary mb-1">
                {t('agent.user_request_detail.first_name', 'First name')}
              </p>
              <p className="text-text font-medium">{user.firstName}</p>
            </div>
            <div>
              <p className="text-xs text-text-secondary mb-1">
                {t('agent.user_request_detail.last_name', 'Last name')}
              </p>
              <p className="text-text font-medium">{user.lastName}</p>
            </div>
            <div>
              <p className="text-xs text-text-secondary mb-1">
                {t('agent.user_request_detail.phone', 'Phone')}
              </p>
              <p className="text-text font-medium">{user.phoneNumber}</p>
            </div>
            <div>
              <p className="text-xs text-text-secondary mb-1">
                {t('agent.user_request_detail.email', 'Email')}
              </p>
              <p className="text-text font-medium">{user.email}</p>
            </div>
            <div>
              <p className="text-xs text-text-secondary mb-1">
                {t('agent.user_request_detail.status', 'Status')}
              </p>
              <Badge variant={statusVariant}>
                {user.status === 'pending'
                  ? t('agent.user_requests.status_pending', 'Pending')
                  : user.status === 'rejected'
                    ? t('agent.user_requests.status_rejected', 'Rejected')
                    : t('agent.user_requests.status_approved', 'Approved')}
              </Badge>
            </div>
            <div>
              <p className="text-xs text-text-secondary mb-1">
                {t('agent.user_request_detail.submitted', 'Submitted')}
              </p>
              <p className="text-text font-medium">{formatDateTime(user.createdAt)}</p>
            </div>
          </div>

          {user.note && (
            <div className="rounded-lg border border-error/30 bg-error/5 p-4">
              <p className="text-xs font-medium text-error mb-1">
                {t('agent.user_request_detail.rejection_note', 'Rejection note')}
              </p>
              <p className="text-sm text-text">{user.note}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Modal
        isOpen={rejectOpen}
        onClose={() => {
          setRejectOpen(false);
          setRejectNote('');
        }}
        title={t('agent.user_request_detail.reject_title', 'Reject User Request')}
      >
        <form onSubmit={handleReject} className="space-y-4">
          <p className="text-sm text-text-secondary">
            {t(
              'agent.user_request_detail.reject_desc',
              'Provide a reason for rejecting this request. The user will see this note.',
            )}
          </p>
          <Textarea
            id="reject-note"
            label={t('agent.user_request_detail.note_label', 'Rejection note')}
            value={rejectNote}
            onChange={(e) => setRejectNote(e.target.value)}
            required
            disabled={submitting}
            rows={4}
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setRejectOpen(false);
                setRejectNote('');
              }}
              disabled={submitting}
            >
              {t('common.cancel', 'Cancel')}
            </Button>
            <Button type="submit" variant="secondary" className="text-error border-error/30" isLoading={submitting}>
              {t('agent.user_request_detail.confirm_reject', 'Confirm Reject')}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default UserRequestDetail;
