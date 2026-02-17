<template>
  <MainLayout>
    <div class="instance-detail-container">
      <a-page-header
        :title="instance?.definitionId"
        @back="goBack"
      >
      <template #extra>
        <a-space>
          <a-tag :color="getStatusColor(instance?.status)">
            {{ getStatusText(instance?.status) }}
          </a-tag>
        </a-space>
      </template>
    </a-page-header>

    <a-row :gutter="24">
      <a-col :span="16">
        <a-card title="流程信息" :bordered="false">
          <a-descriptions :column="2" bordered>
            <a-descriptions-item label="流程名称">
              {{ getDefinitionName(instance?.definitionId) }}
            </a-descriptions-item>
            <a-descriptions-item label="业务键">
              {{ instance?.businessKey || '-' }}
            </a-descriptions-item>
            <a-descriptions-item label="状态">
              <a-tag :color="getStatusColor(instance?.status)">
                {{ getStatusText(instance?.status) }}
              </a-tag>
            </a-descriptions-item>
            <a-descriptions-item label="发起人">
              {{ instance?.startedBy }}
            </a-descriptions-item>
            <a-descriptions-item label="创建时间">
              {{ formatDate(instance?.createdAt) }}
            </a-descriptions-item>
            <a-descriptions-item label="结束时间">
              {{ formatDate(instance?.endedAt) }}
            </a-descriptions-item>
          </a-descriptions>
        </a-card>

        <a-card title="流程变量" :bordered="false" style="margin-top: 24px">
          <a-descriptions v-if="instance?.variables" :column="2" bordered>
            <a-descriptions-item
              v-for="(value, key) in instance.variables"
              :key="key"
              :label="key"
            >
              {{ formatValue(value) }}
            </a-descriptions-item>
          </a-descriptions>
          <a-empty v-else description="暂无流程变量" />
        </a-card>
      </a-col>

      <a-col :span="8">
        <a-card title="审批历史" :bordered="false">
          <a-timeline>
            <a-timeline-item
              v-for="history in instance?.history"
              :key="history.id"
              :color="getHistoryColor(history.type)"
            >
              <div>
                <div style="font-weight: 500">{{ history.nodeName }}</div>
                <div style="color: #999; font-size: 12px">
                  {{ formatDate(history.timestamp) }}
                </div>
                <div v-if="history.operator" style="color: #666; font-size: 12px">
                  操作人：{{ history.operator }}
                </div>
                <div v-if="history.comment" style="color: #666; font-size: 12px">
                  备注：{{ history.comment }}
                </div>
              </div>
            </a-timeline-item>
          </a-timeline>
        </a-card>
      </a-col>
    </a-row>
  </div>
  </MainLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { message } from 'ant-design-vue';
import MainLayout from '../components/layout/MainLayout.vue';
import { useInstanceStore } from '../stores/instance';
import { useProcessStore } from '../stores/process';
import type { ProcessInstance } from '../types';

const route = useRoute();
const router = useRouter();
const instanceStore = useInstanceStore();
const processStore = useProcessStore();

const instance = ref<ProcessInstance | null>(null);

const getDefinitionName = (definitionId?: string) => {
  if (!definitionId) return '-';
  const definition = processStore.definitions.find(d => d.id === definitionId);
  return definition?.name || definitionId;
};

const getStatusColor = (status?: string) => {
  const colorMap: Record<string, string> = {
    running: 'processing',
    completed: 'success',
    suspended: 'warning',
    cancelled: 'error',
  };
  return colorMap[status || ''] || 'default';
};

const getStatusText = (status?: string) => {
  const textMap: Record<string, string> = {
    running: '运行中',
    completed: '已完成',
    suspended: '已挂起',
    cancelled: '已取消',
  };
  return textMap[status || ''] || status || '-';
};

const getHistoryColor = (type: string) => {
  const colorMap: Record<string, string> = {
    enter: 'blue',
    leave: 'gray',
    complete: 'green',
  };
  return colorMap[type] || 'gray';
};

const formatDate = (timestamp?: number) => {
  if (!timestamp) return '-';
  return new Date(timestamp).toLocaleString('zh-CN');
};

const formatValue = (value: any) => {
  if (value === null || value === undefined) return '-';
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
};

const goBack = () => {
  router.back();
};

onMounted(async () => {
  const instanceId = route.params.id as string;
  try {
    await Promise.all([
      instanceStore.getInstance(instanceId),
      processStore.fetchDefinitions(),
    ]);
    instance.value = instanceStore.currentInstance;
  } catch (error: any) {
    message.error(error.message || '加载实例详情失败');
  }
});
</script>

<style scoped>
.instance-detail-container {
  padding: 24px;
}
</style>
