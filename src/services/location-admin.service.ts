import { api } from '../lib/api';
import type {
  City,
  CreateCityPayload,
  CreateStatePayload,
  MessageResponse,
  State,
  UpdateCityPayload,
  UpdateStatePayload,
} from '../types/api';

export function createState(payload: CreateStatePayload) {
  return api<State>('/states', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function updateState(id: number, payload: UpdateStatePayload) {
  return api<State>(`/states/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export function deleteState(id: number) {
  return api<MessageResponse>(`/states/${id}`, { method: 'DELETE' });
}

export function createCity(stateId: number, payload: CreateCityPayload) {
  return api<City>(`/states/${stateId}/cities`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function updateCity(id: number, payload: UpdateCityPayload) {
  return api<City>(`/cities/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export function deleteCity(id: number) {
  return api<MessageResponse>(`/cities/${id}`, { method: 'DELETE' });
}
