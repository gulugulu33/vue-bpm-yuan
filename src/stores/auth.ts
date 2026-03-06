import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { authApi } from '../api';
import { initializeWebSocket, disconnectWebSocket } from '../services/websocket.service';

export interface User {
  id: string;
  username: string;
  email: string;
  fullName?: string;
  role: string;
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null);
  const token = ref<string | null>(localStorage.getItem('token'));
  const loading = ref(false);

  const isLoggedIn = computed(() => !!token.value && !!user.value);

  async function login(username: string, password: string) {
    loading.value = true;
    try {
      const data: any = await authApi.login({ username, password });
      token.value = data.token;
      user.value = data.user;
      localStorage.setItem('token', data.token);
      
      // 初始化 WebSocket 连接
      initializeWebSocket(data.token);
      
      return data;
    } finally {
      loading.value = false;
    }
  }

  async function register(data: {
    username: string;
    email: string;
    password: string;
    fullName?: string;
  }) {
    loading.value = true;
    try {
      const result = await authApi.register(data);
      return result;
    } finally {
      loading.value = false;
    }
  }

  function logout() {
    token.value = null;
    user.value = null;
    localStorage.removeItem('token');
    
    // 断开 WebSocket 连接
    disconnectWebSocket();
  }

  function initAuth() {
    const savedToken = localStorage.getItem('token');
    if (savedToken) {
      token.value = savedToken;
    }
  }

  return {
    user,
    token,
    loading,
    isLoggedIn,
    login,
    register,
    logout,
    initAuth,
  };
});
