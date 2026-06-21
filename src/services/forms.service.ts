import { api } from '../lib/api';
import type {
  CreateFormPayload,
  Form,
  FormSummary,
  MessageResponse,
  UpdateFormPayload,
} from '../types/api';

export function listForms() {
  return api<FormSummary[]>('/forms');
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
