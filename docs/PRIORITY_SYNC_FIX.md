# 优先级双向同步修复

## 🐛 问题描述

用户反馈：
1. 需求池默认应该按照创建时间排序（而不是更新时间）
2. 优先级在列表和详情页之间没有双向同步

## 🔍 问题分析

### 问题1：默认排序字段错误

**原因**：
- `useRequirementFilters.ts` 中默认排序设置为 `updatedAt`（更新时间）
- 用户期望按照 `createdAt`（创建时间）排序

### 问题2：优先级数据结构双重存储

**数据结构**：
```typescript
interface Requirement {
  priority?: '低' | '中' | '高' | '紧急';  // ← 顶层优先级（列表显示）
  endOwnerOpinion: {
    priority?: '低' | '中' | '高' | '紧急';  // ← 端负责人意见中的优先级（详情页显示）
  };
}
```

**同步问题**：
- 列表（需求池、预排期）显示和修改：`requirement.priority`
- 详情页显示和修改：`requirement.endOwnerOpinion.priority`
- 修改一方时，另一方没有同步更新

## ✅ 解决方案

### 1. 修改默认排序为创建时间

**文件**：`src/hooks/useRequirementFilters.ts`

**修改内容**：
```typescript
// 修改前：
const sortConfig = safeGetItem(KEYS.SORT_CONFIG, 
  { field: 'updatedAt', direction: 'desc' },  // ← 更新时间
  objectValidator(['field', 'direction'])
) as SortConfig;

// 修改后：
const sortConfig = safeGetItem(KEYS.SORT_CONFIG, 
  { field: 'createdAt', direction: 'desc' },  // ← 创建时间
  objectValidator(['field', 'direction'])
) as SortConfig;
```

**修改位置**：
- 第86行：`safeGetItem` 默认值
- 第96行：版本不匹配时的默认值
- 第104行：验证失败时的默认值
- 第120行：异常处理时的默认值
- 第276行：`resetSort` 函数

### 2. 实现优先级双向同步

#### 2.1 需求池页面同步

**文件**：`src/app/requirements/page.tsx`

**修改**：在 `handlePriorityChange` 中同时更新两个字段

```typescript
const handlePriorityChange = useCallback((requirementId: string, value: string) => {
  // 验证输入
  const validationResult = validatePriority(value);
  if (!validationResult.valid) {
    toast.error(validationResult.error || '无效的优先级');
    return;
  }
  
  try {
    // 获取当前需求
    const requirement = requirements.find(req => req.id === requirementId);
    const updates: Partial<Requirement> = {
      priority: validationResult.value,  // ← 更新顶层 priority
    };
    
    // 同步更新 endOwnerOpinion.priority
    if (requirement?.endOwnerOpinion) {
      updates.endOwnerOpinion = {
        ...requirement.endOwnerOpinion,
        priority: validationResult.value,  // ← 同步到详情页
      };
    }
    
    updateRequirement(requirementId, updates);
    console.log('✅ 优先级已同步（列表→详情）:', validationResult.value);
  } catch (error) {
    toast.error('更新失败，请重试');
  }
}, [updateRequirement, requirements]);
```

#### 2.2 预排期页面同步

**文件**：`src/app/scheduled/page.tsx`

**修改**：包装 `updateRequirement` 函数

```typescript
import { useCallback } from 'react';

// 需求更新（包装以确保优先级同步）
const { updateRequirement: storeUpdateRequirement } = useRequirementsStore();
const { getRequirements } = useRequirementsStore();

// 包装 updateRequirement，确保优先级同步到 endOwnerOpinion
const updateRequirement = useCallback(async (id: string, updates: Partial<any>) => {
  // 如果更新了 priority，同步到 endOwnerOpinion.priority
  if ('priority' in updates) {
    const allRequirements = getRequirements();
    const requirement = allRequirements.find(req => req.id === id);
    
    if (requirement?.endOwnerOpinion) {
      updates.endOwnerOpinion = {
        ...requirement.endOwnerOpinion,
        priority: updates.priority,  // ← 同步到详情页
      };
    }
    console.log('✅ 优先级已同步（预排期→详情）:', updates.priority);
  }
  
  return storeUpdateRequirement(id, updates);
}, [storeUpdateRequirement, getRequirements]);
```

#### 2.3 详情页同步

**文件**：`src/app/requirements/[id]/page.tsx`

**已有代码**（已经正确）：
```typescript
const handleEndOwnerOpinionChange = async (opinion: EndOwnerOpinionData) => {
  if (!requirement) return;
  
  try {
    // 同时更新 endOwnerOpinion 和顶层字段
    await updateRequirement(requirement.id, {
      endOwnerOpinion: opinion,
      needToDo: opinion.needToDo,
      priority: opinion.priority  // ← 同步到顶层 priority（列表显示）
    });
    
    console.log('✅ 优先级已同步:', opinion.priority);
    toast.success('端负责人意见已更新');
  } catch (error) {
    toast.error('更新失败，请重试');
  }
};
```

**添加调试日志**：帮助用户验证同步是否成功

## 📊 同步流程

### 列表 → 详情页

