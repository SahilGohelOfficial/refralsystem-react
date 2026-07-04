import React, { useState, useEffect, useCallback, FormEvent } from 'react';
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
  createAdmin,
  listAdmins,
  resetAdminPassword,
  updateAdmin,
  updateAdminStatus,
} from '../../services/admins.service';
import { useConfirm } from '../../context/ConfirmContext';
import { formatApiError } from '../../lib/api';
import type { Admin, AdminRole, ApiError } from '../../types/api';

const roleOptions = [
  { value: 'admin', label: 'Admin' },
  { value: 'superAdmin', label: 'Super Admin' },
];

const formatRole = (role: AdminRole) =>
  role === 'superAdmin' ? 'Super Admin' : 'Admin';

type ResetFieldErrors = {
  newPassword?: string;
  confirmPassword?: string;
};

function validatePassword(value: string): string | undefined {
  if (!value.trim()) {
    return 'Password is required';
  }
  if (value.length < 8 || !/[a-zA-Z]/.test(value) || !/[0-9]/.test(value)) {
    return 'Password must be at least 8 characters with one letter and one number';
  }
  return undefined;
}

const Admins = () => {
  const confirm = useConfirm();
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<Admin | null>(null);
  const [resetTarget, setResetTarget] = useState<Admin | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhoneNumber, setFormPhoneNumber] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [formRole, setFormRole] = useState<AdminRole>('admin');
  const [resetPassword, setResetPassword] = useState('');
  const [resetConfirmPassword, setResetConfirmPassword] = useState('');
  const [resetFieldErrors, setResetFieldErrors] = useState<ResetFieldErrors>({});

  const fetchAdmins = useCallback(async () => {
    setLoading(true);
    try {
      const data = await listAdmins();
      setAdmins(data);
    } catch (error) {
      toast.error(formatApiError(error as ApiError));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAdmins();
  }, [fetchAdmins]);

  const resetForm = () => {
    setFormName('');
    setFormEmail('');
    setFormPhoneNumber('');
    setFormPassword('');
    setFormRole('admin');
    setResetPassword('');
    setResetConfirmPassword('');
    setResetFieldErrors({});
  };

  const openResetPassword = (admin: Admin) => {
    setResetTarget(admin);
    setResetPassword('');
    setResetConfirmPassword('');
    setResetFieldErrors({});
  };

  const openCreate = () => {
    resetForm();
    setIsCreateOpen(true);
  };

  const openEdit = (admin: Admin) => {
    setFormName(admin.name);
    setFormEmail(admin.email);
    setFormPhoneNumber(admin.phoneNumber ?? '');
    setFormRole(admin.role);
    setEditingAdmin(admin);
  };

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await createAdmin({
        name: formName,
        email: formEmail,
        phoneNumber: formPhoneNumber,
        password: formPassword,
        role: formRole,
      });
      toast.success('Admin created successfully');
      setIsCreateOpen(false);
      resetForm();
      await fetchAdmins();
    } catch (error) {
      toast.error(formatApiError(error as ApiError));
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdate = async (e: FormEvent) => {
    e.preventDefault();
    if (!editingAdmin) return;

    const confirmed = await confirm({
      title: 'Edit Admin',
      message: `Save changes to "${editingAdmin.name}"?`,
      confirmLabel: 'Save Changes',
    });
    if (!confirmed) return;

    setSubmitting(true);
    try {
      await updateAdmin(editingAdmin.id, {
        name: formName,
        email: formEmail,
        phoneNumber: formPhoneNumber,
        role: formRole,
      });
      toast.success('Admin updated successfully');
      setEditingAdmin(null);
      resetForm();
      await fetchAdmins();
    } catch (error) {
      toast.error(formatApiError(error as ApiError));
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (admin: Admin) => {
    try {
      await updateAdminStatus(admin.id, !admin.isActive);
      toast.success(admin.isActive ? 'Admin deactivated' : 'Admin activated');
      await fetchAdmins();
    } catch (error) {
      toast.error(formatApiError(error as ApiError));
    }
  };

  const handleResetPassword = async (e: FormEvent) => {
    e.preventDefault();
    if (!resetTarget) return;

    const errors: ResetFieldErrors = {};
    const passwordError = validatePassword(resetPassword);
    if (passwordError) {
      errors.newPassword = passwordError;
    }
    if (!resetConfirmPassword.trim()) {
      errors.confirmPassword = 'Please confirm the new password';
    } else if (resetPassword !== resetConfirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    if (Object.keys(errors).length > 0) {
      setResetFieldErrors(errors);
      return;
    }

    setResetFieldErrors({});

    const confirmed = await confirm({
      title: 'Reset Password',
      message: `Reset password for "${resetTarget.name}"? This invalidates all existing sessions.`,
      variant: 'danger',
      confirmLabel: 'Reset Password',
    });
    if (!confirmed) return;

    setSubmitting(true);
    try {
      await resetAdminPassword(resetTarget.id, resetPassword);
      toast.success('Password reset successfully');
      setResetTarget(null);
      setResetPassword('');
      setResetConfirmPassword('');
    } catch (error) {
      toast.error(formatApiError(error as ApiError));
    } finally {
      setSubmitting(false);
    }
  };

  const filteredAdmins = admins.filter((admin) => {
    const query = search.toLowerCase();
    return (
      admin.name.toLowerCase().includes(query) ||
      admin.email.toLowerCase().includes(query) ||
      (admin.phoneNumber?.includes(query) ?? false) ||
      admin.role.toLowerCase().includes(query)
    );
  });

  const createForm = (
    <form onSubmit={handleCreate} className="space-y-4">
      <Input
        label="Name"
        value={formName}
        onChange={(e) => setFormName(e.target.value)}
        required
        disabled={submitting}
      />
      <Input
        label="Email"
        type="email"
        value={formEmail}
        onChange={(e) => setFormEmail(e.target.value)}
        required
        disabled={submitting}
      />
      <Input
        label="Phone Number"
        type="tel"
        value={formPhoneNumber}
        onChange={(e) => setFormPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
        required
        disabled={submitting}
        maxLength={10}
        placeholder="10-digit mobile number"
      />
      <Input
        label="Password"
        type="password"
        value={formPassword}
        onChange={(e) => setFormPassword(e.target.value)}
        required
        disabled={submitting}
      />
      <p className="text-xs text-text-secondary -mt-2">
        At least 8 characters with one letter and one number.
      </p>
      <Select
        label="Role"
        value={formRole}
        onChange={(e) => setFormRole(e.target.value as AdminRole)}
        options={roleOptions}
        disabled={submitting}
      />
      <div className="flex justify-end gap-2 pt-2">
        <Button
          type="button"
          variant="secondary"
          onClick={() => {
            setIsCreateOpen(false);
            resetForm();
          }}
          disabled={submitting}
        >
          Cancel
        </Button>
        <Button type="submit" isLoading={submitting}>
          Create Admin
        </Button>
      </div>
    </form>
  );

  const editForm = (
    <form onSubmit={handleUpdate} className="space-y-4">
      <Input
        label="Name"
        value={formName}
        onChange={(e) => setFormName(e.target.value)}
        required
        disabled={submitting}
      />
      <Input
        label="Email"
        type="email"
        value={formEmail}
        onChange={(e) => setFormEmail(e.target.value)}
        required
        disabled={submitting}
      />
      <Input
        label="Phone Number"
        type="tel"
        value={formPhoneNumber}
        onChange={(e) => setFormPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
        required
        disabled={submitting}
        maxLength={10}
        placeholder="10-digit mobile number"
      />
      <Select
        label="Role"
        value={formRole}
        onChange={(e) => setFormRole(e.target.value as AdminRole)}
        options={roleOptions}
        disabled={submitting}
      />
      <div className="flex justify-end gap-2 pt-2">
        <Button
          type="button"
          variant="secondary"
          onClick={() => {
            setEditingAdmin(null);
            resetForm();
          }}
          disabled={submitting}
        >
          Cancel
        </Button>
        <Button type="submit" isLoading={submitting}>
          Save Changes
        </Button>
      </div>
    </form>
  );

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

        {loading ? (
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
                      <div className="avatar w-10 h-10 text-sm">
                        {admin.name.charAt(0)}
                      </div>
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
                        {formatRole(admin.role)}
                      </span>
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {admin.lastLogin
                      ? new Date(admin.lastLogin).toLocaleString()
                      : 'Never'}
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
                      <DropdownItem onClick={() => openResetPassword(admin)}>
                        <KeyRound size={14} /> Reset Password
                      </DropdownItem>
                      <DropdownItem onClick={() => handleToggleStatus(admin)}>
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

      <Modal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Add New Admin">
        {createForm}
      </Modal>

      <Modal
        isOpen={!!editingAdmin}
        onClose={() => {
          setEditingAdmin(null);
          resetForm();
        }}
        title="Edit Admin"
      >
        {editForm}
      </Modal>

      <Modal
        isOpen={!!resetTarget}
        onClose={() => {
          if (submitting) return;
          setResetTarget(null);
          setResetPassword('');
          setResetConfirmPassword('');
          setResetFieldErrors({});
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
              if (resetFieldErrors.newPassword) {
                setResetFieldErrors((prev) => ({ ...prev, newPassword: undefined }));
              }
            }}
            error={resetFieldErrors.newPassword}
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
              if (resetFieldErrors.confirmPassword) {
                setResetFieldErrors((prev) => ({ ...prev, confirmPassword: undefined }));
              }
            }}
            error={resetFieldErrors.confirmPassword}
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
                setResetFieldErrors({});
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
