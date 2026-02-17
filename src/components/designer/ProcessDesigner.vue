<template>
  <div class="process-designer">
    <a-card :bordered="false" style="height: 100%; display: flex; flex-direction: column;">
      <template #title>
        <a-space>
          <a-button type="primary" @click="handleSave" :loading="saving">保存</a-button>
          <a-button @click="handleClear">清空</a-button>
          <a-button @click="handleExport">导出</a-button>
          <a-divider type="vertical" />
          <a-button @click="handleZoomIn" :disabled="zoom >= 2">放大</a-button>
          <a-button @click="handleZoomOut" :disabled="zoom <= 0.5">缩小</a-button>
          <a-button @click="handleZoomReset">重置</a-button>
          <a-divider type="vertical" />
          <a-button @click="handleUndo" :disabled="!canUndo">撤销</a-button>
          <a-button @click="handleRedo" :disabled="!canRedo">重做</a-button>
        </a-space>
      </template>
      <div class="designer-content">
        <div class="node-palette">
          <div class="palette-title">节点库</div>
          <div
            v-for="nodeType in nodeTypes"
            :key="nodeType.type"
            class="palette-item"
            draggable="true"
            @dragstart="handleDragStart($event, nodeType)"
          >
            <div class="palette-node" :style="{ backgroundColor: nodeType.color }">
              {{ nodeType.label }}
            </div>
          </div>
        </div>
        <div
          ref="containerRef"
          class="designer-container"
          @dragover.prevent
          @drop="handleDrop"
        ></div>
        <div v-if="selectedNode" class="node-properties">
          <div class="properties-title">节点属性</div>
          <a-form layout="vertical" size="small">
            <a-form-item label="节点名称">
              <a-input v-model:value="selectedNode.name" @change="updateNodeName" />
            </a-form-item>
            <a-form-item v-if="selectedNode.type === 'userTask'" label="审批人">
              <a-select
                v-model:value="selectedNode.assignee"
                placeholder="请选择审批人"
                @change="updateNodeProperty"
              >
                <a-select-option value="admin">管理员</a-select-option>
                <a-select-option value="manager">经理</a-select-option>
                <a-select-option value="director">总监</a-select-option>
              </a-select>
            </a-form-item>
            <a-form-item v-if="selectedNode.type === 'userTask'" label="审批方式">
              <a-select
                v-model:value="selectedNode.approvalType"
                placeholder="请选择审批方式"
                @change="updateNodeProperty"
              >
                <a-select-option value="sequential">会签</a-select-option>
                <a-select-option value="allApprove">或签</a-select-option>
                <a-select-option value="anyApprove">任意一人审批</a-select-option>
              </a-select>
            </a-form-item>
            <a-form-item v-if="selectedNode.type === 'exclusiveGateway'" label="条件表达式">
              <a-textarea
                v-model:value="selectedNode.condition"
                placeholder="请输入条件表达式，例如：amount > 1000"
                :rows="3"
                @change="updateNodeProperty"
              />
            </a-form-item>
            <a-form-item label="描述">
              <a-textarea
                v-model:value="selectedNode.description"
                placeholder="请输入描述"
                :rows="2"
                @change="updateNodeProperty"
              />
            </a-form-item>
            <a-form-item>
              <a-button type="primary" danger block @click="handleDeleteNode">删除节点</a-button>
            </a-form-item>
          </a-form>
        </div>
      </div>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, h } from 'vue';
import { Graph } from '@antv/x6';
import { Selection } from '@antv/x6-plugin-selection';
import { Snapline } from '@antv/x6-plugin-snapline';
import { Keyboard } from '@antv/x6-plugin-keyboard';
import { Clipboard } from '@antv/x6-plugin-clipboard';
import { History } from '@antv/x6-plugin-history';
import { Transform } from '@antv/x6-plugin-transform';
import { message, Modal } from 'ant-design-vue';
import { useProcessStore } from '../../stores/process';
import type { NodeData, EdgeData } from '../../types';
import { NodeType } from '../../types';
import { nanoid } from 'nanoid';

const processStore = useProcessStore();
const containerRef = ref<HTMLDivElement>();
const saving = ref(false);
const zoom = ref(1);
const canUndo = ref(false);
const canRedo = ref(false);
const selectedNode = ref<any>(null);

