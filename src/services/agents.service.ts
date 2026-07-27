import { api } from '../lib/api';
import type {
  Agent,
  AgentLoginResponse,
  AgentSignUpResponse,
  AgentStatus,
  AdminPaymentRequest,
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
  UpdateAgentStatusPayload,
  ReferralUser,
  UpdateUserPayload,
  UpdateUserStatusPayload,
  UserStatus,
  ApprovalInfo,
  ChainWithUsers,
  Payment,
  PaymentHistory,
  PaymentRequestCounts,
  PaymentScreenshotDownloadResponse,
  PaymentStatus,
  AgentUserRequestCounts,
  UpdatePaymentStatusPayload,
  PresignPaymentUploadPayload,
  ConfirmPaymentPayload,
} from '../types/api';

export function listAgents(status?: AgentStatus) {
  const query = status ? `?status=${status}` : '';
  return api<Agent[]>(`/agents${query}`);
}

export function getAgent(id: string) {
  return api<Agent>(`/agents/${id}`);
}

export function listAgentUsers(agentId: string, status?: UserStatus) {
  const query = status ? `?status=${status}` : '';
  return api<ReferralUser[]>(`/agents/${agentId}/users${query}`);
}

export function getAgentUser(agentId: string, userId: string) {
  return api<ReferralUser>(`/agents/${agentId}/users/${userId}`);
}

export function listAgentUserForms(agentId: string, userId: string) {
  return api<FormSummary[]>(`/agents/${agentId}/users/${userId}/forms`);
}

export function getAgentUserForm(agentId: string, userId: string, formId: string) {
  return api<Form>(`/agents/${agentId}/users/${userId}/forms/${formId}`);
}

export function listAgentUserFormResponses(
  agentId: string,
  userId: string,
  formId: string,
) {
  return api<FormResponse[]>(
    `/agents/${agentId}/users/${userId}/forms/${formId}/responses`,
  );
}

export function getAgentUserFormResponseFileDownloadUrl(
  agentId: string,
  userId: string,
  formId: string,
  responseId: string,
  fieldId: string,
) {
  return api<FormResponseFileDownloadResponse>(
    `/agents/${agentId}/users/${userId}/forms/${formId}/responses/${responseId}/files/${fieldId}/download`,
  );
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

export function updateAgentStatus(id: string, payload: UpdateAgentStatusPayload) {
  return api<Agent>(`/agents/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export function resetAgentPassword(id: string) {
  return api<ResetAgentPasswordResponse>(`/agents/${id}/reset-password`, {
    method: 'PATCH',
  });
}

export function sendAgentRegistrationOtp(phoneNumber: string) {
  return api<{ message: string }>('/agents/register/send-otp', {
    method: 'POST',
    body: JSON.stringify({ phoneNumber }),
    token: null,
    skipAuthHandler: true,
  });
}

export function agentSignUp(payload: SignUpAgentPayload) {
  return api<AgentSignUpResponse>('/agents/sign-up', {
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

export function getMyUserRequestCounts() {
  return api<AgentUserRequestCounts>('/agents/me/users/counts');
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

export function resubmitMyUser(id: string) {
  return api<ReferralUser>(`/agents/me/users/${id}/resubmit`, {
    method: 'POST',
  });
}

export function getApprovalInfo(userId: string) {
  return api<ApprovalInfo>(`/agents/me/users/${userId}/approval-info`);
}

export function getMyChainReferrals() {
  return api<{ chains: ChainWithUsers[] }>('/agents/me/chain-referrals');
}

export function getAgentChainReferrals(agentId: string) {
  return api<{ chains: ChainWithUsers[] }>(`/agents/${agentId}/chain-referrals`);
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

export function getMyUserPayment(userId: string) {
  return api<Payment | null>(`/agents/me/users/${userId}/payment`);
}

export function getMyUserPaymentHistory(userId: string) {
  return api<PaymentHistory[]>(`/agents/me/users/${userId}/payment/history`);
}

export function getMyUserPaymentScreenshotUrl(userId: string) {
  return api<PaymentScreenshotDownloadResponse>(
    `/agents/me/users/${userId}/payment/screenshot`,
  );
}

export function presignMyUserPaymentUpload(
  userId: string,
  payload: PresignPaymentUploadPayload,
) {
  return api<{ uploadUrl: string; key: string; url: string; expiresIn: number }>(
    `/agents/me/users/${userId}/payment/presign`,
    {
      method: 'POST',
      body: JSON.stringify(payload),
    },
  );
}

export function confirmMyUserPayment(
  userId: string,
  payload: ConfirmPaymentPayload,
) {
  return api<Payment>(`/agents/me/users/${userId}/payment/confirm`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function getAgentUserPayment(agentId: string, userId: string) {
  return api<Payment | null>(`/agents/${agentId}/users/${userId}/payment`);
}

export function getAgentUserPaymentHistory(agentId: string, userId: string) {
  return api<PaymentHistory[]>(`/agents/${agentId}/users/${userId}/payment/history`);
}

export function getAgentUserPaymentScreenshotUrl(agentId: string, userId: string) {
  return api<PaymentScreenshotDownloadResponse>(
    `/agents/${agentId}/users/${userId}/payment/screenshot`,
  );
}

export function updateAgentUserPaymentStatus(
  agentId: string,
  userId: string,
  payload: UpdatePaymentStatusPayload,
) {
  return api<Payment>(`/agents/${agentId}/users/${userId}/payment/status`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export function listPaymentRequests(status?: PaymentStatus) {
  const query = status ? `?status=${status}` : '';
  return api<AdminPaymentRequest[]>(`/agents/payment-requests${query}`);
}

export function getPaymentRequestCounts() {
  return api<PaymentRequestCounts>('/agents/payment-requests/counts');
}
