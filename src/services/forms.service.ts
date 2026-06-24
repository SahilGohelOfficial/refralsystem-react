import { api } from '../lib/api';
import type {
  CreateFormPayload,
  Form,
  FormResponseFileDownloadResponse,
  FormResponse,
  FormSummary,
  MessageResponse,
  PresignFormUploadPayload,
  PresignFormUploadResponse,
  SubmissionUserType,
  SubmitFormResponsePayload,
  UpdateFormPayload,
} from '../types/api';

export function listForms(userType?: SubmissionUserType) {
  const query = userType ? `?userType=${encodeURIComponent(userType)}` : '';
  return api<FormSummary[]>(`/forms${query}`);
}

export function getForm(id: string) {
  return api<Form>(`/forms/${id}`);
}

export function createForm(payload: CreateFormPayload) {
  return api<Form>('/forms', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function updateForm(id: string, payload: UpdateFormPayload) {
  return api<Form>(`/forms/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export function deleteForm(id: string) {
  return api<MessageResponse>(`/forms/${id}`, { method: 'DELETE' });
}

export function submitFormResponse(
  formId: string,
  payload: SubmitFormResponsePayload,
) {
  return api<FormResponse>(`/forms/${formId}/responses`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function listFormResponses(formId: string) {
  return api<FormResponse[]>(`/forms/${formId}/responses`);
}

export function presignFormUpload(
  formId: string,
  payload: PresignFormUploadPayload,
) {
  return api<PresignFormUploadResponse>(`/forms/${formId}/uploads/presign`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function getFormResponseFileDownloadUrl(
  formId: string,
  responseId: string,
  fieldId: string,
) {
  return api<FormResponseFileDownloadResponse>(
    `/forms/${formId}/responses/${responseId}/files/${fieldId}/download`,
  );
}
