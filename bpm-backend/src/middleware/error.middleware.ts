import { Context, Next } from 'koa';

export const errorMiddleware = async (ctx: Context, next: Next) => {
  try {
    await next();
  } catch (error: any) {
    console.error('Error:', error);
    
    ctx.status = error.status || 500;
    ctx.body = {
      code: error.status || 500,
      message: error.message || '服务器内部错误',
    };
  }
};
