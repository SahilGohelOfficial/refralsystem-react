import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Card } from '../../ui/Card';
import Button from '../../ui/Button';
import DynamicFormRenderer from '../builder/DynamicFormRenderer';
import { validateField, validateForm } from '../../../lib/forms/validateField';
import { formatApiError } from '../../../lib/api';
import {
  getForm,
  listFormResponses,
  presignFormUpload,
  submitFormResponse,
} from '../../../services/forms.service';
import {
  getUserForm,
  listUserFormResponses,
  presignUserFormUpload,
  submitUserFormResponse,
} from '../../../services/agents.service';
import type {
  ApiError,
  Form,
  FormResponse,
  StoredFileMeta,
  SubmissionUserType,
  SubmittedAnswerValue,
} from '../../../types/api';
import type { FormAnswerValue, FormAnswers, FormField } from '../../../types/form';
import {
  isImageFile,
  prepareImageForUpload,
} from '../../../lib/images/prepareImageForUpload';

type PortalFormSubmitProps = {
  userType: SubmissionUserType;
  listPath: string;
  userId?: string;
};

function getDefaultAnswers(fields: FormField[]): FormAnswers {
  const answers: FormAnswers = {};
  for (const field of fields) {
    switch (field.type) {
      case 'checkbox':
        answers[field.id] = false;
        break;
      case 'multi_dropdown':
      case 'multi_radio':
      case 'checkbox_group':
        answers[field.id] = [];
        break;
      case 'file':
        answers[field.id] = null;
        break;
      default:
        answers[field.id] = '';
    }
  }
  return answers;
}

function isStoredFileMeta(value: unknown): value is StoredFileMeta {
  return (
    !!value &&
    typeof value === 'object' &&
    'kind' in value &&
    (value as { kind?: unknown }).kind === 'file' &&
    'key' in value &&
    typeof (value as { key?: unknown }).key === 'string' &&
    'name' in value &&
    typeof (value as { name?: unknown }).name === 'string' &&
    'size' in value &&
    typeof (value as { size?: unknown }).size === 'number' &&
    'type' in value &&
    typeof (value as { type?: unknown }).type === 'string'
  );
}

function toFormFields(form: Form): FormField[] {
  return form.fields.map((field) => ({
    ...field,
    type: field.type as FormField['type'],
  }));
}

function buildInitialAnswers(
  fields: FormField[],
  existingResponse: FormResponse | null,
): FormAnswers {
  const defaults = getDefaultAnswers(fields);
  const existingAnswers = existingResponse?.answers ?? {};

  for (const field of fields) {
    const value = existingAnswers[field.id];
    if (value === undefined) {
      continue;
    }

    if (isStoredFileMeta(value)) {
      defaults[field.id] = value;
      continue;
    }

    defaults[field.id] = value as Exclude<SubmittedAnswerValue, StoredFileMeta>;
  }

  return defaults;
}

