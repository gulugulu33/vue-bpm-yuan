<template>
  <MainLayout>
    <div class="my-applications-container">
      <a-card title="我的申请" :bordered="false">
      <template #extra>
        <a-space>
          <a-button type="primary" @click="goToApply">
            发起新申请
          </a-button>
        </a-space>
      </template>

      <a-table
        :columns="columns"
        :data-source="myInstances"
        :loading="loading"
        :pagination="pagination"
        @change="handleTableChange"
        row-key="id"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'definitionName'">
            {{ getDefinitionName(record.definitionId) }}
          </template>
          <template v-else-if="column.key === 'status'">
            <a-tag :color="getStatusColor(record.status)">
              {{ getStatusText(record.status) }}
            </a-tag>
          </template>
          <template v-else-if="column.key === 'currentNode'">
            {{ getCurrentNodeName(record) }}
          </template>
          <template v-else-if="column.key === 'createdAt'">
            {{ formatDate(record.createdAt) }}
          </template>
          <template v-else-if="column.key === 'actions'">
            <a-space>
              <a-button type="link" size="small" @click="viewDetail(record)">
                查看详情
              </a-button>
            </a-space>
          </template>
        </template>
      </a-table>
    </a-card>
  </div>
  </MainLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { message } from 'ant-design-vue';
import MainLayout from '../components/layout/MainLayout.vue';
import { useInstanceStore } from '../stores/instance';
import { useProcessStore } from '../stores/process';
import { useAuthStore } from '../stores/auth';
import type { ProcessInstance } from '../types';

const router = useRouter();
const instanceStore = useInstanceStore();
const processStore = useProcessStore();
const authStore = useAuthStore();

const loading = ref(false);
const pagination = ref({
  current: 1,
  pageSize: 10,
  total: 0,
});

const columns = [
  {
    title: '流程名称',
    dataIndex: 'definitionId',
    key: 'definitionName',
  },
  {
    title: '业务键',
    dataIndex: 'businessKey',
    key: 'businessKey',
  },
  {
    title: '状态',
    dataIndex: 'status',
    key: 'status',
  },
  {
    title: '当前节点',
    key: 'currentNode',
  },
  {
    title: '创建时间',
    dataIndex: 'createdAt',
    key: 'createdAt',
  },
  {
    title: '操作',
    key: 'actions',
  },
];

const myInstances = computed(() => {
  return instanceStore.instances.filter(i => i.startedBy === authStore.user?.id);
});

const getDefinitionName = (definitionId: string) => {
  const definition = processStore.definitions.find(d => d.id === definitionId);
  return definition?.name || definitionId;
};

const getStatusColor = (status: string) => {
  const colorMap: Record<string, string> = {
    running: 'processing',
    completed: 'success',
    suspended: 'warning',
    cancelled: 'error',
  };
  return colorMap[status] || 'default';
};

const getStatusText = (status: string) => {
  const textMap: Record<string, string> = {
    running: '运行中',
    completed: '已完成',
    suspended: '已挂起',
    cancelled: '已取消',
  };
  return textMap[status] || status;
};

const getCurrentNodeName = (instance: ProcessInstance) => {
  if (instance.status === 'completed') {
    return '已结束';
  }
  if (instance.currentNodeIds.length === 0) {
    return '无';
  }
  const definition = processStore.definitions.find(d => d.id === instance.definitionId);
  if (!definition) return '未知';
  
  const currentNode = definition.nodes.find(n => instance.currentNodeIds.includes(n.id));
  return currentNode?.name || '未知';
};

const formatDate = (timestamp: number) => {
  return new Date(timestamp).toLocaleString('zh-CN');
};

const goToApply = () => {
  router.push('/apply');
};

const viewDetail = (instance: ProcessInstance) => {
  router.push(`/instances/${instance.id}`);
};

const handleTableChange = (pag: any) => {
  pagination.value.current = pag.current;
  pagination.value.pageSize = pag.pageSize;
};

onMounted(async () => {
  loading.value = true;
  try {
    await Promise.all([
      instanceStore.fetchInstances(),
      processStore.fetchDefinitions(),
    ]);
  } catch (error: any) {
    message.error(error.message || '加载数据失败');
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
.my-applications-container {
  padding: 24px;
}
</style>
