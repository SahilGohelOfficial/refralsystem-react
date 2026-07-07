import { useEffect } from 'react';
import { useUserPortalStore } from '../stores/userPortalStore';
import type { UserStatus } from '../types/api';

export function useUserPortalSync(options: {
  enabled: boolean;
  userId?: string;
  userStatus?: UserStatus | null;
}) {
  const { enabled, userId, userStatus } = options;

  const setUserStatus = useUserPortalStore((state) => state.setUserStatus);
  const fetchPayment = useUserPortalStore((state) => state.fetchPayment);
  const startPaymentPolling = useUserPortalStore((state) => state.startPaymentPolling);
  const stopPaymentPolling = useUserPortalStore((state) => state.stopPaymentPolling);
  const reset = useUserPortalStore((state) => state.reset);
  const storeUserStatus = useUserPortalStore((state) => state.userStatus);

  useEffect(() => {
    setUserStatus(userStatus);
  }, [userStatus, setUserStatus]);

  useEffect(() => {
    if (!enabled || !userId) {
      reset();
      return;
    }

    void fetchPayment();

    const onFocus = () => {
      void fetchPayment();
    };
    window.addEventListener('focus', onFocus);

    return () => {
      window.removeEventListener('focus', onFocus);
      stopPaymentPolling();
    };
  }, [enabled, userId, fetchPayment, reset, stopPaymentPolling]);

  useEffect(() => {
    if (!enabled) return;

    const status = storeUserStatus ?? userStatus;
    if (status === 'pending') {
      startPaymentPolling();
    } else {
      stopPaymentPolling();
    }
  }, [
    enabled,
    storeUserStatus,
    userStatus,
    startPaymentPolling,
    stopPaymentPolling,
  ]);
}
