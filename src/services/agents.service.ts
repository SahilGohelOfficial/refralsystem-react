import { api } from '../lib/api';
import type {
  Agent,
  AgentLoginResponse,
  CreateAgentPayload,
  CreateAgentResponse,
  MessageResponse,
  ResetAgentPasswordResponse,
  SignUpAgentPayload,
  UpdateAgentPayload,
  UpdateAgentProfilePayload,
  ReferralUser,
  UpdateUserPayload,
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

export function listMyUsers() {
  return api<ReferralUser[]>('/agents/me/users');
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
