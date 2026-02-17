<template>
  <MainLayout>
    <div class="virtual-list-demo">
      <a-card title="虚拟列表演示" :bordered="false">
        <a-space direction="vertical" style="width: 100%" size="large">
          <a-alert message="虚拟列表可以高效渲染大量数据，只渲染可见区域的元素" type="info" show-icon />
          
          <a-row :gutter="16">
            <a-col :span="12">
              <a-statistic title="总数据量" :value="dataList.length" />
            </a-col>
            <a-col :span="12">
              <a-statistic title="可见数据量" :value="visibleCount" />
            </a-col>
          </a-row>

          <VirtualList
            :list="dataList"
            :item-height="60"
            :container-height="500"
            :overscan="5"
            :item-key="(item: any) => item.id"
          >
            <template #default="{ item, index }">
              <div class="list-item">
                <a-space>
                  <a-avatar :style="{ backgroundColor: getRandomColor(index) }">
                    {{ index + 1 }}
                  </a-avatar>
                  <div>
                    <div style="font-weight: 500;">{{ item.name }}</div>
                    <div style="font-size: 12px; color: rgba(0, 0, 0, 0.45);">
                      {{ item.description }} - {{ item.date || '' }}
                    </div>
                  </div>
                </a-space>
              </div>
            </template>
          </VirtualList>
        </a-space>
      </a-card>
    </div>
  </MainLayout>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import MainLayout from '../components/layout/MainLayout.vue';
import VirtualList from '../components/VirtualList.vue';

interface ListItem {
  id: number;
  name: string;
  description: string;
  date: string;
}

const dataList = ref<ListItem[]>([]);

function generateData() {
  const data: ListItem[] = [];
  const descriptions = [
    '审批流程记录',
    '任务处理日志',
    '系统操作记录',
    '用户活动追踪',
    '数据变更历史',
    '业务流程节点',
    '审批意见反馈',
    '流程状态更新',
  ];

  for (let i = 1; i <= 10000; i++) {
    data.push({
      id: i,
      name: `数据项 ${i}`,
      description: descriptions[i % descriptions.length] || '记录',
      date: new Date(Date.now() - i * 1000 * 60 * 60).toLocaleString('zh-CN'),
    });
  }
  return data;
}

dataList.value = generateData();

const visibleCount = computed(() => {
  return Math.ceil(500 / 60) + 10;
});

function getRandomColor(index: number): string {
  const colors = ['#f56a00', '#7265e6', '#ffbf00', '#00a2ae', '#87d068', '#108ee9'];
  return colors[index % colors.length] || '#1677ff';
}
</script>

<style scoped>
.virtual-list-demo {
  padding: 24px;
}

.list-item {
  padding: 12px 16px;
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  align-items: center;
}

.list-item:hover {
  background-color: #f5f5f5;
}
</style>
