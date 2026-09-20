import React from 'react';
import LanguageSelector from '../../components/ui/LanguageSelector';
import ThemeSelector from '../../components/ui/ThemeSelector';
import { Card } from '../../components/ui/Card';
import { useTranslation } from 'react-i18next';

const UserSettings = () => {
  const { t } = useTranslation();
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text">{t('nav.user_portal.settings', 'Settings')}</h1>
        <p className="text-sm text-text-secondary mt-1">Manage your user portal preferences.</p>
      </div>
      <Card className="space-y-6">
        <ThemeSelector />
        <div className="divider" />
        <LanguageSelector />
      </Card>
    </div>
  );
};

export default UserSettings;
