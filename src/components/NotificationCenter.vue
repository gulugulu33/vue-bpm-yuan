<template>
  <div class="notification-container">
    <a-dropdown v-model:open="dropdownVisible">
      <a-badge :count="unreadCount" :dot="unreadCount > 0">
        <a-button type="text" class="notification-button" @click="handleDropdownClick">
          <BellOutlined />
        </a-button>
      </a-badge>
      <template #overlay>
        <a-menu style="width: 360px; max-height: 400px; overflow-y: auto;">
          <a-menu-item-group title="通知中心">
            <a-menu-item v-if="notifications.length === 0" disabled>
              <span style="color: #999;">暂无通知</span>
            </a-menu-item>
            <a-menu-item 
              v-for="notification in notifications" 
              :key="notification.id"
              @click="markAsRead(notification.id)"
            >
              <div class="notification-item">
                <div class="notification-title">{{ notification.title }}</div>
                <div class="notification-message">{{ notification.message }}</div>
                <div class="notification-time">{{ formatTime(notification.timestamp) }}</div>
              </div>
            </a-menu-item>
          </a-menu-item-group>
          <a-menu-divider v-if="notifications.length > 0" />
          <a-menu-item v-if="notifications.length > 0" @click="clearAll">
            <span style="color: #ff4d4f;">清空所有通知</span>
          </a-menu-item>
        </a-menu>
      </template>
    </a-dropdown>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { BellOutlined } from '@ant-design/icons-vue';
import { useNotificationStore } from '../stores/notification';
import { useWebSocket, type WebSocketMessage } from '../services/websocket.service';

const { notifications, clearAll, markAsRead, addNotification } = useNotificationStore();
const { getWebSocketClient } = useWebSocket();
const dropdownVisible = ref(false);

const unreadCount = computed(() => {
  return notifications.value.filter(n => !n.read).length;
});

const formatTime = (timestamp: number) => {
  const date = new Date(timestamp);
  return date.toLocaleString('zh-CN');
};

const handleDropdownClick = () => {
  if (unreadCount.value > 0) {
    markAllAsRead();
  }
  dropdownVisible.value = !dropdownVisible.value;
};

const markAllAsRead = () => {
  notifications.value.forEach(n => {
    n.read = true;
  });
};

const handleWebSocketMessage = (message: WebSocketMessage) => {
  console.log('收到 WebSocket 消息:', message);
  
  switch (message.type) {
    case 'info':
      addNotification({
        type: 'info',
        title: message.data.title || '信息通知',
        message: message.data.message || '',
        timestamp: message.timestamp,
      });
      break;
    case 'task_assigned':
      addNotification({
        type: 'info',
        title: '新任务分配',
        message: `您有一个新的审批任务：${message.data.taskName}`,
        timestamp: message.timestamp,
      });
      break;
    case 'task_result':
      addNotification({
        type: message.data.result === 'approved' ? 'success' : 'error',
        title: message.data.result === 'approved' ? '任务已通过' : '任务已驳回',
        message: message.data.result === 'approved' 
          ? `任务 ${message.data.taskId} 已通过审批`
          : `任务 ${message.data.taskId} 已被驳回${message.data.comment ? `，原因：${message.data.comment}` : ''}`,
        timestamp: message.timestamp,
      });
      break;
    case 'process_update':
      addNotification({
        type: 'info',
        title: '流程状态更新',
        message: message.data.message,
        timestamp: message.timestamp,
      });
      break;
    case 'timeout_warning':
      addNotification({
        type: 'warning',
        title: '任务超时提醒',
        message: `任务 ${message.data.taskName} 即将超时，请及时处理`,
        timestamp: message.timestamp,
      });
      break;
  }
};

onMounted(() => {
  try {
    const wsClient = getWebSocketClient();
    
    // 注册消息监听器
    wsClient.on('info', handleWebSocketMessage);
    wsClient.on('task_assigned', handleWebSocketMessage);
    wsClient.on('task_result', handleWebSocketMessage);
    wsClient.on('process_update', handleWebSocketMessage);
    wsClient.on('timeout_warning', handleWebSocketMessage);
    
    console.log('WebSocket 消息监听器已注册');
  } catch (error) {
    console.error('WebSocket 初始化错误:', error);
  }
});

onUnmounted(() => {
  try {
    const wsClient = getWebSocketClient();
    wsClient.off('info', handleWebSocketMessage);
    wsClient.off('task_assigned', handleWebSocketMessage);
    wsClient.off('task_result', handleWebSocketMessage);
    wsClient.off('process_update', handleWebSocketMessage);
    wsClient.off('timeout_warning', handleWebSocketMessage);
  } catch (error) {
    console.error('WebSocket 清理错误:', error);
  }
});
</script>

<style scoped>
.notification-container {
  display: inline-block;
}

.notification-button {
  font-size: 18px;
  padding: 4px 8px;
}

.notification-item {
  padding: 8px 0;
}

.notification-title {
  font-weight: 500;
  font-size: 14px;
  margin-bottom: 4px;
  color: #333;
}

.notification-message {
  font-size: 12px;
  color: #666;
  margin-bottom: 4px;
  line-height: 1.4;
}

.notification-time {
  font-size: 11px;
  color: #999;
}
</style>