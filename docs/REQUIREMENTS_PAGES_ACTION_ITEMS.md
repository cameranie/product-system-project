# 需求页面改进行动清单

> 基于代码审查报告的具体改进任务清单

## 🎯 P0 - 严重问题（本周必须完成）

### 1. 添加单元测试 ⏳

#### 1.1 useRequirementForm Hook 测试
- [ ] 创建测试文件 `src/hooks/requirements/__tests__/useRequirementForm.test.ts`
- [ ] 测试表单初始化
- [ ] 测试字段验证（标题、描述、URL）
- [ ] 测试XSS防护
- [ ] 测试文件上传
- [ ] 目标覆盖率：90%+

#### 1.2 useComments Hook 测试
- [ ] 创建测试文件 `src/hooks/requirements/__tests__/useComments.test.ts`
- [ ] 测试评论添加
- [ ] 测试回复功能
- [ ] 测试编辑/删除
- [ ] 测试附件管理
- [ ] 目标覆盖率：90%+

#### 1.3 页面集成测试
- [ ] 新建页：测试创建流程
- [ ] 编辑页：测试更新流程
- [ ] 详情页：测试数据展示

---

### 2. 添加错误边界 ⏳

#### 文件变更
- [ ] 创建 `src/components/error-boundary/index.tsx`
- [ ] 创建 `src/components/error-boundary/ErrorFallback.tsx`
- [ ] 在详情页添加错误边界
- [ ] 在新建页添加错误边界
- [ ] 在编辑页添加错误边界

#### 代码示例

```typescript
// src/components/error-boundary/index.tsx
'use client';

import React from 'react';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    // 上报到监控平台
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
          <AlertCircle className="h-16 w-16 text-destructive mb-4" />
          <h2 className="text-2xl font-bold mb-2">出错了</h2>
          <p className="text-muted-foreground mb-4">
            {this.state.error?.message || '页面加载失败'}
          </p>
          <Button onClick={() => window.location.reload()}>
            刷新页面
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}
```

---

### 3. 添加权限控制 ⏳

#### 文件变更
- [ ] 创建 `src/hooks/usePermissions.ts`
- [ ] 创建 `src/components/PermissionDenied.tsx`
- [ ] 在编辑页添加权限检查
- [ ] 在删除操作添加权限检查
- [ ] 在批量操作添加权限检查

#### 代码示例

```typescript
// src/hooks/usePermissions.ts
import { useAuth } from '@/hooks/useAuth';

export type Permission = 
  | 'requirement:view'
  | 'requirement:create'
  | 'requirement:edit'
  | 'requirement:delete'
  | 'requirement:comment'
  | 'requirement:review';

export function usePermissions() {
  const { user } = useAuth();

  const hasPermission = (permission: Permission): boolean => {
    if (!user) return false;
    
    // 管理员拥有所有权限
    if (user.role === 'admin') return true;
    
    // 检查用户是否有该权限
    return user.permissions?.includes(permission) ?? false;
  };

  const hasAnyPermission = (permissions: Permission[]): boolean => {
    return permissions.some(hasPermission);
  };

  const hasAllPermissions = (permissions: Permission[]): boolean => {
    return permissions.every(hasPermission);
  };

  return {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
  };
}

// src/components/PermissionDenied.tsx
export function PermissionDenied() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-2xl font-bold mb-4">访问被拒绝</h1>
      <p className="text-muted-foreground mb-4">
        您没有权限访问此页面
      </p>
      <Button onClick={() => router.back()}>
        返回
      </Button>
    </div>
  );
}

// 使用示例：在编辑页
export default function RequirementEditPage({ params }: Props) {
  const { hasPermission } = usePermissions();
  
  if (!hasPermission('requirement:edit')) {
    return <PermissionDenied />;
  }
  
  // ... 原有代码
}
```

---

### 4. 配置 CI/CD ⏳

#### 文件变更
- [ ] 创建 `.github/workflows/ci.yml`
- [ ] 创建 `.github/workflows/cd.yml`
- [ ] 添加测试覆盖率上报

#### 代码示例

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Type check
        run: npm run type-check
      
      - name: Lint
        run: npm run lint
      
      - name: Run tests
        run: npm run test:ci
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/coverage-final.json
          flags: unittests
          name: codecov-umbrella
      
      - name: Build
        run: npm run build

  security:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v3
      
      - name: Run security audit
        run: npm audit --audit-level=moderate
      
      - name: Check for vulnerabilities
        uses: snyk/actions/node@master
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
```

---

## 🟡 P1 - 中等问题（2周内完成）

### 5. 优化数据同步 ⏳

#### 文件变更
- [ ] 修改 `src/app/requirements/[id]/edit/page.tsx`
- [ ] 添加冲突检测逻辑
- [ ] 实现乐观更新回滚

#### 代码示例

```typescript
// src/app/requirements/[id]/edit/page.tsx

