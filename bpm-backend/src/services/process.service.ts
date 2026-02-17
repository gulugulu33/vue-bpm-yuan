import prisma from '../config/database.config';
import { ProcessDefinition, PaginationParams, PaginationResult } from '../types';

export const getDefinitions = async (
  params: PaginationParams
): Promise<PaginationResult<ProcessDefinition>> => {
  const { page = 1, pageSize = 10, status } = params;
  const skip = (page - 1) * pageSize;

  const where: any = {};
  if (status) {
    where.status = status;
  }

  const [list, total] = await Promise.all([
    prisma.processDefinition.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.processDefinition.count({ where }),
  ]);

  return { list, total, page, pageSize };
};

export const createDefinition = async (
  data: {
    name: string;
    description?: string;
    definition: any;
  },
  createdBy: string
): Promise<ProcessDefinition> => {
  return await prisma.processDefinition.create({
    data: {
      name: data.name,
      description: data.description,
      definition: JSON.stringify(data.definition),
      createdBy,
      version: 1,
      status: 'draft',
    },
  });
};

export const updateDefinition = async (
  id: string,
  data: {
    name?: string;
    description?: string;
    definition?: any;
  }
): Promise<ProcessDefinition> => {
  const updateData: any = {
    updatedAt: new Date(),
  };
  
  if (data.name !== undefined) {
    updateData.name = data.name;
  }
  if (data.description !== undefined) {
    updateData.description = data.description;
  }
  if (data.definition !== undefined) {
    updateData.definition = JSON.stringify(data.definition);
  }
  
  return await prisma.processDefinition.update({
    where: { id },
    data: updateData,
  });
};

export const publishDefinition = async (
  id: string
): Promise<ProcessDefinition> => {
  return await prisma.processDefinition.update({
    where: { id },
    data: { status: 'published', updatedAt: new Date() },
  });
};

export const deleteDefinition = async (id: string): Promise<void> => {
  await prisma.processDefinition.delete({
    where: { id },
  });
};

export const getDefinitionById = async (
  id: string
): Promise<ProcessDefinition | null> => {
  return await prisma.processDefinition.findUnique({
    where: { id },
  });
};
