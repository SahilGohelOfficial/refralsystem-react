import { Monitor, Moon, Sun, SunMoon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useThemeStore } from '../../stores/themeStore';
import type { ThemePreference } from '../../lib/theme';

const OPTIONS: {
  value: ThemePreference;
  labelKey: string;
  fallback: string;
  icon: typeof Sun;
}[] = [
  { value: 'light', labelKey: 'settings.theme_light', fallback: 'Light', icon: Sun },
  { value: 'dark', labelKey: 'settings.theme_dark', fallback: 'Dark', icon: Moon },
  { value: 'system', labelKey: 'settings.theme_system', fallback: 'System', icon: Monitor },
];

const ThemeSelector = () => {
  const { t } = useTranslation();
  const theme = useThemeStore((state) => state.theme);
  const setTheme = useThemeStore((state) => state.setTheme);

  return (
    <div className="flex flex-col sm:flex-row sm:items-start gap-5">
      <div className="w-11 h-11 rounded-xl bg-primary-muted border border-primary/20 flex items-center justify-center text-primary shrink-0">
        <SunMoon size={20} strokeWidth={1.75} />
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="text-base font-semibold text-text">
          {t('settings.theme_preference', 'Appearance')}
        </h3>
        <p className="text-sm text-text-secondary mt-0.5 mb-4">
          {t('settings.theme_desc', 'Choose light, dark, or match your device.')}
        </p>
        <div
          role="radiogroup"
          aria-label={t('settings.theme_preference', 'Appearance')}
          className="grid grid-cols-3 gap-2"
        >
          {OPTIONS.map((option) => {
            const selected = theme === option.value;
            const Icon = option.icon;
            return (
              <button
                key={option.value}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => setTheme(option.value)}
                className={`flex flex-col items-center gap-1.5 rounded-lg border px-3 py-2.5 text-xs font-medium transition-colors duration-150
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40
                  ${
                    selected
                      ? 'border-primary/40 bg-primary-muted text-primary'
                      : 'border-border bg-surface text-text-secondary hover:border-border-strong hover:text-text'
                  }`}
              >
                <Icon size={16} strokeWidth={1.75} />
                {t(option.labelKey, option.fallback)}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ThemeSelector;
