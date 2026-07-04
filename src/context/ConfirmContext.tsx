import React, {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { useTranslation } from 'react-i18next';
import Modal from '../components/ui/Modal';
import Button from '../components/ui/Button';

export type ConfirmVariant = 'default' | 'danger';

export interface ConfirmOptions {
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: ConfirmVariant;
}

interface ConfirmContextValue {
  confirm: (options: ConfirmOptions) => Promise<boolean>;
}

const ConfirmContext = createContext<ConfirmContextValue | null>(null);

interface ConfirmState extends ConfirmOptions {
  resolve: (value: boolean) => void;
}

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const { t } = useTranslation();
  const [state, setState] = useState<ConfirmState | null>(null);
  const stateRef = useRef<ConfirmState | null>(null);

  const confirm = useCallback((options: ConfirmOptions) => {
    return new Promise<boolean>((resolve) => {
      const next: ConfirmState = { ...options, resolve };
      stateRef.current = next;
      setState(next);
    });
  }, []);

  const close = useCallback((value: boolean) => {
    const current = stateRef.current;
    if (!current) return;
    current.resolve(value);
    stateRef.current = null;
    setState(null);
  }, []);

  const variant = state?.variant ?? 'default';
  const title =
    state?.title ??
    (variant === 'danger'
      ? t('common.confirm_delete_title', 'Confirm Delete')
      : t('common.confirm_edit_title', 'Confirm Changes'));
  const confirmLabel =
    state?.confirmLabel ??
    (variant === 'danger' ? t('common.delete', 'Delete') : t('common.confirm', 'Confirm'));
  const cancelLabel = state?.cancelLabel ?? t('common.cancel', 'Cancel');

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      <Modal
        isOpen={!!state}
        onClose={() => close(false)}
        title={title}
        maxWidth="sm"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => close(false)}>
              {cancelLabel}
            </Button>
            <Button
              variant={variant === 'danger' ? 'danger' : 'primary'}
              onClick={() => close(true)}
            >
              {confirmLabel}
            </Button>
          </div>
        }
      >
        <p className="text-sm text-text-secondary">{state?.message}</p>
      </Modal>
    </ConfirmContext.Provider>
  );
}

export function useConfirm(): ConfirmContextValue['confirm'] {
  const context = useContext(ConfirmContext);
  if (!context) {
    throw new Error('useConfirm must be used within ConfirmProvider');
  }
  return context.confirm;
}