<template>
  <a-layout style="min-height: 100vh">
    <a-layout-sider width="240">
      <div class="logo">
        <h2 style="color: white; padding: 16px; margin: 0; font-size: 18px;">yuan BPM</h2>
      </div>
      <a-menu v-model:selectedKeys="selectedKeys" theme="dark" mode="inline">
        <a-menu-item key="/dashboard" @click="navigate('/dashboard')">
          <span>数据看板</span>
        </a-menu-item>
        <a-menu-item key="/designer" @click="navigate('/designer')">
          <span>流程设计器</span>
        </a-menu-item>
        <a-menu-item key="/apply" @click="navigate('/apply')">
          <span>发起申请</span>
        </a-menu-item>
        <a-menu-item key="/my-applications" @click="navigate('/my-applications')">
          <span>我的申请</span>
        </a-menu-item>
        <a-menu-item key="/instances" @click="navigate('/instances')">
          <span>流程实例</span>
        </a-menu-item>
        <a-menu-item key="/tasks" @click="navigate('/tasks')">
          <span>任务中心</span>
        </a-menu-item>
        <a-menu-item key="/virtual-list-demo" @click="navigate('/virtual-list-demo')">
          <span>虚拟列表演示</span>
        </a-menu-item>
      </a-menu>
    </a-layout-sider>
    <a-layout>
      <a-layout-header style="background: #fff; padding: 0 24px; border-bottom: 1px solid #f0f0f0;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span style="font-size: 16px; font-weight: 500;">{{ pageTitle }}</span>
          <a-space>
            <ThemeSwitcher />
            <a-dropdown v-if="authStore.user">
              <a-space style="cursor: pointer;">
                <a-avatar style="background-color: #1890ff;">
                  {{ authStore.user.username?.charAt(0)?.toUpperCase() || 'U' }}
                </a-avatar>
                <span>{{ authStore.user.username }}</span>
                <DownOutlined />
              </a-space>
              <template #overlay>
                <a-menu>
                  <a-menu-item>
                    <UserOutlined />
                    <span>个人信息</span>
                  </a-menu-item>
                  <a-menu-item>
                    <SettingOutlined />
                    <span>设置</span>
                  </a-menu-item>
                  <a-menu-divider />
                  <a-menu-item @click="handleLogout">
                    <LogoutOutlined />
                    <span>退出登录</span>
                  </a-menu-item>
                </a-menu>
              </template>
            </a-dropdown>
            <a-button v-else @click="router.push('/login')">登录</a-button>
          </a-space>
        </div>
      </a-layout-header>
      <a-layout-content style="margin: 24px; padding: 0;">
        <slot></slot>
      </a-layout-content>
    </a-layout>
  </a-layout>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '../../stores/auth';
import { DownOutlined, UserOutlined, SettingOutlined, LogoutOutlined } from '@ant-design/icons-vue';
import ThemeSwitcher from '../ThemeSwitcher.vue';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

const selectedKeys = computed(() => [route.path]);

const pageTitle = computed(() => {
  const titles: Record<string, string> = {
    '/dashboard': '数据看板',
    '/designer': '流程设计器',
    '/apply': '发起申请',
    '/my-applications': '我的申请',
    '/instances': '流程实例',
    '/tasks': '任务中心',
    '/virtual-list-demo': '虚拟列表演示',
  };
  return titles[route.path] || '首页';
});

function navigate(path: string) {
  router.push(path);
}

function handleLogout() {
  authStore.logout();
  router.push('/login');
}
</script>

<style scoped>
.logo {
  height: 64px;
  background: #001529;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
