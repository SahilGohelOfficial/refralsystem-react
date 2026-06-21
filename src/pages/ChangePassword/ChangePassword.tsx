import React, { useState, FormEvent } from 'react';
import { Lock, Save } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { changeAdminPassword, changeAgentPassword } from '../../services/auth.service';
import { formatApiError } from '../../lib/api';
import { isAdminPortalRole } from '../../lib/roles';
import type { ApiError } from '../../types/api';

const ChangePassword = () => {
  const { user, logout } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match!');
      return;
    }

    if (newPassword.length < 8) {
      toast.error('Password must be at least 8 characters long.');
      return;
    }

    setIsLoading(true);
    try {
      if (user?.role === 'agent') {
        await changeAgentPassword(currentPassword, newPassword);
      } else if (user && isAdminPortalRole(user.role)) {
        await changeAdminPassword(currentPassword, newPassword);
      } else {
        toast.error('Password change is not available for this account.');
        return;
      }

      toast.success('Password changed successfully. Please sign in again.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      await logout();
    } catch (error) {
      toast.error(formatApiError(error as ApiError));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-text">Change Password</h1>
        <p className="text-sm text-text-secondary mt-1">
          Ensure your account is using a long, random password to stay secure.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock size={20} className="text-primary" />
            Update Password
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Current Password"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              disabled={isLoading}
            />
            <div className="pt-2">
              <Input
                label="New Password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                disabled={isLoading}
              />
              <p className="mt-2 text-xs text-text-secondary">
                At least 8 characters with one letter and one number.
              </p>
            </div>
            <Input
              label="Confirm New Password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              disabled={isLoading}
            />

            <div className="pt-4 flex justify-end">
              <Button type="submit" isLoading={isLoading} className="gap-2">
                <Save size={16} />
                Save Password
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ChangePassword;
