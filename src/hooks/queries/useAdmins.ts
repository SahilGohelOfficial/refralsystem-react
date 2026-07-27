import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  createAdmin,
  getAdminDashboard,
  listAdmins,
  resetAdminPassword,
  updateAdmin,
  updateAdminStatus,
} from '../../services/admins.service';
import { formatApiError } from '../../lib/api';
import { queryKeys } from '../../lib/queryKeys';
import type { ApiError, CreateAdminPayload, UpdateAdminPayload } from '../../types/api';

export function useAdminDashboard() {
  return useQuery({
    queryKey: queryKeys.admins.dashboard,
    queryFn: getAdminDashboard,
  });
}

export function useAdmins() {
  return useQuery({
    queryKey: queryKeys.admins.all,
    queryFn: listAdmins,
  });
}

export function useCreateAdmin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateAdminPayload) => createAdmin(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.admins.all });
    },
    onError: (error) => toast.error(formatApiError(error as ApiError)),
  });
}

export function useUpdateAdmin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateAdminPayload }) =>
      updateAdmin(id, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.admins.all });
    },
    onError: (error) => toast.error(formatApiError(error as ApiError)),
  });
}

export function useResetAdminPassword() {
  return useMutation({
    mutationFn: ({ id, newPassword }: { id: string; newPassword: string }) =>
      resetAdminPassword(id, newPassword),
    onError: (error) => toast.error(formatApiError(error as ApiError)),
  });
}

export function useUpdateAdminStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      updateAdminStatus(id, isActive),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.admins.all });
    },
    onError: (error) => toast.error(formatApiError(error as ApiError)),
  });
}