import { ref, onMounted, onUnmounted } from 'vue';
import { useAuthStore } from '../stores/auth';

export interface WebSocketMessage {
  type: string;
  data: any;
  timestamp: number;
}

export class WebSocketClient {
  private ws: WebSocket | null = null;
  private url: string;
  private token: string;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private messageHandlers: Map<string, ((message: WebSocketMessage) => void)[]> = new Map();
  private isConnected = false;

  constructor(url: string, token: string) {
    this.url = url;
    this.token = token;
  }

  connect() {
    if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
      return;
    }

    try {
      this.ws = new WebSocket(`${this.url}?token=${this.token}`);

      this.ws.onopen = () => {
        console.log('WebSocket connected');
        this.isConnected = true;
        this.reconnectAttempts = 0;
      };

      this.ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data) as WebSocketMessage;
          this.handleMessage(message);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      this.ws.onclose = () => {
        console.log('WebSocket disconnected');
        this.isConnected = false;
        this.attemptReconnect();
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };
    } catch (error) {
      console.error('Failed to connect WebSocket:', error);
      this.attemptReconnect();
    }
  }

  private attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
      setTimeout(() => {
        this.connect();
      }, this.reconnectDelay * this.reconnectAttempts);
    } else {
      console.error('Max reconnection attempts reached');
    }
  }

  private handleMessage(message: WebSocketMessage) {
    const handlers = this.messageHandlers.get(message.type);
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(message);
        } catch (error) {
          console.error('Error in message handler:', error);
        }
      });
    }
  }

  on(type: string, handler: (message: WebSocketMessage) => void) {
    if (!this.messageHandlers.has(type)) {
      this.messageHandlers.set(type, []);
    }
    this.messageHandlers.get(type)?.push(handler);
  }

  off(type: string, handler: (message: WebSocketMessage) => void) {
    const handlers = this.messageHandlers.get(type);
    if (handlers) {
      this.messageHandlers.set(type, handlers.filter(h => h !== handler));
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.isConnected = false;
  }

  getConnectionStatus() {
    return this.isConnected;
  }
}

let wsClient: WebSocketClient | null = null;

export const useWebSocket = () => {
  const authStore = useAuthStore();
  const isConnected = ref(false);

  const getWebSocketClient = (): WebSocketClient => {
    if (!wsClient && authStore.token) {
      const wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:3000';
      wsClient = new WebSocketClient(wsUrl, authStore.token);
      wsClient.connect();
    }
    return wsClient!;
  };

  onMounted(() => {
    if (authStore.token) {
      const client = getWebSocketClient();
      isConnected.value = client.getConnectionStatus();
      
      // 监听连接状态
      client.on('connect', () => {
        isConnected.value = true;
      });
    }
  });

  onUnmounted(() => {
    if (wsClient) {
      wsClient.disconnect();
    }
  });

  return {
    getWebSocketClient,
    isConnected,
  };
};

// 全局 WebSocket 实例管理
export const getGlobalWebSocketClient = (): WebSocketClient | null => {
  return wsClient;
};

export const initializeWebSocket = (token: string) => {
  const wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:3000';
  wsClient = new WebSocketClient(wsUrl, token);
  wsClient.connect();
  return wsClient;
};

export const disconnectWebSocket = () => {
  if (wsClient) {
    wsClient.disconnect();
    wsClient = null;
  }
};