import { api } from '../lib/api';
import type { City, State } from '../types/api';

export function listStates() {
  return api<State[]>('/states', { skipAuthHandler: true });
}

export function listCities(stateId: number) {
  return api<City[]>(`/states/${stateId}/cities`, { skipAuthHandler: true });
}
