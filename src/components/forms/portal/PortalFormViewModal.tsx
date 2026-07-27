import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { Download, Eye, FileText, ImageIcon, X } from 'lucide-react';
import Modal from '../../ui/Modal';
import Button from '../../ui/Button';
import Image from '../../ui/Image';
import { formatApiError } from '../../../lib/api';
import { formatFileSize } from '../../../lib/formatFileSize';
import {
  getForm,
  getFormResponseFileDownloadUrl,
  listFormResponses,
} from '../../../services/forms.service';
import {
  getUserFormResponseFileDownloadUrl,
  listUserFormResponses,
  getUserForm,
  getAgentUserForm,
  listAgentUserFormResponses,
  getAgentUserFormResponseFileDownloadUrl,
} from '../../../services/agents.service';
import type { ApiError, Form, FormResponse, StoredFileMeta } from '../../../types/api';
import { resolveFieldLabel } from '../../../lib/labels';
import { formatLocalDateTime } from '../../../lib/dates';

type PortalFormViewModalProps = {
  isOpen: boolean;
  onClose: () => void;
  formId: string | null;
  userId?: string;
  agentId?: string;
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

const IMAGE_EXTENSIONS = new Set(['jpg', 'jpeg', 'png', 'webp', 'gif', 'bmp', 'svg', 'heic', 'heif']);

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

export default function PortalFormViewModal({
  isOpen,
  onClose,
  formId,
  userId,
  agentId,
}: PortalFormViewModalProps) {
  const { t } = useTranslation();
  const [form, setForm] = useState<Form | null>(null);
  const [response, setResponse] = useState<FormResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [downloadingFields, setDownloadingFields] = useState<Set<string>>(new Set());
  const [previewUrls, setPreviewUrls] = useState<Record<string, string>>({});
  const [previewLoading, setPreviewLoading] = useState<Record<string, boolean>>({});
  const [previewErrors, setPreviewErrors] = useState<Record<string, boolean>>({});
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);
  const [lightboxName, setLightboxName] = useState<string>('');
  const previewGenRef = useRef(0);

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

  const fetchDownloadUrl = useCallback(
    async (fieldId: string, responseId: string) => {
      if (!formId) throw new Error('Missing form');
      if (userId) {
        if (agentId) {
          return getAgentUserFormResponseFileDownloadUrl(
            agentId,
            userId,
            formId,
            responseId,
            fieldId,
          );
        }
        return getUserFormResponseFileDownloadUrl(userId, formId, responseId, fieldId);
      }
      return getFormResponseFileDownloadUrl(formId, responseId, fieldId);
    },
    [agentId, formId, userId],
  );

  const fetchSubmission = useCallback(async () => {
    if (!formId) return;
    setLoading(true);
    setForm(null);
    setResponse(null);
    setPreviewUrls({});
    setPreviewLoading({});
    setPreviewErrors({});
    setLightboxUrl(null);
    try {
      const [formData, responses] = await Promise.all([
        userId
          ? agentId
            ? getAgentUserForm(agentId, userId, formId)
            : getUserForm(userId, formId)
          : getForm(formId),
        userId
          ? agentId
            ? listAgentUserFormResponses(agentId, userId, formId)
            : listUserFormResponses(userId, formId)
          : listFormResponses(formId),
      ]);
      setForm(formData);
      setResponse(responses[0] ?? null);
    } catch (error) {
      toast.error(formatApiError(error as ApiError));
      onClose();
    } finally {
      setLoading(false);
    }
  }, [agentId, formId, onClose, userId]);

  useEffect(() => {
    if (isOpen && formId) {
      void fetchSubmission();
    }
  }, [fetchSubmission, formId, isOpen]);

  // Prefetch image preview URLs when response is ready
  useEffect(() => {
    if (!isOpen || !response || !formId) return;

    const imageFieldIds = Object.entries(response.answers)
      .filter(([, value]) => isStoredFileMeta(value) && isImageFileMeta(value))
      .map(([fieldId]) => fieldId);

    if (imageFieldIds.length === 0) return;

    const gen = ++previewGenRef.current;
    const responseId = response.id;

    setPreviewLoading((prev) => {
      const next = { ...prev };
      for (const id of imageFieldIds) next[id] = true;
      return next;
    });

    void (async () => {
      await Promise.all(
        imageFieldIds.map(async (fieldId) => {
          try {
            const { downloadUrl } = await fetchDownloadUrl(fieldId, responseId);
            if (gen !== previewGenRef.current) return;
            setPreviewUrls((prev) => ({ ...prev, [fieldId]: downloadUrl }));
            setPreviewErrors((prev) => ({ ...prev, [fieldId]: false }));
          } catch {
            if (gen !== previewGenRef.current) return;
            setPreviewErrors((prev) => ({ ...prev, [fieldId]: true }));
          } finally {
            if (gen !== previewGenRef.current) return;
            setPreviewLoading((prev) => ({ ...prev, [fieldId]: false }));
          }
        }),
      );
    })();

    return () => {
      previewGenRef.current += 1;
    };
  }, [fetchDownloadUrl, formId, isOpen, response]);

  const handleDownloadFile = useCallback(
    async (fieldId: string) => {
      if (!formId || !response) return;

      setDownloadingFields((prev) => {
        const next = new Set(prev);
        next.add(fieldId);
        return next;
      });

      try {
        const { downloadUrl } = await fetchDownloadUrl(fieldId, response.id);
        window.open(downloadUrl, '_blank', 'noopener,noreferrer');
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
    [fetchDownloadUrl, formId, response],
  );

  const title = form?.title ?? t('forms.portal.view_title', 'Submitted form');

  const renderFileAnswer = (fieldId: string, file: StoredFileMeta) => {
    const isImage = isImageFileMeta(file);
    const url = previewUrls[fieldId];
    const loadingPreview = previewLoading[fieldId];
    const previewFailed = previewErrors[fieldId];
    const sizeLabel = formatFileSize(file.size);
    const typeLabel = shortMimeLabel(file.type);

    return (
      <div className="space-y-3">
        {isImage ? (
          <div className="rounded-xl border border-border bg-surface-muted overflow-hidden">
            {loadingPreview ? (
              <div className="h-48 sm:h-64 w-full bg-surface flex items-center justify-center">
                <ImageIcon className="text-text-muted" size={28} />
              </div>
            ) : url && !previewFailed ? (
              <button
                type="button"
                className="block w-full cursor-zoom-in focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                onClick={() => {
                  setLightboxUrl(url);
                  setLightboxName(file.name);
                }}
                aria-label={t('forms.portal.view_full', 'View full size')}
              >
                <Image
                  src={url}
                  alt={file.name}
                  className="max-h-80 w-full bg-surface"
                  onError={() =>
                    setPreviewErrors((prev) => ({ ...prev, [fieldId]: true }))
                  }
                />
              </button>
            ) : (
              <div className="h-36 w-full flex flex-col items-center justify-center gap-2 text-text-secondary bg-surface">
                <ImageIcon size={24} className="text-text-muted" />
                <span className="text-xs">
                  {t('forms.portal.preview_unavailable', 'Preview unavailable')}
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
            {isImage && url && !previewFailed ? (
              <Button
                type="button"
                size="sm"
                variant="secondary"
                className="gap-1.5"
                onClick={() => {
                  setLightboxUrl(url);
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
              onClick={() => void handleDownloadFile(fieldId)}
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

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="2xl">
        <div className="max-h-[70vh] overflow-y-auto -mx-1 px-1">
          {loading ? (
            <div className="flex justify-center py-14">
              <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
            </div>
          ) : !response ? (
            <p className="text-sm text-text-secondary text-center py-10">
              {t('forms.portal.view_empty', 'No submission found.')}
            </p>
          ) : (
            <div className="space-y-4 pb-1">
              {form?.description ? (
                <p className="text-sm text-text-secondary leading-relaxed">{form.description}</p>
              ) : null}

              <div className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface-muted px-3 py-1.5 text-xs text-text-secondary">
                <span className="font-medium text-text">
                  {t('forms.portal.view_submitted_at', 'Submitted at')}
                </span>
                <span>{formatLocalDateTime(response.submittedAt)}</span>
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
          )}
        </div>
      </Modal>

      {/* Full-size image lightbox */}
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
            <Image
              src={lightboxUrl}
              alt={lightboxName}
              priority
              className="max-h-[80vh] w-full rounded-lg"
            />
          </div>
        </div>
      ) : null}
    </>
  );
}
