<template>
  <MainLayout>
    <div class="apply-container">
      <a-card title="发起申请" :bordered="false">
        <a-form :model="formState" layout="vertical">
          <a-form-item label="选择流程">
            <a-select
              v-model:value="formState.definitionId"
              placeholder="请选择流程"
              @change="handleDefinitionChange"
            >
              <a-select-option
                v-for="definition in publishedDefinitions"
                :key="definition.id"
                :value="definition.id"
              >
                {{ definition.name }}
              </a-select-option>
            </a-select>
          </a-form-item>

          <a-form-item label="业务键">
            <a-input
              v-model:value="formState.businessKey"
              placeholder="请输入业务键（可选）"
            />
          </a-form-item>

          <template v-if="selectedDefinition">
            <a-divider>申请信息</a-divider>

            <a-form-item
              v-for="field in formFields"
              :key="field.name"
              :label="field.label"
            >
              <a-input
                v-if="field.type === 'text'"
                v-model:value="formState.variables[field.name]"
                :placeholder="field.placeholder"
              />
              <a-input-number
                v-else-if="field.type === 'number'"
                v-model:value="formState.variables[field.name]"
                :placeholder="field.placeholder"
                style="width: 100%"
              />
              <a-date-picker
                v-else-if="field.type === 'date'"
                v-model:value="formState.variables[field.name]"
                style="width: 100%"
              />
              <a-textarea
                v-else-if="field.type === 'textarea'"
                v-model:value="formState.variables[field.name]"
                :placeholder="field.placeholder"
                :rows="4"
              />
            </a-form-item>
          </template>

          <a-form-item>
            <a-space>
              <a-button type="primary" @click="handleSubmit" :loading="loading">
                提交申请
              </a-button>
              <a-button @click="handleReset">重置</a-button>
            </a-space>
          </a-form-item>
        </a-form>
      </a-card>
    </div>
  </MainLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { message } from 'ant-design-vue';
import MainLayout from '../components/layout/MainLayout.vue';
import { useProcessStore } from '../stores/process';
import { useInstanceStore } from '../stores/instance';

const processStore = useProcessStore();
const instanceStore = useInstanceStore();

const formState = ref({
  definitionId: undefined as string | undefined,
  businessKey: '',
  variables: {} as Record<string, any>,
});

const loading = ref(false);

const publishedDefinitions = computed(() => {
  return processStore.definitions.filter(d => d.status === 'published');
});

const selectedDefinition = computed(() => {
  return processStore.definitions.find(d => d.id === formState.value.definitionId);
});

const formFields = computed(() => {
  if (!selectedDefinition.value) return [];

  const fields: any[] = [];

  if (selectedDefinition.value.nodes.some(n => 
    n.conditions?.some(c => c.field === 'amount')
  )) {
    fields.push({
      name: 'amount',
      label: '金额',
      type: 'number',
      placeholder: '请输入金额',
    });
  }

  if (selectedDefinition.value.nodes.some(n => 
    n.conditions?.some(c => c.field === 'days')
  )) {
    fields.push({
      name: 'days',
      label: '天数',
      type: 'number',
      placeholder: '请输入天数',
    });
  }

  if (selectedDefinition.value.nodes.some(n => 
    n.conditions?.some(c => c.field === 'reason')
  )) {
    fields.push({
      name: 'reason',
      label: '申请原因',
      type: 'textarea',
      placeholder: '请输入申请原因',
    });
  }

  return fields;
});

const handleDefinitionChange = () => {
  formState.value.variables = {};
};

const handleSubmit = async () => {
  if (!formState.value.definitionId) {
    message.error('请选择流程');
    return;
  }

  loading.value = true;
  try {
    await instanceStore.startProcess(
      formState.value.definitionId,
      formState.value.businessKey || undefined,
      formState.value.variables
    );

    message.success('申请提交成功');
    handleReset();
  } catch (error: any) {
    message.error(error.message || '申请提交失败');
  } finally {
    loading.value = false;
  }
};

const handleReset = () => {
  formState.value = {
    definitionId: undefined,
    businessKey: '',
    variables: {},
  };
};

onMounted(() => {
  processStore.fetchDefinitions();
});
</script>

<style scoped>
.apply-container {
  padding: 24px;
  max-width: 800px;
  margin: 0 auto;
}
</style>
