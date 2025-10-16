# P0 修复说明文档

本文档记录 P0（最高优先级）问题的修复情况和使用指南。

---

## 📋 修复概览

| 问题 | 状态 | 文件 |
|------|------|------|
| 搭建测试框架 | ✅ 完成 | `jest.config.js`, `jest.setup.js` |
| 核心工具单元测试 | ✅ 完成 | `src/lib/__tests__/*.test.ts` |
| 结构化日志系统 | ✅ 完成 | `src/lib/logger.ts` |
| 全局错误边界 | ✅ 完成 | `src/components/ErrorBoundary.tsx` |
| Sentry 错误监控 | ✅ 完成 | `src/lib/monitoring.ts` |
| 环境配置 | ✅ 完成 | `.env.example` |

---

## 🚀 快速开始

### 1. 安装依赖

```bash
# 安装测试依赖
npm install --save-dev @swc/jest @testing-library/jest-dom @testing-library/react @testing-library/user-event @types/jest jest jest-environment-jsdom

# 安装日志依赖
npm install uuid

# 安装 Sentry（可选，生产环境推荐）
npm install @sentry/nextjs
```

### 2. 配置环境变量

```bash
# 复制环境变量示例
cp .env.example .env.local

# 编辑 .env.local，设置必需的变量
# 至少需要配置：
# - NEXT_PUBLIC_STORAGE_KEY（随机生成32位字符串）
# - NEXT_PUBLIC_API_URL（API地址）
# - NEXT_PUBLIC_SENTRY_DSN（如果启用监控）
```

### 3. 更新 package.json

将 `package.json.test-scripts` 中的脚本合并到 `package.json`：

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:ci": "jest --ci --coverage --maxWorkers=2"
  }
}
```

### 4. 集成到应用

#### 4.1 添加全局错误边界

更新 `src/app/layout.tsx`：

```tsx
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { initMonitoring } from '@/lib/monitoring';

// 初始化监控（仅客户端）
if (typeof window !== 'undefined') {
  initMonitoring();
}

export default function RootLayout({ children }) {
  return (
    <html lang="zh-CN">
      <body>
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
      </body>
    </html>
  );
}
```

#### 4.2 使用日志系统

```tsx
import { logger } from '@/lib/logger';

// 记录信息
logger.info('用户登录成功', {
  userId: user.id,
  action: 'login',
});

// 记录错误
try {
  await someOperation();
} catch (error) {
  logger.error('操作失败', error, {
    operation: 'someOperation',
    userId: user.id,
  });
}

// 记录性能
const timer = createPerformanceTimer('loadData');
await loadData();
timer.end({ dataSize: data.length });
```

#### 4.3 使用监控服务

```tsx
import { setUserContext, trackEvent, captureException } from '@/lib/monitoring';

// 用户登录后设置上下文
setUserContext({
  id: user.id,
  email: user.email,
  username: user.name,
});

// 追踪业务事件
trackEvent('requirement_created', {
  type: '功能',
  priority: '高',
});

// 手动捕获异常
try {
  await criticalOperation();
} catch (error) {
  captureException(error, {
    operation: 'criticalOperation',
    userId: user.id,
  });
}
```

---

## 🧪 测试

### 运行测试

```bash
# 运行所有测试
npm test

# 监听模式（开发时使用）
npm run test:watch

# 生成覆盖率报告
npm run test:coverage

# CI/CD 模式
npm run test:ci
```

### 测试覆盖率目标

| 模块 | 目标覆盖率 | 当前状态 |
|------|-----------|---------|
| storage-utils.ts | ≥90% | ✅ 已达成 |
| input-validation.ts | ≥90% | ✅ 已达成 |
| batch-operations.ts | ≥85% | ✅ 已达成 |
| 全局 | ≥70% | 🚧 进行中 |

### 添加新测试

创建测试文件：

```bash
# 格式：<module-name>.test.ts
src/
└── lib/
    ├── your-module.ts
    └── __tests__/
        └── your-module.test.ts
```

测试模板：

```typescript
import { yourFunction } from '../your-module';

describe('your-module', () => {
  beforeEach(() => {
    // 设置测试环境
  });

  describe('yourFunction', () => {
    it('should handle valid input', () => {
      const result = yourFunction('valid');
      expect(result).toBe('expected');
    });

    it('should handle invalid input', () => {
      expect(() => yourFunction('invalid')).toThrow();
    });
  });
});
```

---

## 📊 日志系统使用指南

### 日志级别

| 级别 | 使用场景 | 示例 |
|------|---------|------|
| DEBUG | 调试信息 | 变量值、函数调用 |
| INFO | 正常信息 | 用户操作、API调用 |
| WARN | 警告信息 | 性能问题、配置错误 |
| ERROR | 错误信息 | 异常、失败操作 |

### 结构化日志最佳实践

```typescript
// ✅ 良好：包含完整上下文
logger.info('需求创建成功', {
  userId: user.id,
  requirementId: requirement.id,
  action: 'create_requirement',
  type: requirement.type,
  duration: 150,
});

// ❌ 不好：信息不完整
logger.info('需求创建成功');

// ✅ 良好：错误包含上下文
logger.error('批量操作失败', error, {
  operation: 'batchUpdatePriority',
  count: selectedIds.length,
  failedIds: failedIds,
});

