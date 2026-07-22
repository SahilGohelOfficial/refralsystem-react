import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { Eye } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import Modal from '../ui/Modal';
import { formatApiError } from '../../lib/api';
import { formatLocalDateTime } from '../../lib/dates';
import { paymentStatusBadgeVariant, paymentStatusLabel } from '../../lib/labels';
import type {
  ApiError,
  Payment,
  PaymentHistory,
  UpdatePaymentStatusPayload,
} from '../../types/api';

type PaymentReviewSectionProps = {
  payment: Payment | null;
  screenshotUrl: string | null;
  loadingScreenshot: boolean;
  submitting: boolean;
  onMarkReceived?: () => Promise<void> | void;
  onMarkNotReceived?: () => Promise<void> | void;
  readOnly?: boolean;
};

type PaymentHistorySectionProps = {
  paymentHistory?: PaymentHistory[];
  loadingHistory?: boolean;
};

export function PaymentHistorySection({
  paymentHistory = [],
  loadingHistory = false,
}: PaymentHistorySectionProps) {
  const { t } = useTranslation();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  return (
    <>
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>{t('agent.payment.history_title', 'Payment history')}</CardTitle>
        </CardHeader>
        <CardContent>
          {loadingHistory ? (
            <div className="h-24 rounded-lg border border-border bg-surface-muted animate-pulse" />
          ) : paymentHistory.length === 0 ? (
            <p className="text-sm text-text-secondary">
              {t('agent.payment.history_empty', 'No payment history yet.')}
            </p>
          ) : (
            <div className="space-y-2">
              {paymentHistory.map((entry) => (
                <div key={entry.id} className="rounded-lg border border-border p-3 bg-surface/40">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-sm font-medium text-text">
                      {entry.statusUpdatedAt
                        ? t('agent.payment.history_status_changed', 'Status changed')
                        : t('agent.payment.history_submitted', 'Screenshot submitted')}
                    </span>
                    <Badge variant={paymentStatusBadgeVariant(entry.status)} dot>
                      {paymentStatusLabel(entry.status)}
                    </Badge>
                  </div>
                  <p className="text-xs text-text-secondary mt-1">
                    {t('agent.payment.submitted_at', 'Submitted')}:{' '}
                    {formatLocalDateTime(entry.createdAt)}
                  </p>
                  <p className="text-xs text-text-secondary mt-1">
                    {t('agent.payment.history_agent', 'Agent')}:{' '}
                    {entry.agentName ?? '—'}
                  </p>
                  {entry.statusUpdatedByName ? (
                    <p className="text-xs text-text-secondary mt-1">
                      {t('agent.payment.status_updated_by', 'Status updated by')}:{' '}
                      {entry.statusUpdatedByName}
                    </p>
                  ) : null}
                  {entry.statusUpdatedAt ? (
                    <p className="text-xs text-text-secondary mt-1">
                      {t('agent.payment.status_updated_at', 'Status updated')}:{' '}
                      {formatLocalDateTime(entry.statusUpdatedAt)}
                    </p>
                  ) : null}
                  {entry.note ? (
                    <p className="text-xs text-text-secondary mt-1">
                      {t('agent.payment.admin_note', 'Admin note')}: {entry.note}
                    </p>
                  ) : null}
                  {entry.screenshotDownloadUrl ? (
                    <div className="mt-3">
                      <Button
                        type="button"
                        size="sm"
                        variant="secondary"
                        className="gap-2"
                        onClick={() => setPreviewUrl(entry.screenshotDownloadUrl)}
                      >
                        <Eye size={14} />
                        {t('agent.payment.history_preview', 'Preview')}
                      </Button>
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Modal
        isOpen={previewUrl !== null}
        onClose={() => setPreviewUrl(null)}
        title={t('agent.payment.screenshot', 'Payment screenshot')}
        maxWidth="2xl"
      >
        {previewUrl ? (
          <img
            src={previewUrl}
            alt={t('agent.payment.screenshot_alt', 'Payment screenshot')}
            className="max-h-[70vh] w-full rounded-lg border border-border object-contain bg-surface-muted"
          />
        ) : null}
      </Modal>
    </>
  );
}

export function PaymentReviewSection({
  payment,
  screenshotUrl,
  loadingScreenshot,
  submitting,
  onMarkReceived,
  onMarkNotReceived,
  readOnly = false,
}: PaymentReviewSectionProps) {
  const { t } = useTranslation();

  if (!payment) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>{t('agent.payment.title', 'Payment')}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-text-secondary">
            {t('agent.payment.not_submitted', 'No payment has been submitted yet.')}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <CardTitle>{t('agent.payment.title', 'Payment')}</CardTitle>
          <Badge variant={paymentStatusBadgeVariant(payment.status)} dot>
            {paymentStatusLabel(payment.status)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <dt className="text-xs text-text-secondary">
              {t('agent.payment.submitted_at', 'Submitted')}
            </dt>
            <dd className="text-sm font-medium text-text mt-0.5">
              {formatLocalDateTime(payment.createdAt)}
            </dd>
          </div>
          {payment.statusUpdatedAt ? (
            <div>
              <dt className="text-xs text-text-secondary">
                {t('agent.payment.status_updated_at', 'Status updated')}
              </dt>
              <dd className="text-sm font-medium text-text mt-0.5">
                {formatLocalDateTime(payment.statusUpdatedAt)}
              </dd>
            </div>
          ) : null}
          {payment.statusUpdatedBy ? (
            <div>
              <dt className="text-xs text-text-secondary">
                {t('agent.payment.status_updated_by', 'Status updated by')}
              </dt>
              <dd className="text-sm font-medium text-text mt-0.5 font-mono">
                {payment.statusUpdatedBy}
              </dd>
            </div>
          ) : null}
        </dl>

        {payment.note ? (
          <div className="rounded-lg border border-warning/30 bg-warning/10 p-3">
            <p className="text-xs font-medium text-text mb-1">
              {t('agent.payment.admin_note', 'Admin note')}
            </p>
            <p className="text-sm text-text-secondary">{payment.note}</p>
          </div>
        ) : null}

        <div>
          <p className="text-xs text-text-secondary mb-2">
            {t('agent.payment.screenshot', 'Payment screenshot')}
          </p>
          {loadingScreenshot && !screenshotUrl ? (
            <div className="h-48 rounded-lg border border-border bg-surface-muted animate-pulse" />
          ) : screenshotUrl ? (
            <a href={screenshotUrl} target="_blank" rel="noopener noreferrer">
              <img
                key={payment.screenShot}
                src={screenshotUrl}
                alt={t('agent.payment.screenshot_alt', 'Payment screenshot')}
                className="max-h-80 w-full rounded-lg border border-border object-contain bg-surface-muted"
              />
            </a>
          ) : (
            <p className="text-sm text-text-secondary">
              {t('agent.payment.screenshot_unavailable', 'Screenshot preview unavailable.')}
            </p>
          )}
        </div>

        {!readOnly ? (
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              className="gap-2"
              disabled={submitting || payment.status === 'received' || !onMarkReceived}
              onClick={() => void onMarkReceived?.()}
            >
              {t('agent.payment.mark_received', 'Mark received')}
            </Button>
            <Button
              type="button"
              variant="secondary"
              className="gap-2 text-error border-error/30 hover:bg-error/10"
              disabled={submitting || payment.status === 'not_received' || !onMarkNotReceived}
              onClick={() => void onMarkNotReceived?.()}
            >
              {t('agent.payment.mark_not_received', 'Mark not received')}
            </Button>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

export function usePaymentReview(options: {
  enabled: boolean;
  reloadKey?: string;
  fetchPayment: () => Promise<Payment | null>;
  fetchScreenshotUrl: () => Promise<string>;
  fetchHistory: () => Promise<PaymentHistory[]>;
  updateStatus?: (payload: UpdatePaymentStatusPayload) => Promise<Payment>;
}) {
  const { t } = useTranslation();
  const {
    enabled,
    reloadKey = '',
    fetchPayment,
    fetchScreenshotUrl,
    fetchHistory,
    updateStatus,
  } = options;
  const [payment, setPayment] = useState<Payment | null>(null);
  const [screenshotUrl, setScreenshotUrl] = useState<string | null>(null);
  const [history, setHistory] = useState<PaymentHistory[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [loadingScreenshot, setLoadingScreenshot] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchPaymentRef = useRef(fetchPayment);
  const fetchScreenshotUrlRef = useRef(fetchScreenshotUrl);
  const fetchHistoryRef = useRef(fetchHistory);
  const updateStatusRef = useRef(updateStatus);

  fetchPaymentRef.current = fetchPayment;
  fetchScreenshotUrlRef.current = fetchScreenshotUrl;
  fetchHistoryRef.current = fetchHistory;
  updateStatusRef.current = updateStatus;

  useEffect(() => {
    if (!enabled) {
      setPayment(null);
      setScreenshotUrl(null);
      setHistory([]);
      setLoadingHistory(false);
      setLoadingScreenshot(false);
      return;
    }

    let cancelled = false;
    setLoadingScreenshot(true);
    setLoadingHistory(true);

    async function loadPayment() {
      try {
        const data = await fetchPaymentRef.current();
        if (cancelled) return;

        setPayment(data);

        if (!data) {
          setScreenshotUrl(null);
          const historyEntries = await fetchHistoryRef.current();
          if (!cancelled) {
            setHistory(historyEntries);
          }
          return;
        }

        const [url, historyEntries] = await Promise.all([
          fetchScreenshotUrlRef.current(),
          fetchHistoryRef.current(),
        ]);
        if (!cancelled) {
          setScreenshotUrl(url);
          setHistory(historyEntries);
        }
      } catch (error) {
        if (!cancelled) {
          toast.error(formatApiError(error as ApiError));
          setScreenshotUrl(null);
          setHistory([]);
        }
      } finally {
        if (!cancelled) {
          setLoadingScreenshot(false);
          setLoadingHistory(false);
        }
      }
    }

    void loadPayment();

    return () => {
      cancelled = true;
    };
  }, [enabled, reloadKey]);

  const handleMarkReceived = useCallback(async () => {
    if (!updateStatusRef.current) return;
    setSubmitting(true);
    try {
      setPayment(await updateStatusRef.current({ status: 'received' }));
      setHistory(await fetchHistoryRef.current());
      toast.success(t('agent.payment.received_success', 'Payment marked as received'));
    } catch (error) {
      toast.error(formatApiError(error as ApiError));
    } finally {
      setSubmitting(false);
    }
  }, [t]);

  const handleMarkNotReceived = useCallback(async (note: string) => {
    if (!updateStatusRef.current) return;
    setSubmitting(true);
    try {
      setPayment(
        await updateStatusRef.current({ status: 'not_received', note }),
      );
      setHistory(await fetchHistoryRef.current());
      toast.success(t('agent.payment.not_received_success', 'Payment marked as not received'));
    } catch (error) {
      toast.error(formatApiError(error as ApiError));
    } finally {
      setSubmitting(false);
    }
  }, [t]);

  const reloadPayment = useCallback(async () => {
    if (!enabled) return;

    setLoadingScreenshot(true);
    setLoadingHistory(true);
    try {
      const data = await fetchPaymentRef.current();
      setPayment(data);

      if (!data) {
        setScreenshotUrl(null);
        setHistory(await fetchHistoryRef.current());
        return;
      }

      const [url, historyEntries] = await Promise.all([
        fetchScreenshotUrlRef.current(),
        fetchHistoryRef.current(),
      ]);
      setScreenshotUrl(url);
      setHistory(historyEntries);
    } catch (error) {
      toast.error(formatApiError(error as ApiError));
      setScreenshotUrl(null);
      setHistory([]);
    } finally {
      setLoadingScreenshot(false);
      setLoadingHistory(false);
    }
  }, [enabled]);

  return {
    payment,
    screenshotUrl,
    history,
    loadingHistory,
    loadingScreenshot,
    submitting,
    handleMarkReceived,
    handleMarkNotReceived,
    reloadPayment,
  };
}