let graph: Graph | null = null;
let isLoadingDefinition = false;
let syncTimeout: number | null = null;

const nodeTypes = [
  { type: 'start', label: '开始', color: '#52c41a' },
  { type: 'end', label: '结束', color: '#ff4d4f' },
  { type: 'userTask', label: '用户任务', color: '#1677ff' },
  { type: 'exclusiveGateway', label: '条件网关', color: '#faad14' },
  { type: 'parallelGateway', label: '并行网关', color: '#722ed1' },
  { type: 'serviceTask', label: '服务任务', color: '#13c2c2' },
];

onMounted(() => {
  if (!containerRef.value) return;

  graph = new Graph({
    container: containerRef.value,
    width: '100%',
    height: '100%',
    grid: {
      visible: true,
      size: 10,
      type: 'dot',
      args: { color: '#d0d0d0', thickness: 1 },
    },
    panning: {
      enabled: true,
      modifiers: 'ctrl',
    },
    mousewheel: {
      enabled: true,
      modifiers: 'ctrl',
      factor: 1.1,
      maxScale: 2,
      minScale: 0.5,
    },
    connecting: {
      router: 'manhattan',
      connector: {
        name: 'rounded',
        args: {
          radius: 8,
        },
      },
      anchor: 'center',
      connectionPoint: 'anchor',
      allowBlank: false,
      snap: true,
      createEdge() {
        return graph?.createEdge({
          attrs: {
            line: {
              stroke: '#A2B1C3',
              strokeWidth: 2,
              targetMarker: {
                name: 'block',
                width: 12,
                height: 8,
              },
            },
          },
          zIndex: 0,
        });
      },
      validateConnection({ targetMagnet }: any) {
        return !!targetMagnet;
      },
    },
    highlighting: {
      magnetAdsorbed: {
        name: 'stroke',
        args: {
          attrs: {
            fill: '#5F95FF',
            stroke: '#5F95FF',
          },
        },
      },
    },
    background: {
      color: '#f5f5f5',
    },
  } as any);

  graph.use(new Selection({ enabled: true, multiple: true, rubberband: true }));
  graph.use(new Snapline({ enabled: true }));
  graph.use(new Keyboard({ enabled: true }));
  graph.use(new Clipboard({ enabled: true }));
  graph.use(new History());
  graph.use(new Transform());

  setupGraphEvents();
  loadDefinition();
  setupKeyboardShortcuts();
});

onUnmounted(() => {
  if (syncTimeout) {
    clearTimeout(syncTimeout);
  }
  graph?.dispose();
});

watch(() => processStore.currentDefinition?.id, (newId, oldId) => {
  if (newId && newId !== oldId) {
    loadDefinition();
  }
});

function setupGraphEvents() {
  if (!graph) return;

  graph.on('node:change:*', () => {
    debouncedSync();
  });

  graph.on('edge:change:*', () => {
    debouncedSync();
  });

  graph.on('node:moved', () => {
    debouncedSync();
  });

  graph.on('edge:connected', () => {
    debouncedSync();
  });

  graph.on('node:removed', () => {
    debouncedSync();
  });

  graph.on('edge:removed', () => {
    debouncedSync();
  });

  graph.on('cell:added', () => {
    debouncedSync();
  });

  graph.on('history:change', () => {
    if (graph) {
      const historyPlugin = graph.getPlugin('history');
      if (historyPlugin) {
        canUndo.value = (historyPlugin as any).canUndo();
        canRedo.value = (historyPlugin as any).canRedo();
      }
    }
  });

  graph.on('node:click', ({ node }) => {
    const fillColor = node.attr('body/fill') as string;
    const labelText = node.getAttrs().label?.text;
    selectedNode.value = {
      id: node.id,
      type: getNodeType(fillColor),
      name: String(labelText || '节点'),
      assignee: node.getData()?.assignee || '',
      approvalType: node.getData()?.approvalType || 'sequential',
      condition: node.getData()?.condition || '',
      description: node.getData()?.description || '',
    };
  });

  graph.on('blank:click', () => {
    selectedNode.value = null;
  });

  graph.on('edge:click', ({ edge }) => {
    const label = edge.getLabels()[0]?.text;
    const inputValue = ref(label || '');
    
    Modal.confirm({
      title: '编辑连线名称',
      content: () => h('div', [
        h('div', { style: { marginBottom: '8px' } }, '当前名称: ' + (label || '无')),
        h('input', {
          value: inputValue.value,
          onInput: (e: any) => { inputValue.value = e.target.value; },
          onVnodeMounted: (vnode: any) => {
            const el = vnode.el as HTMLInputElement;
            el.focus();
            el.select();
          },
          style: {
            width: '100%',
            padding: '8px',
            border: '1px solid #d9d9d9',
            borderRadius: '4px',
          },
        }),
      ]),
      okText: '确定',
      cancelText: '取消',
      onOk: () => {
        const newLabel = inputValue.value;
        if (newLabel !== null) {
          edge.setLabels([{ text: newLabel }]);
          debouncedSync();
        }
      },
    });
  });
}

