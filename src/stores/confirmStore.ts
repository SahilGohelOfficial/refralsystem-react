import { create } from 'zustand';

export type ConfirmVariant = 'default' | 'danger';

export interface ConfirmOptions {
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: ConfirmVariant;
}

type ConfirmDialogState = ConfirmOptions & {
  isOpen: true;
};

type ConfirmStore = {
  dialog: ConfirmDialogState | null;
  confirm: (options: ConfirmOptions) => Promise<boolean>;
  close: (value: boolean) => void;
};

let resolveRef: ((value: boolean) => void) | null = null;

export const useConfirmStore = create<ConfirmStore>((set) => ({
  dialog: null,

  confirm: (options) =>
    new Promise<boolean>((resolve) => {
      resolveRef = resolve;
      set({ dialog: { ...options, isOpen: true } });
    }),

  close: (value) => {
    resolveRef?.(value);
    resolveRef = null;
    set({ dialog: null });
  },
}));

export function useConfirm(): ConfirmStore['confirm'] {
  return useConfirmStore((state) => state.confirm);
}
