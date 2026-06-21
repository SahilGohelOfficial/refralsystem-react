import { api } from '../lib/api';
import type {
  Agent,
  AssignAgentPayload,
  CreateUserPayload,
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
