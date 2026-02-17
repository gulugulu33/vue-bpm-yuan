import { Context } from 'koa';
import * as processService from '../services/process.service';
import { successResponse } from '../utils/response.util';

export const getDefinitions = async (ctx: Context) => {
  const { page = 1, pageSize = 10, status } = ctx.query;
  const result = await processService.getDefinitions({
    page: Number(page),
    pageSize: Number(pageSize),
    status: status as string,
  });
  successResponse(ctx, result);
};

export const createDefinition = async (ctx: Context) => {
  const data = ctx.request.body as any;
  const userId = ctx.state.user.userId;
  const result = await processService.createDefinition(data, userId);
  successResponse(ctx, result, '创建成功');
};

export const updateDefinition = async (ctx: Context) => {
  const { id } = ctx.params;
  const data = ctx.request.body as any;
  const result = await processService.updateDefinition(id, data);
  successResponse(ctx, result, '更新成功');
};

export const publishDefinition = async (ctx: Context) => {
  const { id } = ctx.params;
  const result = await processService.publishDefinition(id);
  successResponse(ctx, result, '发布成功');
};

export const deleteDefinition = async (ctx: Context) => {
  const { id } = ctx.params;
  await processService.deleteDefinition(id);
  successResponse(ctx, null, '删除成功');
};
