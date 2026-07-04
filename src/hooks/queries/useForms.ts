import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  createForm,
  deleteForm,
  getForm,
  listFormResponses,
  listForms,
  updateForm,
} from '../../services/forms.service';
import { formatApiError } from '../../lib/api';
import { queryKeys } from '../../lib/queryKeys';
import type {
  ApiError,
  CreateFormPayload,
  SubmissionUserType,
  UpdateFormPayload,
} from '../../types/api';

export function useForms(userType?: SubmissionUserType) {
  return useQuery({
    queryKey: queryKeys.forms.all(userType),
    queryFn: () => listForms(userType),
  });
}

export function useForm(id: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.forms.detail(id),
    queryFn: () => getForm(id),
    enabled: Boolean(id) && enabled,
  });
}

export function useFormResponses(formId: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.forms.responses(formId),
    queryFn: () => listFormResponses(formId),
    enabled: Boolean(formId) && enabled,
  });
}

export function useCreateForm() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateFormPayload) => createForm(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['forms'] });
    },
    onError: (error) => toast.error(formatApiError(error as ApiError)),
  });
}

export function useUpdateForm() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateFormPayload }) =>
      updateForm(id, payload),
    onSuccess: (_data, { id }) => {
      void queryClient.invalidateQueries({ queryKey: ['forms'] });
      void queryClient.invalidateQueries({ queryKey: queryKeys.forms.detail(id) });
    },
    onError: (error) => toast.error(formatApiError(error as ApiError)),
  });
}

export function useDeleteForm() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteForm(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['forms'] });
    },
    onError: (error) => toast.error(formatApiError(error as ApiError)),
  });
}