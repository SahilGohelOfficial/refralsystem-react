import { useEffect } from 'react';
import { useThemeStore } from '../stores/themeStore';
import { applyResolvedTheme } from '../lib/theme';

const ThemeSync = () => {
  const theme = useThemeStore((state) => state.theme);
  const resolved = useThemeStore((state) => state.resolved);
  const syncFromSystem = useThemeStore((state) => state.syncFromSystem);

  useEffect(() => {
    applyResolvedTheme(resolved);
  }, [resolved]);

  useEffect(() => {
    if (theme !== 'system') return;

    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => syncFromSystem();

    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, [theme, syncFromSystem]);

  return null;
};

export default ThemeSync;
