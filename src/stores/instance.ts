import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { ProcessInstance, Task } from '../types';
import { instanceApi, taskApi } from '../api';

export const useInstanceStore = defineStore('instance', () => {
  const instances = ref<ProcessInstance[]>([]);
  const currentInstance = ref<ProcessInstance | null>(null);
  const loading = ref(false);

  const runningInstances = computed(() => 
    instances.value.filter(i => i.status === 'running')
  );

  const completedInstances = computed(() => 
    instances.value.filter(i => i.status === 'completed')
  );

  async function fetchInstances(params?: { page?: number; pageSize?: number; status?: string; definitionId?: string }) {
    loading.value = true;
    try {
      const data: any = await instanceApi.getInstances(params);
      instances.value = data.list.map((item: any) => ({
        ...item,
        variables: typeof item.variables === 'string' 
          ? JSON.parse(item.variables) 
          : item.variables,
        currentNodeIds: typeof item.currentNodeIds === 'string' 
          ? JSON.parse(item.currentNodeIds) 
          : item.currentNodeIds,
        history: item.history?.map((h: any) => ({
          ...h,
          timestamp: new Date(h.timestamp).getTime(),
        })) || [],
        createdAt: new Date(item.createdAt).getTime(),
        startedAt: new Date(item.startedAt).getTime(),
        endedAt: item.endedAt ? new Date(item.endedAt).getTime() : undefined,
      }));
    } finally {
      loading.value = false;
    }
  }

  async function startProcess(definitionId: string, businessKey?: string, variables: Record<string, any> = {}) {
    const result: any = await instanceApi.startInstance({
      definitionId,
      businessKey,
      variables,
    });
    const parsedResult = {
      ...result,
      variables: typeof result.variables === 'string' 
        ? JSON.parse(result.variables) 
        : result.variables,
      currentNodeIds: typeof result.currentNodeIds === 'string' 
        ? JSON.parse(result.currentNodeIds) 
        : result.currentNodeIds,
      history: result.history?.map((h: any) => ({
        ...h,
        timestamp: new Date(h.timestamp).getTime(),
      })) || [],
      createdAt: new Date(result.createdAt).getTime(),
      startedAt: new Date(result.startedAt).getTime(),
      endedAt: result.endedAt ? new Date(result.endedAt).getTime() : undefined,
    };
    instances.value.push(parsedResult);
    currentInstance.value = parsedResult;
    return parsedResult;
  }

  async function cancelInstance(instanceId: string) {
    await instanceApi.cancelInstance(instanceId);
    const index = instances.value.findIndex(i => i.id === instanceId);
    if (index !== -1) {
      instances.value.splice(index, 1);
    }
  }

  async function getInstance(instanceId: string) {
    const result: any = await instanceApi.getInstance(instanceId);
    const parsedResult = {
      ...result,
      variables: typeof result.variables === 'string' 
        ? JSON.parse(result.variables) 
        : result.variables,
      currentNodeIds: typeof result.currentNodeIds === 'string' 
        ? JSON.parse(result.currentNodeIds) 
        : result.currentNodeIds,
      history: result.history?.map((h: any) => ({
        ...h,
        timestamp: new Date(h.timestamp).getTime(),
      })) || [],
      createdAt: new Date(result.createdAt).getTime(),
      startedAt: new Date(result.startedAt).getTime(),
      endedAt: result.endedAt ? new Date(result.endedAt).getTime() : undefined,
    };
    currentInstance.value = parsedResult;
    return parsedResult;
  }

  function setCurrentInstance(instanceId: string) {
    const instance = instances.value.find(i => i.id === instanceId);
    currentInstance.value = instance || null;
  }

  return {
    instances,
    currentInstance,
    loading,
    runningInstances,
    completedInstances,
    fetchInstances,
    startProcess,
    cancelInstance,
    getInstance,
    setCurrentInstance,
  };
});

