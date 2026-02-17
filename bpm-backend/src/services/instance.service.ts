import prisma from '../config/database.config';
import { ProcessInstance, PaginationParams, PaginationResult } from '../types';
import * as processService from './process.service';
import * as taskService from './task.service';

export const getInstances = async (
  params: PaginationParams & { definitionId?: string }
): Promise<PaginationResult<ProcessInstance>> => {
  const { page = 1, pageSize = 10, status, definitionId } = params;
  const skip = (page - 1) * pageSize;

  const where: any = {};
  if (status) {
    where.status = status;
  }
  if (definitionId) {
    where.definitionId = definitionId;
  }

  const [list, total] = await Promise.all([
    prisma.processInstance.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: { createdAt: 'desc' },
      include: {
        definition: true,
      },
    }),
    prisma.processInstance.count({ where }),
  ]);

  return { list, total, page, pageSize };
};

export const startInstance = async (
  data: {
    definitionId: string;
    businessKey?: string;
    variables?: any;
  },
  startedBy: string
): Promise<ProcessInstance> => {
  const { definitionId, businessKey, variables } = data;

  const definition = await processService.getDefinitionById(definitionId);
  if (!definition) {
    throw new Error('流程定义不存在');
  }

  if (definition.status !== 'published') {
    throw new Error('流程定义未发布');
  }

  const instance = await prisma.processInstance.create({
    data: {
      definitionId,
      definitionVersion: definition.version,
      businessKey,
      status: 'running',
      variables: variables ? JSON.stringify(variables) : null,
      currentNodeIds: JSON.stringify([]),
      startedBy,
    },
  });

  await executeProcess(instance.id, definition, startedBy);

  return instance;
};

export const getInstance = async (
  id: string
): Promise<ProcessInstance & { history: any[] }> => {
  const instance = await prisma.processInstance.findUnique({
    where: { id },
    include: {
      definition: true,
      histories: {
        orderBy: { timestamp: 'asc' },
      },
    },
  });

  if (!instance) {
    throw new Error('流程实例不存在');
  }

  return instance as any;
};

export const cancelInstance = async (id: string): Promise<void> => {
  const instance = await prisma.processInstance.findUnique({
    where: { id },
  });

  if (!instance) {
    throw new Error('流程实例不存在');
  }

  if (instance.status !== 'running') {
    throw new Error('流程实例未运行中');
  }

  await prisma.processInstance.update({
    where: { id },
    data: {
      status: 'cancelled',
      endedAt: new Date(),
    },
  });

  await prisma.task.updateMany({
    where: {
      instanceId: id,
      status: 'pending',
    },
    data: {
      status: 'cancelled',
      completedAt: new Date(),
    },
  });
};

const executeProcess = async (
  instanceId: string,
  definition: any,
  startedBy: string
): Promise<void> => {
  const definitionData = typeof definition.definition === 'string' 
    ? JSON.parse(definition.definition) 
    : definition.definition;
  const nodes = definitionData.nodes || [];
  const edges = definitionData.edges || [];

  const startNode = nodes.find((node: any) => node.type === 'start');
  if (!startNode) {
    throw new Error('流程定义缺少开始节点');
  }

  let currentNodeIds: string[] = [startNode.id];
  const executedNodes: string[] = [];

  while (currentNodeIds.length > 0) {
    const nodeId = currentNodeIds.shift()!;

    if (executedNodes.includes(nodeId)) {
      continue;
    }

    const node = nodes.find((n: any) => n.id === nodeId);
    if (!node) {
      continue;
    }

    executedNodes.push(nodeId);

    await prisma.processHistory.create({
      data: {
        instanceId,
        nodeId: node.id,
        nodeName: node.label || node.id,
        type: node.type,
        timestamp: new Date(),
      },
    });

    if (node.type === 'userTask') {
      const candidateUsers = node.data?.candidateUsers || [];
      const candidateGroups = node.data?.candidateGroups || [];
      const assignee = node.data?.assignee || startedBy;

      await prisma.task.create({
        data: {
          instanceId,
          definitionId: definition.id,
          nodeId: node.id,
          nodeName: node.label || node.id,
          status: 'pending',
          assignee,
          candidateUsers: JSON.stringify(candidateUsers),
          candidateGroups: JSON.stringify(candidateGroups),
        },
      });

      await prisma.processInstance.update({
        where: { id: instanceId },
        data: {
          currentNodeIds: JSON.stringify([...currentNodeIds, ...executedNodes.filter((id) => !currentNodeIds.includes(id))]),
        },
      });

      return;
    }

    const outgoingEdges = edges.filter((edge: any) => edge.source === nodeId);
    for (const edge of outgoingEdges) {
      currentNodeIds.push(edge.target);
    }
  }

  await prisma.processInstance.update({
    where: { id: instanceId },
    data: {
      status: 'completed',
      endedAt: new Date(),
      currentNodeIds: JSON.stringify([]),
    },
  });
};
