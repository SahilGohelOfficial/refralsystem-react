import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, CheckCircle, Eye, Search, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Table, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/Table';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import Select from '../../components/ui/Select';
import Textarea from '../../components/forms/form/Textarea';
import PortalFormViewModal from '../../components/forms/portal/PortalFormViewModal';
import { formatApiError } from '../../lib/api';
import { useAgentUserPaths } from '../../lib/agentUserPaths';
import { getMyUser, listUserForms, updateMyUserStatus, getApprovalInfo } from '../../services/agents.service';
import type { ApiError, ApprovalInfo, FormSummary, ReferralUser, UserStatus } from '../../types/api';
import { formatUserName } from '../../types/api';

function formatDate(iso?: string): string {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return '—';
  }
}

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

const statusVariant = (status: UserStatus) => {
  if (status === 'pending') return 'warning';
  if (status === 'rejected') return 'error';
  return 'success';
};

const statusLabelKey = (status: UserStatus) => {
  if (status === 'pending') return 'agent.user_requests.status_pending';
  if (status === 'rejected') return 'agent.user_requests.status_rejected';
  return 'agent.user_requests.status_approved';
};

const AgentUserDetail = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { userId, backListPath, formSubmitPath } = useAgentUserPaths();
  const [user, setUser] = useState<ReferralUser | null>(null);
  const [forms, setForms] = useState<FormSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState('');
  const [viewFormId, setViewFormId] = useState<string | null>(null);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectNote, setRejectNote] = useState('');
  const [approveOpen, setApproveOpen] = useState(false);
  const [approvalInfo, setApprovalInfo] = useState<ApprovalInfo | null>(null);
  const [selectedChainId, setSelectedChainId] = useState('');

  const fetchData = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const [userData, formsData] = await Promise.all([
        getMyUser(userId),
        listUserForms(userId),
      ]);
      setUser(userData);
      setForms(formsData);
    } catch (error) {
      toast.error(formatApiError(error as ApiError));
      navigate(backListPath);
    } finally {
      setLoading(false);
    }
  }, [userId, navigate, backListPath]);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  const filteredForms = useMemo(() => {
    const query = search.toLowerCase();
    return forms.filter(
      (form) =>
        form.title.toLowerCase().includes(query) ||
        form.id.toLowerCase().includes(query),
    );
  }, [forms, search]);

  const handleApprove = async () => {
    if (!user) return;

    setSubmitting(true);
    try {
      const info = await getApprovalInfo(user.id);
      if (!info.requiresChainSelection) {
        await updateMyUserStatus(user.id, { status: 'approved' });
        toast.success(t('agent.user_request_detail.approve_success', 'User approved successfully'));
        navigate(backListPath);
      } else {
        setApprovalInfo(info);
        setSelectedChainId(info.suggestedChainId ?? '');
        setApproveOpen(true);
      }
    } catch (error) {
      toast.error(formatApiError(error as ApiError));
    } finally {
      setSubmitting(false);
    }
  };

  const handleApproveConfirm = async (e: FormEvent) => {
    e.preventDefault();
    if (!user || !selectedChainId) return;

    setSubmitting(true);
    try {
      await updateMyUserStatus(user.id, { status: 'approved', chainId: selectedChainId });
      toast.success(t('agent.user_request_detail.approve_success', 'User approved successfully'));
      setApproveOpen(false);
      navigate(backListPath);
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
      navigate(backListPath);
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

  const filledCount = user.filledFormsCount ?? forms.filter((f) => f.isSubmitted === true).length;
  const totalCount = user.totalFormsCount ?? forms.length;
  const isPending = user.status === 'pending';

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-4 min-w-0">
          <Button
            type="button"
            variant="secondary"
            className="shrink-0 gap-2 mt-1"
            onClick={() => navigate(backListPath)}
          >
            <ArrowLeft size={16} />
            {t('common.back', 'Back')}
          </Button>

          <div className="flex items-start gap-4 min-w-0">
            <div className="w-14 h-14 rounded-full bg-primary/15 flex items-center justify-center text-primary text-xl font-bold shrink-0">
              {user.firstName.charAt(0)}
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-bold text-text truncate">{formatUserName(user)}</h1>
                <Badge variant={statusVariant(user.status)}>
                  {t(statusLabelKey(user.status), user.status)}
                </Badge>
              </div>
              <p className="text-sm text-text-secondary mt-1">
                {user.phoneNumber} · {user.email}
              </p>
            </div>
          </div>
        </div>

        {isPending ? (
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
        ) : null}
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>{t('agent.user_request_detail.details', 'User Details')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <dt className="text-xs text-text-secondary">
                {t('agent.user_request_detail.first_name', 'First name')}
              </dt>
              <dd className="text-sm font-medium text-text mt-0.5">{user.firstName}</dd>
            </div>
            <div>
              <dt className="text-xs text-text-secondary">
                {t('agent.user_request_detail.last_name', 'Last name')}
              </dt>
              <dd className="text-sm font-medium text-text mt-0.5">{user.lastName}</dd>
            </div>
            <div>
              <dt className="text-xs text-text-secondary">
                {t('agent.user_request_detail.phone', 'Phone')}
              </dt>
              <dd className="text-sm font-medium text-text mt-0.5">{user.phoneNumber}</dd>
            </div>
            <div>
              <dt className="text-xs text-text-secondary">
                {t('agent.user_request_detail.email', 'Email')}
              </dt>
              <dd className="text-sm font-medium text-text break-all">{user.email}</dd>
            </div>
            <div>
              <dt className="text-xs text-text-secondary">
                {t('agent.user_request_detail.submitted', 'Submitted')}
              </dt>
              <dd className="text-sm font-medium text-text mt-0.5">{formatDateTime(user.createdAt)}</dd>
            </div>
            <div>
              <dt className="text-xs text-text-secondary">
                {t('agent.user_detail.referred_by', 'Referral by')}
              </dt>
              <dd className="text-sm font-medium text-text mt-0.5">
                {user.referredByName ?? '—'}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-text-secondary">
                {t('agent.user_detail.referral_code', 'Referral code')}
              </dt>
              <dd className="text-sm font-medium text-text mt-0.5 font-mono">
                {user.referralCode ?? '—'}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-text-secondary">
                {t('agent.user_requests.col_forms', 'Forms')}
              </dt>
              <dd className="text-sm font-medium text-text mt-0.5">
                {filledCount}/{totalCount}{' '}
                <span className="text-text-secondary font-normal">
                  {t('agent.user_detail.forms_completed', 'completed')}
                </span>
              </dd>
            </div>
          </dl>

          {user.note ? (
            <div className="rounded-lg border border-error/30 bg-error/5 p-3">
              <p className="text-xs font-medium text-error mb-1">
                {t('agent.user_request_detail.rejection_note', 'Rejection note')}
              </p>
              <p className="text-sm text-text">{user.note}</p>
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Card className="p-0 overflow-hidden">
        <div className="p-4 border-b border-border flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between bg-surface/50">
          <h2 className="text-lg font-semibold text-text">
            {t('agent.user_detail.forms_section', 'Forms')}
          </h2>
          <div className="w-full sm:w-72">
            <Input
              icon={Search}
              placeholder={t('forms.search_placeholder', 'Search by title or ID...')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {filteredForms.length === 0 ? (
          <div className="p-12 text-center text-text-secondary">
            {search
              ? t('forms.no_results', 'No forms match your search.')
              : t('forms.portal.empty', 'No forms available right now.')}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('forms.col_title', 'Title')}</TableHead>
                <TableHead>{t('forms.portal.col_submitted', 'Submitted')}</TableHead>
                <TableHead>{t('forms.col_updated', 'Last Updated')}</TableHead>
                <TableHead className="text-right">
                  {t('forms.portal.col_action', 'Action')}
                </TableHead>
              </TableRow>
            </TableHeader>
            <tbody>
              {filteredForms.map((form) => (
                <TableRow key={form.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium text-text">{form.title}</div>
                      <div className="text-xs text-text-secondary font-mono truncate max-w-[200px] sm:max-w-xs">
                        {form.id}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {form.isSubmitted === true ? (
                      <Badge variant="success">
                        {t('forms.portal.submitted_yes', 'Submitted')}
                      </Badge>
                    ) : form.isSubmitted === false ? (
                      <Badge variant="warning">
                        {t('forms.portal.submitted_no', 'Not submitted')}
                      </Badge>
                    ) : (
                      <Badge variant="neutral">
                        {t('forms.portal.submitted_na', 'N/A')}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>{formatDate(form.updatedAt)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end items-center gap-2">
                      {form.isSubmitted === true ? (
                        <Button
                          size="sm"
                          variant="secondary"
                          aria-label={t('forms.portal.view', 'View')}
                          title={t('forms.portal.view', 'View')}
                          onClick={() => setViewFormId(form.id)}
                        >
                          <Eye size={16} />
                        </Button>
                      ) : null}
                      <Button
                        size="sm"
                        onClick={() => navigate(formSubmitPath(form.id))}
                      >
                        {form.isSubmitted
                          ? t('forms.portal.edit', 'Edit')
                          : t('forms.portal.fill', 'Fill')}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </tbody>
          </Table>
        )}
      </Card>

      <PortalFormViewModal
        isOpen={viewFormId !== null}
        onClose={() => setViewFormId(null)}
        formId={viewFormId}
        userId={userId}
      />

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

      <Modal
        isOpen={approveOpen}
        onClose={() => {
          setApproveOpen(false);
          setSelectedChainId('');
          setApprovalInfo(null);
        }}
        title={t('agent.approval_modal.title', 'Approve User — Select Chain')}
      >
        <form onSubmit={handleApproveConfirm} className="space-y-4">
          <p className="text-sm text-text-secondary">
            {t(
              'agent.approval_modal.description',
              'Select the chain this user should be assigned to.',
            )}
          </p>
          <Select
            label={t('agent.approval_modal.chain_label', 'Chain')}
            value={selectedChainId}
            onChange={(e) => setSelectedChainId(e.target.value)}
            required
            disabled={submitting}
            options={[
              { value: '', label: t('agent.approval_modal.select_chain', '— Select a chain —') },
              ...(approvalInfo?.chains.map((chain) => ({
                value: chain.id,
                label: chain.name,
              })) ?? []),
            ]}
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setApproveOpen(false);
                setSelectedChainId('');
                setApprovalInfo(null);
              }}
              disabled={submitting}
            >
              {t('common.cancel', 'Cancel')}
            </Button>
            <Button type="submit" isLoading={submitting} disabled={!selectedChainId}>
              {t('agent.approval_modal.confirm', 'Confirm Approve')}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AgentUserDetail;
