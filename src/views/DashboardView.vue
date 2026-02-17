<template>
  <MainLayout>
    <div class="dashboard-container">
      <a-row :gutter="24" style="margin-bottom: 24px">
      <a-col :span="6">
        <a-card>
          <a-statistic
            title="总申请数"
            :value="statistics.totalInstances"
            :value-style="{ color: '#3f8600' }"
          />
        </a-card>
      </a-col>
      <a-col :span="6">
        <a-card>
          <a-statistic
            title="审批中"
            :value="statistics.runningInstances"
            :value-style="{ color: '#1890ff' }"
          />
        </a-card>
      </a-col>
      <a-col :span="6">
        <a-card>
          <a-statistic
            title="已完成"
            :value="statistics.completedInstances"
            :value-style="{ color: '#52c41a' }"
          />
        </a-card>
      </a-col>
      <a-col :span="6">
        <a-card>
          <a-statistic
            title="通过率"
            :value="statistics.approvalRate"
            suffix="%"
            :precision="2"
            :value-style="{ color: '#cf1322' }"
          />
        </a-card>
      </a-col>
    </a-row>

    <a-row :gutter="24" style="margin-bottom: 24px">
      <a-col :span="12">
        <a-card title="审批转化漏斗" :bordered="false">
          <div class="funnel-chart">
            <div
              v-for="item in funnelData"
              :key="item.label"
              class="funnel-item"
              :style="{ width: `${item.percentage}%` }"
            >
              <div class="funnel-label">{{ item.label }}</div>
              <div class="funnel-value">{{ item.value }}</div>
            </div>
          </div>
        </a-card>
      </a-col>
      <a-col :span="12">
        <a-card title="流程分布" :bordered="false">
          <div class="process-chart">
            <div
              v-for="item in processDistribution"
              :key="item.name"
              class="process-item"
            >
              <div class="process-label">{{ item.name }}</div>
              <div class="process-bar">
                <div
                  class="process-bar-fill"
                  :style="{ width: `${item.percentage}%` }"
                />
              </div>
              <div class="process-value">{{ item.count }}</div>
            </div>
          </div>
        </a-card>
      </a-col>
    </a-row>

    <a-row :gutter="24">
      <a-col :span="24">
        <a-card title="最近活动" :bordered="false">
          <a-timeline>
            <a-timeline-item
              v-for="activity in recentActivities"
              :key="activity.id"
              :color="getActivityColor(activity.type)"
            >
              <div>
                <div style="font-weight: 500">{{ activity.title }}</div>
                <div style="color: #999; font-size: 12px">
                  {{ formatDate(activity.timestamp) }}
                </div>
                <div v-if="activity.operator" style="color: #666; font-size: 12px">
                  操作人：{{ activity.operator }}
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
import { computed, onMounted } from 'vue';
import { message } from 'ant-design-vue';
import MainLayout from '../components/layout/MainLayout.vue';
import { useInstanceStore } from '../stores/instance';
import { useProcessStore } from '../stores/process';

const instanceStore = useInstanceStore();
const processStore = useProcessStore();

const statistics = computed(() => {
  const instances = instanceStore.instances;
  const totalInstances = instances.length;
  const runningInstances = instances.filter(i => i.status === 'running').length;
  const completedInstances = instances.filter(i => i.status === 'completed').length;
  
  const approvalRate = totalInstances > 0 ? (completedInstances / totalInstances) * 100 : 0;

  return {
    totalInstances,
    runningInstances,
    completedInstances,
    approvalRate,
  };
});

const funnelData = computed(() => {
  const instances = instanceStore.instances;
  const total = instances.length;
  
  if (total === 0) return [];

  return [
    { label: '提交', value: total, percentage: 100 },
    { label: '审批中', value: instances.filter(i => i.status === 'running').length, percentage: (instances.filter(i => i.status === 'running').length / total) * 100 },
    { label: '已完成', value: instances.filter(i => i.status === 'completed').length, percentage: (instances.filter(i => i.status === 'completed').length / total) * 100 },
  ];
});

const processDistribution = computed(() => {
  const instances = instanceStore.instances;
  const distribution = new Map<string, number>();
  
  instances.forEach(instance => {
    const definition = processStore.definitions.find(d => d.id === instance.definitionId);
    const name = definition?.name || instance.definitionId;
    distribution.set(name, (distribution.get(name) || 0) + 1);
  });
  
  const total = instances.length;
  
  return Array.from(distribution.entries()).map(([name, count]) => ({
    name,
    count,
    percentage: total > 0 ? (count / total) * 100 : 0,
  })).sort((a, b) => b.count - a.count);
});

const recentActivities = computed(() => {
  const activities: any[] = [];
  
  instanceStore.instances.forEach(instance => {
    instance.history.forEach(history => {
      activities.push({
        id: `${instance.id}-${history.id}`,
        title: history.nodeName,
        type: history.type,
        timestamp: history.timestamp,
        operator: history.operator,
      });
    });
  });
  
  return activities
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, 10);
});

const getActivityColor = (type: string) => {
  const colorMap: Record<string, string> = {
    enter: 'blue',
    leave: 'gray',
    complete: 'green',
  };
  return colorMap[type] || 'gray';
};

const formatDate = (timestamp: number) => {
  return new Date(timestamp).toLocaleString('zh-CN');
};

onMounted(async () => {
  try {
    await Promise.all([
      instanceStore.fetchInstances(),
      processStore.fetchDefinitions(),
    ]);
  } catch (error: any) {
    message.error(error.message || '加载数据失败');
  }
});
</script>

<style scoped>
.dashboard-container {
  padding: 24px;
}

.funnel-chart {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.funnel-item {
  background: #1890ff;
  color: white;
  padding: 12px 24px;
  border-radius: 4px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  min-width: 200px;
  transition: all 0.3s;
}

.funnel-item:hover {
  transform: scale(1.02);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.funnel-label {
  font-weight: 500;
}

.funnel-value {
  font-weight: bold;
}

.process-chart {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.process-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.process-label {
  width: 120px;
  text-align: right;
  font-weight: 500;
}

.process-bar {
  flex: 1;
  height: 24px;
  background: #f0f0f0;
  border-radius: 4px;
  overflow: hidden;
}

.process-bar-fill {
  height: 100%;
  background: #1890ff;
  transition: width 0.3s;
}

.process-value {
  width: 60px;
  text-align: right;
  font-weight: bold;
}
</style>
