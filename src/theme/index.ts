export type Theme = 'light' | 'dark';

export interface ThemeConfig {
  theme: Theme;
  primaryColor: string;
}

export const THEME_KEY = 'bpm-theme';

export const DEFAULT_THEME: ThemeConfig = {
  theme: 'light',
  primaryColor: '#1677ff',
};

export const lightTheme = {
  '--primary-color': '#1677ff',
  '--success-color': '#52c41a',
  '--warning-color': '#faad14',
  '--error-color': '#ff4d4f',
  '--info-color': '#1677ff',
  '--text-primary': 'rgba(0, 0, 0, 0.88)',
  '--text-secondary': 'rgba(0, 0, 0, 0.65)',
  '--text-disabled': 'rgba(0, 0, 0, 0.25)',
  '--border-color': '#d9d9d9',
  '--background-color': '#f0f2f5',
  '--component-background': '#ffffff',
  '--header-background': '#ffffff',
  '--sider-background': '#001529',
  '--sider-text': '#rgba(255, 255, 255, 0.65)',
  '--hover-background': '#f5f5f5',
  '--shadow-color': 'rgba(0, 0, 0, 0.1)',
};

export const darkTheme = {
  '--primary-color': '#177ddc',
  '--success-color': '#49aa19',
  '--warning-color': '#d89614',
  '--error-color': '#d32029',
  '--info-color': '#177ddc',
  '--text-primary': 'rgba(255, 255, 255, 0.85)',
  '--text-secondary': 'rgba(255, 255, 255, 0.65)',
  '--text-disabled': 'rgba(255, 255, 255, 0.25)',
  '--border-color': '#434343',
  '--background-color': '#141414',
  '--component-background': '#1f1f1f',
  '--header-background': '#1f1f1f',
  '--sider-background': '#000000',
  '--sider-text': 'rgba(255, 255, 255, 0.65)',
  '--hover-background': '#262626',
  '--shadow-color': 'rgba(0, 0, 0, 0.5)',
};

export function getThemeConfig(): ThemeConfig {
  const saved = localStorage.getItem(THEME_KEY);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      return DEFAULT_THEME;
    }
  }
  return DEFAULT_THEME;
}

export function saveThemeConfig(config: ThemeConfig) {
  localStorage.setItem(THEME_KEY, JSON.stringify(config));
}

export function applyTheme(_config: ThemeConfig) {
}

export function toggleTheme(): Theme {
  const config = getThemeConfig();
  const newTheme: Theme = config.theme === 'light' ? 'dark' : 'light';
  saveThemeConfig({ ...config, theme: newTheme });
  return newTheme;
}

export function setPrimaryColor(color: string) {
  const config = getThemeConfig();
  saveThemeConfig({ ...config, primaryColor: color });
}
