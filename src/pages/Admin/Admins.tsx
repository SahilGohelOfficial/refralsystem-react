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
import {
  createAdmin,
  listAdmins,
  resetAdminPassword,
  updateAdmin,
  updateAdminStatus,
} from '../../services/admins.service';
import { formatApiError } from '../../lib/api';
import type { Admin, AdminRole, ApiError } from '../../types/api';

const roleOptions = [
  { value: 'admin', label: 'Admin' },
  { value: 'superAdmin', label: 'Super Admin' },
];

const formatRole = (role: AdminRole) =>
  role === 'superAdmin' ? 'Super Admin' : 'Admin';

const Admins = () => {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<Admin | null>(null);
  const [resetTarget, setResetTarget] = useState<Admin | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [formRole, setFormRole] = useState<AdminRole>('admin');
  const [resetPassword, setResetPassword] = useState('');

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
    setFormPassword('');
    setFormRole('admin');
    setResetPassword('');
  };

  const openCreate = () => {
    resetForm();
    setIsCreateOpen(true);
  };

  const openEdit = (admin: Admin) => {
    setFormName(admin.name);
    setFormEmail(admin.email);
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

    setSubmitting(true);
    try {
      await updateAdmin(editingAdmin.id, {
        name: formName,
        email: formEmail,
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

    setSubmitting(true);
    try {
      await resetAdminPassword(resetTarget.id, resetPassword);
      toast.success('Password reset successfully');
      setResetTarget(null);
      setResetPassword('');
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
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text">Admin Management</h1>
          <p className="text-sm text-text-secondary mt-1">
            Create and manage admin accounts. Super Admin only.
          </p>
        </div>
        <Button className="shrink-0 gap-2" onClick={openCreate}>
          <Plus size={16} />
          Add New Admin
        </Button>
      </div>

      <Card className="p-0">
        <div className="p-4 border-b border-border flex flex-col sm:flex-row gap-4 justify-between items-center bg-surface/50 rounded-t-[20px]">
          <div className="w-full sm:w-96">
            <Input
              icon={Search}
              placeholder="Search by name, email, or role..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="p-12 flex justify-center">
            <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
          </div>
        ) : filteredAdmins.length === 0 ? (
          <div className="p-12 text-center text-text-secondary">
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
                      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                        {admin.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-medium text-text">{admin.name}</div>
                        <div className="text-xs text-text-secondary">{admin.email}</div>
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
                    <Badge variant={admin.isActive ? 'success' : 'neutral'}>
                      {admin.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Dropdown
                      align="right"
                      trigger={
                        <button className="p-1 text-text-secondary hover:text-text hover:bg-surface rounded-md transition-colors">
                          <MoreVertical size={16} />
                        </button>
                      }
                    >
                      <DropdownItem onClick={() => openEdit(admin)}>
                        <Edit2 size={14} /> Edit Admin
                      </DropdownItem>
                      <DropdownItem onClick={() => setResetTarget(admin)}>
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
          setResetTarget(null);
          setResetPassword('');
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
            onChange={(e) => setResetPassword(e.target.value)}
            required
            disabled={submitting}
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
