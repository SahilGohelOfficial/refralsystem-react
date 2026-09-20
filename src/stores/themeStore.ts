import { create } from 'zustand';
import {
  THEME_STORAGE_KEY,
  applyResolvedTheme,
  readStoredTheme,
  resolveTheme,
  type ResolvedTheme,
  type ThemePreference,
} from '../lib/theme';

type ThemeStore = {
  theme: ThemePreference;
  resolved: ResolvedTheme;
  setTheme: (theme: ThemePreference) => void;
  syncFromSystem: () => void;
};

const initialTheme = typeof window === 'undefined' ? 'system' : readStoredTheme();
const initialResolved =
  typeof window === 'undefined' ? 'dark' : resolveTheme(initialTheme);

if (typeof window !== 'undefined') {
  applyResolvedTheme(initialResolved);
}

export const useThemeStore = create<ThemeStore>((set, get) => ({
  theme: initialTheme,
  resolved: initialResolved,

  setTheme: (theme) => {
    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      // ignore write failures
    }
    const resolved = resolveTheme(theme);
    applyResolvedTheme(resolved);
    set({ theme, resolved });
  },

  syncFromSystem: () => {
    const { theme } = get();
    if (theme !== 'system') return;
    const resolved = resolveTheme(theme);
    applyResolvedTheme(resolved);
    set({ resolved });
  },
}));
