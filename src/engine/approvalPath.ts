import type { ProcessDefinition, FormContext, ApprovalPathNode } from '../types';

export function evaluateCondition(
  condition: string,
  context: FormContext
): boolean {
  if (!condition) return true;

  try {
    const func = new Function('context', `return ${condition}`);
    return func(context);
  } catch (error) {
    console.error('Condition evaluation error:', error);
    return false;
  }
}

export function resolveNextNodeId(
  definition: ProcessDefinition,
  currentNodeId: string,
  context: FormContext
): string | null {
  const currentNode = definition.nodes.find(n => n.id === currentNodeId);
  if (!currentNode) return null;

  const outgoingEdges = definition.edges.filter(e => e.source === currentNodeId);

  if (outgoingEdges.length === 0) {
    return null;
  }

  if (outgoingEdges.length === 1) {
    return outgoingEdges[0]?.target || null;
  }

  for (const edge of outgoingEdges) {
    if (edge?.condition) {
      if (evaluateCondition(edge.condition, context)) {
        return edge.target;
      }
    }
  }

  return outgoingEdges[0]?.target || null;
}

export function buildApprovalPath(
  definition: ProcessDefinition,
  context: FormContext
): ApprovalPathNode[] {
  const startNode = definition.nodes.find(n => n.type === 'start');
  if (!startNode) return [];

  const visited = new Set<string>();
  const result: ApprovalPathNode[] = [];

  let cursor: string | null = startNode.id;
  let guard = 0;

  while (cursor && guard < 200) {
    guard++;

    if (visited.has(cursor)) break;
    visited.add(cursor);

    const node = definition.nodes.find(n => n.id === cursor);
    if (!node) break;

    if (node.type === 'userTask') {
      const label = node.approverRoles && node.approverRoles.length > 0
        ? `${node.approverRoles.join(' / ')}${node.approvalMode === 'allApprove' ? '（会签）' : node.approvalMode === 'anyApprove' ? '（或签）' : ''}`
        : node.name;

      result.push({
        id: node.id,
        label,
        approverRoles: node.approverRoles,
        approvalMode: node.approvalMode,
      });
    }

    if (node.type === 'end') break;

    const next = resolveNextNodeId(definition, cursor, context);
    cursor = next;
  }

  return result;
}

export function getDefinitionSnapshot(
  definition: ProcessDefinition
): ProcessDefinition {
  return {
    ...definition,
    nodes: definition.nodes.map(node => ({
      ...node,
      conditions: node.conditions || [],
    })),
    edges: definition.edges.map(edge => ({
      ...edge,
      condition: edge.condition || undefined,
    })),
  };
}
