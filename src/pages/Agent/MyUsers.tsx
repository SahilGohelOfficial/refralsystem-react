import { useState, useEffect, useCallback, type MouseEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Search, Edit2, Trash2, UserPlus, Eye } from 'lucide-react';
import toast from 'react-hot-toast';
import { Card } from '../../components/ui/Card';
import { Table, TableHeader, TableRow, TableHead, TableCell } from '../../components/ui/Table';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import AgentUserEditModal from '../../components/agent/AgentUserEditModal';
import {
  deleteMyUser,
  listMyUsers,
} from '../../services/agents.service';
import { useConfirm } from '../../context/ConfirmContext';
import { formatApiError } from '../../lib/api';
import type { ApiError, ReferralUser } from '../../types/api';
import { formatUserName } from '../../types/api';
import { formatLocalDate } from '../../lib/dates';

const MyUsers = () => {
  const { t } = useTranslation();
  const confirm = useConfirm();
  const navigate = useNavigate();
  const [users, setUsers] = useState<ReferralUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [editingUser, setEditingUser] = useState<ReferralUser | null>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await listMyUsers('approved');
      setUsers(data);
    } catch (error) {
      toast.error(formatApiError(error as ApiError));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchUsers();
  }, [fetchUsers]);

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
      await deleteMyUser(user.id);
      toast.success(t('agent.my_users.deleted_success', 'User deleted successfully'));
      await fetchUsers();
    } catch (error) {
      toast.error(formatApiError(error as ApiError));
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
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text">
            {t('agent.my_users.title', 'My Users')}
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            {t('agent.my_users.subtitle', 'View and manage users assigned to you.')}
          </p>
        </div>
        <Button
          type="button"
          className="shrink-0 gap-2"
          onClick={() => navigate('/agent/register-user')}
        >
          <UserPlus size={16} />
          {t('nav.agent.register_user', 'Register User')}
        </Button>
      </div>

      <Card className="p-0">
        <div className="p-4 border-b border-border flex flex-col sm:flex-row gap-4 justify-between items-center bg-surface/50 rounded-t-[20px]">
          <div className="w-full sm:w-96">
            <Input
              icon={Search}
              placeholder={t('agent.my_users.search_placeholder', 'Search by name, phone, or email...')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="p-12 flex justify-center">
            <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-12 text-center text-text-secondary">
            <p>
              {search
                ? t('agent.my_users.no_results', 'No users match your search.')
                : t('agent.my_users.empty', 'No users yet.')}
            </p>
            {!search && (
              <Link
                to="/agent/register-user"
                className="inline-block mt-3 text-primary hover:underline text-sm font-medium"
              >
                {t('agent.my_users.empty_action', 'Register your first user')}
              </Link>
            )}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('agent.my_users.col_name', 'Name')}</TableHead>
                <TableHead>{t('agent.my_users.col_phone', 'Phone')}</TableHead>
                <TableHead>{t('agent.my_users.col_email', 'Email')}</TableHead>
                <TableHead>{t('agent.my_users.col_registered', 'Registered')}</TableHead>
                <TableHead>{t('agent.my_users.col_forms', 'Forms')}</TableHead>
                <TableHead className="text-right">{t('agent.my_users.col_actions', 'Actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <tbody>
              {filteredUsers.map((user) => (
                <TableRow
                  key={user.id}
                  className="cursor-pointer hover:bg-surface/50"
                  onClick={() => navigate(`/agent/users/${user.id}`)}
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                        {user.firstName.charAt(0)}
                      </div>
                      <div>
                        <div className="font-medium text-text">{formatUserName(user)}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{user.phoneNumber}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{formatLocalDate(user.createdAt)}</TableCell>
                  <TableCell>
                    <span className="font-medium text-text">
                      {user.filledFormsCount ?? 0}/{user.totalFormsCount ?? 0}
                    </span>
                  </TableCell>
                  <TableCell className="text-right" onClick={stopRowNavigation}>
                    <div className="flex justify-end items-center gap-1">
                      <button
                        type="button"
                        className="icon-btn-sm"
                        title={t('agent.my_users.view', 'View details')}
                        aria-label={t('agent.my_users.view', 'View details')}
                        onClick={() => navigate(`/agent/users/${user.id}`)}
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        type="button"
                        className="icon-btn-sm"
                        title={t('agent.my_users.edit', 'Edit')}
                        aria-label={t('agent.my_users.edit', 'Edit')}
                        onClick={() => setEditingUser(user)}
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        type="button"
                        className="icon-btn-sm text-error hover:text-error hover:bg-error-muted"
                        title={t('agent.my_users.delete', 'Delete')}
                        aria-label={t('agent.my_users.delete', 'Delete')}
                        onClick={() => void handleDelete(user)}
                      >
                        <Trash2 size={16} />
                      </button>
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
        onSaved={() => void fetchUsers()}
      />
    </div>
  );
};

export default MyUsers;