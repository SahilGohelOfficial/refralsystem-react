import { useTranslation } from 'react-i18next';
import Modal from './ui/Modal';
import Button from './ui/Button';
import { useConfirmStore } from '../stores/confirmStore';

const ConfirmModal = () => {
  const { t } = useTranslation();
  const dialog = useConfirmStore((state) => state.dialog);
  const close = useConfirmStore((state) => state.close);

  const variant = dialog?.variant ?? 'default';
  const title =
    dialog?.title ??
    (variant === 'danger'
      ? t('common.confirm_delete_title', 'Confirm Delete')
      : t('common.confirm_edit_title', 'Confirm Changes'));
  const confirmLabel =
    dialog?.confirmLabel ??
    (variant === 'danger' ? t('common.delete', 'Delete') : t('common.confirm', 'Confirm'));
  const cancelLabel = dialog?.cancelLabel ?? t('common.cancel', 'Cancel');

  return (
    <Modal
      isOpen={!!dialog}
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
      <p className="text-sm text-text-secondary">{dialog?.message}</p>
    </Modal>
  );
};

export default ConfirmModal;
