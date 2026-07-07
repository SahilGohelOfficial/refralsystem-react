import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import { useConfirm } from '../../stores/confirmStore';
import { formatApiError } from '../../lib/api';
import { formatLocalDateTime } from '../../lib/dates';
import type { ApiError, Payment, PaymentStatus } from '../../types/api';

type PaymentReviewSectionProps = {
  payment: Payment | null;
  screenshotUrl: string | null;
  loadingScreenshot: boolean;
  submitting: boolean;
  onMarkReceived: () => Promise<void>;
  onMarkNotReceived: () => Promise<void>;
  readOnly?: boolean;
};

const paymentStatusVariant = (status: PaymentStatus) => {
  if (status === 'received') return 'success' as const;
  if (status === 'not_received') return 'error' as const;
  return 'warning' as const;
};

const paymentStatusLabel = (status: PaymentStatus, t: (key: string, fallback: string) => string) => {
  if (status === 'received') {
    return t('agent.payment.status_received', 'Received');
  }
  if (status === 'not_received') {
    return t('agent.payment.status_not_received', 'Not received');
  }
  return t('agent.payment.status_pending', 'Pending');
};

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
  const confirm = useConfirm();

  const handleMarkReceivedClick = async () => {
    const confirmed = await confirm({
      title: t('agent.payment.confirm_received_title', 'Mark payment as received?'),
      message: t(
        'agent.payment.confirm_received_message',
        'Confirm that you have verified this payment screenshot.',
      ),
      confirmLabel: t('agent.payment.mark_received', 'Mark received'),
    });
    if (!confirmed) return;
    await onMarkReceived();
  };

  const handleMarkNotReceivedClick = async () => {
    const confirmed = await confirm({
      title: t('agent.payment.confirm_not_received_title', 'Mark payment as not received?'),
      message: t(
        'agent.payment.confirm_not_received_message',
        'The user will be asked to upload a new payment screenshot.',
      ),
      confirmLabel: t('agent.payment.mark_not_received', 'Mark not received'),
      variant: 'danger',
    });
    if (!confirmed) return;
    await onMarkNotReceived();
  };

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
          <Badge variant={paymentStatusVariant(payment.status)} dot>
            {paymentStatusLabel(payment.status, t)}
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
        </dl>

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
              disabled={submitting || payment.status === 'received'}
              onClick={() => void handleMarkReceivedClick()}
            >
              {t('agent.payment.mark_received', 'Mark received')}
            </Button>
            <Button
              type="button"
              variant="secondary"
              className="gap-2 text-error border-error/30 hover:bg-error/10"
              disabled={submitting || payment.status === 'not_received'}
              onClick={() => void handleMarkNotReceivedClick()}
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
  updateStatus: (status: 'received' | 'not_received') => Promise<Payment>;
}) {
  const { t } = useTranslation();
  const { enabled, reloadKey = '', fetchPayment, fetchScreenshotUrl, updateStatus } = options;
  const [payment, setPayment] = useState<Payment | null>(null);
  const [screenshotUrl, setScreenshotUrl] = useState<string | null>(null);
  const [loadingScreenshot, setLoadingScreenshot] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchPaymentRef = useRef(fetchPayment);
  const fetchScreenshotUrlRef = useRef(fetchScreenshotUrl);
  const updateStatusRef = useRef(updateStatus);

  fetchPaymentRef.current = fetchPayment;
  fetchScreenshotUrlRef.current = fetchScreenshotUrl;
  updateStatusRef.current = updateStatus;

  useEffect(() => {
    if (!enabled) {
      setPayment(null);
      setScreenshotUrl(null);
      setLoadingScreenshot(false);
      return;
    }

    let cancelled = false;
    setLoadingScreenshot(true);

    async function loadPayment() {
      try {
        const data = await fetchPaymentRef.current();
        if (cancelled) return;

        setPayment(data);

        if (!data) {
          setScreenshotUrl(null);
          return;
        }

        const url = await fetchScreenshotUrlRef.current();
        if (!cancelled) {
          setScreenshotUrl(url);
        }
      } catch (error) {
        if (!cancelled) {
          toast.error(formatApiError(error as ApiError));
          setScreenshotUrl(null);
        }
      } finally {
        if (!cancelled) {
          setLoadingScreenshot(false);
        }
      }
    }

    void loadPayment();

    return () => {
      cancelled = true;
    };
  }, [enabled, reloadKey]);

  const handleMarkReceived = useCallback(async () => {
    setSubmitting(true);
    try {
      setPayment(await updateStatusRef.current('received'));
      toast.success(t('agent.payment.received_success', 'Payment marked as received'));
    } catch (error) {
      toast.error(formatApiError(error as ApiError));
    } finally {
      setSubmitting(false);
    }
  }, [t]);

  const handleMarkNotReceived = useCallback(async () => {
    setSubmitting(true);
    try {
      setPayment(await updateStatusRef.current('not_received'));
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
    try {
      const data = await fetchPaymentRef.current();
      setPayment(data);

      if (!data) {
        setScreenshotUrl(null);
        return;
      }

      setScreenshotUrl(await fetchScreenshotUrlRef.current());
    } catch (error) {
      toast.error(formatApiError(error as ApiError));
      setScreenshotUrl(null);
    } finally {
      setLoadingScreenshot(false);
    }
  }, [enabled]);

  return {
    payment,
    screenshotUrl,
    loadingScreenshot,
    submitting,
    handleMarkReceived,
    handleMarkNotReceived,
    reloadPayment,
  };
}
