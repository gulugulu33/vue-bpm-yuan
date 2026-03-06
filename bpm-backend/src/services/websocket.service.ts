import { Server, WebSocket } from 'ws';
import http from 'http';
import { JwtPayload } from '../types';
import { verifyToken } from '../utils/jwt.util';

export interface WebSocketMessage {
  type: string;
  data: any;
  timestamp: number;
}

export class WebSocketService {
  private wss: Server;
  private clients: Map<string, WebSocket> = new Map();

  constructor(server: http.Server) {
    this.wss = new Server({ server });
    this.setup();
  }

  private setup() {
    this.wss.on('connection', (ws: WebSocket, req) => {
      console.log('WebSocket 新连接');
      
      // 从查询参数获取 token
      const url = new URL(req.url || '', 'http://localhost');
      const token = url.searchParams.get('token');

      if (!token) {
        console.log('WebSocket 连接失败：缺少 token');
        ws.close(401, 'Unauthorized');
        return;
      }

      try {
        const decoded = verifyToken(token) as JwtPayload;
        const userId = decoded.userId;

        console.log('WebSocket 用户连接成功:', userId);
        this.clients.set(userId, ws);

        ws.on('close', () => {
          console.log('WebSocket 用户断开连接:', userId);
          this.clients.delete(userId);
        });

        ws.on('error', (error) => {
          console.error('WebSocket 错误:', error);
          this.clients.delete(userId);
        });
      } catch (error) {
        console.error('WebSocket token 验证失败:', error);
        ws.close(401, 'Invalid token');
      }
    });
  }

  // 向特定用户推送消息
  public sendToUser(userId: string, message: WebSocketMessage) {
    const ws = this.clients.get(userId);
    console.log(`尝试发送消息给用户 ${userId}，连接数: ${this.clients.size}`);
    if (ws && ws.readyState === WebSocket.OPEN) {
      console.log(`用户 ${userId} 的 WebSocket 连接状态: OPEN`);
      ws.send(JSON.stringify(message));
      console.log(`消息已发送给用户 ${userId}`);
    } else {
      console.log(`用户 ${userId} 的 WebSocket 连接不存在或未打开`);
    }
  }

  // 向多个用户推送消息
  public sendToUsers(userIds: string[], message: WebSocketMessage) {
    userIds.forEach(userId => {
      this.sendToUser(userId, message);
    });
  }

  // 广播消息给所有用户
  public broadcast(message: WebSocketMessage) {
    this.clients.forEach(ws => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(message));
      }
    });
  }

  // 推送流程状态更新
  public sendProcessUpdate(userId: string, instanceId: string, status: string, message: string) {
    this.sendToUser(userId, {
      type: 'process_update',
      data: {
        instanceId,
        status,
        message,
      },
      timestamp: Date.now(),
    });
  }

  // 推送任务分配通知
  public sendTaskAssigned(userId: string, taskId: string, taskName: string, instanceId: string) {
    this.sendToUser(userId, {
      type: 'task_assigned',
      data: {
        taskId,
        taskName,
        instanceId,
      },
      timestamp: Date.now(),
    });
  }

  // 推送任务审批结果
  public sendTaskResult(userId: string, taskId: string, instanceId: string, result: 'approved' | 'rejected', comment?: string) {
    this.sendToUser(userId, {
      type: 'task_result',
      data: {
        taskId,
        instanceId,
        result,
        comment,
      },
      timestamp: Date.now(),
    });
  }

  // 推送超时提醒
  public sendTimeoutWarning(userId: string, taskId: string, taskName: string, instanceId: string) {
    this.sendToUser(userId, {
      type: 'timeout_warning',
      data: {
        taskId,
        taskName,
        instanceId,
      },
      timestamp: Date.now(),
    });
  }
}

let wsService: WebSocketService | null = null;

export const getWebSocketService = (): WebSocketService => {
  if (!wsService) {
    throw new Error('WebSocket service not initialized');
  }
  return wsService;
};

export const initializeWebSocketService = (server: http.Server): WebSocketService => {
  wsService = new WebSocketService(server);
  return wsService;
};