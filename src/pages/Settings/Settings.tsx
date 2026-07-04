import LanguageSelector from '../../components/ui/LanguageSelector';
import PageHeader from '../../components/ui/PageHeader';
import { useTranslation } from 'react-i18next';

const Settings = () => {
  const { t } = useTranslation();

  return (
    <div className="page-shell space-y-6">
      <PageHeader
        title={t('nav.admin.settings', 'Settings')}
        description="Manage your dashboard preferences."
      />
      <LanguageSelector />
    </div>
  );
};

export default Settings;
