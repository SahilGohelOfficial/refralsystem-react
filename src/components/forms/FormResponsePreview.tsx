import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { Download, Eye, FileText, ImageIcon, X } from 'lucide-react';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import { formatApiError } from '../../lib/api';
import { formatFileSize } from '../../lib/formatFileSize';
import { formatLocalDateTime } from '../../lib/dates';
import { resolveFieldLabel } from '../../lib/labels';
import type { ApiError, Form, FormResponse, StoredFileMeta } from '../../types/api';

export type FormResponsePreviewProps = {
  form: Form | null;
  response: FormResponse | null;
  loading?: boolean;
  /**
   * Called only when the user clicks Download.
   * Previews use `downloadUrl` already present on file answers from the details API.
   */
  onDownloadFile?: (fieldId: string, responseId: string) => Promise<string>;
  showSubmitterMeta?: boolean;
  emptyMessage?: string;
};

function isStoredFileMeta(value: unknown): value is StoredFileMeta {
  return (
    !!value &&
    typeof value === 'object' &&
    'kind' in value &&
    (value as { kind?: unknown }).kind === 'file' &&
    'key' in value &&
    typeof (value as { key?: unknown }).key === 'string'
  );
}

function formatAnswerValue(value: unknown): string {
  if (value === null || value === undefined) return '—';
  if (typeof value === 'string') return value || '—';
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  if (Array.isArray(value)) return value.length > 0 ? value.join(', ') : '—';
  return JSON.stringify(value);
}

const IMAGE_EXTENSIONS = new Set([
  'jpg',
  'jpeg',
  'png',
  'webp',
  'gif',
  'bmp',
  'svg',
  'heic',
  'heif',
]);

function isImageFileMeta(file: StoredFileMeta): boolean {
  const type = (file.type || '').toLowerCase();
  if (type.startsWith('image/')) return true;
  const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
  return IMAGE_EXTENSIONS.has(ext);
}

function shortMimeLabel(type: string): string {
  if (!type) return 'file';
  if (type.startsWith('image/')) return type.replace('image/', '').toUpperCase();
  if (type.includes('/')) return type.split('/')[1]?.toUpperCase() ?? type;
  return type;
}

type AnswerEntry = {
  fieldId: string;
  label: string;
  value: unknown;
};

