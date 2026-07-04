import { useEffect } from 'react';
import toast from 'react-hot-toast';
import { formatApiError } from '../lib/api';
import type { ApiError } from '../types/api';

export function useToastOnError(error: unknown, enabled = true) {
  useEffect(() => {
    if (!enabled || !error) return;
    toast.error(formatApiError(error as ApiError));
  }, [error, enabled]);
}