function setupKeyboardShortcuts() {
  if (!graph) return;

  graph.bindKey('backspace', () => {
    const cells = graph?.getSelectedCells();
    if (cells && cells.length) {
      graph?.removeCells(cells);
    }
  });

  graph.bindKey('delete', () => {
    const cells = graph?.getSelectedCells();
    if (cells && cells.length) {
      graph?.removeCells(cells);
    }
  });

  graph.bindKey(['meta+z', 'ctrl+z'], () => {
    const historyPlugin = graph?.getPlugin('history');
    if (historyPlugin && (historyPlugin as any).canUndo()) {
      graph?.undo();
    }
  });

  graph.bindKey(['meta+shift+z', 'ctrl+shift+z'], () => {
    const historyPlugin = graph?.getPlugin('history');
    if (historyPlugin && (historyPlugin as any).canRedo()) {
      graph?.redo();
    }
  });

  graph.bindKey(['meta+c', 'ctrl+c'], () => {
    const cells = graph?.getSelectedCells();
    if (cells && cells.length) {
      graph?.copy(cells);
    }
  });

  graph.bindKey(['meta+v', 'ctrl+v'], () => {
    if (graph && !graph.isClipboardEmpty()) {
      const cells = graph.paste({ offset: 32 });
      graph.cleanSelection();
      graph.select(cells);
    }
  });

  graph.bindKey(['meta+x', 'ctrl+x'], () => {
    const cells = graph?.getSelectedCells();
    if (cells && cells.length) {
      graph?.cut(cells);
    }
  });
}

function debouncedSync() {
  if (syncTimeout) {
    clearTimeout(syncTimeout);
  }
  syncTimeout = window.setTimeout(() => {
    syncToStore();
  }, 500);
}

function loadDefinition() {
  const definition = processStore.currentDefinition;
  if (!definition || !graph || isLoadingDefinition) return;

  isLoadingDefinition = true;

  graph.clearCells();

  definition.nodes.forEach(node => {
    graph?.addNode({
      id: node.id,
      x: node.x || 100,
      y: node.y || 100,
      width: 120,
      height: 60,
      label: node.name,
      data: {
        assignee: node.assignee,
        approvalType: node.approvalType,
        condition: node.condition,
        description: node.description,
      },
      attrs: {
        body: {
          fill: getNodeColor(node.type),
          stroke: getNodeColor(node.type),
          rx: 6,
          ry: 6,
        },
        label: {
          fill: '#fff',
          fontSize: 14,
        },
      },
      ports: {
        groups: {
          top: { position: 'top', attrs: { circle: { r: 4, magnet: true, stroke: '#5F95FF', strokeWidth: 1, fill: '#fff' } } },
          bottom: { position: 'bottom', attrs: { circle: { r: 4, magnet: true, stroke: '#5F95FF', strokeWidth: 1, fill: '#fff' } } },
          left: { position: 'left', attrs: { circle: { r: 4, magnet: true, stroke: '#5F95FF', strokeWidth: 1, fill: '#fff' } } },
          right: { position: 'right', attrs: { circle: { r: 4, magnet: true, stroke: '#5F95FF', strokeWidth: 1, fill: '#fff' } } },
        },
        items: [
          { group: 'top' },
          { group: 'bottom' },
          { group: 'left' },
          { group: 'right' },
        ],
      },
    });
  });

  definition.edges.forEach(edge => {
    graph?.addEdge({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      labels: edge.label ? [{ text: edge.label }] : [],
      attrs: {
        line: {
          stroke: '#A2B1C3',
          strokeWidth: 2,
          targetMarker: {
            name: 'block',
            width: 12,
            height: 8,
          },
        },
      },
    });
  });

  isLoadingDefinition = false;
}

