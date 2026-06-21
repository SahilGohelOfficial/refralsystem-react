import { api } from '../lib/api';
import type {
  Admin,
  CreateAdminPayload,
  MessageResponse,
  UpdateAdminPayload,
} from '../types/api';

export function listAdmins() {
  return api<Admin[]>('/admins');
}

export function getAdmin(id: string) {
  return api<Admin>(`/admins/${id}`);
}

export function createAdmin(payload: CreateAdminPayload) {
  return api<Admin>('/admins', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function updateAdmin(id: string, payload: UpdateAdminPayload) {
  return api<Admin>(`/admins/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export function resetAdminPassword(id: string, newPassword: string) {
  return api<MessageResponse>(`/admins/${id}/reset-password`, {
    method: 'PATCH',
    body: JSON.stringify({ newPassword }),
  });
}

export function updateAdminStatus(id: string, isActive: boolean) {
  return api<Admin>(`/admins/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ isActive }),
  });
}
