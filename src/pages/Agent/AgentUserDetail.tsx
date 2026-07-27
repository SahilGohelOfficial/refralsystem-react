import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
} from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ArrowLeft,
  CheckCircle,
  Edit2,
  Eye,
  ImagePlus,
  RefreshCw,
  Search,
  Trash2,
  Upload,
  XCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Table, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/Table';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import Image from '../../components/ui/Image';
import Select from '../../components/ui/Select';
import Textarea from '../../components/forms/form/Textarea';
import PortalFormViewModal from '../../components/forms/portal/PortalFormViewModal';
import AgentUserEditModal from '../../components/agent/AgentUserEditModal';
import { useConfirm } from '../../stores/confirmStore';
import { formatApiError } from '../../lib/api';
import { queryClient } from '../../lib/queryClient';
import { queryKeys } from '../../lib/queryKeys';
import { useAgentUserPaths } from '../../lib/agentUserPaths';
import {
  confirmMyUserPayment,
  deleteMyUser,
  getApprovalInfo,
  getMyUser,
  getMyUserPayment,
  getMyUserPaymentHistory,
  getMyUserPaymentScreenshotUrl,
  listUserForms,
  presignMyUserPaymentUpload,
  resubmitMyUser,
  updateMyUserStatus,
} from '../../services/agents.service';
import type {
  ApiError,
  ApprovalInfo,
  FormSummary,
  PaymentHistory,
  ReferralUser,
  UserStatus,
} from '../../types/api';
import { formatGenderLabel, formatUserName } from '../../types/api';
import { formatCalendarDate, formatLocalDate, formatLocalDateTime } from '../../lib/dates';
import {
  PaymentHistorySection,
  usePaymentReview,
} from '../../components/agent/PaymentReviewSection';
import {
  isHeicLike,
  isImageFile,
  isPaymentApiImageType,
  MAX_PAYMENT_IMAGE_BYTES,
  PAYMENT_IMAGE_ACCEPT,
  prepareImageForUpload,
} from '../../lib/images/prepareImageForUpload';

async function uploadFileToPresignedUrl(uploadUrl: string, file: File): Promise<void> {
  const response = await fetch(uploadUrl, {
    method: 'PUT',
    headers: {
      'Content-Type': file.type || 'application/octet-stream',
    },
    body: file,
  });

  if (!response.ok) {
    throw new Error(`Upload failed (${response.status})`);
  }
}

const statusVariant = (status: UserStatus | null) => {
  if (status === 'pending') return 'warning';
  if (status === 'rejected') return 'error';
  return 'success';
};

const statusDefaultLabel = (status: UserStatus | null) => {
  if (status === 'pending') return 'Pending';
  if (status === 'rejected') return 'Rejected';
  return 'Approved';
};

const statusLabelKey = (status: UserStatus | null) => {
  if (status === 'pending') return 'agent.user_requests.status_pending';
  if (status === 'rejected') return 'agent.user_requests.status_rejected';
  return 'agent.user_requests.status_approved';
};

