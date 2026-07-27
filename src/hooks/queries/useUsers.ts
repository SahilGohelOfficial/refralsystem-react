import { useQuery } from '@tanstack/react-query';
import {
  getMyProfile,
  getUserDashboard,
  listAgentsByLocation,
} from '../../services/users.service';
import { queryKeys } from '../../lib/queryKeys';

export function useMyProfile(enabled = true) {
  return useQuery({
    queryKey: queryKeys.users.me,
    queryFn: getMyProfile,
    enabled,
  });
}

export function useUserDashboard(enabled = true) {
  return useQuery({
    queryKey: queryKeys.users.dashboard,
    queryFn: getUserDashboard,
    enabled,
  });
}

export function useAgentsByLocation(stateId: number | null, cityId: number | null) {
  return useQuery({
    queryKey: queryKeys.users.agentsByLocation(stateId ?? 0, cityId ?? 0),
    queryFn: () => listAgentsByLocation(stateId!, cityId!),
    enabled: stateId != null && stateId > 0 && cityId != null && cityId > 0,
  });
}