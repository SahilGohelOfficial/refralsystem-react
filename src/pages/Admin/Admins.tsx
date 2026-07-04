import { useState, FormEvent } from 'react';
import {
  Search,
  Plus,
  MoreVertical,
  Edit2,
  KeyRound,
  UserX,
  UserCheck,
  Shield,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { Card } from '../../components/ui/Card';
import { Table, TableHeader, TableRow, TableHead, TableCell } from '../../components/ui/Table';
import Badge from '../../components/ui/Badge';
import { Dropdown, DropdownItem } from '../../components/ui/Dropdown';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Modal from '../../components/ui/Modal';
import PageHeader from '../../components/ui/PageHeader';
import IconButton from '../../components/ui/IconButton';
import Loader from '../../components/ui/Loader';
import {
  useAdmins,
  useCreateAdmin,
  useResetAdminPassword,
  useUpdateAdmin,
  useUpdateAdminStatus,
} from '../../hooks/queries';
import { useConfirm } from '../../context/ConfirmContext';
import { useToastOnError } from '../../hooks/useToastOnError';
import { formatRoleLabel } from '../../lib/roles';
import type { Admin, AdminRole } from '../../types/api';
import { formatLocalDateTime } from '../../lib/dates';

const roleOptions = [
  { value: 'admin', label: 'Admin' },
  { value: 'superAdmin', label: 'Super Admin' },
];

const normalizePhone = (value: string) => value.replace(/\D/g, '').slice(0, 10);

function validatePassword(value: string): string | undefined {
  if (!value.trim()) return 'Password is required';
  if (value.length < 8 || !/[a-zA-Z]/.test(value) || !/[0-9]/.test(value)) {
    return 'Password must be at least 8 characters with one letter and one number';
  }
  return undefined;
}

type AdminModal = { mode: 'create' } | { mode: 'edit'; admin: Admin };

const emptyForm = () => ({
  name: '',
  email: '',
  phoneNumber: '',
  password: '',
  role: 'admin' as AdminRole,
});

const Admins = () => {
  const confirm = useConfirm();
  const { data: admins = [], isLoading, error } = useAdmins();
  const createAdminMutation = useCreateAdmin();
  const updateAdminMutation = useUpdateAdmin();
  const resetPasswordMutation = useResetAdminPassword();
  const updateStatusMutation = useUpdateAdminStatus();
  useToastOnError(error);

  const [search, setSearch] = useState('');
  const [modal, setModal] = useState<AdminModal | null>(null);
  const [resetTarget, setResetTarget] = useState<Admin | null>(null);
  const [form, setForm] = useState(emptyForm());
  const [resetPassword, setResetPassword] = useState('');
  const [resetConfirmPassword, setResetConfirmPassword] = useState('');
  const [resetErrors, setResetErrors] = useState<{ newPassword?: string; confirmPassword?: string }>({});

  const submitting =
    createAdminMutation.isPending ||
    updateAdminMutation.isPending ||
    resetPasswordMutation.isPending;

  const openCreate = () => {
    setForm(emptyForm());
    setModal({ mode: 'create' });
  };

  const openEdit = (admin: Admin) => {
    setForm({
      name: admin.name,
      email: admin.email,
      phoneNumber: admin.phoneNumber ?? '',
      password: '',
      role: admin.role,
    });
    setModal({ mode: 'edit', admin });
  };

  const closeModal = () => {
    setModal(null);
    setForm(emptyForm());
  };

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    if (!modal) return;

    if (modal.mode === 'edit') {
      const confirmed = await confirm({
        title: 'Edit Admin',
        message: `Save changes to "${modal.admin.name}"?`,
        confirmLabel: 'Save Changes',
      });
      if (!confirmed) return;
    }

    try {
      if (modal.mode === 'create') {
        await createAdminMutation.mutateAsync({
          name: form.name,
          email: form.email,
          phoneNumber: form.phoneNumber,
          password: form.password,
          role: form.role,
        });
        toast.success('Admin created successfully');
      } else {
        await updateAdminMutation.mutateAsync({
          id: modal.admin.id,
          payload: {
            name: form.name,
            email: form.email,
            phoneNumber: form.phoneNumber,
            role: form.role,
          },
        });
        toast.success('Admin updated successfully');
      }
      closeModal();
    } catch {
      // Errors handled by mutation hooks
    }
  };

  const handleToggleStatus = async (admin: Admin) => {
    try {
      await updateStatusMutation.mutateAsync({ id: admin.id, isActive: !admin.isActive });
      toast.success(admin.isActive ? 'Admin deactivated' : 'Admin activated');
    } catch {
      // Errors handled by mutation hooks
    }
  };

  const handleResetPassword = async (e: FormEvent) => {
    e.preventDefault();
    if (!resetTarget) return;

    const errors: { newPassword?: string; confirmPassword?: string } = {};
    const passwordError = validatePassword(resetPassword);
    if (passwordError) errors.newPassword = passwordError;
    if (!resetConfirmPassword.trim()) {
      errors.confirmPassword = 'Please confirm the new password';
    } else if (resetPassword !== resetConfirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    if (Object.keys(errors).length > 0) {
      setResetErrors(errors);
      return;
    }

    const confirmed = await confirm({
      title: 'Reset Password',
      message: `Reset password for "${resetTarget.name}"? This invalidates all existing sessions.`,
      variant: 'danger',
      confirmLabel: 'Reset Password',
    });
    if (!confirmed) return;

    try {
      await resetPasswordMutation.mutateAsync({ id: resetTarget.id, newPassword: resetPassword });
      toast.success('Password reset successfully');
      setResetTarget(null);
      setResetPassword('');
      setResetConfirmPassword('');
      setResetErrors({});
    } catch {
      // Errors handled by mutation hooks
    }
  };

  const query = search.toLowerCase();
  const filteredAdmins = admins.filter(
    (admin) =>
      admin.name.toLowerCase().includes(query) ||
      admin.email.toLowerCase().includes(query) ||
      (admin.phoneNumber?.includes(query) ?? false) ||
      admin.role.toLowerCase().includes(query),
  );

  const isCreate = modal?.mode === 'create';

  return (
    <div className="page-shell">
      <PageHeader
        title="Admin Management"
        description="Create and manage admin accounts. Super Admin only."
        actions={
          <Button onClick={openCreate}>
            <Plus size={16} />
            Add New Admin
          </Button>
        }
      />

      <Card padding="none" className="data-card">
        <div className="table-toolbar">
          <div className="w-full sm:max-w-md">
            <Input
              icon={Search}
              placeholder="Search by name, email, phone, or role..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {isLoading ? (
          <Loader text="Loading admins..." />
        ) : filteredAdmins.length === 0 ? (
          <div className="py-16 text-center text-sm text-text-secondary">
            {search ? 'No admins match your search.' : 'No other admins yet. Create your first admin.'}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Admin</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Last Login</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <tbody>
              {filteredAdmins.map((admin) => (
                <TableRow key={admin.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="avatar w-10 h-10 text-sm">{admin.name.charAt(0)}</div>
                      <div>
                        <div className="font-medium text-text">{admin.name}</div>
                        <div className="text-xs text-text-secondary">
                          {admin.email}
                          {admin.phoneNumber ? ` · ${admin.phoneNumber}` : ''}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={admin.role === 'superAdmin' ? 'warning' : 'neutral'}>
                      <span className="flex items-center gap-1">
                        {admin.role === 'superAdmin' && <Shield size={12} />}
                        {formatRoleLabel(admin.role)}
                      </span>
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {admin.lastLogin ? formatLocalDateTime(admin.lastLogin) : 'Never'}
                  </TableCell>
                  <TableCell>
                    <Badge variant={admin.isActive ? 'success' : 'neutral'} dot>
                      {admin.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Dropdown
                      align="right"
                      trigger={
                        <IconButton size="sm" aria-label="Admin actions">
                          <MoreVertical size={16} />
                        </IconButton>
                      }
                    >
                      <DropdownItem onClick={() => openEdit(admin)}>
                        <Edit2 size={14} /> Edit Admin
                      </DropdownItem>
                      <DropdownItem
                        onClick={() => {
                          setResetTarget(admin);
                          setResetPassword('');
                          setResetConfirmPassword('');
                          setResetErrors({});
                        }}
                      >
                        <KeyRound size={14} /> Reset Password
                      </DropdownItem>
                      <DropdownItem onClick={() => void handleToggleStatus(admin)}>
                        {admin.isActive ? (
                          <>
                            <UserX size={14} /> Deactivate
                          </>
                        ) : (
                          <>
                            <UserCheck size={14} /> Activate
                          </>
                        )}
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
        title={isCreate ? 'Add New Admin' : 'Edit Admin'}
      >
        <form onSubmit={handleSave} className="space-y-4">
          <Input
            label="Name"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            required
            disabled={submitting}
          />
          <Input
            label="Email"
            type="email"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            required
            disabled={submitting}
          />
          <Input
            label="Phone Number"
            type="tel"
            value={form.phoneNumber}
            onChange={(e) => setForm((f) => ({ ...f, phoneNumber: normalizePhone(e.target.value) }))}
            required
            disabled={submitting}
            maxLength={10}
            placeholder="10-digit mobile number"
          />
          {isCreate && (
            <>
              <Input
                label="Password"
                type="password"
                value={form.password}
                onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                required
                disabled={submitting}
              />
              <p className="text-xs text-text-secondary -mt-2">
                At least 8 characters with one letter and one number.
              </p>
            </>
          )}
          <Select
            label="Role"
            value={form.role}
            onChange={(e) => setForm((f) => ({ ...f, role: e.target.value as AdminRole }))}
            options={roleOptions}
            disabled={submitting}
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={closeModal} disabled={submitting}>
              Cancel
            </Button>
            <Button type="submit" isLoading={submitting}>
              {isCreate ? 'Create Admin' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={!!resetTarget}
        onClose={() => {
          if (submitting) return;
          setResetTarget(null);
          setResetPassword('');
          setResetConfirmPassword('');
          setResetErrors({});
        }}
        title={`Reset Password — ${resetTarget?.name ?? ''}`}
      >
        <form onSubmit={handleResetPassword} className="space-y-4">
          <p className="text-sm text-text-secondary">
            Set a new password for {resetTarget?.email}. This invalidates all existing sessions.
          </p>
          <Input
            label="New Password"
            type="password"
            value={resetPassword}
            onChange={(e) => {
              setResetPassword(e.target.value);
              if (resetErrors.newPassword) setResetErrors((p) => ({ ...p, newPassword: undefined }));
            }}
            error={resetErrors.newPassword}
            required
            disabled={submitting}
            autoComplete="new-password"
          />
          <Input
            label="Confirm New Password"
            type="password"
            value={resetConfirmPassword}
            onChange={(e) => {
              setResetConfirmPassword(e.target.value);
              if (resetErrors.confirmPassword) setResetErrors((p) => ({ ...p, confirmPassword: undefined }));
            }}
            error={resetErrors.confirmPassword}
            required
            disabled={submitting}
            autoComplete="new-password"
          />
          <p className="text-xs text-text-secondary -mt-2">
            At least 8 characters with one letter and one number.
          </p>
          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setResetTarget(null);
                setResetPassword('');
                setResetConfirmPassword('');
                setResetErrors({});
              }}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button type="submit" isLoading={submitting}>
              Reset Password
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Admins;