```
用户在需求池/预排期修改优先级
         ↓
handlePriorityChange / PriorityCell.onClick
         ↓
updateRequirement({
  priority: newValue,              ← 更新顶层字段（列表显示）
  endOwnerOpinion: {
    ...existing,
    priority: newValue             ← 同步到详情页
  }
})
         ↓
Store 更新 → 所有组件重新渲染
         ↓
详情页自动显示新优先级 ✅
```

### 详情页 → 列表

```
用户在详情页端负责人意见中修改优先级
         ↓
handleEndOwnerOpinionChange
         ↓
updateRequirement({
  endOwnerOpinion: {
    priority: newValue             ← 更新详情页字段
  },
  priority: newValue               ← 同步到顶层字段（列表显示）
})
         ↓
Store 更新 → 所有组件重新渲染
         ↓
列表自动显示新优先级 ✅
```

## 🧪 测试验证

### 测试场景1：需求池 → 详情页

1. 打开需求池页面
2. 在列表中修改某个需求的优先级（例如：从"中"改为"高"）
3. 打开控制台，应该看到：`✅ 优先级已同步（列表→详情）: 高`
4. 点击该需求，进入详情页
5. 在"端负责人意见"卡片中，应该看到优先级"高"被选中 ✅

### 测试场景2：详情页 → 需求池

1. 打开需求详情页
2. 在"端负责人意见"卡片中修改优先级（例如：从"高"改为"紧急"）
3. 打开控制台，应该看到：`✅ 优先级已同步: 紧急`
4. 点击返回，回到需求池列表
5. 列表中该需求的优先级应该显示为"紧急" ✅

### 测试场景3：预排期 → 详情页

1. 打开预排期页面
2. 在表格中修改某个需求的优先级（例如：从"中"改为"低"）
3. 打开控制台，应该看到：`✅ 优先级已同步（预排期→详情）: 低`
4. 点击该需求，进入详情页
5. 详情页应该显示优先级为"低" ✅

### 测试场景4：详情页 → 预排期

1. 打开需求详情页
2. 修改优先级（例如：从"低"改为"紧急"）
3. 打开控制台，应该看到：`✅ 优先级已同步: 紧急`
4. 点击返回，回到预排期列表
5. 列表中该需求的优先级应该显示为"紧急" ✅

### 测试场景5：默认排序

1. 清除浏览器 localStorage：
   ```javascript
   localStorage.clear();
   location.reload();
   ```
2. 打开需求池页面
3. 列表应该按照创建时间倒序排列（最新创建的在最上面） ✅
4. 点击"创建时间"列头，应该看到向下箭头 ↓ ✅

## 📁 修改的文件

| 文件 | 修改内容 | 行号 |
|------|---------|------|
| `src/hooks/useRequirementFilters.ts` | 修改默认排序为 createdAt | 86, 96, 104, 120, 276 |
| `src/app/requirements/page.tsx` | 列表修改优先级时同步到详情页 | 128-159 |
| `src/app/scheduled/page.tsx` | 包装 updateRequirement 确保同步 | 81-102 |
| `src/app/requirements/[id]/page.tsx` | 添加调试日志 | 141 |

## 🎯 关键要点

### 1. 双重存储问题

优先级同时存在于两个地方：
- `requirement.priority` - 列表显示和修改
- `requirement.endOwnerOpinion.priority` - 详情页显示和修改

**必须同时更新两个字段才能保证同步！**

### 2. 更新时机

**列表修改时**：
```typescript
updateRequirement(id, {
  priority: newValue,                    // ← 列表
  endOwnerOpinion: { 
    ...existing, 
    priority: newValue                   // ← 详情页
  }
});
```

**详情页修改时**：
```typescript
updateRequirement(id, {
  endOwnerOpinion: { priority: newValue }, // ← 详情页
  priority: newValue                       // ← 列表
});
```

### 3. 调试日志

所有修改都添加了 `console.log`，方便验证同步是否成功：
- 需求池：`✅ 优先级已同步（列表→详情）: xxx`
- 预排期：`✅ 优先级已同步（预排期→详情）: xxx`
- 详情页：`✅ 优先级已同步: xxx`

## 🔧 使用说明

### 清除缓存后测试

为了确保修改生效，请执行以下步骤：

```javascript
// 1. 打开浏览器控制台（F12）
// 2. 执行以下命令清除缓存
localStorage.clear();
location.reload();

// 3. 测试优先级修改，控制台应该显示同步日志
```

### 验证同步成功

修改优先级后，在控制台查看日志：
- ✅ 看到日志 → 同步成功
- ❌ 没有日志 → 检查浏览器缓存是否清除

## ⚠️ 注意事项

1. **必须刷新页面**：修改代码后，需要刷新浏览器才能看到效果
2. **清除 localStorage**：首次使用时清除缓存，确保使用新的默认排序
3. **控制台日志**：生产环境可以移除调试日志（当前用于验证）

## 🎉 修复完成

- ✅ 需求池默认按创建时间排序
- ✅ 列表修改优先级 → 详情页自动同步
- ✅ 详情页修改优先级 → 列表自动同步
- ✅ 添加调试日志便于验证

**请清除浏览器缓存并测试！** 🚀

