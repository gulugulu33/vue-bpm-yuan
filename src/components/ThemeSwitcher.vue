<template>
  <a-dropdown>
    <a-button>
      <BulbOutlined v-if="themeStore.themeConfig.theme === 'light'" />
      <BulbFilled v-else />
      <span style="margin-left: 8px;">{{ themeStore.themeConfig.theme === 'light' ? '亮色' : '暗黑' }}</span>
    </a-button>
    <template #overlay>
      <a-menu>
        <a-menu-item @click="handleThemeChange('light')">
          <BulbOutlined />
          <span>亮色模式</span>
        </a-menu-item>
        <a-menu-item @click="handleThemeChange('dark')">
          <BulbFilled />
          <span>暗黑模式</span>
        </a-menu-item>
      </a-menu>
    </template>
  </a-dropdown>
</template>

<script setup lang="ts">
import { BulbOutlined, BulbFilled } from '@ant-design/icons-vue';
import { useThemeStore } from '../stores/theme';
import type { Theme } from '../theme';

const themeStore = useThemeStore();

function handleThemeChange(theme: Theme) {
  themeStore.setTheme({ ...themeStore.themeConfig, theme });
}
</script>