// 添加冲突检测
const [hasUserEdits, setHasUserEdits] = useState(false);
const [serverVersion, setServerVersion] = useState(originalRequirement?.updatedAt);

// 监听用户输入
const handleInputChange = useCallback((field: string, value: any) => {
  setHasUserEdits(true);
  formState.handleInputChange(field, value);
}, [formState]);

// 检测服务端数据变化
useEffect(() => {
  if (originalRequirement && serverVersion !== originalRequirement.updatedAt) {
    if (hasUserEdits) {
      // 数据冲突：服务端数据已被他人修改
      toast.warning('需求已被他人更新', {
        description: '点击刷新获取最新数据',
        action: {
          label: '刷新',
          onClick: () => {
            setFormData(mapRequirementToFormData(originalRequirement));
            setHasUserEdits(false);
            setServerVersion(originalRequirement.updatedAt);
          }
        }
      });
    } else {
      // 没有用户编辑，自动同步
      setFormData(mapRequirementToFormData(originalRequirement));
      setServerVersion(originalRequirement.updatedAt);
    }
  }
}, [originalRequirement?.updatedAt, hasUserEdits]);

// 保存时检查版本
const handleSave = async () => {
  if (serverVersion !== originalRequirement?.updatedAt) {
    toast.error('数据已过期，请先刷新页面');
    return;
  }
  
  // ... 原有保存逻辑
};
```

---

### 6. 代码重构 ⏳

#### 6.1 提取 RequirementForm 组件
- [ ] 创建 `src/components/requirements/RequirementForm.tsx`
- [ ] 在新建页使用
- [ ] 在编辑页使用

```typescript
// src/components/requirements/RequirementForm.tsx
interface RequirementFormProps {
  formData: RequirementFormData;
  attachments: Attachment[];
  onInputChange: (field: string, value: any) => void;
  onTypeChange: (type: string, checked: boolean) => void;
  onPlatformChange: (platform: string, checked: boolean) => void;
  onAttachmentsChange: (attachments: Attachment[]) => void;
  readOnly?: boolean;
}

export function RequirementForm({
  formData,
  attachments,
  onInputChange,
  onTypeChange,
  onPlatformChange,
  onAttachmentsChange,
  readOnly = false,
}: RequirementFormProps) {
  return (
    <>
      {/* 基本信息 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">基本信息</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 标题 */}
          <div className="space-y-2">
            <Label htmlFor="title">
              需求标题 <span className="text-red-500">*</span>
            </Label>
            <Input
              id="title"
              placeholder="请输入需求标题"
              value={formData.title}
              onChange={(e) => onInputChange('title', e.target.value)}
              disabled={readOnly}
            />
          </div>

          {/* 需求类型 */}
          {/* ... */}
        </CardContent>
      </Card>

      {/* 需求描述 + 附件 */}
      <Card>
        {/* ... */}
      </Card>
    </>
  );
}
```

#### 6.2 清理废弃代码
- [ ] 删除 `useComments.ts` 中的废弃函数
- [ ] 删除未使用的 import
- [ ] 删除注释掉的代码

---

### 7. 性能优化 ⏳

#### 7.1 添加防抖
- [ ] 为保存操作添加防抖
- [ ] 为搜索添加防抖

```typescript
import { debounce } from 'lodash';

const debouncedSave = useMemo(
  () => debounce(async () => {
    await handleSave();
  }, 1000),
  [handleSave]
);

// 组件卸载时取消
useEffect(() => {
  return () => debouncedSave.cancel();
}, [debouncedSave]);
```

#### 7.2 虚拟列表
- [ ] 为评论列表添加虚拟化
- [ ] 为附件列表添加虚拟化（如果数量多）

```typescript
import { useVirtualizer } from '@tanstack/react-virtual';

const parentRef = useRef<HTMLDivElement>(null);

const virtualizer = useVirtualizer({
  count: comments.length,
  getScrollElement: () => parentRef.current,
  estimateSize: () => 100, // 估计每个评论高度
  overscan: 5,
});

return (
  <div ref={parentRef} style={{ height: '600px', overflow: 'auto' }}>
    <div
      style={{
        height: `${virtualizer.getTotalSize()}px`,
        position: 'relative',
      }}
    >
      {virtualizer.getVirtualItems().map((item) => {
        const comment = comments[item.index];
        return (
          <div
            key={item.key}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              transform: `translateY(${item.start}px)`,
            }}
          >
            {/* 评论内容 */}
          </div>
        );
      })}
    </div>
  </div>
);
```

---

### 8. 添加数据验证增强 ⏳

#### 文件变更
- [ ] 修改 `src/hooks/requirements/useRequirementForm.ts`
- [ ] 添加实时验证
- [ ] 添加错误提示

```typescript
// 实时验证
const [errors, setErrors] = useState<Record<string, string>>({});

