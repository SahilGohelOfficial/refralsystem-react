import React from 'react';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';
import Select from './Select';

const LanguageSelector = () => {
  const { t, i18n } = useTranslation();

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    i18n.changeLanguage(e.target.value);
  };

  const languageOptions = [
    { value: 'en', label: t('settings.english', 'English') },
    { value: 'hi', label: t('settings.hindi', 'Hindi') },
    { value: 'gu', label: t('settings.gujarati', 'Gujarati') },
  ];

  return (
    <div className="flex flex-col sm:flex-row sm:items-start gap-5 max-w-lg">
      <div className="w-11 h-11 rounded-xl bg-primary-muted border border-primary/20 flex items-center justify-center text-primary shrink-0">
        <Globe size={20} strokeWidth={1.75} />
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="text-base font-semibold text-text">
          {t('settings.language_preference', 'Language Preference')}
        </h3>
        <p className="text-sm text-text-secondary mt-0.5 mb-4">
          {t('settings.language_desc', 'Select your preferred language')}
        </p>
        <Select
          value={i18n.language}
          onChange={handleLanguageChange}
          options={languageOptions}
        />
      </div>
    </div>
  );
};

export default LanguageSelector;