export default function FormResponsePreview({
  form,
  response,
  loading = false,
  onDownloadFile,
  showSubmitterMeta = false,
  emptyMessage,
}: FormResponsePreviewProps) {
  const { t } = useTranslation();
  const [downloadingFields, setDownloadingFields] = useState<Set<string>>(new Set());
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);
  const [lightboxName, setLightboxName] = useState('');

  const fieldLabelMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const field of form?.fields ?? []) {
      map.set(field.id, field.label);
    }
    return map;
  }, [form]);

  const answerEntries = useMemo((): AnswerEntry[] => {
    if (!response) return [];

    const answers = response.answers ?? {};
    const ordered: AnswerEntry[] = [];
    const seen = new Set<string>();

    for (const field of form?.fields ?? []) {
      if (!(field.id in answers)) continue;
      seen.add(field.id);
      ordered.push({
        fieldId: field.id,
        label: resolveFieldLabel(
          field.id,
          fieldLabelMap,
          t('forms.responses.unknown_field', 'Unknown field'),
        ),
        value: answers[field.id],
      });
    }

    for (const [fieldId, value] of Object.entries(answers)) {
      if (seen.has(fieldId)) continue;
      ordered.push({
        fieldId,
        label: resolveFieldLabel(
          fieldId,
          fieldLabelMap,
          t('forms.responses.unknown_field', 'Unknown field'),
        ),
        value,
      });
    }

    return ordered;
  }, [form?.fields, fieldLabelMap, response, t]);

  const handleDownloadFile = useCallback(
    async (fieldId: string, file: StoredFileMeta) => {
      if (!response) return;

      setDownloadingFields((prev) => new Set(prev).add(fieldId));
      try {
        // Prefer a fresh download URL from the download API only on button click.
        if (onDownloadFile) {
          const downloadUrl = await onDownloadFile(fieldId, response.id);
          window.open(downloadUrl, '_blank', 'noopener,noreferrer');
        } else if (file.downloadUrl) {
          window.open(file.downloadUrl, '_blank', 'noopener,noreferrer');
        } else {
          toast.error(
            t('forms.responses.download_unavailable', 'Download is not available.'),
          );
        }
      } catch (error) {
        toast.error(formatApiError(error as ApiError));
      } finally {
        setDownloadingFields((prev) => {
          const next = new Set(prev);
          next.delete(fieldId);
          return next;
        });
      }
    },
    [onDownloadFile, response, t],
  );

  const renderFileAnswer = (fieldId: string, file: StoredFileMeta) => {
    const isImage = isImageFileMeta(file);
    // Preview uses URL prefilled on the details/list API — never a separate download call.
    const previewUrl = file.downloadUrl ?? null;
    const previewFailed = isImage && (!previewUrl || imageErrors[fieldId]);
    const sizeLabel = formatFileSize(file.size);
    const typeLabel = shortMimeLabel(file.type);

    return (
      <div className="space-y-3">
        {isImage ? (
          <div className="rounded-xl border border-border bg-surface-muted overflow-hidden min-h-[8rem]">
            {previewUrl && !imageErrors[fieldId] ? (
              <button
                type="button"
                className="block w-full cursor-zoom-in focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                onClick={() => {
                  setLightboxUrl(previewUrl);
                  setLightboxName(file.name);
                }}
                aria-label={t('forms.portal.view_full', 'View full size')}
              >
                <img
                  src={previewUrl}
                  alt={file.name}
                  className="max-h-80 w-full object-contain bg-surface"
                  onError={() =>
                    setImageErrors((prev) => ({ ...prev, [fieldId]: true }))
                  }
                />
              </button>
            ) : (
              <div className="h-36 w-full flex flex-col items-center justify-center gap-2 text-text-secondary bg-surface">
                <ImageIcon size={24} className="text-text-muted" />
                <span className="text-xs">
                  {previewFailed
                    ? t('forms.portal.preview_unavailable', 'Preview unavailable')
                    : t('forms.portal.preview_unavailable', 'Preview unavailable')}
                </span>
              </div>
            )}
          </div>
        ) : null}

        <div className="flex flex-col sm:flex-row sm:items-center gap-3 rounded-lg border border-border bg-surface/50 px-3 py-2.5">
          <div className="flex items-start gap-3 min-w-0 flex-1">
            <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
              {isImage ? <ImageIcon size={18} /> : <FileText size={18} />}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-text break-all">{file.name}</p>
              <p className="text-xs text-text-secondary mt-0.5">
                {typeLabel}
                <span className="mx-1.5 text-border-strong">·</span>
                {sizeLabel}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 shrink-0 sm:justify-end">
            {isImage && previewUrl && !imageErrors[fieldId] ? (
              <Button
                type="button"
                size="sm"
                variant="secondary"
                className="gap-1.5"
                onClick={() => {
                  setLightboxUrl(previewUrl);
                  setLightboxName(file.name);
                }}
              >
                <Eye size={14} />
                {t('forms.portal.view_full', 'View full')}
              </Button>
            ) : null}
            <Button
              type="button"
              size="sm"
              variant="secondary"
              className="gap-1.5"
              onClick={() => void handleDownloadFile(fieldId, file)}
              isLoading={downloadingFields.has(fieldId)}
            >
              <Download size={14} />
              {t('forms.responses.download', 'Download')}
            </Button>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center py-14">
        <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!response) {
    return (
      <p className="text-sm text-text-secondary text-center py-10">
        {emptyMessage ?? t('forms.portal.view_empty', 'No submission found.')}
      </p>
    );
  }

  const submitterName =
    response.submitter?.name?.trim() ||
    t('forms.responses.unknown_submitter', 'Unknown submitter');
  const submitterType = response.submitterType ?? response.submitter?.type;
  const submitterPhone = response.submitter?.phoneNumber;

  return (
    <>
      <div className="space-y-4 pb-1">
        {form?.description ? (
          <p className="text-sm text-text-secondary leading-relaxed">{form.description}</p>
        ) : null}

        <div className="flex flex-wrap gap-2">
          <div className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface-muted px-3 py-1.5 text-xs text-text-secondary">
            <span className="font-medium text-text">
              {t('forms.portal.view_submitted_at', 'Submitted at')}
            </span>
            <span>{formatLocalDateTime(response.submittedAt)}</span>
          </div>

          {showSubmitterMeta ? (
            <>
              <div className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface-muted px-3 py-1.5 text-xs text-text-secondary">
                <span className="font-medium text-text">
                  {t('forms.response_submitter', 'Submitter')}
                </span>
                <span>{submitterName}</span>
                {submitterType ? (
                  <Badge variant="neutral">
                    {submitterType === 'agent'
                      ? t('forms.submitter_agent', 'Agent')
                      : t('forms.submitter_user', 'User')}
                  </Badge>
                ) : null}
              </div>
              {submitterPhone ? (
                <div className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface-muted px-3 py-1.5 text-xs text-text-secondary">
                  <span className="font-medium text-text">
                    {t('forms.response_phone', 'Phone')}
                  </span>
                  <span>{submitterPhone}</span>
                </div>
              ) : null}
            </>
          ) : null}
        </div>

        {answerEntries.length === 0 ? (
          <p className="text-sm text-text-secondary py-4">
            {t('forms.responses.no_answers', 'No answers available.')}
          </p>
        ) : (
          <div className="space-y-3">
            {answerEntries.map(({ fieldId, label, value }) => (
              <div
                key={fieldId}
                className="rounded-xl border border-border bg-card/40 overflow-hidden"
              >
                <div className="px-4 py-2.5 border-b border-border bg-surface/50">
                  <p className="text-xs font-semibold uppercase tracking-wide text-text-secondary">
                    {label}
                  </p>
                </div>
                <div className="px-4 py-3">
                  {isStoredFileMeta(value) ? (
                    renderFileAnswer(fieldId, value)
                  ) : (
                    <p className="text-sm text-text break-words whitespace-pre-wrap leading-relaxed">
                      {formatAnswerValue(value)}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {lightboxUrl ? (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-8"
          role="dialog"
          aria-modal="true"
          aria-label={lightboxName || t('forms.portal.view_full', 'View full size')}
        >
          <div
            className="absolute inset-0 bg-black/85 backdrop-blur-sm"
            onClick={() => setLightboxUrl(null)}
            aria-hidden="true"
          />
          <div className="relative z-10 w-full max-w-5xl max-h-[90vh] flex flex-col gap-3">
            <div className="flex items-center justify-between gap-3 text-white">
              <p className="text-sm font-medium truncate min-w-0">{lightboxName}</p>
              <button
                type="button"
                onClick={() => setLightboxUrl(null)}
                className="shrink-0 rounded-lg p-2 hover:bg-white/10 transition-colors"
                aria-label={t('common.cancel', 'Close')}
              >
                <X size={20} />
              </button>
            </div>
            <img
              src={lightboxUrl}
              alt={lightboxName}
              className="max-h-[80vh] w-full object-contain rounded-lg"
            />
          </div>
        </div>
      ) : null}
    </>
  );
}
