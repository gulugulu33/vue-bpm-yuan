import { Context, Next } from 'koa';

export const loggerMiddleware = async (ctx: Context, next: Next) => {
  const start = Date.now();
  
  await next();
  
  const ms = Date.now() - start;
  console.log(`${ctx.method} ${ctx.url} - ${ctx.status} - ${ms}ms`);
};
