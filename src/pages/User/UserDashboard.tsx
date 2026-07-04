import PageHeader from '../../components/ui/PageHeader';
import { useTranslation } from 'react-i18next';

const UserDashboard = () => {
  const { t } = useTranslation();

  return (
    <div className="page-shell">
      <PageHeader
        title={t('nav.user_portal.dashboard', 'Dashboard')}
        description="Welcome to your user portal."
      />
    </div>
  );
};

export default UserDashboard;
