import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Lock, User } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import PageHeader from '../../components/ui/PageHeader';
import { useAuth } from '../../context/AuthContext';

const AdminProfile = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user } = useAuth();

  const roleLabel =
    user?.role === 'superAdmin'
      ? 'Super Admin'
      : user?.role
        ? user.role.charAt(0).toUpperCase() + user.role.slice(1)
        : 'Admin';

  return (
    <div className="page-shell space-y-6">
      <PageHeader
        title={t('nav.admin.profile', 'Profile')}
        description="View your admin account details."
      />

      {user && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User size={18} />
              {user.name}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 text-sm">
              <div className="flex justify-between gap-4">
                <span className="text-text-secondary">Name</span>
                <span className="text-text font-medium">{user.name}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-text-secondary">Email</span>
                <span className="text-text font-medium">{user.email || '—'}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-text-secondary">Role</span>
                <span className="text-text font-medium">{roleLabel}</span>
              </div>
            </div>

            <Button
              variant="outline"
              onClick={() => navigate('/admin/change-password')}
              className="gap-2"
            >
              <Lock size={15} />
              {t('nav.admin.change_password', 'Change Password')}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdminProfile;