import { useEffect, useRef, useState, type ChangeEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ImagePlus, Upload } from 'lucide-react';
import toast from 'react-hot-toast';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Loader from '../../components/ui/Loader';
import { useAuth } from '../../stores/authStore';
import { formatApiError } from '../../lib/api';
import {
  confirmPayment,
  presignPaymentUpload,
} from '../../services/users.service';
import {
  selectNeedsPaymentSubmission,
  useUserPortalStore,
} from '../../stores/userPortalStore';
import type { ApiError } from '../../types/api';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_SIZE_BYTES = 10 * 1024 * 1024;

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

const UserPayment = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { refreshUserProfile } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const paymentLoaded = useUserPortalStore((state) => state.paymentLoaded);
  const fetchPayment = useUserPortalStore((state) => state.fetchPayment);
  const syncAfterPaymentConfirm = useUserPortalStore((state) => state.syncAfterPaymentConfirm);
  const needsPaymentSubmission = useUserPortalStore(selectNeedsPaymentSubmission);

  const [submitting, setSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!paymentLoaded) {
      void fetchPayment();
    }
  }, [paymentLoaded, fetchPayment]);

  useEffect(() => {
    if (!selectedFile) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(selectedFile);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [selectedFile]);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_TYPES.includes(file.type)) {
      toast.error(
        t(
          'user_portal.payment.invalid_type',
          'Please upload a JPEG, PNG, WebP, or GIF image.',
        ),
      );
      event.target.value = '';
      return;
    }

    if (file.size > MAX_SIZE_BYTES) {
      toast.error(
        t('user_portal.payment.too_large', 'Image must be 10 MB or smaller.'),
      );
      event.target.value = '';
      return;
    }

    setSelectedFile(file);
  };

  const handleConfirm = async () => {
    if (!selectedFile) {
      toast.error(
        t('user_portal.payment.file_required', 'Please select a payment screenshot.'),
      );
      return;
    }

    setSubmitting(true);
    try {
      const presign = await presignPaymentUpload({
        fileName: selectedFile.name,
        contentType: selectedFile.type,
        size: selectedFile.size,
      });
      await uploadFileToPresignedUrl(presign.uploadUrl, selectedFile);
      const confirmed = await confirmPayment({ screenShot: presign.key });
      syncAfterPaymentConfirm(confirmed);
      await refreshUserProfile();
      toast.success(
        t('user_portal.payment.submit_success', 'Payment submitted successfully.'),
      );
      navigate('/user/dashboard');
    } catch (error) {
      toast.error(formatApiError(error as ApiError));
    } finally {
      setSubmitting(false);
    }
  };

  if (!paymentLoaded) {
    return <Loader text={t('common.loading', 'Loading...')} />;
  }

  if (!needsPaymentSubmission) {
    return (
      <div className="page-shell max-w-2xl">
        <Card>
          <CardContent className="py-12 text-center text-sm text-text-secondary">
            {t(
              'user_portal.payment.not_required',
              'Payment submission is not required at this time.',
            )}
            <div className="mt-4">
              <Link to="/user/dashboard" className="text-primary hover:underline">
                {t('user_portal.payment.back_dashboard', 'Back to dashboard')}
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="page-shell max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text">
          {t('user_portal.payment.title', 'Submit payment')}
        </h1>
        <p className="text-sm text-text-secondary mt-1">
          {t(
            'user_portal.payment.subtitle',
            'Upload a screenshot of your payment. Your agent will verify it before approving your registration.',
          )}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            {t('user_portal.payment.screenshot', 'Payment screenshot')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <input
            ref={fileInputRef}
            type="file"
            accept={ALLOWED_TYPES.join(',')}
            className="hidden"
            onChange={handleFileChange}
          />

          {previewUrl ? (
            <div className="rounded-lg border border-border overflow-hidden bg-surface-muted">
              <img
                src={previewUrl}
                alt={t('user_portal.payment.preview_alt', 'Payment screenshot preview')}
                className="max-h-80 w-full object-contain"
              />
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full rounded-xl border-2 border-dashed border-border p-10 flex flex-col items-center gap-3 text-text-secondary hover:border-primary/50 hover:text-text transition-colors"
            >
              <ImagePlus size={32} className="text-primary" />
              <span className="text-sm font-medium">
                {t('user_portal.payment.choose_file', 'Choose an image')}
              </span>
              <span className="text-xs">
                {t('user_portal.payment.file_hint', 'JPEG, PNG, WebP, or GIF up to 10 MB')}
              </span>
            </button>
          )}

          <div className="flex flex-wrap gap-3">
            <Button
              type="button"
              variant="secondary"
              onClick={() => fileInputRef.current?.click()}
              disabled={submitting}
            >
              <Upload size={16} className="mr-2" />
              {selectedFile
                ? t('user_portal.payment.change_file', 'Change image')
                : t('user_portal.payment.choose_file', 'Choose an image')}
            </Button>
            <Button
              type="button"
              onClick={() => void handleConfirm()}
              disabled={submitting || !selectedFile}
            >
              {submitting
                ? t('common.submitting', 'Submitting...')
                : t('user_portal.payment.confirm', 'Confirm payment')}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserPayment;
