import { useState, type MouseEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Search, Edit2, Trash2, UserPlus, Eye } from 'lucide-react';
import toast from 'react-hot-toast';
import { Card } from '../../components/ui/Card';
import { Table, TableHeader, TableRow, TableHead, TableCell } from '../../components/ui/Table';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Loader from '../../components/ui/Loader';
import AgentUserEditModal from '../../components/agent/AgentUserEditModal';
import { useDeleteMyUser, useMyUsers } from '../../hooks/queries';
import { useConfirm } from '../../context/ConfirmContext';
import { useToastOnError } from '../../hooks/useToastOnError';
import type { ReferralUser } from '../../types/api';
import { formatUserName } from '../../types/api';
import { formatLocalDate } from '../../lib/dates';

const MyUsers = () => {
  const { t } = useTranslation();
  const confirm = useConfirm();
  const navigate = useNavigate();
  const { data: users = [], isLoading, error } = useMyUsers('approved');
  const deleteUserMutation = useDeleteMyUser();
  useToastOnError(error);

  const [search, setSearch] = useState('');
  const [editingUser, setEditingUser] = useState<ReferralUser | null>(null);

  const handleDelete = async (user: ReferralUser) => {
    const name = formatUserName(user);
    const confirmed = await confirm({
      title: t('agent.my_users.delete_title', 'Delete User'),
      message: t(
        'agent.my_users.delete_confirm_named',
        'Delete user "{{name}}"? This cannot be undone.',
        { name },
      ),
      variant: 'danger',
      confirmLabel: t('agent.my_users.delete', 'Delete'),
    });
    if (!confirmed) return;

    try {
      await deleteUserMutation.mutateAsync(user.id);
      toast.success(t('agent.my_users.deleted_success', 'User deleted successfully'));
    } catch {
      // Errors handled by mutation hooks
    }
  };

  const filteredUsers = users.filter((user) => {
    const query = search.toLowerCase();
    const fullName = formatUserName(user).toLowerCase();
    return (
      fullName.includes(query) ||
      user.phoneNumber.includes(query) ||
      user.email.toLowerCase().includes(query)
    );
  });

  const stopRowNavigation = (e: MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <div className="page-shell space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text">
            {t('agent.my_users.title', 'My Users')}
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            {t('agent.my_users.subtitle', 'Manage users you have registered.')}
          </p>
        </div>
        <Button type="button" className="shrink-0 gap-2" onClick={() => navigate('/agent/register-user')}>
          <UserPlus size={16} />
          {t('nav.agent.register_user', 'Register User')}
        </Button>
      </div>

      <Card padding="none" className="data-card">
        <div className="table-toolbar">
          <div className="w-full sm:max-w-md">
            <Input
              icon={Search}
              placeholder={t('agent.my_users.search', 'Search users...')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {isLoading ? (
          <Loader text={t('common.loading', 'Loading...')} />
        ) : filteredUsers.length === 0 ? (
          <div className="py-16 text-center text-sm text-text-secondary">
            {search
              ? t('agent.my_users.no_results', 'No users match your search.')
              : t('agent.my_users.empty', 'No approved users yet.')}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('agent.my_users.col_user', 'User')}</TableHead>
                <TableHead>{t('agent.my_users.col_phone', 'Phone')}</TableHead>
                <TableHead>{t('agent.my_users.col_registered', 'Registered')}</TableHead>
                <TableHead className="text-right">{t('agent.my_users.col_actions', 'Actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <tbody>
              {filteredUsers.map((user) => (
                <TableRow
                  key={user.id}
                  className="cursor-pointer"
                  onClick={() => navigate(`/agent/users/${user.id}`)}
                >
                  <TableCell>
                    <div className="font-medium text-text">{formatUserName(user)}</div>
                    <div className="text-xs text-text-secondary">{user.email}</div>
                  </TableCell>
                  <TableCell>{user.phoneNumber}</TableCell>
                  <TableCell>{formatLocalDate(user.createdAt)}</TableCell>
                  <TableCell className="text-right" onClick={stopRowNavigation}>
                    <div className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => navigate(`/agent/users/${user.id}`)}
                      >
                        <Eye size={14} />
                        {t('common.view', 'View')}
                      </Button>
                      <Button size="sm" variant="secondary" onClick={() => setEditingUser(user)}>
                        <Edit2 size={14} />
                        {t('common.edit', 'Edit')}
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => void handleDelete(user)}
                        isLoading={deleteUserMutation.isPending}
                      >
                        <Trash2 size={14} />
                        {t('common.delete', 'Delete')}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </tbody>
          </Table>
        )}
      </Card>

      <AgentUserEditModal
        user={editingUser}
        isOpen={!!editingUser}
        onClose={() => setEditingUser(null)}
        onSaved={() => setEditingUser(null)}
      />
    </div>
  );
};

export default MyUsers;