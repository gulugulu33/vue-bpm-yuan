# BPM 系统 - 企业级业务流程管理系统

## 项目概述

基于 Vue3 + TypeScript + Ant Design Vue + AntV X6 + Koa + Prisma 构建的企业级业务流程管理系统，支持流程可视化设计、自动化任务分配、跨部门协作审批等核心功能。

## 技术栈

### 前端
- Vue 3 + Composition API
- TypeScript
- Pinia (状态管理)
- Ant Design Vue (UI 组件库)
- AntV X6 (流程设计引擎)
- Axios (HTTP 客户端)
- Vite (构建工具)

### 后端
- Koa 2.x (Node.js 框架)
- TypeScript
- Prisma (ORM)
- PostgreSQL (数据库)
- JWT (认证)
- bcrypt (密码加密)

## 项目结构

```
vue-bpm-yuan/
├── src/                          # 前端源码
│   ├── api/                      # API 请求封装
│   │   ├── index.ts             # API 接口定义
│   │   └── request.ts           # Axios 二次封装
│   ├── components/               # 公共组件
│   │   ├── designer/            # 流程设计器组件
│   │   ├── layout/             # 布局组件
│   │   ├── ThemeSwitcher.vue   # 主题切换组件
│   │   └── VirtualList.vue     # 虚拟列表组件
│   ├── engine/                  # 流程执行引擎
│   │   ├── approvalPath.ts     # 审批路径计算
│   │   └── index.ts
│   ├── hooks/                   # 自定义 Hooks
│   │   └── useVirtualList.ts   # 虚拟列表 Hook
│   ├── router/                  # 路由配置
│   │   └── index.ts
│   ├── stores/                  # Pinia 状态管理
│   │   ├── auth.ts            # 认证状态
│   │   ├── instance.ts        # 流程实例状态
│   │   ├── process.ts         # 流程定义状态
│   │   └── theme.ts          # 主题状态
│   ├── theme/                   # 主题配置
│   │   ├── designToken.ts     # 设计令牌
│   │   └── index.ts          # 主题管理
│   ├── types/                   # TypeScript 类型定义
│   │   └── index.ts
│   ├── views/                   # 页面视图
│   │   ├── DashboardView.vue   # 数据看板
│   │   ├── DesignerView.vue    # 流程设计器
│   │   ├── ApplyView.vue      # 发起申请
│   │   ├── MyApplicationsView.vue  # 我的申请
│   │   ├── InstancesView.vue   # 流程实例
│   │   ├── InstanceDetailView.vue  # 实例详情
│   │   ├── TasksView.vue      # 任务中心
│   │   ├── TaskDetailView.vue # 任务详情
│   │   ├── LoginView.vue     # 登录
│   │   ├── RegisterView.vue  # 注册
│   │   └── VirtualListDemo.vue  # 虚拟列表演示
│   ├── App.vue
│   └── main.ts
├── bpm-backend/                # 后端源码
│   ├── src/
│   │   ├── config/            # 配置文件
│   │   ├── controllers/       # 控制器
│   │   ├── middleware/        # 中间件
│   │   ├── routes/            # 路由
│   │   ├── services/          # 业务逻辑
│   │   ├── types/             # 类型定义
│   │   └── utils/             # 工具函数
│   └── prisma/                # Prisma 配置
├── public/                     # 静态资源
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

## 快速开始

### 前置要求

- Node.js 18+
- PostgreSQL 15+

### 1. 安装依赖

#### 前端
```bash
npm install
```

#### 后端
```bash
cd bpm-backend
npm install
```

### 2. 配置数据库

#### 创建数据库
```bash
psql -U postgres
CREATE DATABASE bpm;
\q
```

#### 配置环境变量
编辑 `bpm-backend/.env` 文件：
```env
DATABASE_URL="postgresql://postgres:your_password@localhost:5432/bpm?schema=public"
PORT=3000
NODE_ENV=development
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRES_IN=7d
```

#### 运行数据库迁移
```bash
cd bpm-backend
npx prisma generate
npx prisma migrate dev
```

### 3. 启动服务

#### 启动后端
```bash
cd bpm-backend
npm run dev
```

后端服务将在 http://localhost:3000 启动

#### 启动前端
```bash
npm run dev
```

前端服务将在 http://localhost:5173 启动

### 4. 访问应用

打开浏览器访问 http://localhost:5173

## 核心功能

### 流程设计器
- 基于 AntV X6 实现可视化流程设计
- 支持多种节点类型（开始、结束、用户任务、服务任务、网关等）
- 拖拽式操作与节点连线
- 实时保存与预览

### 审批引擎
- 支持顺序审批、全员审批、任意审批三种模式
- 条件网关实现流程分支智能路由
- 动态表单引擎支持字段条件渲染与关联校验

### 任务中心
- 待办任务管理
- 任务审批（同意/拒绝）
- 任务委派
- 任务历史记录

### 数据看板
- 流程状态统计
- 审批耗时分析
- 趋势图表展示

### 技术亮点
- **Axios 二次封装**：Token 自动注入、统一错误处理、接口重试机制
- **主题化方案**：暗黑/亮色模式切换，基于 Ant Design Config Provider
- **虚拟列表**：针对大数据量场景的性能优化
- **类型安全**：完整的 TypeScript 类型定义

## API 文档

### 认证接口

#### 用户登录
```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "password123"
}
```

#### 用户注册
```http
POST /api/v1/auth/register
Content-Type: application/json

{
  "username": "newuser",
  "email": "newuser@example.com",
  "password": "password123",
  "fullName": "新用户"
}
```

### 流程定义接口

#### 获取流程定义列表
```http
GET /api/v1/process-definitions?page=1&pageSize=10&status=draft
```

#### 创建流程定义
```http
POST /api/v1/process-definitions
Content-Type: application/json

{
  "name": "请假审批流程",
  "description": "员工请假审批流程",
  "definition": {
    "nodes": [...],
    "edges": [...]
  }
}
```

#### 发布流程定义
```http
POST /api/v1/process-definitions/:id/publish
```

### 流程实例接口

#### 发起流程实例
```http
POST /api/v1/process-instances
Content-Type: application/json

{
  "definitionId": "uuid",
  "businessKey": "LEAVE-2024-001",
  "variables": {
    "leaveType": "年假",
    "days": 5,
    "reason": "回家探亲"
  }
}
```

### 任务接口

#### 获取我的待办任务
```http
GET /api/v1/tasks/my-pending
```

#### 完成任务
```http
POST /api/v1/tasks/:id/complete
Content-Type: application/json

{
  "variables": {
    "approved": true
  },
  "comment": "审批通过"
}
```

## 开发指南

### 前端开发

#### 添加新页面
1. 在 `src/views/` 创建新组件
2. 在 `src/router/index.ts` 添加路由
3. 在 `src/components/layout/MainLayout.vue` 添加菜单项

#### 添加新 API
1. 在 `src/api/index.ts` 添加 API 方法
2. 在对应的 Store 中调用 API

### 后端开发

#### 添加新接口
1. 在 `src/controllers/` 创建控制器方法
2. 在 `src/services/` 创建业务逻辑
3. 在 `src/routes/index.ts` 添加路由

#### 添加数据库表
1. 在 `prisma/schema.prisma` 定义模型
2. 运行 `npx prisma migrate dev` 创建迁移

## 构建

### 前端构建
```bash
npm run build
```

### 后端构建
```bash
cd bpm-backend
npm run build
npm start
```

## 许可证

MIT License
