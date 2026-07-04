import { useQuery } from '@tanstack/react-query';
import { listCities, listStates } from '../../services/location.service';
import { queryKeys } from '../../lib/queryKeys';

export function useStates() {
  return useQuery({
    queryKey: queryKeys.location.states,
    queryFn: listStates,
    staleTime: 5 * 60_000,
  });
}

export function useCities(stateId: number | null) {
  return useQuery({
    queryKey: queryKeys.location.cities(stateId ?? 0),
    queryFn: () => listCities(stateId!),
    enabled: stateId != null && stateId > 0,
    staleTime: 5 * 60_000,
  });
}