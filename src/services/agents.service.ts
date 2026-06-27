import { api } from '../lib/api';
import type {
  Agent,
  AgentLoginResponse,
  CreateAgentPayload,
  CreateAgentResponse,
  Form,
  FormResponse,
  FormResponseFileDownloadResponse,
  FormSummary,
  MessageResponse,
  PresignFormUploadPayload,
  PresignFormUploadResponse,
  ResetAgentPasswordResponse,
  SignUpAgentPayload,
  SubmitFormResponsePayload,
  UpdateAgentPayload,
  UpdateAgentProfilePayload,
  ReferralUser,
  UpdateUserPayload,
  UpdateUserStatusPayload,
  UserStatus,
  ApprovalInfo,
  ChainWithUsers,
} from '../types/api';

export function listAgents() {
  return api<Agent[]>('/agents');
}

export function getAgent(id: string) {
  return api<Agent>(`/agents/${id}`);
}

export function createAgent(payload: CreateAgentPayload) {
  return api<CreateAgentResponse>('/agents', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function updateAgent(id: string, payload: UpdateAgentPayload) {
  return api<Agent>(`/agents/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export function deleteAgent(id: string) {
  return api<MessageResponse>(`/agents/${id}`, { method: 'DELETE' });
}

export function updateAgentStatus(id: string, isActive: boolean) {
  return api<Agent>(`/agents/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ isActive }),
  });
}

export function resetAgentPassword(id: string) {
  return api<ResetAgentPasswordResponse>(`/agents/${id}/reset-password`, {
    method: 'PATCH',
  });
}

export function agentSignUp(payload: SignUpAgentPayload) {
  return api<AgentLoginResponse>('/agents/sign-up', {
    method: 'POST',
    body: JSON.stringify(payload),
    token: null,
    skipAuthHandler: true,
  });
}

export function getAgentProfile() {
  return api<Agent>('/agents/me/profile');
}

export function updateAgentProfile(payload: UpdateAgentProfilePayload) {
  return api<Agent>('/agents/me/profile', {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export function listMyUsers(status?: UserStatus) {
  const query = status ? `?status=${status}` : '';
  return api<ReferralUser[]>(`/agents/me/users${query}`);
}

export function getMyUser(id: string) {
  return api<ReferralUser>(`/agents/me/users/${id}`);
}

export function updateMyUser(id: string, payload: UpdateUserPayload) {
  return api<ReferralUser>(`/agents/me/users/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export function deleteMyUser(id: string) {
  return api<MessageResponse>(`/agents/me/users/${id}`, { method: 'DELETE' });
}

export function updateMyUserStatus(id: string, payload: UpdateUserStatusPayload) {
  return api<ReferralUser>(`/agents/me/users/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export function getApprovalInfo(userId: string) {
  return api<ApprovalInfo>(`/agents/me/users/${userId}/approval-info`);
}

export function getMyChainReferrals() {
  return api<{ chains: ChainWithUsers[] }>('/agents/me/chain-referrals');
}

export function listUserForms(userId: string) {
  return api<FormSummary[]>(`/agents/me/users/${userId}/forms`);
}

export function getUserForm(userId: string, formId: string) {
  return api<Form>(`/agents/me/users/${userId}/forms/${formId}`);
}

export function listUserFormResponses(userId: string, formId: string) {
  return api<FormResponse[]>(`/agents/me/users/${userId}/forms/${formId}/responses`);
}

export function submitUserFormResponse(
  userId: string,
  formId: string,
  payload: SubmitFormResponsePayload,
) {
  return api<FormResponse>(`/agents/me/users/${userId}/forms/${formId}/responses`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function presignUserFormUpload(
  userId: string,
  formId: string,
  payload: PresignFormUploadPayload,
) {
  return api<PresignFormUploadResponse>(
    `/agents/me/users/${userId}/forms/${formId}/uploads/presign`,
    {
      method: 'POST',
      body: JSON.stringify(payload),
    },
  );
}

export function getUserFormResponseFileDownloadUrl(
  userId: string,
  formId: string,
  responseId: string,
  fieldId: string,
) {
  return api<FormResponseFileDownloadResponse>(
    `/agents/me/users/${userId}/forms/${formId}/responses/${responseId}/files/${fieldId}/download`,
  );
}
