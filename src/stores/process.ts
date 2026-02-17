import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { ProcessDefinition, NodeData, EdgeData } from '../types';
import { NodeType, ProcessStatus } from '../types';
import { nanoid } from 'nanoid';
import { processApi } from '../api';

export const useProcessStore = defineStore('process', () => {
  const definitions = ref<ProcessDefinition[]>([]);
  const currentDefinition = ref<ProcessDefinition | null>(null);
  const loading = ref(false);

  const publishedDefinitions = computed(() => 
    definitions.value.filter(d => d.status === 'published')
  );

  const draftDefinitions = computed(() => 
    definitions.value.filter(d => d.status === 'draft')
  );

  async function fetchDefinitions(params?: { page?: number; pageSize?: number; status?: string }) {
    loading.value = true;
    try {
      const data: any = await processApi.getDefinitions(params);
      definitions.value = data.list.map((item: any) => ({
        ...item,
        definition: typeof item.definition === 'string' 
          ? JSON.parse(item.definition) 
          : item.definition,
        nodes: typeof item.definition === 'string' 
          ? JSON.parse(item.definition).nodes || [] 
          : item.definition?.nodes || [],
        edges: typeof item.definition === 'string' 
          ? JSON.parse(item.definition).edges || [] 
          : item.definition?.edges || [],
        createdAt: new Date(item.createdAt).getTime(),
        updatedAt: new Date(item.updatedAt).getTime(),
      }));
    } finally {
      loading.value = false;
    }
  }

  async function createDefinition(name: string, description?: string): Promise<ProcessDefinition> {
    const now = Date.now();
    const definition: ProcessDefinition = {
      id: nanoid(),
      name,
      description,
      version: 1,
      status: ProcessStatus.DRAFT,
      nodes: [
        {
          id: 'start',
          type: NodeType.START,
          name: '开始',
          x: 100,
          y: 100,
        },
        {
          id: 'end',
          type: NodeType.END,
          name: '结束',
          x: 500,
          y: 100,
        },
      ],
      edges: [],
      createdAt: now,
      updatedAt: now,
      createdBy: 'admin',
    };
    
    const result: any = await processApi.createDefinition({
      name,
      description,
      definition: {
        nodes: definition.nodes,
        edges: definition.edges,
      },
    });
    
    const parsedResult: ProcessDefinition = {
      ...result,
      definition: typeof result.definition === 'string' 
        ? JSON.parse(result.definition) 
        : result.definition,
      nodes: typeof result.definition === 'string' 
        ? JSON.parse(result.definition).nodes || [] 
        : result.definition?.nodes || [],
      edges: typeof result.definition === 'string' 
        ? JSON.parse(result.definition).edges || [] 
        : result.definition?.edges || [],
      createdAt: new Date(result.createdAt).getTime(),
      updatedAt: new Date(result.updatedAt).getTime(),
    };
    
    definitions.value.push(parsedResult);
    currentDefinition.value = parsedResult;
    
    return parsedResult;
  }

  async function updateDefinitionData(id: string, nodes?: NodeData[], edges?: EdgeData[]) {
    const index = definitions.value.findIndex(d => d.id === id);
    if (index === -1) return;
    
    const current = definitions.value[index];
    if (!current) return;
    
    const updatedNodes = nodes || current.nodes;
    const updatedEdges = edges || current.edges;
    
    const result: any = await processApi.updateDefinition(id, {
      name: current.name,
      description: current.description,
      definition: {
        nodes: updatedNodes,
        edges: updatedEdges,
      },
    });
    
    const parsedResult: ProcessDefinition = {
      ...result,
      definition: typeof result.definition === 'string' 
        ? JSON.parse(result.definition) 
        : result.definition,
      nodes: typeof result.definition === 'string' 
        ? JSON.parse(result.definition).nodes || [] 
        : result.definition?.nodes || [],
      edges: typeof result.definition === 'string' 
        ? JSON.parse(result.definition).edges || [] 
        : result.definition?.edges || [],
      createdAt: new Date(result.createdAt).getTime(),
      updatedAt: new Date(result.updatedAt).getTime(),
    };
    
    definitions.value[index] = parsedResult;
    if (currentDefinition.value?.id === id) {
      currentDefinition.value = parsedResult;
    }
  }

  async function updateDefinition(id: string, updates: Partial<ProcessDefinition>) {
    const index = definitions.value.findIndex(d => d.id === id);
    if (index !== -1) {
      const current = definitions.value[index];
      const updated = {
        ...current,
        ...updates,
        updatedAt: Date.now(),
      };
      
      const result: any = await processApi.updateDefinition(id, {
        name: updated.name,
        description: updated.description,
        definition: {
          nodes: updated.nodes,
          edges: updated.edges,
        },
      });
      
      const parsedResult: ProcessDefinition = {
        ...result,
        definition: typeof result.definition === 'string' 
          ? JSON.parse(result.definition) 
          : result.definition,
        nodes: typeof result.definition === 'string' 
          ? JSON.parse(result.definition).nodes || [] 
          : result.definition?.nodes || [],
        edges: typeof result.definition === 'string' 
          ? JSON.parse(result.definition).edges || [] 
          : result.definition?.edges || [],
        createdAt: new Date(result.createdAt).getTime(),
        updatedAt: new Date(result.updatedAt).getTime(),
      };
      
      definitions.value[index] = parsedResult;
      if (currentDefinition.value?.id === id) {
        currentDefinition.value = parsedResult;
      }
    }
  }

  async function updateNodesAndEdges(id: string, nodes: NodeData[], edges: EdgeData[]) {
    await updateDefinitionData(id, nodes, edges);
  }

  async function updateNodes(id: string, nodes: NodeData[]) {
    const index = definitions.value.findIndex(d => d.id === id);
    if (index !== -1) {
      const current = definitions.value[index];
      if (current) {
        await updateDefinitionData(id, nodes, current.edges);
      }
    }
  }

  async function updateEdges(id: string, edges: EdgeData[]) {
    const index = definitions.value.findIndex(d => d.id === id);
    if (index !== -1) {
      const current = definitions.value[index];
      if (current) {
        await updateDefinitionData(id, current.nodes, edges);
      }
    }
  }

  async function publishDefinition(id: string) {
    const result: any = await processApi.publishDefinition(id);
    const parsedResult: ProcessDefinition = {
      ...result,
      definition: typeof result.definition === 'string' 
        ? JSON.parse(result.definition) 
        : result.definition,
      nodes: typeof result.definition === 'string' 
        ? JSON.parse(result.definition).nodes || [] 
        : result.definition?.nodes || [],
      edges: typeof result.definition === 'string' 
        ? JSON.parse(result.definition).edges || [] 
        : result.definition?.edges || [],
      createdAt: new Date(result.createdAt).getTime(),
      updatedAt: new Date(result.updatedAt).getTime(),
    };
    const index = definitions.value.findIndex(d => d.id === id);
    if (index !== -1) {
      definitions.value[index] = parsedResult;
    }
    if (currentDefinition.value?.id === id) {
      currentDefinition.value = parsedResult;
    }
  }

  async function deleteDefinition(id: string) {
    await processApi.deleteDefinition(id);
    const index = definitions.value.findIndex(d => d.id === id);
    if (index !== -1) {
      definitions.value.splice(index, 1);
      if (currentDefinition.value?.id === id) {
        currentDefinition.value = null;
      }
    }
  }

  function setCurrentDefinition(id: string) {
    const definition = definitions.value.find(d => d.id === id);
    currentDefinition.value = definition || null;
  }

  return {
    definitions,
    currentDefinition,
    loading,
    publishedDefinitions,
    draftDefinitions,
    fetchDefinitions,
    createDefinition,
    updateDefinition,
    updateNodes,
    updateEdges,
    updateNodesAndEdges,
    publishDefinition,
    deleteDefinition,
    setCurrentDefinition,
  };
});