export const useTaskStore = defineStore('task', () => {
  const tasks = ref<Task[]>([]);
  const loading = ref(false);

  const myTasks = computed(() => 
    tasks.value.filter(t => t.status === 'pending')
  );

  const pendingTasks = computed(() => 
    tasks.value.filter(t => t.status === 'pending')
  );

  const approvedTasks = computed(() => 
    tasks.value.filter(t => t.status === 'approved' || t.status === 'rejected')
  );

  async function fetchTasks(params?: { page?: number; pageSize?: number; status?: string; assignee?: string }) {
    loading.value = true;
    try {
      const data: any = await taskApi.getTasks(params);
      tasks.value = data.list.map((item: any) => ({
        ...item,
        variables: typeof item.variables === 'string' 
          ? JSON.parse(item.variables) 
          : item.variables,
        candidateUsers: typeof item.candidateUsers === 'string' 
          ? JSON.parse(item.candidateUsers) 
          : item.candidateUsers,
        candidateGroups: typeof item.candidateGroups === 'string' 
          ? JSON.parse(item.candidateGroups) 
          : item.candidateGroups,
        createdAt: new Date(item.createdAt).getTime(),
        claimedAt: item.claimedAt ? new Date(item.claimedAt).getTime() : undefined,
        completedAt: item.completedAt ? new Date(item.completedAt).getTime() : undefined,
      }));
    } finally {
      loading.value = false;
    }
  }

  async function fetchMyPendingTasks() {
    loading.value = true;
    try {
      const result: any = await taskApi.getMyPendingTasks();
      tasks.value = result.map((item: any) => ({
        ...item,
        variables: typeof item.variables === 'string' 
          ? JSON.parse(item.variables) 
          : item.variables,
        candidateUsers: typeof item.candidateUsers === 'string' 
          ? JSON.parse(item.candidateUsers) 
          : item.candidateUsers,
        candidateGroups: typeof item.candidateGroups === 'string' 
          ? JSON.parse(item.candidateGroups) 
          : item.candidateGroups,
        createdAt: new Date(item.createdAt).getTime(),
        claimedAt: item.claimedAt ? new Date(item.claimedAt).getTime() : undefined,
        completedAt: item.completedAt ? new Date(item.completedAt).getTime() : undefined,
      }));
    } finally {
      loading.value = false;
    }
  }

  async function completeTask(taskId: string, variables: Record<string, any> = {}, comment?: string) {
    const result: any = await taskApi.completeTask(taskId, { variables, comment });
    const parsedResult = {
      ...result,
      variables: typeof result.variables === 'string' 
        ? JSON.parse(result.variables) 
        : result.variables,
      candidateUsers: typeof result.candidateUsers === 'string' 
        ? JSON.parse(result.candidateUsers) 
        : result.candidateUsers,
      candidateGroups: typeof result.candidateGroups === 'string' 
        ? JSON.parse(result.candidateGroups) 
        : result.candidateGroups,
      createdAt: new Date(result.createdAt).getTime(),
      claimedAt: result.claimedAt ? new Date(result.claimedAt).getTime() : undefined,
      completedAt: result.completedAt ? new Date(result.completedAt).getTime() : undefined,
    };
    const index = tasks.value.findIndex(t => t.id === taskId);
    if (index !== -1) {
      tasks.value[index] = parsedResult;
    }
  }

  async function rejectTask(taskId: string, comment?: string) {
    const result: any = await taskApi.rejectTask(taskId, { comment });
    const parsedResult = {
      ...result,
      variables: typeof result.variables === 'string' 
        ? JSON.parse(result.variables) 
        : result.variables,
      candidateUsers: typeof result.candidateUsers === 'string' 
        ? JSON.parse(result.candidateUsers) 
        : result.candidateUsers,
      candidateGroups: typeof result.candidateGroups === 'string' 
        ? JSON.parse(result.candidateGroups) 
        : result.candidateGroups,
      createdAt: new Date(result.createdAt).getTime(),
      claimedAt: result.claimedAt ? new Date(result.claimedAt).getTime() : undefined,
      completedAt: result.completedAt ? new Date(result.completedAt).getTime() : undefined,
    };
    const index = tasks.value.findIndex(t => t.id === taskId);
    if (index !== -1) {
      tasks.value[index] = parsedResult;
    }
  }

  async function delegateTask(taskId: string, toUserId: string, comment?: string) {
    const result: any = await taskApi.delegateTask(taskId, { toUserId, comment });
    const parsedResult = {
      ...result,
      variables: typeof result.variables === 'string' 
        ? JSON.parse(result.variables) 
        : result.variables,
      candidateUsers: typeof result.candidateUsers === 'string' 
        ? JSON.parse(result.candidateUsers) 
        : result.candidateUsers,
      candidateGroups: typeof result.candidateGroups === 'string' 
        ? JSON.parse(result.candidateGroups) 
        : result.candidateGroups,
      createdAt: new Date(result.createdAt).getTime(),
      claimedAt: result.claimedAt ? new Date(result.claimedAt).getTime() : undefined,
      completedAt: result.completedAt ? new Date(result.completedAt).getTime() : undefined,
    };
    const index = tasks.value.findIndex(t => t.id === taskId);
    if (index !== -1) {
      tasks.value[index] = parsedResult;
    }
  }

  function addTask(task: Task) {
    tasks.value.push(task);
  }

  return {
    tasks,
    loading,
    myTasks,
    pendingTasks,
    approvedTasks,
    fetchTasks,
    fetchMyPendingTasks,
    completeTask,
    rejectTask,
    delegateTask,
    addTask,
  };
});
