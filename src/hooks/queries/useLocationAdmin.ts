import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  createCity,
  createState,
  deleteCity,
  deleteState,
  updateCity,
  updateState,
} from '../../services/location-admin.service';
import { formatApiError } from '../../lib/api';
import { queryKeys } from '../../lib/queryKeys';
import type {
  ApiError,
  CreateCityPayload,
  CreateStatePayload,
  UpdateCityPayload,
  UpdateStatePayload,
} from '../../types/api';

export function useCreateState() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateStatePayload) => createState(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.location.states });
    },
    onError: (error) => toast.error(formatApiError(error as ApiError)),
  });
}

export function useUpdateState() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateStatePayload }) =>
      updateState(id, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.location.states });
    },
    onError: (error) => toast.error(formatApiError(error as ApiError)),
  });
}

export function useDeleteState() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteState(id),
    onSuccess: (_data, id) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.location.states });
      void queryClient.invalidateQueries({ queryKey: queryKeys.location.cities(id) });
    },
    onError: (error) => toast.error(formatApiError(error as ApiError)),
  });
}

export function useCreateCity() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      stateId,
      payload,
    }: {
      stateId: number;
      payload: CreateCityPayload;
    }) => createCity(stateId, payload),
    onSuccess: (_data, { stateId }) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.location.states });
      void queryClient.invalidateQueries({ queryKey: queryKeys.location.cities(stateId) });
    },
    onError: (error) => toast.error(formatApiError(error as ApiError)),
  });
}

export function useUpdateCity() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
      stateId,
    }: {
      id: number;
      payload: UpdateCityPayload;
      stateId: number;
    }) => updateCity(id, payload),
    onSuccess: (_data, { stateId, payload }) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.location.states });
      void queryClient.invalidateQueries({ queryKey: queryKeys.location.cities(stateId) });
      if (payload.stateId != null && payload.stateId !== stateId) {
        void queryClient.invalidateQueries({
          queryKey: queryKeys.location.cities(payload.stateId),
        });
      }
    },
    onError: (error) => toast.error(formatApiError(error as ApiError)),
  });
}

export function useDeleteCity() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id }: { id: number; stateId: number }) => deleteCity(id),
    onSuccess: (_data, { stateId }) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.location.states });
      void queryClient.invalidateQueries({ queryKey: queryKeys.location.cities(stateId) });
    },
    onError: (error) => toast.error(formatApiError(error as ApiError)),
  });
}
