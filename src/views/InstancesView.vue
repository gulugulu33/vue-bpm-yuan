<template>
  <MainLayout>
    <div class="instances-page">
      <a-card :bordered="false">
        <template #title>
          <a-space>
            <a-radio-group v-model:value="activeTab" button-style="solid">
              <a-radio-button value="running">运行中</a-radio-button>
              <a-radio-button value="completed">已完成</a-radio-button>
              <a-radio-button value="all">全部</a-radio-button>
            </a-radio-group>
          </a-space>
        </template>
        <template #extra>
          <a-button type="primary" @click="showStartModal">
            发起流程
          </a-button>
        </template>

        <a-table
          :columns="columns"
          :data-source="filteredInstances"
          :pagination="{ pageSize: 10 }"
          row-key="id"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'status'">
              <a-tag :color="getStatusColor(record.status)">{{ getStatusText(record.status) }}</a-tag>
            </template>
            <template v-else-if="column.key === 'action'">
              <a-space>
                <a-button type="link" size="small" @click="viewInstance(record)">查看</a-button>
                <a-popconfirm
                  v-if="record.status === 'running'"
                  title="确定要终止此流程吗？"
                  @confirm="cancelInstance(record.id)"
                >
                  <a-button type="link" size="small" danger>终止</a-button>
                </a-popconfirm>
              </a-space>
            </template>
          </template>
        </a-table>
      </a-card>
    </div>

    <a-modal
      v-model:open="startModalVisible"
      title="发起流程"
      @ok="handleStart"
      width="600px"
    >
      <a-form layout="vertical">
        <a-form-item label="选择流程">
          <a-select v-model:value="startForm.definitionId" placeholder="请选择流程" style="width: 100%">
            <a-select-option
              v-for="def in processStore.publishedDefinitions"
              :key="def.id"
              :value="def.id"
            >
              {{ def.name }}
            </a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="业务键">
          <a-input v-model:value="startForm.businessKey" placeholder="请输入业务键" />
        </a-form-item>
        <a-form-item label="流程变量">
          <a-textarea v-model:value="startForm.variablesJson" placeholder="请输入JSON格式的变量" :rows="4" />
        </a-form-item>
      </a-form>
    </a-modal>

    <a-modal
      v-model:open="viewModalVisible"
      title="流程详情"
      width="700px"
      :footer="null"
    >
      <a-descriptions :column="2" bordered v-if="currentInstance">
        <a-descriptions-item label="实例ID">{{ currentInstance.id }}</a-descriptions-item>
        <a-descriptions-item label="状态">
          <a-tag :color="getStatusColor(currentInstance.status)">{{ getStatusText(currentInstance.status) }}</a-tag>
        </a-descriptions-item>
        <a-descriptions-item label="流程定义ID">{{ currentInstance.definitionId }}</a-descriptions-item>
        <a-descriptions-item label="版本">{{ currentInstance.definitionVersion }}</a-descriptions-item>
        <a-descriptions-item label="创建时间">{{ formatDate(currentInstance.createdAt) }}</a-descriptions-item>
        <a-descriptions-item label="启动时间">{{ formatDate(currentInstance.startedAt) }}</a-descriptions-item>
      </a-descriptions>
      <a-divider />
      <a-typography-title :level="4">流转记录</a-typography-title>
      <a-timeline v-if="currentInstance">
        <a-timeline-item v-for="item in currentInstance.history" :key="item.id">
          <a-typography-paragraph>
            <a-typography-text strong>{{ item.nodeName }}</a-typography-text>
            <a-typography-text type="secondary" style="margin-left: 8px">{{ getHistoryTypeText(item.type) }}</a-typography-text>
          </a-typography-paragraph>
          <a-typography-text type="secondary" style="font-size: 12px">
            {{ formatDate(item.timestamp) }}
            <span v-if="item.operator" style="margin-left: 12px">操作人：{{ item.operator }}</span>
          </a-typography-text>
          <a-typography-paragraph v-if="item.comment" style="margin-top: 8px">
            备注：{{ item.comment }}
          </a-typography-paragraph>
        </a-timeline-item>
      </a-timeline>
    </a-modal>
  </MainLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { message } from 'ant-design-vue';
import MainLayout from '../components/layout/MainLayout.vue';
import { useInstanceStore } from '../stores/instance';
import { useProcessStore } from '../stores/process';
import type { InstanceStatus } from '../types';
import type { ColumnsType } from 'ant-design-vue/es/table';

const instanceStore = useInstanceStore();
const processStore = useProcessStore();

const activeTab = ref<'running' | 'completed' | 'all'>('running');
const startModalVisible = ref(false);
const viewModalVisible = ref(false);
const startForm = ref({
  definitionId: '',
  businessKey: '',
  variablesJson: '{}',
});
const currentInstance = ref<typeof instanceStore.currentInstance>();

onMounted(() => {
  instanceStore.fetchInstances();
  processStore.fetchDefinitions();
});

const filteredInstances = computed(() => {
  if (activeTab.value === 'running') return instanceStore.runningInstances;
  if (activeTab.value === 'completed') return instanceStore.completedInstances;
  return instanceStore.instances;
});

const columns: ColumnsType = [
  { title: '实例ID', dataIndex: 'id', key: 'id', width: 200 },
  { title: '业务键', dataIndex: 'businessKey', key: 'businessKey' },
  { title: '状态', key: 'status', width: 100 },
  { title: '创建时间', key: 'createdAt', width: 180, customRender: ({ record }) => formatDate((record as any).createdAt) },
  { title: '操作', key: 'action', width: 150, fixed: 'right' },
];

function formatDate(timestamp: number) {
  return new Date(timestamp).toLocaleString('zh-CN');
}

function getStatusColor(status: InstanceStatus) {
  const colors: Record<InstanceStatus, string> = {
    running: 'blue',
    completed: 'green',
    suspended: 'orange',
    cancelled: 'red',
  };
  return colors[status];
}

function getStatusText(status: InstanceStatus) {
  const texts: Record<InstanceStatus, string> = {
    running: '运行中',
    completed: '已完成',
    suspended: '已暂停',
    cancelled: '已取消',
  };
  return texts[status];
}

function getHistoryTypeText(type: string) {
  const texts: Record<string, string> = {
    enter: '进入',
    leave: '离开',
    complete: '完成',
  };
  return texts[type] || type;
}

function showStartModal() {
  startForm.value = { definitionId: '', businessKey: '', variablesJson: '{}' };
  startModalVisible.value = true;
}

function handleStart() {
  if (!startForm.value.definitionId) {
    message.warning('请选择流程');
    return;
  }
  try {
    const variables = JSON.parse(startForm.value.variablesJson || '{}');
    instanceStore.startProcess(startForm.value.definitionId, startForm.value.businessKey, variables);
    startModalVisible.value = false;
    message.success('发起成功');
  } catch (e) {
    message.error('变量JSON格式错误');
  }
}

function viewInstance(record: any) {
  instanceStore.setCurrentInstance(record.id);
  currentInstance.value = instanceStore.currentInstance;
  viewModalVisible.value = true;
}

function cancelInstance(id: string) {
  instanceStore.cancelInstance(id);
  message.success('已终止');
}
</script>

<style scoped>
.instances-page {
  height: 100%;
}
</style>
