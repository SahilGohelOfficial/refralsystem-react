import React from 'react';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';
import { Card, CardContent } from './Card';

const LanguageSelector = () => {
  const { t, i18n } = useTranslation();

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    i18n.changeLanguage(e.target.value);
  };

  return (
    <Card className="max-w-md">
      <CardContent className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary">
            <Globe size={20} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-text">{t('settings.language_preference', 'Language Preference')}</h3>
            <p className="text-sm text-text-secondary">{t('settings.language_desc', 'Select your preferred language')}</p>
          </div>
        </div>
        
        <div className="mt-4">
          <select 
            value={i18n.language} 
            onChange={handleLanguageChange}
            className="w-full bg-surface border border-border text-text rounded-xl p-3 focus:outline-none focus:border-primary transition-colors appearance-none cursor-pointer"
            style={{ WebkitAppearance: 'none', MozAppearance: 'none' }}
          >
            <option value="en">{t('settings.english', 'English')}</option>
            <option value="hi">{t('settings.hindi', 'Hindi')}</option>
            <option value="gu">{t('settings.gujarati', 'Gujarati')}</option>
          </select>
        </div>
      </CardContent>
    </Card>
  );
};

export default LanguageSelector;
