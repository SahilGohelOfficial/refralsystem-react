import PageHeader from '../../components/ui/PageHeader';
import { useTranslation } from 'react-i18next';

const AdminDashboard = () => {
  const { t } = useTranslation();

  return (
    <div className="page-shell">
      <PageHeader
        title={t('nav.admin.dashboard', 'Dashboard')}
        description="Welcome to the admin portal."
      />
    </div>
  );
};

export default AdminDashboard;
