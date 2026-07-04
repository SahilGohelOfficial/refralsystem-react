import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  createChain,
  deleteChain,
  listChains,
  updateChain,
} from '../../services/chains.service';
import { formatApiError } from '../../lib/api';
import { queryKeys } from '../../lib/queryKeys';
import type { ApiError, CreateChainPayload, UpdateChainPayload } from '../../types/api';

export function useChains() {
  return useQuery({
    queryKey: queryKeys.chains.all,
    queryFn: listChains,
  });
}

export function useCreateChain() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateChainPayload) => createChain(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.chains.all });
    },
    onError: (error) => toast.error(formatApiError(error as ApiError)),
  });
}

export function useUpdateChain() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateChainPayload }) =>
      updateChain(id, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.chains.all });
    },
    onError: (error) => toast.error(formatApiError(error as ApiError)),
  });
}

export function useDeleteChain() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteChain(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.chains.all });
    },
    onError: (error) => toast.error(formatApiError(error as ApiError)),
  });
}