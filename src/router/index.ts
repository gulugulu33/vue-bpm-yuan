import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/LoginView.vue'),
    meta: { requiresAuth: false },
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('../views/RegisterView.vue'),
    meta: { requiresAuth: false },
  },
  {
    path: '/',
    redirect: '/dashboard',
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('../views/DashboardView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/designer',
    name: 'Designer',
    component: () => import('../views/DesignerView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/instances',
    name: 'Instances',
    component: () => import('../views/InstancesView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/instances/:id',
    name: 'InstanceDetail',
    component: () => import('../views/InstanceDetailView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/tasks',
    name: 'Tasks',
    component: () => import('../views/TasksView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/tasks/:id',
    name: 'TaskDetail',
    component: () => import('../views/TaskDetailView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/apply',
    name: 'Apply',
    component: () => import('../views/ApplyView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/my-applications',
    name: 'MyApplications',
    component: () => import('../views/MyApplicationsView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/virtual-list-demo',
    name: 'VirtualListDemo',
    component: () => import('../views/VirtualListDemo.vue'),
    meta: { requiresAuth: true },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, _from, next) => {
  const authStore = useAuthStore();
  authStore.initAuth();

  const requiresAuth = to.meta.requiresAuth !== false;

  if (requiresAuth && !authStore.isLoggedIn) {
    next('/login');
  } else if ((to.path === '/login' || to.path === '/register') && authStore.isLoggedIn) {
    next('/');
  } else {
    next();
  }
});

export default router;
