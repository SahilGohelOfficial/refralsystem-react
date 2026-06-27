import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import Modal from '../../ui/Modal';
import Button from '../../ui/Button';
import { formatApiError } from '../../../lib/api';
import {
  getForm,
  getFormResponseFileDownloadUrl,
  listFormResponses,
} from '../../../services/forms.service';
import {
  getUserFormResponseFileDownloadUrl,
  listUserFormResponses,
  getUserForm,
} from '../../../services/agents.service';
import type { ApiError, Form, FormResponse, StoredFileMeta } from '../../../types/api';

type PortalFormViewModalProps = {
  isOpen: boolean;
  onClose: () => void;
  formId: string | null;
  userId?: string;
};

function formatDateTime(iso?: string): string {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '—';
  }
}

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

export default function PortalFormViewModal({
  isOpen,
  onClose,
  formId,
  userId,
}: PortalFormViewModalProps) {
  const { t } = useTranslation();
  const [form, setForm] = useState<Form | null>(null);
  const [response, setResponse] = useState<FormResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [downloadingFields, setDownloadingFields] = useState<Set<string>>(new Set());

  const fieldLabelMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const field of form?.fields ?? []) {
      map.set(field.id, field.label);
    }
    return map;
  }, [form]);

  const fetchSubmission = useCallback(async () => {
    if (!formId) return;
    setLoading(true);
    setForm(null);
    setResponse(null);
    try {
      const [formData, responses] = await Promise.all([
        userId ? getUserForm(userId, formId) : getForm(formId),
        userId
          ? listUserFormResponses(userId, formId)
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
  }, [formId, onClose, userId]);

  useEffect(() => {
    if (isOpen && formId) {
      void fetchSubmission();
    }
  }, [fetchSubmission, formId, isOpen]);

  const handleDownloadFile = useCallback(
    async (fieldId: string) => {
      if (!formId || !response) return;

      setDownloadingFields((prev) => {
        const next = new Set(prev);
        next.add(fieldId);
        return next;
      });

      try {
        const { downloadUrl } = userId
          ? await getUserFormResponseFileDownloadUrl(
              userId,
              formId,
              response.id,
              fieldId,
            )
          : await getFormResponseFileDownloadUrl(formId, response.id, fieldId);
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
    [formId, response, userId],
  );

  const title = form?.title ?? t('forms.portal.view_title', 'Submitted form');

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="2xl">
      <div className="max-h-[70vh] overflow-y-auto space-y-4">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
          </div>
        ) : !response ? (
          <p className="text-sm text-text-secondary text-center py-8">
            {t('forms.portal.view_empty', 'No submission found.')}
          </p>
        ) : (
          <>
            {form?.description ? (
              <p className="text-sm text-text-secondary">{form.description}</p>
            ) : null}

            <p className="text-xs text-text-secondary">
              {t('forms.portal.view_submitted_at', 'Submitted at')}:{' '}
              <span className="text-text">{formatDateTime(response.submittedAt)}</span>
            </p>

            <div className="space-y-4 pt-2">
              {Object.keys(response.answers).length === 0 ? (
                <p className="text-sm text-text-secondary">
                  {t('forms.responses.no_answers', 'No answers available.')}
                </p>
              ) : (
                Object.entries(response.answers).map(([fieldId, value]) => (
                  <div
                    key={fieldId}
                    className="rounded-xl border border-border bg-surface/40 p-4 space-y-2"
                  >
                    <p className="text-sm font-medium text-text">
                      {fieldLabelMap.get(fieldId) ?? fieldId}
                    </p>
                    {isStoredFileMeta(value) ? (
                      <div className="space-y-2">
                        <p className="text-sm text-text-secondary break-words">
                          {`${value.name} (${value.type}, ${value.size} bytes)`}
                        </p>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => void handleDownloadFile(fieldId)}
                          isLoading={downloadingFields.has(fieldId)}
                        >
                          {t('forms.responses.download', 'Download')}
                        </Button>
                      </div>
                    ) : (
                      <p className="text-sm text-text break-words whitespace-pre-wrap">
                        {formatAnswerValue(value)}
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}