function getNodeColor(type: NodeType): string {
  switch (type) {
    case NodeType.START:
      return '#52c41a';
    case NodeType.END:
      return '#ff4d4f';
    case NodeType.EXCLUSIVE_GATEWAY:
      return '#faad14';
    case NodeType.PARALLEL_GATEWAY:
      return '#722ed1';
    case NodeType.SERVICE_TASK:
      return '#13c2c2';
    default:
      return '#1677ff';
  }
}

async function syncToStore() {
  const definition = processStore.currentDefinition;
  if (!definition || !graph) return;

  const nodes: NodeData[] = graph.getNodes().map(node => {
    const fillColor = node.attr('body/fill') as string;
    const labelText = node.getAttrs().label?.text;
    const data = node.getData() || {};
    return {
      id: node.id,
      type: getNodeType(fillColor),
      name: String(labelText || '节点'),
      x: node.position().x,
      y: node.position().y,
      assignee: data.assignee,
      approvalType: data.approvalType,
      condition: data.condition,
      description: data.description,
    };
  });

  const edges: EdgeData[] = graph.getEdges().map(edge => ({
    id: edge.id,
    source: edge.getSourceCellId()!,
    target: edge.getTargetCellId()!,
    label: edge.getLabels()[0]?.text as string,
  }));

  try {
    await processStore.updateNodesAndEdges(definition.id, nodes, edges);
  } catch (error: any) {
    console.error('保存失败:', error);
  }
}

function getNodeType(color: string): NodeType {
  switch (color) {
    case '#52c41a':
      return NodeType.START;
    case '#ff4d4f':
      return NodeType.END;
    case '#faad14':
      return NodeType.EXCLUSIVE_GATEWAY;
    case '#722ed1':
      return NodeType.PARALLEL_GATEWAY;
    case '#13c2c2':
      return NodeType.SERVICE_TASK;
    default:
      return NodeType.USER_TASK;
  }
}

async function handleSave() {
  if (!processStore.currentDefinition) {
    message.warning('请先选择或创建流程');
    return;
  }
  
  saving.value = true;
  try {
    await syncToStore();
    message.success('保存成功');
  } catch (error: any) {
    message.error('保存失败: ' + (error.message || '未知错误'));
  } finally {
    saving.value = false;
  }
}

function handleClear() {
  if (!graph) return;
  
  Modal.confirm({
    title: '确认清空',
    content: '确定要清空画布吗？此操作不可恢复。',
    okText: '确定',
    cancelText: '取消',
    onOk: () => {
      if (graph) {
        graph.clearCells();
        selectedNode.value = null;
        message.success('画布已清空');
      }
    },
  });
}

function handleExport() {
  if (!graph) return;
  
  try {
    const data = graph.toJSON();
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `process-${processStore.currentDefinition?.name || 'export'}.json`;
    a.click();
    URL.revokeObjectURL(url);
    message.success('导出成功');
  } catch (error: any) {
    message.error('导出失败: ' + (error.message || '未知错误'));
  }
}

function handleZoomIn() {
  if (!graph) return;
  const currentScale = graph.zoom();
  const newScale = Math.min(currentScale * 1.1, 2);
  graph.zoomTo(newScale);
  zoom.value = newScale;
}

function handleZoomOut() {
  if (!graph) return;
  const currentScale = graph.zoom();
  const newScale = Math.max(currentScale * 0.9, 0.5);
  graph.zoomTo(newScale);
  zoom.value = newScale;
}

function handleZoomReset() {
  if (!graph) return;
  graph.zoomTo(1);
  graph.centerContent();
  zoom.value = 1;
}

function handleUndo() {
  if (!graph) return;
  graph.undo();
}

function handleRedo() {
  if (!graph) return;
  graph.redo();
}

