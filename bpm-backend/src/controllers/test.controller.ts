import { Context } from 'koa';
import { getWebSocketService } from '../services/websocket.service';

export const sendTestNotification = async (ctx: Context) => {
  try {
    const userId = ctx.state.user.userId;
    const wsService = getWebSocketService();
    
    console.log('发送测试通知给用户:', userId);
    
    const testMessage = {
      type: 'info',
      data: {
        title: '测试通知',
        message: '这是一条通过 WebSocket 发送的测试通知，时间：' + new Date().toLocaleTimeString(),
      },
      timestamp: Date.now(),
    };
    
    console.log('WebSocket 消息内容:', testMessage);
    
    wsService.sendToUser(userId, testMessage);
    
    console.log('测试通知已发送');
    
    ctx.body = {
      success: true,
      message: '测试通知已发送',
    };
  } catch (error: any) {
    console.error('发送测试通知失败:', error);
    ctx.status = 500;
    ctx.body = {
      success: false,
      message: error.message || '发送测试通知失败',
    };
  }
};