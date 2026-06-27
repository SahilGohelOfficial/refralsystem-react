import React from 'react';
import LanguageSelector from '../../components/ui/LanguageSelector';
import { useTranslation } from 'react-i18next';

const WithdrawalSettings = () => {
  const { t } = useTranslation();
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text">{t('nav.user_portal.settings', 'Settings')}</h1>
        <p className="text-sm text-text-secondary mt-1">Manage your user portal preferences.</p>
      </div>
      <LanguageSelector />
    </div>
  );
};

export default WithdrawalSettings;
