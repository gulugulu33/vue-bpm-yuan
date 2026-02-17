<template>
  <div class="register-container">
    <a-card class="register-card" title="注册">
      <a-form
        :model="formState"
        :rules="rules"
        @finish="handleRegister"
        layout="vertical"
      >
        <a-form-item label="用户名" name="username">
          <a-input
            v-model:value="formState.username"
            placeholder="请输入用户名"
            size="large"
          />
        </a-form-item>

        <a-form-item label="邮箱" name="email">
          <a-input
            v-model:value="formState.email"
            placeholder="请输入邮箱"
            size="large"
          />
        </a-form-item>

        <a-form-item label="姓名" name="fullName">
          <a-input
            v-model:value="formState.fullName"
            placeholder="请输入姓名（可选）"
            size="large"
          />
        </a-form-item>

        <a-form-item label="密码" name="password">
          <a-input-password
            v-model:value="formState.password"
            placeholder="请输入密码"
            size="large"
          />
        </a-form-item>

        <a-form-item label="确认密码" name="confirmPassword">
          <a-input-password
            v-model:value="formState.confirmPassword"
            placeholder="请再次输入密码"
            size="large"
          />
        </a-form-item>

        <a-form-item>
          <a-button
            type="primary"
            html-type="submit"
            size="large"
            block
            :loading="authStore.loading"
          >
            注册
          </a-button>
        </a-form-item>

        <a-form-item>
          <div class="login-link">
            已有账号？<router-link to="/login">立即登录</router-link>
          </div>
        </a-form-item>
      </a-form>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue';
import { useRouter } from 'vue-router';
import { message } from 'ant-design-vue';
import { useAuthStore } from '../stores/auth';

const router = useRouter();
const authStore = useAuthStore();

const formState = reactive({
  username: '',
  email: '',
  fullName: '',
  password: '',
  confirmPassword: '',
});

const validatePassword = async (_rule: any, value: string) => {
  if (value === '') {
    return Promise.reject('请输入确认密码');
  }
  if (value !== formState.password) {
    return Promise.reject('两次输入的密码不一致');
  }
  return Promise.resolve();
};

const rules = {
  username: [
    { required: true, message: '请输入用户名' },
    { min: 3, message: '用户名至少3个字符' },
  ],
  email: [
    { required: true, message: '请输入邮箱' },
    { type: 'email', message: '请输入有效的邮箱地址' },
  ],
  password: [
    { required: true, message: '请输入密码' },
    { min: 6, message: '密码至少6个字符' },
  ],
  confirmPassword: [{ required: true, validator: validatePassword, trigger: 'change' }],
};

const handleRegister = async () => {
  try {
    await authStore.register({
      username: formState.username,
      email: formState.email,
      password: formState.password,
      fullName: formState.fullName || undefined,
    });
    message.success('注册成功，请登录');
    router.push('/login');
  } catch (error: any) {
    message.error(error.message || '注册失败');
  }
};
</script>

<style scoped>
.register-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: #f0f2f5;
}

.register-card {
  width: 400px;
}

.login-link {
  text-align: center;
  color: #666;
}

.login-link a {
  color: #1677ff;
  text-decoration: none;
}

.login-link a:hover {
  text-decoration: underline;
}
</style>
