import { api } from '../lib/api';
import type {
  Chain,
  CreateChainPayload,
  MessageResponse,
  UpdateChainPayload,
} from '../types/api';

export function listChains() {
  return api<Chain[]>('/chains');
}

export function getChain(id: string) {
  return api<Chain>(`/chains/${id}`);
}

export function createChain(payload: CreateChainPayload) {
  return api<Chain>('/chains', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function updateChain(id: string, payload: UpdateChainPayload) {
  return api<Chain>(`/chains/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export function deleteChain(id: string) {
  return api<MessageResponse>(`/chains/${id}`, { method: 'DELETE' });
}
