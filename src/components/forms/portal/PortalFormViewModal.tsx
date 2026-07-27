import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import Modal from '../../ui/Modal';
import FormResponsePreview from '../FormResponsePreview';
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
  getAgentUserForm,
  listAgentUserFormResponses,
  getAgentUserFormResponseFileDownloadUrl,
} from '../../../services/agents.service';
import type { ApiError, Form, FormResponse } from '../../../types/api';

type PortalFormViewModalProps = {
  isOpen: boolean;
  onClose: () => void;
  formId: string | null;
  userId?: string;
  agentId?: string;
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
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!isOpen || !formId) return;

    let cancelled = false;
    setLoading(true);
    setForm(null);
    setResponse(null);

    void (async () => {
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
        if (cancelled) return;
        setForm(formData);
        setResponse(responses[0] ?? null);
      } catch (error) {
        if (cancelled) return;
        toast.error(formatApiError(error as ApiError));
        onCloseRef.current();
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [agentId, formId, isOpen, userId]);

  const onDownloadFile = useCallback(
    async (fieldId: string, responseId: string) => {
      if (!formId) throw new Error('Missing form');
      if (userId) {
        if (agentId) {
          const res = await getAgentUserFormResponseFileDownloadUrl(
            agentId,
            userId,
            formId,
            responseId,
            fieldId,
          );
          return res.downloadUrl;
        }
        const res = await getUserFormResponseFileDownloadUrl(
          userId,
          formId,
          responseId,
          fieldId,
        );
        return res.downloadUrl;
      }
      const res = await getFormResponseFileDownloadUrl(formId, responseId, fieldId);
      return res.downloadUrl;
    },
    [agentId, formId, userId],
  );

  const title = form?.title ?? t('forms.portal.view_title', 'Submitted form');

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="2xl">
      <div className="max-h-[70vh] overflow-y-auto -mx-1 px-1">
        <FormResponsePreview
          form={form}
          response={response}
          loading={loading}
          onDownloadFile={onDownloadFile}
        />
      </div>
    </Modal>
  );
}
