import { Context } from 'koa';
import * as instanceService from '../services/instance.service';
import { successResponse } from '../utils/response.util';

export const getInstances = async (ctx: Context) => {
  const { page = 1, pageSize = 10, status, definitionId } = ctx.query;
  const result = await instanceService.getInstances({
    page: Number(page),
    pageSize: Number(pageSize),
    status: status as string,
    definitionId: definitionId as string,
  });
  successResponse(ctx, result);
};

export const startInstance = async (ctx: Context) => {
  const data = ctx.request.body as any;
  const userId = ctx.state.user.userId;
  const result = await instanceService.startInstance(data, userId);
  successResponse(ctx, result, '发起成功');
};

export const getInstance = async (ctx: Context) => {
  const { id } = ctx.params;
  const result = await instanceService.getInstance(id);
  successResponse(ctx, result);
};

export const cancelInstance = async (ctx: Context) => {
  const { id } = ctx.params;
  await instanceService.cancelInstance(id);
  successResponse(ctx, null, '终止成功');
};
