# 开发指南

> 🚀 快速上手产品需求管理系统开发

---

## 📋 目录

- [环境准备](#环境准备)
- [快速开始](#快速开始)
- [项目结构](#项目结构)
- [开发规范](#开发规范)
- [常用命令](#常用命令)
- [Git工作流](#git工作流)
- [测试指南](#测试指南)
- [性能优化](#性能优化)
- [故障排查](#故障排查)

---

## 🛠️ 环境准备

### 必需软件

| 软件 | 版本 | 说明 |
|------|------|------|
| Node.js | ≥ 18.17.0 | JavaScript运行时 |
| npm | ≥ 9.0.0 | 包管理器 |
| Git | ≥ 2.30.0 | 版本控制 |

### 推荐工具

- **IDE**: VS Code
- **插件**:
  - ESLint
  - Prettier
  - TypeScript and JavaScript Language Features
  - Tailwind CSS IntelliSense
  - GitLens

---

## 🚀 快速开始

### 1. 克隆项目

```bash
git clone <repository-url>
cd product-system-project
```

### 2. 安装依赖

```bash
npm install
```

### 3. 配置环境变量

```bash
cp env.example .env.local
```

编辑 `.env.local`，配置必要的环境变量。

### 4. 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:3000

---

## 📁 项目结构

```
product-system-project/
├── .husky/                 # Git hooks配置
├── docs/                   # 文档目录
│   ├── API.md             # API概览
│   ├── ARCHITECTURE.md    # 架构文档
│   ├── DEVELOPMENT_GUIDE.md # 开发指南（本文件）
│   └── api/               # TypeDoc生成的API文档
├── public/                # 静态资源
├── src/
│   ├── app/               # Next.js应用目录
│   │   ├── requirements/  # 需求模块
│   │   │   ├── page.tsx  # 需求列表页
│   │   │   ├── [id]/     # 需求详情
│   │   │   │   ├── page.tsx  # 详情页
│   │   │   │   └── edit/     # 编辑页
│   │   │   └── new/      # 新建页
│   │   ├── layout.tsx    # 根布局
│   │   └── page.tsx      # 首页
│   ├── components/        # React组件
│   │   ├── ui/           # 基础UI组件（shadcn/ui）
│   │   ├── requirements/ # 需求相关组件
│   │   ├── layout/       # 布局组件
│   │   └── ...
│   ├── hooks/            # 自定义Hooks
│   │   ├── requirements/ # 需求相关Hooks
│   │   ├── useDebounce.ts
│   │   ├── useOptimisticUpdate.ts
│   │   └── ...
│   ├── lib/              # 工具库
│   │   ├── requirements-store.ts  # Zustand状态管理
│   │   ├── file-upload-utils.ts
│   │   ├── input-validation.ts
│   │   ├── web-vitals.ts
│   │   └── ...
│   ├── config/           # 配置文件
│   │   ├── requirements.ts
│   │   ├── validation-constants.ts
│   │   └── ...
│   └── types/            # TypeScript类型定义
│       ├── page-props.ts
│       ├── component-props.ts
│       └── ...
├── .commitlintrc.json    # Commit规范配置
├── .lintstagedrc.json    # lint-staged配置
├── eslint.config.mjs     # ESLint配置
├── jest.config.js        # Jest配置
├── tailwind.config.js    # Tailwind CSS配置
├── tsconfig.json         # TypeScript配置
├── typedoc.json          # TypeDoc配置
├── CHANGELOG.md          # 变更日志
└── package.json
```

---

## 📜 开发规范

### 代码风格

#### TypeScript

```typescript
// ✅ 好的做法
export interface UserData {
  id: string;
  name: string;
  email: string;
}

export function validateUser(user: UserData): boolean {
  return user.email.includes('@');
}

// ❌ 避免
export function validateUser(user: any) { // 不要使用any
  return true;
}
```

#### React组件

```tsx
// ✅ 函数组件 + TypeScript
interface ButtonProps {
  variant?: 'primary' | 'secondary';
  onClick?: () => void;
  children: React.ReactNode;
}

export function Button({ variant = 'primary', onClick, children }: ButtonProps) {
  return (
    <button onClick={onClick} className={`btn btn-${variant}`}>
      {children}
    </button>
  );
}

// ❌ 避免使用默认导出（除非是页面组件）
export default function Button() { ... }
```

### 命名约定

| 类型 | 约定 | 示例 |
|------|------|------|
| 组件 | PascalCase | `Button`, `UserProfile` |
| 函数/变量 | camelCase | `getUserData`, `isValid` |
| 常量 | UPPER_SNAKE_CASE | `MAX_FILE_SIZE`, `API_URL` |
| 类型/接口 | PascalCase | `UserData`, `ButtonProps` |
| Hook | use开头 + camelCase | `useDebounce`, `useAuth` |
| 文件名 | kebab-case | `user-profile.tsx`, `api-utils.ts` |

### 目录组织

```
components/
├── ui/                    # 通用UI组件
│   ├── button.tsx
│   ├── input.tsx
│   └── ...
├── requirements/          # 业务组件（按功能模块）
│   ├── RequirementForm.tsx
│   ├── CommentSection.tsx
│   └── ...
└── layout/               # 布局组件
    ├── AppLayout.tsx
    └── Sidebar.tsx
```

---

## 🎨 UI开发规范

### 样式

优先使用Tailwind CSS工具类：

```tsx
// ✅ 好
<div className="flex items-center gap-4 p-4 bg-white rounded-lg shadow-md">
  ...
</div>

// ⚠️ 仅在必要时使用CSS模块
import styles from './component.module.css';
<div className={styles.container}>...</div>
```

### 响应式设计

```tsx
// 使用Tailwind响应式前缀
<div className="
  grid grid-cols-1      // 移动端：1列
  md:grid-cols-2        // 平板：2列
  lg:grid-cols-3        // 桌面：3列
  gap-4
">
  ...
</div>
```

### 深色模式

```tsx
// 使用dark:前缀
<div className="bg-white dark:bg-gray-800 text-black dark:text-white">
  ...
</div>
```

---

## 🔧 常用命令

### 开发

```bash
# 启动开发服务器
npm run dev

# 类型检查
npm run type-check

# 代码格式化
npm run format

# 代码检查并自动修复
npm run lint:fix
```

### 测试

```bash
# 运行所有测试
npm test

# 监视模式运行测试
npm run test:watch

# 生成覆盖率报告
npm run test:coverage

# CI环境运行测试
npm run test:ci
```

### 构建

```bash
# 生产构建
npm run build

# 启动生产服务器
npm start
```

### 文档

```bash
# 生成API文档
npm run docs:api

# 查看API文档
npm run docs:serve
```

---

## 🌲 Git工作流

### 分支策略

```
main           # 生产分支
  └── develop  # 开发分支
      ├── feature/xxx    # 功能分支
      ├── fix/xxx        # 修复分支
      └── refactor/xxx   # 重构分支
```

### Commit规范

使用[约定式提交](https://www.conventionalcommits.org/zh-hans/)：

```
<type>(<scope>): <subject>

[optional body]

[optional footer]
```

#### Type类型

- `feat`: 新功能
- `fix`: Bug修复
- `docs`: 文档更新
- `style`: 代码格式（不影响功能）
- `refactor`: 重构
- `perf`: 性能优化
- `test`: 测试相关
- `build`: 构建系统
- `ci`: CI配置
- `chore`: 其他变更

#### 示例

```bash
# 新功能
git commit -m "feat(requirements): 添加批量导出功能"

# Bug修复
git commit -m "fix(upload): 修复文件上传内存泄漏"

# 文档更新
git commit -m "docs: 更新API文档"

# 重构
git commit -m "refactor(form): 提取RequirementForm组件"

# 性能优化
git commit -m "perf(list): 添加虚拟化列表支持"
```

### Pull Request流程

1. **创建分支**
   ```bash
   git checkout -b feature/your-feature
   ```

2. **开发并提交**
   ```bash
   git add .
   git commit -m "feat: 你的功能"
   ```

3. **推送到远程**
   ```bash
   git push origin feature/your-feature
   ```

4. **创建PR**
   - 填写PR模板
   - 关联相关Issue
   - 请求代码审查

5. **代码审查**
   - 等待审查通过
   - 根据反馈修改

6. **合并**
   - Squash and merge（推荐）
   - 删除feature分支

---

## 🧪 测试指南

### 单元测试

```typescript
// src/lib/__tests__/utils.test.ts
import { describe, it, expect } from '@jest/globals';
import { formatFileSize } from '../file-upload-utils';

describe('formatFileSize', () => {
  it('应该正确格式化字节数', () => {
    expect(formatFileSize(0)).toBe('0 B');
    expect(formatFileSize(1024)).toBe('1.00 KB');
    expect(formatFileSize(1048576)).toBe('1.00 MB');
  });
});
```

### 组件测试

```typescript
// src/components/__tests__/Button.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '../ui/button';

describe('Button', () => {
  it('应该渲染按钮文本', () => {
    render(<Button>点击我</Button>);
    expect(screen.getByText('点击我')).toBeInTheDocument();
  });

  it('应该触发点击事件', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>点击</Button>);
    
    fireEvent.click(screen.getByText('点击'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

### 测试覆盖率目标

- 核心工具函数：≥ 90%
- Hooks：≥ 85%
- 组件：≥ 80%
- 整体：≥ 80%

---

## ⚡ 性能优化

### 1. 使用防抖和节流

```typescript
import { useDebounce } from '@/hooks/useDebounce';

const [search, setSearch] = useState('');
const debouncedSearch = useDebounce(search, 500);

// 只在用户停止输入500ms后搜索
useEffect(() => {
  if (debouncedSearch) {
    performSearch(debouncedSearch);
  }
}, [debouncedSearch]);
```

### 2. 虚拟化长列表

```typescript
import { VirtualCommentList } from '@/components/requirements/VirtualCommentList';

<VirtualCommentList
  comments={comments} // 自动在>50条时启用虚拟化
  currentUserId={user.id}
/>
```

### 3. 优化状态订阅

```typescript
// ❌ 订阅整个数组
const requirements = useRequirementsStore(state => state.requirements);

// ✅ 使用selector
const requirement = useRequirementsStore(
  state => state.requirements.find(r => r.id === id)
);
```

### 4. 代码分割

```typescript
// 动态导入大型组件
const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <Spinner />,
});
```

---

## 🔍 故障排查

### 常见问题

#### 1. 依赖安装失败

```bash
# 清除缓存后重装
rm -rf node_modules package-lock.json
npm install
```

#### 2. 类型错误

```bash
# 重新生成类型声明
npm run type-check
```

#### 3. 测试失败

```bash
# 清除Jest缓存
npm test -- --clearCache
```

#### 4. 开发服务器端口占用

```bash
# 查找并杀死占用3000端口的进程
lsof -ti:3000 | xargs kill -9

# 或使用其他端口
PORT=3001 npm run dev
```

### 性能调试

```typescript
// 使用React DevTools Profiler
// 或使用性能测量API
import { startMeasure } from '@/lib/web-vitals';

const measure = startMeasure('data-load');
await loadData();
const duration = measure.end();
console.log(`耗时: ${duration}ms`);
```

---

## 📚 学习资源

### 官方文档

- [Next.js文档](https://nextjs.org/docs)
- [React文档](https://react.dev/)
- [TypeScript文档](https://www.typescriptlang.org/docs/)
- [Tailwind CSS文档](https://tailwindcss.com/docs)

### 项目文档

- [API文档](./api/index.html)
- [架构文档](./ARCHITECTURE.md)
- [代码审查报告](./REQUIREMENTS_PAGES_REVIEW_SUMMARY.md)

---

## 🤝 贡献指南

1. Fork项目
2. 创建feature分支
3. 提交更改
4. 推送到分支
5. 创建Pull Request

### 代码审查标准

- ✅ 代码符合ESLint规范
- ✅ 所有测试通过
- ✅ 测试覆盖率达标
- ✅ 有完整的文档注释
- ✅ PR描述清晰

---

## 📞 获取帮助

- 📖 查看文档：`docs/`目录
- 🐛 提交Issue：GitHub Issues
- 💬 团队讨论：Slack/Teams

---

**祝开发愉快！** 🎉

*最后更新：2025-10-15*