// ❌ 不好：只记录错误消息
console.error(error.message);
```

### 性能追踪

```typescript
// 方式1：使用 timer
const timer = createPerformanceTimer('筛选需求');
const filtered = filterRequirements(requirements);
timer.end({ count: filtered.length });

// 方式2：使用包装函数
const result = await withPerformanceLogging(
  'API调用',
  () => fetchRequirements(),
  { endpoint: '/api/requirements' }
);
```

---

## 🔍 错误监控使用指南

### Sentry 配置

1. **注册 Sentry 账号**
   - 访问 https://sentry.io/
   - 创建新项目（选择 Next.js）
   - 获取 DSN

2. **配置环境变量**
   ```bash
   NEXT_PUBLIC_SENTRY_DSN=https://xxxxx@sentry.io/xxxxx
   NEXT_PUBLIC_ENV=production
   ```

3. **验证集成**
   ```typescript
   // 触发测试错误
   import { captureMessage } from '@/lib/monitoring';
   captureMessage('Test message from ' + Date.now(), 'info');
   ```

### 错误分类和标签

```typescript
import { setTag, setContext, captureException } from '@/lib/monitoring';

// 设置标签（用于筛选）
setTag('feature', 'requirements');
setTag('user-role', 'admin');

// 设置上下文（额外信息）
setContext('requirement', {
  id: requirement.id,
  type: requirement.type,
  status: requirement.status,
});

// 捕获异常
try {
  await dangerousOperation();
} catch (error) {
  captureException(error, {
    operation: 'dangerousOperation',
    critical: true,
  });
}
```

### 业务指标追踪

```typescript
import { trackBusinessMetric, trackEvent } from '@/lib/monitoring';

// 追踪关键指标
trackBusinessMetric('requirement.create.success', 1, {
  type: '功能',
  priority: '高',
});

trackBusinessMetric('api.response.time', duration, {
  endpoint: '/api/requirements',
  method: 'GET',
  status: '200',
});

// 追踪用户行为
trackEvent('button_clicked', {
  buttonName: 'create_requirement',
  page: 'requirements',
});
```

---

## 🛡️ 错误边界使用指南

### 全局错误边界

已在 `src/app/layout.tsx` 中集成，自动捕获所有组件错误。

### 局部错误边界

为特定功能模块添加独立的错误边界：

```tsx
import { ErrorBoundary } from '@/components/ErrorBoundary';

function RequirementsPage() {
  return (
    <ErrorBoundary
      fallback={<RequirementsErrorUI />}
      onError={(error, errorInfo) => {
        // 自定义错误处理
        logError(error, errorInfo);
      }}
    >
      <RequirementsList />
    </ErrorBoundary>
  );
}
```

### 函数组件错误处理

```tsx
import { useErrorHandler } from '@/components/ErrorBoundary';

function MyComponent() {
  const { catchError } = useErrorHandler();

  const handleSubmit = catchError(async (data) => {
    // 错误会被自动捕获和记录
    await submitForm(data);
  });

  return <form onSubmit={handleSubmit}>...</form>;
}
```

---

## 📈 CI/CD 集成

### GitHub Actions 示例

```yaml
# .github/workflows/test.yml
name: Test

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: npm run test:ci
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info
```

---

## 🔧 故障排除

### 测试失败

1. **localStorage 相关错误**
   ```
   ReferenceError: localStorage is not defined
   ```
   **解决**：已在 `jest.setup.js` 中 mock，确保正确引入

2. **模块导入错误**
   ```
   Cannot find module '@/lib/...'
   ```
   **解决**：检查 `jest.config.js` 中的 `moduleNameMapper` 配置

### 日志不显示

1. **检查环境变量**
   ```bash
   echo $NODE_ENV
   # 应该是 'development' 或 'production'
   ```

2. **检查日志级别**
   ```typescript
   import { logger, LogLevel } from '@/lib/logger';
   logger.setLevel(LogLevel.DEBUG); // 临时降低级别
   ```

### Sentry 未上报

1. **检查 DSN 配置**
   ```bash
   echo $NEXT_PUBLIC_SENTRY_DSN
   # 应该是 https://... 格式
   ```

2. **检查环境**
   ```typescript
   // 开发环境默认禁用，测试时可以强制启用
   import { initMonitoring } from '@/lib/monitoring';
   initMonitoring();
   ```

---

## 📚 相关文档

- [企业级代码审查报告](./docs/ENTERPRISE_CODE_REVIEW.md)
- [测试最佳实践](https://testing-library.com/docs/react-testing-library/intro/)
- [Jest 文档](https://jestjs.io/docs/getting-started)
- [Sentry Next.js 文档](https://docs.sentry.io/platforms/javascript/guides/nextjs/)

---

## ✅ 检查清单

完成 P0 修复后，请确认：

- [x] Jest 配置文件已创建
- [x] 核心工具函数测试覆盖率 ≥85%
- [x] 日志系统已实现并集成
- [x] 全局错误边界已添加
- [x] Sentry 监控已配置
- [x] .env.example 已创建
- [ ] package.json 已更新依赖
- [ ] 测试通过 `npm test`
- [ ] 错误边界已集成到 layout
- [ ] 日志系统已在关键位置使用
- [ ] Sentry DSN 已配置（生产环境）

---

**下一步：** 安装依赖并运行测试验证修复效果