async function uploadFileToPresignedUrl(
  uploadUrl: string,
  file: File,
): Promise<void> {
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

export default function PortalFormSubmit({
  userType,
  listPath,
  userId,
}: PortalFormSubmitProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { formId = '' } = useParams<{ formId: string }>();

  const [form, setForm] = useState<Form | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [answers, setAnswers] = useState<FormAnswers>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [preparingFileFields, setPreparingFileFields] = useState<Record<string, boolean>>(
    {},
  );
  const isPreparingFiles = Object.values(preparingFileFields).some(Boolean);

  const fields = useMemo<FormField[]>(
    () => (form ? toFormFields(form) : []),
    [form],
  );

  const fetchForm = useCallback(async () => {
    if (!formId) return;
    setLoading(true);
    try {
      const [data, responses] = await Promise.all([
        userId ? getUserForm(userId, formId) : getForm(formId),
        userId
          ? listUserFormResponses(userId, formId)
          : listFormResponses(formId),
      ]);
      if (data.submissionUserType !== userType) {
        toast.error(
          t(
            'forms.portal.type_mismatch',
            'This form is not available for your account type.',
          ),
        );
        navigate(listPath, { replace: true });
        return;
      }

      const mappedFields = toFormFields(data);
      const existingResponse = responses[0] ?? null;
      setForm(data);
      setAnswers(buildInitialAnswers(mappedFields, existingResponse));
    } catch (error) {
      toast.error(formatApiError(error as ApiError));
      navigate(listPath, { replace: true });
    } finally {
      setLoading(false);
    }
  }, [formId, listPath, navigate, t, userId, userType]);

  useEffect(() => {
    void fetchForm();
  }, [fetchForm]);

  const handleChange = useCallback((fieldId: string, value: FormAnswerValue) => {
    setAnswers((prev) => ({ ...prev, [fieldId]: value }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next[fieldId];
      return next;
    });
  }, []);

  const handleFilePreparingChange = useCallback((fieldId: string, preparing: boolean) => {
    setPreparingFileFields((prev) => {
      if (!preparing) {
        if (!(fieldId in prev)) return prev;
        const next = { ...prev };
        delete next[fieldId];
        return next;
      }
      if (prev[fieldId]) return prev;
      return { ...prev, [fieldId]: true };
    });
  }, []);

  const handleBlur = useCallback(
    (fieldId: string) => {
      const field = fields.find((f) => f.id === fieldId);
      if (!field) return;
      // Skip validation while this field's image is still being prepared.
      if (preparingFileFields[fieldId]) return;
      const error = validateField(field, answers[fieldId]);
      setErrors((prev) => {
        const next = { ...prev };
        if (error) next[fieldId] = error;
        else delete next[fieldId];
        return next;
      });
    },
    [answers, fields, preparingFileFields],
  );

  const buildSubmissionAnswers = useCallback(async (): Promise<Record<string, SubmittedAnswerValue>> => {
    if (!form) {
      return {};
    }

    const payloadAnswers: Record<string, SubmittedAnswerValue> = {};

    for (const field of fields) {
      const value = answers[field.id];

      if (value instanceof File) {
        const uploadFile = isImageFile(value)
          ? await prepareImageForUpload(value)
          : value;

        const contentType = uploadFile.type || 'application/octet-stream';
        const presign = userId
          ? await presignUserFormUpload(userId, form.id, {
              fieldId: field.id,
              fileName: uploadFile.name,
              contentType,
              size: uploadFile.size,
            })
          : await presignFormUpload(form.id, {
              fieldId: field.id,
              fileName: uploadFile.name,
              contentType,
              size: uploadFile.size,
            });

        await uploadFileToPresignedUrl(presign.uploadUrl, uploadFile);

        const storedMeta: StoredFileMeta = {
          kind: 'file',
          key: presign.key,
          name: uploadFile.name,
          size: uploadFile.size,
          type: contentType,
        };
        payloadAnswers[field.id] = storedMeta;
        continue;
      }

      if (isStoredFileMeta(value)) {
        payloadAnswers[field.id] = value;
        continue;
      }

      if (value === undefined) {
        continue;
      }

      payloadAnswers[field.id] = value as Exclude<SubmittedAnswerValue, StoredFileMeta>;
    }

    return payloadAnswers;
  }, [answers, fields, form, userId]);

  const handleSubmit = useCallback(async () => {
    if (!form || isPreparingFiles) return;

    const formErrors = validateForm(fields, answers);
    setErrors(formErrors);
    if (Object.keys(formErrors).length > 0) {
      return;
    }

    setSubmitting(true);
    try {
      const preparedAnswers = await buildSubmissionAnswers();
      if (userId) {
        await submitUserFormResponse(userId, form.id, { answers: preparedAnswers });
      } else {
        await submitFormResponse(form.id, { answers: preparedAnswers });
      }
      toast.success(
        t('forms.portal.submit_success', 'Form submitted successfully.'),
      );
      navigate(listPath);
    } catch (error) {
      const maybeApiError = error as ApiError;
      if (typeof maybeApiError?.statusCode === 'number') {
        toast.error(formatApiError(maybeApiError));
      } else {
        toast.error(
          t(
            'forms.portal.submit_error',
            'Failed to submit form. Please try again.',
          ),
        );
      }
    } finally {
      setSubmitting(false);
    }
  }, [
    answers,
    buildSubmissionAnswers,
    fields,
    form,
    isPreparingFiles,
    listPath,
    navigate,
    t,
    userId,
  ]);

  const pageTitle = userId
    ? t('agent.my_users.submit_title', 'Fill User Form')
    : userType === 'agent'
      ? t('agent.forms.submit_title', 'Fill Form')
      : t('user_portal.forms.submit_title', 'Fill Form');
  const pageSubtitle = userId
    ? t(
        'agent.my_users.submit_subtitle',
        'Complete the form on behalf of this user.',
      )
    : userType === 'agent'
      ? t('agent.forms.submit_subtitle', 'Complete the form and submit your response.')
      : t(
          'user_portal.forms.submit_subtitle',
          'Complete the form and submit your response.',
        );

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!form) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text">{pageTitle}</h1>
        <p className="text-sm text-text-secondary mt-1">{pageSubtitle}</p>
      </div>

      <Card className="space-y-6">
        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-text">{form.title}</h2>
          {form.description ? (
            <p className="text-sm text-text-secondary">{form.description}</p>
          ) : null}
        </div>

        <DynamicFormRenderer
          fields={fields}
          answers={answers}
          errors={errors}
          onChange={handleChange}
          onBlur={handleBlur}
          onFilePreparingChange={handleFilePreparingChange}
        />

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate(listPath)}
            disabled={submitting || isPreparingFiles}
          >
            {t('common.cancel', 'Cancel')}
          </Button>
          <Button
            type="button"
            onClick={() => void handleSubmit()}
            isLoading={submitting}
            disabled={isPreparingFiles}
          >
            {isPreparingFiles
              ? t('forms.portal.preparing_image', 'Preparing image…')
              : t('forms.portal.submit', 'Submit')}
          </Button>
        </div>
      </Card>
    </div>
  );
}