function handleDragStart(event: DragEvent, nodeType: any) {
  if (event.dataTransfer) {
    event.dataTransfer.setData('nodeType', JSON.stringify(nodeType));
  }
}

function handleDrop(event: DragEvent) {
  if (!graph || !containerRef.value || !processStore.currentDefinition) {
    message.warning('请先选择或创建流程');
    return;
  }

  const nodeTypeStr = event.dataTransfer?.getData('nodeType');
  if (!nodeTypeStr) return;

  const nodeType = JSON.parse(nodeTypeStr);
  const rect = containerRef.value.getBoundingClientRect();
  const x = event.clientX - rect.left - 60;
  const y = event.clientY - rect.top - 30;

  const id = nanoid();
  const nodeData: any = {
    id,
    x,
    y,
    width: 120,
    height: 60,
    label: nodeType.label,
    type: nodeType.type,
    data: {},
  };

  graph.addNode({
    id,
    x,
    y,
    width: 120,
    height: 60,
    label: nodeType.label,
    data: nodeData.data,
    attrs: {
      body: {
        fill: nodeType.color,
        stroke: nodeType.color,
        rx: 6,
        ry: 6,
      },
      label: {
        fill: '#fff',
        fontSize: 14,
      },
    },
    ports: {
      groups: {
        top: { position: 'top', attrs: { circle: { r: 4, magnet: true, stroke: '#5F95FF', strokeWidth: 1, fill: '#fff' } } },
        bottom: { position: 'bottom', attrs: { circle: { r: 4, magnet: true, stroke: '#5F95FF', strokeWidth: 1, fill: '#fff' } } },
        left: { position: 'left', attrs: { circle: { r: 4, magnet: true, stroke: '#5F95FF', strokeWidth: 1, fill: '#fff' } } },
        right: { position: 'right', attrs: { circle: { r: 4, magnet: true, stroke: '#5F95FF', strokeWidth: 1, fill: '#fff' } } },
      },
      items: [
        { group: 'top' },
        { group: 'bottom' },
        { group: 'left' },
        { group: 'right' },
      ],
    },
  });

  message.success('节点已添加');
}

function updateNodeName() {
  if (!graph || !selectedNode.value) return;
  
  const node = graph.getCellById(selectedNode.value.id);
  if (node) {
    node.setAttrs({ label: { text: selectedNode.value.name } });
    debouncedSync();
  }
}

function updateNodeProperty() {
  if (!graph || !selectedNode.value) return;
  
  const node = graph.getCellById(selectedNode.value.id);
  if (node) {
    node.setData({
      assignee: selectedNode.value.assignee,
      approvalType: selectedNode.value.approvalType,
      condition: selectedNode.value.condition,
      description: selectedNode.value.description,
    });
    debouncedSync();
  }
}

function handleDeleteNode() {
  if (!graph || !selectedNode.value) return;
  
  Modal.confirm({
    title: '确认删除',
    content: '确定要删除这个节点吗？此操作不可恢复。',
    okText: '确定',
    cancelText: '取消',
    onOk: () => {
      if (graph && selectedNode.value) {
        const node = graph.getCellById(selectedNode.value.id);
        if (node) {
          graph.removeCell(node);
          selectedNode.value = null;
          message.success('节点已删除');
        }
      }
    },
  });
}
</script>

<style scoped>
.process-designer {
  height: 100%;
}

.designer-content {
  display: flex;
  flex: 1;
  gap: 16px;
  min-height: 0;
}

.node-palette {
  width: 160px;
  background: #fafafa;
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  padding: 12px;
  overflow-y: auto;
}

.palette-title {
  font-weight: 500;
  margin-bottom: 12px;
  color: #262626;
}

.palette-item {
  margin-bottom: 8px;
  cursor: move;
}

.palette-node {
  padding: 8px 12px;
  border-radius: 4px;
  color: white;
  text-align: center;
  font-size: 12px;
  user-select: none;
}

.designer-container {
  flex: 1;
  min-height: 500px;
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  background: #f5f5f5;
}

.node-properties {
  width: 280px;
  background: #fafafa;
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  padding: 12px;
  overflow-y: auto;
}

.properties-title {
  font-weight: 500;
  margin-bottom: 12px;
  color: #262626;
}
</style>
