import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  createAgent,
  deleteAgent,
  deleteMyUser,
  getAgent,
  getAgentChainReferrals,
  getAgentProfile,
  getAgentUser,
  getApprovalInfo,
  getMyChainReferrals,
  getMyUser,
  listAgentUserForms,
  listAgentUsers,
  listAgents,
  listMyUsers,
  resetAgentPassword,
  updateAgent,
  updateAgentProfile,
  updateAgentStatus,
  updateMyUser,
  updateMyUserStatus,
} from '../../services/agents.service';
import { formatApiError } from '../../lib/api';
import { queryKeys } from '../../lib/queryKeys';
import type {
  ApiError,
  CreateAgentPayload,
  UpdateAgentPayload,
  UpdateAgentProfilePayload,
  UpdateUserPayload,
  UpdateUserStatusPayload,
  UserStatus,
} from '../../types/api';

export function useAgents() {
  return useQuery({
    queryKey: queryKeys.agents.all,
    queryFn: listAgents,
  });
}

export function useAgent(id: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.agents.detail(id),
    queryFn: () => getAgent(id),
    enabled: Boolean(id) && enabled,
  });
}

export function useAgentUsers(agentId: string, status?: UserStatus, enabled = true) {
  return useQuery({
    queryKey: queryKeys.agents.users(agentId, status),
    queryFn: () => listAgentUsers(agentId, status),
    enabled: Boolean(agentId) && enabled,
  });
}

export function useAgentUser(agentId: string, userId: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.agents.user(agentId, userId),
    queryFn: () => getAgentUser(agentId, userId),
    enabled: Boolean(agentId && userId) && enabled,
  });
}

export function useAgentUserForms(agentId: string, userId: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.agents.userForms(agentId, userId),
    queryFn: () => listAgentUserForms(agentId, userId),
    enabled: Boolean(agentId && userId) && enabled,
  });
}

export function useAgentChainReferrals(agentId: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.agents.chainReferrals(agentId),
    queryFn: async () => {
      const data = await getAgentChainReferrals(agentId);
      return data.chains;
    },
    enabled: Boolean(agentId) && enabled,
  });
}

export function useMyUsers(status?: UserStatus) {
  return useQuery({
    queryKey: queryKeys.agents.myUsers(status),
    queryFn: () => listMyUsers(status),
  });
}

export function useMyUser(userId: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.agents.myUser(userId),
    queryFn: () => getMyUser(userId),
    enabled: Boolean(userId) && enabled,
  });
}

export function useMyChainReferrals() {
  return useQuery({
    queryKey: queryKeys.agents.myChainReferrals,
    queryFn: async () => {
      const data = await getMyChainReferrals();
      return data.chains;
    },
  });
}

export function useAgentProfile() {
  return useQuery({
    queryKey: queryKeys.agents.myProfile,
    queryFn: getAgentProfile,
  });
}

export function useApprovalInfo(userId: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.agents.approvalInfo(userId),
    queryFn: () => getApprovalInfo(userId),
    enabled: Boolean(userId) && enabled,
  });
}

export function useCreateAgent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateAgentPayload) => createAgent(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.agents.all });
    },
    onError: (error) => toast.error(formatApiError(error as ApiError)),
  });
}

export function useUpdateAgent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateAgentPayload }) =>
      updateAgent(id, payload),
    onSuccess: (_data, { id }) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.agents.all });
      void queryClient.invalidateQueries({ queryKey: queryKeys.agents.detail(id) });
    },
    onError: (error) => toast.error(formatApiError(error as ApiError)),
  });
}

export function useDeleteAgent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteAgent(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.agents.all });
    },
    onError: (error) => toast.error(formatApiError(error as ApiError)),
  });
}

export function useUpdateAgentStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      updateAgentStatus(id, isActive),
    onSuccess: (_data, { id }) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.agents.all });
      void queryClient.invalidateQueries({ queryKey: queryKeys.agents.detail(id) });
    },
    onError: (error) => toast.error(formatApiError(error as ApiError)),
  });
}

export function useResetAgentPassword() {
  return useMutation({
    mutationFn: (id: string) => resetAgentPassword(id),
    onError: (error) => toast.error(formatApiError(error as ApiError)),
  });
}

export function useUpdateAgentProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateAgentProfilePayload) => updateAgentProfile(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.agents.myProfile });
    },
    onError: (error) => toast.error(formatApiError(error as ApiError)),
  });
}

export function useUpdateMyUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateUserPayload }) =>
      updateMyUser(id, payload),
    onSuccess: (_data, { id }) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.agents.myUsers() });
      void queryClient.invalidateQueries({ queryKey: queryKeys.agents.myUser(id) });
    },
    onError: (error) => toast.error(formatApiError(error as ApiError)),
  });
}

export function useDeleteMyUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteMyUser(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.agents.myUsers() });
    },
    onError: (error) => toast.error(formatApiError(error as ApiError)),
  });
}

export function useUpdateMyUserStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateUserStatusPayload }) =>
      updateMyUserStatus(id, payload),
    onSuccess: (_data, { id }) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.agents.myUsers() });
      void queryClient.invalidateQueries({ queryKey: queryKeys.agents.myUser(id) });
    },
    onError: (error) => toast.error(formatApiError(error as ApiError)),
  });
}