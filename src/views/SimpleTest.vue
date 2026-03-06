<template>
  <MainLayout>
    <div class="simple-test">
      <h1>通知中心简单测试</h1>
      
      <div class="test-box">
        <h2>测试按钮</h2>
        <a-space>
          <a-button type="primary" @click="testAddNotification" :loading="loading">
            添加测试通知（真实 WebSocket）
          </a-button>
        </a-space>
      </div>

      <div class="test-box">
        <h2>调试信息</h2>
        <p>通知数量: {{ notifications.length }}</p>
        <p>未读数量: {{ unreadCount }}</p>
        <p>WebSocket 连接状态: {{ isConnected ? '已连接' : '未连接' }}</p>
        <p>说明：点击按钮后，后端会通过 WebSocket 推送通知到前端</p>
      </div>

      <div class="test-box">
        <h2>使用说明</h2>
        <ol>
          <li>登录后，WebSocket 会自动连接</li>
          <li>点击"添加测试通知"按钮，后端会通过 WebSocket 推送通知</li>
          <li>点击页面右上角的铃铛图标查看通知</li>
          <li>铃铛图标上的红点表示有未读消息</li>
        </ol>
      </div>
    </div>
  </MainLayout>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { message } from 'ant-design-vue';
import { useNotificationStore } from '../stores/notification';
import { useWebSocket } from '../services/websocket.service';
import MainLayout from '../components/layout/MainLayout.vue';
import axios from 'axios';

const { notifications } = useNotificationStore();
const { getWebSocketClient } = useWebSocket();
const loading = ref(false);

const unreadCount = computed(() => {
  return notifications.value.filter(n => !n.read).length;
});

const isConnected = computed(() => {
  try {
    const wsClient = getWebSocketClient();
    return wsClient.getConnectionStatus();
  } catch {
    return false;
  }
});

const testAddNotification = async () => {
  loading.value = true;
  try {
    const token = localStorage.getItem('token');
    await axios.post('http://localhost:3000/api/v1/test/notification', {}, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    message.success('测试通知已发送');
  } catch (error: any) {
    message.error(error.response?.data?.message || '发送测试通知失败');
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.simple-test {
  padding: 24px;
}

.test-box {
  background: white;
  padding: 24px;
  border-radius: 8px;
  margin-bottom: 24px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.test-box h2 {
  margin-bottom: 16px;
  font-size: 16px;
  font-weight: 500;
}

.test-box p {
  margin-bottom: 8px;
  color: #666;
}

.test-box ol {
  padding-left: 20px;
}

.test-box li {
  margin-bottom: 8px;
  color: #666;
}
</style>