import { Moon, Sun } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useThemeStore } from '../../stores/themeStore';

const ThemeToggle = () => {
  const { t } = useTranslation();
  const resolved = useThemeStore((state) => state.resolved);
  const setTheme = useThemeStore((state) => state.setTheme);
  const isDark = resolved === 'dark';

  return (
    <button
      type="button"
      className="icon-btn"
      aria-label={t('settings.theme_toggle', 'Toggle theme')}
      title={
        isDark
          ? t('settings.theme_light', 'Light')
          : t('settings.theme_dark', 'Dark')
      }
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
    >
      {isDark ? <Sun size={18} strokeWidth={1.75} /> : <Moon size={18} strokeWidth={1.75} />}
    </button>
  );
};

export default ThemeToggle;
