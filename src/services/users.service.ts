import { api } from '../lib/api';
import type {
  Agent,
  AssignAgentPayload,
  ConfirmPaymentPayload,
  CreateUserPayload,
  Payment,
  PresignFormUploadResponse,
  PresignPaymentUploadPayload,
  ReferralUser,
} from '../types/api';

const publicOpts = { skipAuthHandler: true as const };

export function createUser(payload: CreateUserPayload) {
  return api<ReferralUser>('/users', {
    method: 'POST',
    body: JSON.stringify(payload),
    ...publicOpts,
  });
}

export function sendRegistrationOtp(phoneNumber: string) {
  return api<{ message: string }>('/users/register/send-otp', {
    method: 'POST',
    body: JSON.stringify({ phoneNumber }),
    ...publicOpts,
  });
}

export function validateRegistrationEmail(email: string) {
  return api<{ valid: true; message: string }>('/users/register/validate-email', {
    method: 'POST',
    body: JSON.stringify({ email }),
    ...publicOpts,
  });
}

export function validateReferralCode(referralCode: string) {
  return api<{ valid: true; message: string }>('/users/register/validate-referral', {
    method: 'POST',
    body: JSON.stringify({ referralCode }),
    // Keep auth token when present (agent portal scopes validation to that agent)
    skipAuthHandler: true,
  });
}

export function listAgentsByLocation(stateId: number, cityId: number) {
  const params = new URLSearchParams({
    stateId: String(stateId),
    cityId: String(cityId),
  });
  return api<Agent[]>(`/users/agents?${params}`, publicOpts);
}

export function assignAgent(userId: string, payload: AssignAgentPayload) {
  return api<ReferralUser>(`/users/${userId}/agent`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
    ...publicOpts,
  });
}

export function getMyProfile() {
  return api<ReferralUser>('/users/me');
}

export function getMyPayment() {
  return api<Payment | null>('/users/me/payment');
}

export function presignPaymentUpload(payload: PresignPaymentUploadPayload) {
  return api<PresignFormUploadResponse>('/users/me/payment/presign', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function confirmPayment(payload: ConfirmPaymentPayload) {
  return api<Payment>('/users/me/payment/confirm', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}
