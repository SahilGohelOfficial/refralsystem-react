import React, { useState, useEffect, useCallback, FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, Plus, MoreVertical, Edit2, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { Card } from '../../components/ui/Card';
import { Table, TableHeader, TableRow, TableHead, TableCell } from '../../components/ui/Table';
import { Dropdown, DropdownItem } from '../../components/ui/Dropdown';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import {
  createChain,
  deleteChain,
  listChains,
  updateChain,
} from '../../services/chains.service';
import { useConfirm } from '../../context/ConfirmContext';
import { formatApiError } from '../../lib/api';
import type { ApiError, Chain } from '../../types/api';

function formatDate(iso?: string): string {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return '—';
  }
}

const Chains = () => {
  const { t } = useTranslation();
  const confirm = useConfirm();
  const [chains, setChains] = useState<Chain[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingChain, setEditingChain] = useState<Chain | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formName, setFormName] = useState('');

  const fetchChains = useCallback(async () => {
    setLoading(true);
    try {
      const data = await listChains();
      setChains(data);
    } catch (error) {
      toast.error(formatApiError(error as ApiError));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchChains();
  }, [fetchChains]);

  const resetForm = () => {
    setFormName('');
  };

  const openCreate = () => {
    resetForm();
    setIsCreateOpen(true);
  };

  const openEdit = (chain: Chain) => {
    setFormName(chain.name);
    setEditingChain(chain);
  };

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await createChain({ name: formName });
      toast.success(t('chains.createSuccess'));
      setIsCreateOpen(false);
      resetForm();
      await fetchChains();
    } catch (error) {
      toast.error(formatApiError(error as ApiError));
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdate = async (e: FormEvent) => {
    e.preventDefault();
    if (!editingChain) return;

    const confirmed = await confirm({
      title: t('chains.edit', 'Edit Chain'),
      message: t(
        'chains.update_confirm',
        'Save changes to "{{name}}"?',
        { name: editingChain.name },
      ),
      confirmLabel: t('common.save', 'Save Changes'),
    });
    if (!confirmed) return;

    setSubmitting(true);
    try {
      await updateChain(editingChain.id, { name: formName });
      toast.success(t('chains.updateSuccess'));
      setEditingChain(null);
      resetForm();
      await fetchChains();
    } catch (error) {
      toast.error(formatApiError(error as ApiError));
    } finally {
      setSubmitting(false);
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
      await deleteChain(chain.id);
      toast.success(t('chains.deleteSuccess'));
      await fetchChains();
    } catch (error) {
      toast.error(formatApiError(error as ApiError));
    }
  };

  const filteredChains = chains.filter((chain) => {
    const query = search.toLowerCase();
    return chain.name.toLowerCase().includes(query);
  });

  const chainForm = (onSubmit: (e: FormEvent) => void, submitLabel: string, onCancel: () => void) => (
    <form onSubmit={onSubmit} className="space-y-4">
      <Input
        label={t('chains.name')}
        value={formName}
        onChange={(e) => setFormName(e.target.value)}
        required
        disabled={submitting}
      />
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={submitting}>
          {t('common.cancel')}
        </Button>
        <Button type="submit" isLoading={submitting}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text">{t('chains.title')}</h1>
          <p className="text-sm text-text-secondary mt-1">{t('chains.subtitle')}</p>
        </div>
        <Button className="shrink-0 gap-2" onClick={openCreate}>
          <Plus size={16} />
          {t('chains.create')}
        </Button>
      </div>

      <Card className="p-0">
        <div className="p-4 border-b border-border flex flex-col sm:flex-row gap-4 justify-between items-center bg-surface/50 rounded-t-[20px]">
          <div className="w-full sm:w-96">
            <Input
              icon={Search}
              placeholder={t('chains.search')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="p-12 flex justify-center">
            <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
          </div>
        ) : filteredChains.length === 0 ? (
          <div className="p-12 text-center text-text-secondary">
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
                  <TableCell>{formatDate(chain.createdAt)}</TableCell>
                  <TableCell>{formatDate(chain.updatedAt)}</TableCell>
                  <TableCell className="text-right">
                    <Dropdown
                      align="right"
                      trigger={
                        <button className="p-1 text-text-secondary hover:text-text hover:bg-surface rounded-md transition-colors">
                          <MoreVertical size={16} />
                        </button>
                      }
                    >
                      <DropdownItem onClick={() => openEdit(chain)}>
                        <Edit2 size={14} /> {t('chains.edit')}
                      </DropdownItem>
                      <DropdownItem onClick={() => handleDelete(chain)}>
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

      <Modal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title={t('chains.create')}>
        {chainForm(
          handleCreate,
          t('chains.create'),
          () => {
            setIsCreateOpen(false);
            resetForm();
          },
        )}
      </Modal>

      <Modal
        isOpen={!!editingChain}
        onClose={() => {
          setEditingChain(null);
          resetForm();
        }}
        title={t('chains.edit')}
      >
        {chainForm(
          handleUpdate,
          t('common.save'),
          () => {
            setEditingChain(null);
            resetForm();
          },
        )}
      </Modal>
    </div>
  );
};

export default Chains;
