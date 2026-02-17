import { Context } from 'koa';
import * as taskService from '../services/task.service';
import { successResponse } from '../utils/response.util';

export const getTasks = async (ctx: Context) => {
  const { page = 1, pageSize = 10, status, assignee } = ctx.query;
  const userId = ctx.state.user.userId;
  const result = await taskService.getTasks({
    page: Number(page),
    pageSize: Number(pageSize),
    status: status as string,
    assignee: assignee as string || userId,
  });
  successResponse(ctx, result);
};

export const getMyPendingTasks = async (ctx: Context) => {
  const userId = ctx.state.user.userId;
  const result = await taskService.getMyPendingTasks(userId);
  successResponse(ctx, result);
};

export const completeTask = async (ctx: Context) => {
  const { id } = ctx.params;
  const { variables, comment } = ctx.request.body as any;
  const userId = ctx.state.user.userId;
  const result = await taskService.completeTask(id, userId, variables, comment);
  successResponse(ctx, result, '任务完成');
};

export const rejectTask = async (ctx: Context) => {
  const { id } = ctx.params;
  const { comment } = ctx.request.body as any;
  const userId = ctx.state.user.userId;
  const result = await taskService.rejectTask(id, userId, comment);
  successResponse(ctx, result, '任务已拒绝');
};

export const delegateTask = async (ctx: Context) => {
  const { id } = ctx.params;
  const { toUserId, comment } = ctx.request.body as any;
  const userId = ctx.state.user.userId;
  const result = await taskService.delegateTask(id, userId, toUserId, comment);
  successResponse(ctx, result, '委派成功');
};
