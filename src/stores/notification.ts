import { ref } from 'vue';

interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: number;
  read: boolean;
}

const notifications = ref<Notification[]>([]);

const addNotification = (notification: Omit<Notification, 'id' | 'read'>) => {
  notifications.value.unshift({
    ...notification,
    id: Date.now().toString(),
    read: false,
  });
  
  // 最多保留20条通知
  if (notifications.value.length > 20) {
    notifications.value = notifications.value.slice(0, 20);
  }
};

const clearAll = () => {
  notifications.value = [];
};

const markAsRead = (id: string) => {
  const notification = notifications.value.find(n => n.id === id);
  if (notification) {
    notification.read = true;
  }
};

const markAllAsRead = () => {
  notifications.value.forEach(n => {
    n.read = true;
  });
};

export const useNotificationStore = () => {
  return {
    notifications,
    addNotification,
    clearAll,
    markAsRead,
    markAllAsRead,
  };
};