const AgentUserDetail = () => {
  const { t } = useTranslation();
  const confirm = useConfirm();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { userId, fromUserRequests, backListPath, formSubmitPath } = useAgentUserPaths();
  const [user, setUser] = useState<ReferralUser | null>(null);
  const [forms, setForms] = useState<FormSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState('');
  const [viewFormId, setViewFormId] = useState<string | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [paymentHistory, setPaymentHistory] = useState<PaymentHistory[]>([]);
  const [paymentHistoryLoading, setPaymentHistoryLoading] = useState(false);
  const [uploadingPayment, setUploadingPayment] = useState(false);
  const [preparingImage, setPreparingImage] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [submittingStatus, setSubmittingStatus] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectNote, setRejectNote] = useState('');
  const [approveOpen, setApproveOpen] = useState(false);
  const [approvalInfo, setApprovalInfo] = useState<ApprovalInfo | null>(null);
  const [selectedChainId, setSelectedChainId] = useState('');

  const paymentReview = usePaymentReview({
    enabled: Boolean(userId),
    reloadKey: userId,
    fetchPayment: () => getMyUserPayment(userId!),
    fetchScreenshotUrl: async () => {
      const response = await getMyUserPaymentScreenshotUrl(userId!);
      return response.downloadUrl;
    },
    fetchHistory: () => getMyUserPaymentHistory(userId!),
  });

  const fetchData = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const userData = await getMyUser(userId);
      setUser(userData);
      if (!fromUserRequests) {
        setForms(await listUserForms(userId));
      } else {
        setForms([]);
      }
    } catch (error) {
      toast.error(formatApiError(error as ApiError));
      navigate(backListPath);
    } finally {
      setLoading(false);
    }
  }, [userId, navigate, backListPath, fromUserRequests]);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (!selectedFile) {
      setPreviewUrl(null);
      return;
    }
    const objectUrl = URL.createObjectURL(selectedFile);
    setPreviewUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [selectedFile]);

  useEffect(() => {
    setPaymentHistory(paymentReview.history);
    setPaymentHistoryLoading(paymentReview.loadingHistory);
  }, [paymentReview.history, paymentReview.loadingHistory]);

  const filteredForms = useMemo(() => {
    const query = search.toLowerCase();
    return forms.filter(
      (form) =>
        form.title.toLowerCase().includes(query) ||
        (form.description?.toLowerCase().includes(query) ?? false),
    );
  }, [forms, search]);

  const refreshMyUserLists = () => {
    void queryClient.invalidateQueries({ queryKey: queryKeys.agents.myUsersPrefix });
    void queryClient.invalidateQueries({ queryKey: queryKeys.agents.myUserRequestCounts });
  };

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!isImageFile(file) && !isHeicLike(file)) {
      toast.error(
        t(
          'user_portal.payment.invalid_type',
          'Please upload a JPEG, PNG, WebP, GIF, or iPhone (HEIC) image.',
        ),
      );
      event.target.value = '';
      return;
    }

    // Allow larger HEIC inputs; compression runs before upload (API max 10MB).
    if (file.size > MAX_PAYMENT_IMAGE_BYTES * 3) {
      toast.error(
        t('user_portal.payment.too_large', 'Image must be 10 MB or smaller.'),
      );
      event.target.value = '';
      return;
    }

    setPreparingImage(true);
    try {
      const prepared = await prepareImageForUpload(file);

      if (!isPaymentApiImageType(prepared.type)) {
        toast.error(
          t(
            'user_portal.payment.invalid_type',
            'Please upload a JPEG, PNG, WebP, GIF, or iPhone (HEIC) image.',
          ),
        );
        event.target.value = '';
        return;
      }

      if (prepared.size > MAX_PAYMENT_IMAGE_BYTES) {
        toast.error(
          t('user_portal.payment.too_large', 'Image must be 10 MB or smaller.'),
        );
        event.target.value = '';
        return;
      }

      setSelectedFile(prepared);
    } catch {
      toast.error(
        t(
          'user_portal.payment.prepare_failed',
          'Could not process this image. Try a screenshot or export as JPEG/PNG.',
        ),
      );
      event.target.value = '';
      setSelectedFile(null);
    } finally {
      setPreparingImage(false);
    }
  };

  const handleSubmitPayment = async () => {
    if (!userId || !selectedFile) {
      toast.error(
        t('user_portal.payment.file_required', 'Please select a payment screenshot.'),
      );
      return;
    }

    setUploadingPayment(true);
    try {
      const presign = await presignMyUserPaymentUpload(userId, {
        fileName: selectedFile.name,
        contentType: selectedFile.type,
        size: selectedFile.size,
      });
      await uploadFileToPresignedUrl(presign.uploadUrl, selectedFile);
      await confirmMyUserPayment(userId, { screenShot: presign.key });
      await paymentReview.reloadPayment();
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      toast.success(
        t('user_portal.payment.submit_success', 'Payment submitted successfully.'),
      );
      refreshMyUserLists();
    } catch (error) {
      toast.error(formatApiError(error as ApiError));
    } finally {
      setUploadingPayment(false);
    }
  };

  const handleDelete = async () => {
    if (!user) return;

    const name = formatUserName(user);
    const confirmed = await confirm({
      title: t('agent.my_users.delete_title', 'Delete User'),
      message: t(
        'agent.my_users.delete_confirm_named',
        'Delete user "{{name}}"? This cannot be undone.',
        { name },
      ),
      variant: 'danger',
      confirmLabel: t('agent.my_users.delete', 'Delete'),
    });
    if (!confirmed) return;

    setSubmitting(true);
    try {
      await deleteMyUser(user.id);
      toast.success(t('agent.my_users.deleted_success', 'User deleted successfully'));
      navigate(backListPath);
    } catch (error) {
      toast.error(formatApiError(error as ApiError));
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenApprove = async () => {
    if (!user || !userId) return;
    setSubmittingStatus(true);
    try {
      const info = await getApprovalInfo(userId);
      if (!info.requiresChainSelection) {
        await updateMyUserStatus(userId, { status: 'approved' });
        toast.success(
          t('agent.user_request_detail.approve_success', 'User approved successfully'),
        );
        refreshMyUserLists();
        navigate(backListPath);
      } else {
        setApprovalInfo(info);
        setSelectedChainId(info.suggestedChainId ?? '');
        setApproveOpen(true);
      }
    } catch (error) {
      toast.error(formatApiError(error as ApiError));
    } finally {
      setSubmittingStatus(false);
    }
  };

  const handleApproveConfirm = async (event: FormEvent) => {
    event.preventDefault();
    if (!user || !userId || !selectedChainId) return;
    setSubmittingStatus(true);
    try {
      await updateMyUserStatus(userId, {
        status: 'approved',
        chainId: selectedChainId,
      });
      toast.success(
        t('agent.user_request_detail.approve_success', 'User approved successfully'),
      );
      setApproveOpen(false);
      refreshMyUserLists();
      navigate(backListPath);
    } catch (error) {
      toast.error(formatApiError(error as ApiError));
    } finally {
      setSubmittingStatus(false);
    }
  };

  const handleRejectConfirm = async (event: FormEvent) => {
    event.preventDefault();
    if (!user || !userId || !rejectNote.trim()) return;
    setSubmittingStatus(true);
    try {
      await updateMyUserStatus(userId, {
        status: 'rejected',
        note: rejectNote.trim(),
      });
      toast.success(
        t('agent.user_request_detail.reject_success', 'User rejected successfully'),
      );
      setRejectOpen(false);
      setRejectNote('');
      refreshMyUserLists();
      navigate(backListPath);
    } catch (error) {
      toast.error(formatApiError(error as ApiError));
    } finally {
      setSubmittingStatus(false);
    }
  };

  const handleResubmit = async () => {
    if (!user || !userId || user.status !== 'rejected') return;

    const confirmed = await confirm({
      title: t('agent.user_request_detail.resubmit_confirm_title', 'Resubmit for review?'),
      message: t(
        'agent.user_request_detail.resubmit_confirm_message',
        'This will move the user back to pending so you can review and approve them again.',
      ),
      confirmLabel: t('agent.user_request_detail.resubmit', 'Resubmit for review'),
    });
    if (!confirmed) return;

    setSubmittingStatus(true);
    try {
      const updated = await resubmitMyUser(userId);
      setUser(updated);
      toast.success(
        t(
          'agent.user_request_detail.resubmit_success',
          'Account resubmitted for review successfully',
        ),
      );
      refreshMyUserLists();
    } catch (error) {
      toast.error(formatApiError(error as ApiError));
    } finally {
      setSubmittingStatus(false);
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

  const filledCount = fromUserRequests
    ? 0
    : (user.filledFormsCount ?? forms.filter((f) => f.isSubmitted === true).length);
  const totalCount = fromUserRequests ? 0 : (user.totalFormsCount ?? forms.length);
  const isPending = user.status === 'pending';
  const isRejected = user.status === 'rejected';
  const canUploadPayment =
    fromUserRequests &&
    isPending &&
    (!paymentReview.payment || paymentReview.payment.status === 'not_received');
  const canEdit = !fromUserRequests || isRejected;

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
                  {t(statusLabelKey(user.status), statusDefaultLabel(user.status))}
                </Badge>
              </div>
              <p className="text-sm text-text-secondary mt-1">
                {user.phoneNumber} · {user.email}
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 shrink-0">
          {fromUserRequests && isPending ? (
            <>
              <Button
                type="button"
                variant="secondary"
                className="gap-2 text-error border-error/30 hover:bg-error/10"
                onClick={() => setRejectOpen(true)}
                disabled={submittingStatus}
              >
                <XCircle size={16} />
                {t('agent.user_request_detail.reject', 'Reject')}
              </Button>
              <Button
                type="button"
                className="gap-2"
                onClick={() => void handleOpenApprove()}
                isLoading={submittingStatus}
                disabled={paymentReview.payment?.status !== 'received'}
                title={
                  paymentReview.payment?.status !== 'received'
                    ? t(
                        'agent.payment.approve_blocked',
                        'Mark payment as received before approving this user.',
                      )
                    : undefined
                }
              >
                <CheckCircle size={16} />
                {t('agent.user_request_detail.approve', 'Approve')}
              </Button>
            </>
          ) : null}
          {fromUserRequests && isRejected ? (
            <Button
              type="button"
              className="gap-2"
              onClick={() => void handleResubmit()}
              isLoading={submittingStatus}
            >
              <RefreshCw size={16} />
              {t('agent.user_request_detail.resubmit', 'Resubmit for review')}
            </Button>
          ) : null}
          {canEdit ? (
            <Button
              type="button"
              variant="secondary"
              className="gap-2"
              onClick={() => setEditOpen(true)}
              disabled={submitting || submittingStatus}
            >
              <Edit2 size={16} />
              {t('agent.my_users.edit', 'Edit')}
            </Button>
          ) : null}
          {!fromUserRequests ? (
            <Button
              type="button"
              variant="secondary"
              className="gap-2 text-error border-error/30 hover:bg-error/10"
              onClick={() => void handleDelete()}
              disabled={submitting}
            >
              <Trash2 size={16} />
              {t('agent.my_users.delete', 'Delete')}
            </Button>
          ) : null}
        </div>
      </div>

      {fromUserRequests && isPending ? (
        <>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>{t('agent.payment.upload_title', 'Upload payment screenshot')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {paymentReview.payment?.status === 'not_received' ? (
                <div className="rounded-lg border border-warning/30 bg-warning/10 p-3">
                  <p className="text-sm font-medium text-text">
                    {t(
                      'agent.payment.resubmit_required',
                      'Admin marked this payment as not received. Please submit again.',
                    )}
                  </p>
                  {paymentReview.payment.note ? (
                    <p className="mt-1 text-sm text-text-secondary">
                      {t('agent.payment.admin_note', 'Admin note')}: {paymentReview.payment.note}
                    </p>
                  ) : null}
                </div>
              ) : null}

              <input
                ref={fileInputRef}
                type="file"
                accept={PAYMENT_IMAGE_ACCEPT.join(',')}
                className="hidden"
                onChange={(e) => void handleFileChange(e)}
              />

              {preparingImage ? (
                <div className="rounded-xl border border-border p-8 flex flex-col items-center gap-3 text-text-secondary">
                  <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                  <span className="text-sm font-medium">
                    {t('user_portal.payment.preparing', 'Preparing image…')}
                  </span>
                  <span className="text-xs">
                    {t(
                      'user_portal.payment.preparing_hint',
                      'Compressing and converting iPhone photos if needed.',
                    )}
                  </span>
                </div>
              ) : previewUrl ? (
                <div className="rounded-lg border border-border overflow-hidden bg-surface-muted">
                  <Image
                    src={previewUrl}
                    alt={t('user_portal.payment.preview_alt', 'Payment screenshot preview')}
                    className="max-h-80 w-full"
                  />
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={!canUploadPayment}
                  className="w-full rounded-xl border-2 border-dashed border-border p-8 flex flex-col items-center gap-3 text-text-secondary hover:border-primary/50 hover:text-text transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <ImagePlus size={30} className="text-primary" />
                  <span className="text-sm font-medium">
                    {t('user_portal.payment.choose_file', 'Choose an image')}
                  </span>
                  <span className="text-xs">
                    {t(
                      'user_portal.payment.file_hint',
                      'JPEG, PNG, WebP, GIF, or iPhone HEIC · compressed on upload',
                    )}
                  </span>
                </button>
              )}

              <div className="flex flex-wrap gap-3">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={!canUploadPayment || uploadingPayment || preparingImage}
                >
                  <Upload size={16} className="mr-2" />
                  {selectedFile
                    ? t('user_portal.payment.change_file', 'Change image')
                    : t('user_portal.payment.choose_file', 'Choose an image')}
                </Button>
                <Button
                  type="button"
                  onClick={() => void handleSubmitPayment()}
                  disabled={
                    !canUploadPayment ||
                    uploadingPayment ||
                    preparingImage ||
                    !selectedFile
                  }
                >
                  {uploadingPayment
                    ? t('common.submitting', 'Submitting...')
                    : t('agent.payment.submit_for_verification', 'Submit for verification')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </>
      ) : null}

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
                {t('agent.user_request_detail.middle_name', 'Middle name')}
              </dt>
              <dd className="text-sm font-medium text-text mt-0.5">{user.middleName ?? '—'}</dd>
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
                {t('register.date_of_birth', 'Date of Birth')}
              </dt>
              <dd className="text-sm font-medium text-text mt-0.5">
                {user.dateOfBirth ? formatCalendarDate(user.dateOfBirth) : '—'}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-text-secondary">
                {t('register.gender', 'Gender')}
              </dt>
              <dd className="text-sm font-medium text-text mt-0.5">
                {formatGenderLabel(user.gender, t)}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-text-secondary">
                {t('register.is_married', 'Are you married?')}
              </dt>
              <dd className="text-sm font-medium text-text mt-0.5">
                {user.isMarried ? 'Yes' : user.isMarried === false ? 'No' : '—'}
              </dd>
            </div>
            {user.isMarried && (
              <div>
                <dt className="text-xs text-text-secondary">
                  {t('register.marriage_date', 'Marriage Date')}
                </dt>
                <dd className="text-sm font-medium text-text mt-0.5">
                  {user.marriageDate ? formatCalendarDate(user.marriageDate) : '—'}
                </dd>
              </div>
            )}
            <div>
              <dt className="text-xs text-text-secondary">
                {t('register.address_line1', 'Address Line 1')}
              </dt>
              <dd className="text-sm font-medium text-text mt-0.5">
                {user.addressLine1 ?? '—'}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-text-secondary">
                {t('register.address_line2', 'Address line 2')}
              </dt>
              <dd className="text-sm font-medium text-text mt-0.5">
                {user.addressLine2 ?? '—'}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-text-secondary">
                {t('register.landmark', 'Landmark')}
              </dt>
              <dd className="text-sm font-medium text-text mt-0.5">{user.landmark ?? '—'}</dd>
            </div>
            <div>
              <dt className="text-xs text-text-secondary">
                {t('register.postal_code', 'Postal/ZIP Code (PIN Code)')}
              </dt>
              <dd className="text-sm font-medium text-text mt-0.5">{user.postalCode ?? '—'}</dd>
            </div>
            <div>
              <dt className="text-xs text-text-secondary">
                {t('agent.user_request_detail.submitted', 'Submitted')}
              </dt>
              <dd className="text-sm font-medium text-text mt-0.5">{formatLocalDateTime(user.createdAt)}</dd>
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
            {!fromUserRequests ? (
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
            ) : null}
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

      {!fromUserRequests ? (
        <Card className="p-0 overflow-hidden">
          <div className="p-4 border-b border-border flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between bg-surface/50">
            <h2 className="text-lg font-semibold text-text">
              {t('agent.user_detail.forms_section', 'Forms')}
            </h2>
            <div className="w-full sm:w-72">
              <Input
                icon={Search}
                placeholder={t('forms.search_placeholder', 'Search by title...')}
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
                        {form.description ? (
                          <div className="text-xs text-text-secondary truncate max-w-[200px] sm:max-w-xs">
                            {form.description}
                          </div>
                        ) : null}
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
                    <TableCell>{formatLocalDate(form.updatedAt)}</TableCell>
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
      ) : null}

      <PaymentHistorySection
        paymentHistory={paymentHistory}
        loadingHistory={paymentHistoryLoading}
      />

      <AgentUserEditModal
        user={user}
        isOpen={editOpen}
        onClose={() => setEditOpen(false)}
        onSaved={(updated) => setUser(updated)}
      />

      {!fromUserRequests ? (
        <PortalFormViewModal
          isOpen={viewFormId !== null}
          onClose={() => setViewFormId(null)}
          formId={viewFormId}
          userId={userId}
        />
      ) : null}

      <Modal
        isOpen={rejectOpen}
        onClose={() => {
          setRejectOpen(false);
          setRejectNote('');
        }}
        title={t('agent.user_request_detail.reject_title', 'Reject User Request')}
      >
        <form onSubmit={handleRejectConfirm} className="space-y-4">
          <p className="text-sm text-text-secondary">
            {t(
              'agent.user_request_detail.reject_desc',
              'Provide a reason for rejecting this request. The user will see this note.',
            )}
          </p>
          <Textarea
            id="agent-reject-note"
            label={t('agent.user_request_detail.note_label', 'Rejection note')}
            value={rejectNote}
            onChange={(e) => setRejectNote(e.target.value)}
            required
            rows={4}
            disabled={submittingStatus}
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setRejectOpen(false);
                setRejectNote('');
              }}
              disabled={submittingStatus}
            >
              {t('common.cancel', 'Cancel')}
            </Button>
            <Button
              type="submit"
              variant="secondary"
              className="text-error border-error/30"
              isLoading={submittingStatus}
            >
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
            disabled={submittingStatus}
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
              disabled={submittingStatus}
            >
              {t('common.cancel', 'Cancel')}
            </Button>
            <Button type="submit" isLoading={submittingStatus} disabled={!selectedChainId}>
              {t('agent.approval_modal.confirm', 'Confirm Approve')}
            </Button>
          </div>
        </form>
      </Modal>

    </div>
  );
};

export default AgentUserDetail;
