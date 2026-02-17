import { defineStore } from 'pinia';
import { ref, watch } from 'vue';
import { DEFAULT_THEME, THEME_KEY, type ThemeConfig } from '../theme';

export const useThemeStore = defineStore('theme', () => {
  const themeConfig = ref<ThemeConfig>(DEFAULT_THEME);

  function loadTheme() {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved) {
      try {
        themeConfig.value = JSON.parse(saved);
      } catch {
        themeConfig.value = DEFAULT_THEME;
      }
    } else {
      themeConfig.value = DEFAULT_THEME;
    }
  }

  function setTheme(config: ThemeConfig) {
    themeConfig.value = config;
    localStorage.setItem(THEME_KEY, JSON.stringify(config));
  }

  function toggleTheme() {
    const newTheme = themeConfig.value.theme === 'light' ? 'dark' : 'light';
    setTheme({ ...themeConfig.value, theme: newTheme });
  }

  function setPrimaryColor(color: string) {
    setTheme({ ...themeConfig.value, primaryColor: color });
  }

  watch(
    () => themeConfig.value,
    (newConfig) => {
      localStorage.setItem(THEME_KEY, JSON.stringify(newConfig));
    },
    { deep: true }
  );

  loadTheme();

  return {
    themeConfig,
    setTheme,
    toggleTheme,
    setPrimaryColor,
  };
});
