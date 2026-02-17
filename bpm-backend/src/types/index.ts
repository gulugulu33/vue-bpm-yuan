export interface User {
  id: string;
  username: string;
  email: string;
  password: string;
  fullName: string | null;
  role: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProcessDefinition {
  id: string;
  name: string;
  description: string | null;
  version: number;
  status: string;
  definition: any;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProcessInstance {
  id: string;
  definitionId: string;
  definitionVersion: number;
  businessKey: string | null;
  status: string;
  variables: any;
  currentNodeIds: string | null;
  createdAt: Date;
  startedAt: Date;
  endedAt: Date | null;
  startedBy: string;
}

export interface Task {
  id: string;
  instanceId: string;
  definitionId: string;
  nodeId: string;
  nodeName: string;
  status: string;
  assignee: string | null;
  candidateUsers: string | null;
  candidateGroups: string | null;
  variables: any;
  createdAt: Date;
  claimedAt: Date | null;
  completedAt: Date | null;
}

export interface ProcessHistory {
  id: string;
  instanceId: string;
  nodeId: string;
  nodeName: string;
  type: string;
  timestamp: Date;
  operator: string | null;
  comment: string | null;
}

export interface JwtPayload {
  userId: string;
  username: string;
  email: string;
  role: string;
}

export interface ApiResponse<T = any> {
  code: number;
  message: string;
  data?: T;
}

export interface PaginationParams {
  page?: number;
  pageSize?: number;
  status?: string;
}

export interface PaginationResult<T> {
  list: T[];
  total: number;
  page: number;
  pageSize: number;
}
