import LanguageSelector from '../../components/ui/LanguageSelector';
import ThemeSelector from '../../components/ui/ThemeSelector';
import PageHeader from '../../components/ui/PageHeader';
import { Card } from '../../components/ui/Card';
import { useTranslation } from 'react-i18next';

const Settings = () => {
  const { t } = useTranslation();

  return (
    <div className="page-shell space-y-6">
      <PageHeader
        title={t('nav.admin.settings', 'Settings')}
        description="Manage your dashboard preferences."
      />
      <Card className="space-y-6">
        <ThemeSelector />
        <div className="divider" />
        <LanguageSelector />
      </Card>
    </div>
  );
};

export default Settings;
