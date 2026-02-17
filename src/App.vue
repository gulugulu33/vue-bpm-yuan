<template>
  <a-config-provider :theme="themeConfig">
    <router-view />
  </a-config-provider>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { theme } from 'ant-design-vue';
import { useThemeStore } from './stores/theme';

const themeStore = useThemeStore();

const themeConfig = computed(() => {
  const config = themeStore.themeConfig;
  return {
    token: {
      colorPrimary: config.primaryColor,
    },
    algorithm: config.theme === 'dark' ? theme.darkAlgorithm : theme.defaultAlgorithm,
  };
});
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body, #app {
  height: 100%;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}
</style>
