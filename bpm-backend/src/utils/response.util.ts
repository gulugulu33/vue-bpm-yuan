import { Context } from 'koa';
import { ApiResponse } from '../types';

export const successResponse = <T>(
  ctx: Context,
  data?: T,
  message: string = 'success'
): void => {
  ctx.body = {
    code: 200,
    message,
    data,
  } as ApiResponse<T>;
};

export const errorResponse = (
  ctx: Context,
  code: number,
  message: string
): void => {
  ctx.status = code;
  ctx.body = {
    code,
    message,
  } as ApiResponse;
};
