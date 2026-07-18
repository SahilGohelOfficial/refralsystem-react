import { create } from 'zustand';
import { getMyPayment } from '../services/users.service';
import type { Payment, UserStatus } from '../types/api';

const POLL_INTERVAL_MS = 30_000;

type UserPortalState = {
  payment: Payment | null;
  paymentLoaded: boolean;
  userStatus: UserStatus | null | undefined;
  pollTimerId: ReturnType<typeof setInterval> | null;
  setUserStatus: (status: UserStatus | null | undefined) => void;
  fetchPayment: () => Promise<void>;
  syncAfterPaymentConfirm: (payment: Payment) => void;
  startPaymentPolling: () => void;
  stopPaymentPolling: () => void;
  reset: () => void;
};

export const useUserPortalStore = create<UserPortalState>((set, get) => ({
  payment: null,
  paymentLoaded: false,
  userStatus: undefined,
  pollTimerId: null,

  setUserStatus: (userStatus) => set({ userStatus }),

  fetchPayment: async () => {
    try {
      const payment = await getMyPayment();
      set({ payment: payment ?? null, paymentLoaded: true });
    } catch {
      set({ payment: null, paymentLoaded: true });
    }
  },

  syncAfterPaymentConfirm: (payment) => {
    set({
      payment,
      paymentLoaded: true,
      userStatus: 'pending',
    });
  },

  startPaymentPolling: () => {
    if (get().pollTimerId != null) return;

    const id = setInterval(() => {
      void get().fetchPayment();
    }, POLL_INTERVAL_MS);
    set({ pollTimerId: id });
  },

  stopPaymentPolling: () => {
    const { pollTimerId } = get();
    if (pollTimerId != null) {
      clearInterval(pollTimerId);
    }
    set({ pollTimerId: null });
  },

  reset: () => {
    get().stopPaymentPolling();
    set({
      payment: null,
      paymentLoaded: false,
      userStatus: undefined,
      pollTimerId: null,
    });
  },
}));

export const selectPaymentStatus = (state: UserPortalState) => state.payment?.status ?? null;

export const selectPaymentLoaded = (state: UserPortalState) => state.paymentLoaded;

export const selectHasPayment = (state: UserPortalState) => Boolean(state.payment?.id);
