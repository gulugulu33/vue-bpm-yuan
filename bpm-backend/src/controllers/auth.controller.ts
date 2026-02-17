import { Context } from 'koa';
import * as authService from '../services/auth.service';
import { successResponse } from '../utils/response.util';

export const register = async (ctx: Context) => {
  const { username, email, password, fullName } = ctx.request.body as any;
  const result = await authService.register({
    username,
    email,
    password,
    fullName,
  });
  successResponse(ctx, result, '注册成功');
};

export const login = async (ctx: Context) => {
  const { username, password } = ctx.request.body as any;
  const result = await authService.login(username, password);
  successResponse(ctx, result, '登录成功');
};
