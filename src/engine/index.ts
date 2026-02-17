import type { ProcessDefinition, ProcessInstance, NodeData, Task } from '../types';
import { nanoid } from 'nanoid';
import { InstanceStatus, TaskStatus } from '../types';
export * from './approvalPath';

export class BpmEngine {
  static evaluateCondition(condition: string, variables: Record<string, any>): boolean {
    try {
      const fn = new Function(...Object.keys(variables), `return ${condition}`);
      return fn(...Object.values(variables));
    } catch (error) {
      console.error('Condition evaluation error:', error);
      return true;
    }
  }

  static startProcess(definition: ProcessDefinition, businessKey?: string, variables: Record<string, any> = {}): ProcessInstance {
    const now = Date.now();
    const instance: ProcessInstance = {
      id: nanoid(),
      definitionId: definition.id,
      definitionVersion: definition.version,
      businessKey,
      status: InstanceStatus.RUNNING,
      currentNodeIds: [],
      variables: { ...variables },
      history: [],
      executedNodes: [],
      createdAt: now,
      startedAt: now,
      startedBy: 'admin',
    };

    const startNode = definition.nodes.find(n => n.type === 'start');
    if (startNode) {
      this.executeNode(instance, definition, startNode);
    }

    return instance;
  }

  static completeTask(
    instance: ProcessInstance,
    definition: ProcessDefinition,
    task: Task,
    variables: Record<string, any> = {},
    comment?: string
  ) {
    instance.variables = { ...instance.variables, ...variables };

    instance.history.push({
      id: nanoid(),
      nodeId: task.nodeId,
      nodeName: task.nodeName,
      type: 'complete',
      timestamp: Date.now(),
      operator: 'admin',
      comment,
    });

    const node = definition.nodes.find(n => n.id === task.nodeId);
    if (node) {
      const nextNodeIds = this.getNextNodes(definition, node, instance.variables);
      
      for (const nextNodeId of nextNodeIds) {
        const nextNode = definition.nodes.find(n => n.id === nextNodeId);
        if (nextNode) {
          this.executeNode(instance, definition, nextNode);
        }
      }
    }
  }

  static rejectTask(
    instance: ProcessInstance,
    definition: ProcessDefinition,
    task: Task,
    comment?: string
  ) {
    instance.history.push({
      id: nanoid(),
      nodeId: task.nodeId,
      nodeName: task.nodeName,
      type: 'complete',
      timestamp: Date.now(),
      operator: 'admin',
      comment,
    });

    const node = definition.nodes.find(n => n.id === task.nodeId);
    if (node) {
      const incomingEdges = definition.edges.filter(e => e.target === node.id);
      if (incomingEdges.length > 0) {
        const prevEdge = incomingEdges[0];
        if (prevEdge) {
          const prevNode = definition.nodes.find(n => n.id === prevEdge.source);
          if (prevNode) {
            this.executeNode(instance, definition, prevNode);
          }
        }
      }
    }
  }

  private static executeNode(
    instance: ProcessInstance,
    definition: ProcessDefinition,
    node: NodeData
  ) {
    if (instance.executedNodes.includes(node.id)) {
      return;
    }
    
    instance.executedNodes.push(node.id);
    
    instance.history.push({
      id: nanoid(),
      nodeId: node.id,
      nodeName: node.name,
      type: 'enter',
      timestamp: Date.now(),
    });

    switch (node.type) {
      case 'start':
      case 'serviceTask':
        const nextNodeIds = this.getNextNodes(definition, node, instance.variables);
        for (const nextNodeId of nextNodeIds) {
          const nextNode = definition.nodes.find(n => n.id === nextNodeId);
          if (nextNode) {
            this.executeNode(instance, definition, nextNode);
          }
        }
        break;

      case 'userTask':
        instance.currentNodeIds.push(node.id);
        this.createTask(instance, definition, node);
        break;

      case 'exclusiveGateway':
        const exclusiveNext = this.getNextNodes(definition, node, instance.variables);
        if (exclusiveNext.length > 0) {
          const nextNode = definition.nodes.find(n => n.id === exclusiveNext[0]);
          if (nextNode) {
            this.executeNode(instance, definition, nextNode);
          }
        }
        break;

      case 'parallelGateway':
        const parallelNext = this.getNextNodes(definition, node, instance.variables);
        for (const nextNodeId of parallelNext) {
          const nextNode = definition.nodes.find(n => n.id === nextNodeId);
          if (nextNode) {
            this.executeNode(instance, definition, nextNode);
          }
        }
        break;

      case 'end':
        instance.status = InstanceStatus.COMPLETED;
        instance.endedAt = Date.now();
        instance.currentNodeIds = [];
        break;
    }
  }

  private static getNextNodes(
    definition: ProcessDefinition,
    node: NodeData,
    variables: Record<string, any>
  ): string[] {
    const outEdges = definition.edges.filter(e => e.source === node.id);
    
    if (node.type === 'exclusiveGateway') {
      for (const edge of outEdges) {
        if (!edge.condition || this.evaluateCondition(edge.condition, variables)) {
          return [edge.target];
        }
      }
      return [];
    }

    return outEdges.map(e => e.target);
  }

  private static createTask(
    instance: ProcessInstance,
    definition: ProcessDefinition,
    node: NodeData
  ): Task {
    return {
      id: nanoid(),
      instanceId: instance.id,
      definitionId: definition.id,
      nodeId: node.id,
      nodeName: node.name,
      status: TaskStatus.PENDING,
      assignee: node.assignee,
      candidateUsers: node.candidateUsers,
      candidateGroups: node.candidateGroups,
      variables: { ...instance.variables },
      createdAt: Date.now(),
    };
  }
}
