<template>
  <MainLayout>
    <div class="tasks-page">
      <a-card :bordered="false">
        <template #title>
          <a-space>
            <a-radio-group v-model:value="activeTab" button-style="solid">
              <a-radio-button value="my">我的待办</a-radio-button>
              <a-radio-button value="pending">全部待办</a-radio-button>
              <a-radio-button value="approved">已处理</a-radio-button>
            </a-radio-group>
          </a-space>
        </template>

        <a-table
          :columns="columns"
          :data-source="filteredTasks"
          :pagination="{ pageSize: 10 }"
          row-key="id"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'status'">
              <a-tag :color="getTaskStatusColor(record.status)">{{ getTaskStatusText(record.status) }}</a-tag>
            </template>
            <template v-else-if="column.key === 'action'">
              <a-space v-if="record.status === 'pending'">
                <a-button type="link" size="small" @click="handleTaskDetail(record.id)">处理</a-button>
                <a-button type="link" size="small" @click="showViewModal(record)">查看</a-button>
              </a-space>
              <a-button v-else type="link" size="small" @click="showViewModal(record)">查看</a-button>
            </template>
          </template>
        </a-table>
      </a-card>
    </div>

    <a-modal
      v-model:open="approveModalVisible"
      title="处理任务"
      @ok="handleApprove"
      width="600px"
    >
      <a-form layout="vertical">
        <a-form-item label="处理结果">
          <a-radio-group v-model:value="approveForm.action">
            <a-radio value="approve">同意</a-radio>
            <a-radio value="reject">拒绝</a-radio>
          </a-radio-group>
        </a-form-item>
        <a-form-item label="备注">
          <a-textarea v-model:value="approveForm.comment" placeholder="请输入备注" :rows="3" />
        </a-form-item>
        <a-form-item label="流程变量">
          <a-textarea v-model:value="approveForm.variablesJson" placeholder="请输入JSON格式的变量" :rows="3" />
        </a-form-item>
      </a-form>
    </a-modal>

    <a-modal
      v-model:open="viewModalVisible"
      title="任务详情"
      width="700px"
      :footer="null"
    >
      <a-descriptions :column="2" bordered v-if="currentTask">
        <a-descriptions-item label="任务ID">{{ currentTask.id }}</a-descriptions-item>
        <a-descriptions-item label="状态">
          <a-tag :color="getTaskStatusColor(currentTask.status)">{{ getTaskStatusText(currentTask.status) }}</a-tag>
        </a-descriptions-item>
        <a-descriptions-item label="任务名称">{{ currentTask.nodeName }}</a-descriptions-item>
        <a-descriptions-item label="处理人">{{ currentTask.assignee || '-' }}</a-descriptions-item>
        <a-descriptions-item label="创建时间">{{ formatDate(currentTask.createdAt) }}</a-descriptions-item>
        <a-descriptions-item label="完成时间">{{ currentTask.completedAt ? formatDate(currentTask.completedAt) : '-' }}</a-descriptions-item>
      </a-descriptions>
      <a-divider />
      <a-typography-title :level="4">流程变量</a-typography-title>
      <a-typography-paragraph>
        <pre>{{ JSON.stringify(currentTask?.variables || {}, null, 2) }}</pre>
      </a-typography-paragraph>
    </a-modal>
  </MainLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { message } from 'ant-design-vue';
import MainLayout from '../components/layout/MainLayout.vue';
import { useTaskStore } from '../stores/instance';
import { useProcessStore } from '../stores/process';
import type { TaskStatus } from '../types';
import type { ColumnsType } from 'ant-design-vue/es/table';
import type { Task } from '../types';

const router = useRouter();
const taskStore = useTaskStore();
const processStore = useProcessStore();

const activeTab = ref<'my' | 'pending' | 'approved'>('my');
const approveModalVisible = ref(false);
const viewModalVisible = ref(false);
const currentTask = ref<Task | null>(null);
const approveForm = ref({
  action: 'approve' as 'approve' | 'reject',
  variablesJson: '{}',
  comment: '',
});

onMounted(() => {
  taskStore.fetchTasks();
  processStore.fetchDefinitions();
});

const filteredTasks = computed(() => {
  if (activeTab.value === 'my') return taskStore.myTasks;
  if (activeTab.value === 'pending') return taskStore.pendingTasks;
  return taskStore.approvedTasks;
});

const columns: ColumnsType = [
  { title: '任务ID', dataIndex: 'id', key: 'id', width: 200 },
  { title: '任务名称', dataIndex: 'nodeName', key: 'nodeName', width: 150 },
  { title: '流程名称', key: 'defName', width: 150, customRender: ({ record }) => getDefinitionName((record as any).definitionId) },
  { title: '状态', key: 'status', width: 100 },
  { title: '处理人', dataIndex: 'assignee', key: 'assignee', width: 100 },
  { title: '创建时间', key: 'createdAt', width: 180, customRender: ({ record }) => formatDate((record as any).createdAt) },
  { title: '操作', key: 'action', width: 150, fixed: 'right' },
];

function getDefinitionName(definitionId: string) {
  const def = processStore.definitions.find(d => d.id === definitionId);
  return def?.name || definitionId;
}

function formatDate(timestamp: number) {
  return new Date(timestamp).toLocaleString('zh-CN');
}

function getTaskStatusColor(status: TaskStatus) {
  const colors: Record<TaskStatus, string> = {
    pending: 'orange',
    approved: 'green',
    rejected: 'red',
    delegated: 'blue',
  };
  return colors[status];
}

function getTaskStatusText(status: TaskStatus) {
  const texts: Record<TaskStatus, string> = {
    pending: '待处理',
    approved: '已同意',
    rejected: '已拒绝',
    delegated: '已委派',
  };
  return texts[status];
}

function showViewModal(task: Task) {
  currentTask.value = task;
  viewModalVisible.value = true;
}

function handleApprove() {
  if (!currentTask.value) return;
  
  try {
    const variables = JSON.parse(approveForm.value.variablesJson || '{}');
    
    if (approveForm.value.action === 'approve') {
      taskStore.completeTask(currentTask.value.id, variables, approveForm.value.comment);
    } else {
      taskStore.rejectTask(currentTask.value.id, approveForm.value.comment);
    }
    
    approveModalVisible.value = false;
    message.success('处理成功');
  } catch (e) {
    message.error('变量JSON格式错误');
  }
}

function handleTaskDetail(taskId: string) {
  router.push(`/tasks/${taskId}`);
}
</script>

<style scoped>
.tasks-page {
  height: 100%;
}
</style>