const validateField = useCallback((field: string, value: any) => {
  let error = '';
  
  switch (field) {
    case 'title':
      if (!value.trim()) {
        error = '标题不能为空';
      } else if (value.length > 200) {
        error = '标题不能超过200个字符';
      } else if (/<script|<iframe|javascript:/i.test(value)) {
        error = '标题包含不允许的字符';
      }
      break;
    
    case 'description':
      const plainText = getPlainText(value);
      if (!plainText.trim()) {
        error = '描述不能为空';
      } else if (plainText.length > 5000) {
        error = '描述不能超过5000个字符';
      }
      break;
  }
  
  setErrors(prev => ({ ...prev, [field]: error }));
  return !error;
}, []);

// 在输入时验证
const handleInputChange = useCallback((field: string, value: any) => {
  setFormData(prev => ({ ...prev, [field]: value }));
  validateField(field, value);
}, [validateField]);
```

---

## 🟢 P2 - 次要问题（1个月内完成）

### 9. 完善工程化 ⏳

#### 9.1 添加代码质量检查
- [ ] 配置 Husky
- [ ] 配置 lint-staged
- [ ] 添加 commitlint

```json
// package.json
{
  "scripts": {
    "prepare": "husky install",
    "type-check": "tsc --noEmit",
    "lint:fix": "eslint --fix src/**/*.{ts,tsx}",
    "format": "prettier --write \"src/**/*.{ts,tsx}\"",
    "pre-commit": "lint-staged"
  },
  "lint-staged": {
    "*.{ts,tsx}": [
      "eslint --fix",
      "prettier --write",
      "npm run type-check"
    ]
  }
}
```

#### 9.2 添加性能监控
- [ ] 配置 Web Vitals
- [ ] 添加性能指标收集
- [ ] 集成监控平台

```typescript
// src/lib/vitals.ts
import { Metric } from 'web-vitals';

export function reportWebVitals(metric: Metric) {
  // 发送到分析服务
  if (window.analytics) {
    window.analytics.track('Web Vitals', {
      name: metric.name,
      value: metric.value,
      rating: metric.rating,
      delta: metric.delta,
    });
  }
  
  // 本地开发时打印
  if (process.env.NODE_ENV === 'development') {
    console.log(metric);
  }
}
```

---

### 10. 文档完善 ⏳

#### 10.1 API 文档
- [ ] 使用 TypeDoc 生成 API 文档
- [ ] 添加使用示例
- [ ] 添加最佳实践

#### 10.2 组件文档
- [ ] 使用 Storybook 创建组件文档
- [ ] 添加交互示例
- [ ] 添加设计规范

#### 10.3 变更日志
- [ ] 创建 CHANGELOG.md
- [ ] 使用语义化版本
- [ ] 记录每次发布的变更

---

## 📈 进度跟踪

| 任务 | 优先级 | 状态 | 负责人 | 截止日期 |
|------|--------|------|--------|----------|
| 添加单元测试 | P0 | 🔴 待开始 | - | 本周五 |
| 添加错误边界 | P0 | 🔴 待开始 | - | 本周五 |
| 添加权限控制 | P0 | 🔴 待开始 | - | 本周五 |
| 配置 CI/CD | P0 | 🔴 待开始 | - | 本周五 |
| 优化数据同步 | P1 | ⚪ 未开始 | - | 下周五 |
| 代码重构 | P1 | ⚪ 未开始 | - | 下周五 |
| 性能优化 | P1 | ⚪ 未开始 | - | 下周五 |
| 完善工程化 | P2 | ⚪ 未开始 | - | 下月 |
| 文档完善 | P2 | ⚪ 未开始 | - | 下月 |

---

## ✅ 验收标准

### P0 任务验收标准

1. **单元测试**
   - ✅ 测试覆盖率 ≥ 90%
   - ✅ 所有测试通过
   - ✅ 包含边界情况和异常场景

2. **错误边界**
   - ✅ 所有页面都有错误边界包裹
   - ✅ 错误信息清晰友好
   - ✅ 提供恢复操作

3. **权限控制**
   - ✅ 所有敏感操作都有权限检查
   - ✅ 未授权访问返回 403
   - ✅ 权限不足有明确提示

4. **CI/CD**
   - ✅ 每次 PR 自动运行测试
   - ✅ 测试失败阻止合并
   - ✅ 覆盖率报告可见

---

*最后更新：2025-10-15*




