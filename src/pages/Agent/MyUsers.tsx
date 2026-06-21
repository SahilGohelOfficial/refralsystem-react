import { useState, useEffect, useCallback, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Search, MoreVertical, Edit2, Trash2, UserPlus } from 'lucide-react';
import toast from 'react-hot-toast';
import { Card } from '../../components/ui/Card';
import { Table, TableHeader, TableRow, TableHead, TableCell } from '../../components/ui/Table';
import { Dropdown, DropdownItem } from '../../components/ui/Dropdown';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import {
  deleteMyUser,
  getMyUser,
  listMyUsers,
  updateMyUser,
} from '../../services/agents.service';
import { formatApiError } from '../../lib/api';
import type { ApiError, ReferralUser } from '../../types/api';
import { formatUserName } from '../../types/api';

function normalizePhone(value: string): string {
  return value.replace(/\D/g, '').slice(0, 10);
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

const MyUsers = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [users, setUsers] = useState<ReferralUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [editingUser, setEditingUser] = useState<ReferralUser | null>(null);
  const [loadingEdit, setLoadingEdit] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await listMyUsers();
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

  const openEdit = async (user: ReferralUser) => {
    setEditingUser(user);
    setFirstName(user.firstName);
    setLastName(user.lastName);
    setPhoneNumber(user.phoneNumber);
    setEmail(user.email);
    setLoadingEdit(true);
    try {
      const fresh = await getMyUser(user.id);
      setEditingUser(fresh);
      setFirstName(fresh.firstName);
      setLastName(fresh.lastName);
      setPhoneNumber(fresh.phoneNumber);
      setEmail(fresh.email);
    } catch (error) {
      toast.error(formatApiError(error as ApiError));
    } finally {
      setLoadingEdit(false);
    }
  };

  const closeEdit = () => {
    setEditingUser(null);
    setFirstName('');
    setLastName('');
    setPhoneNumber('');
    setEmail('');
  };

  const handleUpdate = async (e: FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    if (!/^\d{10}$/.test(phoneNumber)) {
      toast.error(t('agent.my_users.err_phone', 'Phone number must be exactly 10 digits'));
      return;
    }
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error(t('agent.my_users.err_email', 'Valid email is required'));
      return;
    }

    setSubmitting(true);
    try {
      await updateMyUser(editingUser.id, {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phoneNumber,
        email: email.trim(),
      });
      toast.success(t('agent.my_users.updated_success', 'User updated successfully'));
      closeEdit();
      await fetchUsers();
    } catch (error) {
      toast.error(formatApiError(error as ApiError));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (user: ReferralUser) => {
    const name = formatUserName(user);
    if (!window.confirm(t('agent.my_users.delete_confirm', `Delete user "${name}"? This cannot be undone.`))) {
      return;
    }

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
          onClick={() => navigate('/agent/register-customer')}
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
            <p>{search ? t('agent.my_users.no_results', 'No users match your search.') : t('agent.my_users.empty', 'No users yet.')}</p>
            {!search && (
              <Link
                to="/agent/register-customer"
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
                <TableHead className="text-right">{t('agent.my_users.col_actions', 'Actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <tbody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
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
                  <TableCell>{formatDate(user.createdAt)}</TableCell>
                  <TableCell className="text-right">
                    <Dropdown
                      align="right"
                      trigger={
                        <button className="p-1 text-text-secondary hover:text-text hover:bg-surface rounded-md transition-colors">
                          <MoreVertical size={16} />
                        </button>
                      }
                    >
                      <DropdownItem onClick={() => void openEdit(user)}>
                        <Edit2 size={14} /> {t('agent.my_users.edit', 'Edit')}
                      </DropdownItem>
                      <DropdownItem danger onClick={() => void handleDelete(user)}>
                        <Trash2 size={14} /> {t('agent.my_users.delete', 'Delete')}
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
        isOpen={!!editingUser}
        onClose={closeEdit}
        title={t('agent.my_users.edit_title', 'Edit User')}
      >
        {loadingEdit ? (
          <div className="flex justify-center py-8">
            <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
          </div>
        ) : (
          <form onSubmit={handleUpdate} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label={t('agent.my_users.first_name', 'First name')}
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
                disabled={submitting}
              />
              <Input
                label={t('agent.my_users.last_name', 'Last name')}
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
                disabled={submitting}
              />
            </div>
            <Input
              label={t('agent.my_users.phone', 'Phone number')}
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(normalizePhone(e.target.value))}
              placeholder="9876543210"
              inputMode="numeric"
              maxLength={10}
              required
              disabled={submitting}
            />
            <Input
              label={t('agent.my_users.email', 'Email')}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={submitting}
            />
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="secondary" onClick={closeEdit} disabled={submitting}>
                {t('common.cancel', 'Cancel')}
              </Button>
              <Button type="submit" isLoading={submitting}>
                {t('agent.my_users.save', 'Save changes')}
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};

export default MyUsers;
