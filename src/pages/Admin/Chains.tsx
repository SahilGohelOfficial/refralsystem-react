import { useState, FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, Plus, MoreVertical, Edit2, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { Card } from '../../components/ui/Card';
import { Table, TableHeader, TableRow, TableHead, TableCell } from '../../components/ui/Table';
import { Dropdown, DropdownItem } from '../../components/ui/Dropdown';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import PageHeader from '../../components/ui/PageHeader';
import IconButton from '../../components/ui/IconButton';
import Loader from '../../components/ui/Loader';
import {
  useChains,
  useCreateChain,
  useDeleteChain,
  useUpdateChain,
} from '../../hooks/queries';
import { useConfirm } from '../../stores/confirmStore';
import { useToastOnError } from '../../hooks/useToastOnError';
import type { Chain } from '../../types/api';
import { formatLocalDate } from '../../lib/dates';

type ChainModal = { mode: 'create' } | { mode: 'edit'; chain: Chain };

const Chains = () => {
  const { t } = useTranslation();
  const confirm = useConfirm();
  const { data: chains = [], isLoading, error } = useChains();
  const createChainMutation = useCreateChain();
  const updateChainMutation = useUpdateChain();
  const deleteChainMutation = useDeleteChain();
  useToastOnError(error);

  const [search, setSearch] = useState('');
  const [modal, setModal] = useState<ChainModal | null>(null);
  const [formName, setFormName] = useState('');

  const submitting = createChainMutation.isPending || updateChainMutation.isPending;

  const openCreate = () => {
    setFormName('');
    setModal({ mode: 'create' });
  };

  const openEdit = (chain: Chain) => {
    setFormName(chain.name);
    setModal({ mode: 'edit', chain });
  };

  const closeModal = () => {
    setModal(null);
    setFormName('');
  };

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    if (!modal) return;

    if (modal.mode === 'edit') {
      const confirmed = await confirm({
        title: t('chains.edit', 'Edit Chain'),
        message: t('chains.update_confirm', 'Save changes to "{{name}}"?', {
          name: modal.chain.name,
        }),
        confirmLabel: t('common.save', 'Save Changes'),
      });
      if (!confirmed) return;
    }

    try {
      if (modal.mode === 'create') {
        await createChainMutation.mutateAsync({ name: formName });
        toast.success(t('chains.createSuccess'));
      } else {
        await updateChainMutation.mutateAsync({ id: modal.chain.id, payload: { name: formName } });
        toast.success(t('chains.updateSuccess'));
      }
      closeModal();
    } catch {
      // Errors handled by mutation hooks
    }
  };

  const handleDelete = async (chain: Chain) => {
    const confirmed = await confirm({
      title: t('chains.delete', 'Delete Chain'),
      message: t('chains.deleteConfirm', { name: chain.name }),
      variant: 'danger',
      confirmLabel: t('chains.delete', 'Delete Chain'),
    });
    if (!confirmed) return;

    try {
      await deleteChainMutation.mutateAsync(chain.id);
      toast.success(t('chains.deleteSuccess'));
    } catch {
      // Errors handled by mutation hooks
    }
  };

  const query = search.toLowerCase();
  const filteredChains = chains.filter((chain) => chain.name.toLowerCase().includes(query));

  return (
    <div className="page-shell">
      <PageHeader
        title={t('chains.title')}
        description={t('chains.subtitle')}
        actions={
          <Button onClick={openCreate}>
            <Plus size={16} />
            {t('chains.create')}
          </Button>
        }
      />

      <Card padding="none" className="data-card">
        <div className="table-toolbar">
          <div className="w-full sm:max-w-md">
            <Input
              icon={Search}
              placeholder={t('chains.search')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {isLoading ? (
          <Loader text={t('common.loading', 'Loading...')} />
        ) : filteredChains.length === 0 ? (
          <div className="py-16 text-center text-sm text-text-secondary">
            {search ? t('chains.noResults') : t('chains.empty')}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">{t('chains.index')}</TableHead>
                <TableHead>{t('chains.name')}</TableHead>
                <TableHead>{t('chains.created')}</TableHead>
                <TableHead>{t('chains.updated')}</TableHead>
                <TableHead className="text-right">{t('chains.actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <tbody>
              {filteredChains.map((chain, index) => (
                <TableRow key={chain.id}>
                  <TableCell className="text-text-secondary">{index + 1}</TableCell>
                  <TableCell>
                    <div className="font-medium text-text">{chain.name}</div>
                  </TableCell>
                  <TableCell>{formatLocalDate(chain.createdAt)}</TableCell>
                  <TableCell>{formatLocalDate(chain.updatedAt)}</TableCell>
                  <TableCell className="text-right">
                    <Dropdown
                      align="right"
                      trigger={
                        <IconButton size="sm" aria-label={t('chains.actions')}>
                          <MoreVertical size={16} />
                        </IconButton>
                      }
                    >
                      <DropdownItem onClick={() => openEdit(chain)}>
                        <Edit2 size={14} /> {t('chains.edit')}
                      </DropdownItem>
                      <DropdownItem danger onClick={() => void handleDelete(chain)}>
                        <Trash2 size={14} /> {t('chains.delete')}
                      </DropdownItem>
                    </Dropdown>
                  </TableCell>
                </TableRow>
              ))}
            </tbody>
          </Table>
        )}
      </Card>

      <Modal
        isOpen={!!modal}
        onClose={closeModal}
        title={modal?.mode === 'create' ? t('chains.create') : t('chains.edit')}
      >
        <form onSubmit={handleSave} className="space-y-4">
          <Input
            label={t('chains.name')}
            value={formName}
            onChange={(e) => setFormName(e.target.value)}
            required
            disabled={submitting}
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={closeModal} disabled={submitting}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" isLoading={submitting}>
              {modal?.mode === 'create' ? t('chains.create') : t('common.save')}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Chains;