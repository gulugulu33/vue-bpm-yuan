import request from './request';

export const authApi = {
  login: (data: { username: string; password: string }) => 
    request.post('/auth/login', data),
  
  register: (data: { username: string; email: string; password: string; fullName?: string }) => 
    request.post('/auth/register', data),
};

export const processApi = {
  getDefinitions: (params?: { page?: number; pageSize?: number; status?: string }) => 
    request.get('/process-definitions', { params }),
  
  createDefinition: (data: { name: string; description?: string; definition: any }) => 
    request.post('/process-definitions', data),
  
  updateDefinition: (id: string, data: { name?: string; description?: string; definition?: any }) => 
    request.put(`/process-definitions/${id}`, data),
  
  publishDefinition: (id: string) => 
    request.post(`/process-definitions/${id}/publish`),
  
  deleteDefinition: (id: string) => 
    request.delete(`/process-definitions/${id}`),
};

export const instanceApi = {
  getInstances: (params?: { page?: number; pageSize?: number; status?: string; definitionId?: string }) => 
    request.get('/process-instances', { params }),
  
  startInstance: (data: { definitionId: string; businessKey?: string; variables?: any }) => 
    request.post('/process-instances', data),
  
  getInstance: (id: string) => 
    request.get(`/process-instances/${id}`),
  
  cancelInstance: (id: string) => 
    request.post(`/process-instances/${id}/cancel`),
};

export const taskApi = {
  getTasks: (params?: { page?: number; pageSize?: number; status?: string; assignee?: string }) => 
    request.get('/tasks', { params }),
  
  getMyPendingTasks: () => 
    request.get('/tasks/my-pending'),
  
  completeTask: (id: string, data: { variables?: any; comment?: string }) => 
    request.post(`/tasks/${id}/complete`, data),
  
  rejectTask: (id: string, data: { comment?: string }) => 
    request.post(`/tasks/${id}/reject`, data),
  
  delegateTask: (id: string, data: { toUserId: string; comment?: string }) => 
    request.post(`/tasks/${id}/delegate`, data),
};
