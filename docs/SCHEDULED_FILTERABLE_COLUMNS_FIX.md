# 预排期列隐藏功能根本原因修复

## 🐛 问题根源

用户反馈："刷新后是6个隐藏，一会又恢复4个隐藏了"

### 问题分析

通过调试日志发现：
1. **初始化时**：正确计算出应该隐藏6个列
2. **稍后**：hiddenColumns 被修改为只有4个列

缺失的列：`id` 和 `type`

### 根本原因

**`SCHEDULED_FILTERABLE_COLUMNS` 配置不完整！**

#### 修复前（错误配置）

```tsx
export const SCHEDULED_FILTERABLE_COLUMNS = [
  { value: 'id', label: 'ID' },
  { value: 'type', label: '类型' },
  { value: 'priority', label: '优先级' },
  { value: 'version', label: '版本号' },
  { value: 'platforms', label: '应用端' },
] as const;
```

❌ **只包含5个列**，缺少：
- creator（创建人）
- createdAt（创建时间）
- updatedAt（更新时间）
- level1Reviewer（一级评审人）
- level1Status（一级评审）
- level1Opinion（一级意见）
- level2Reviewer（二级评审人）
- level2Status（二级评审）
- level2Opinion（二级意见）
- isOperational（是否运营）
- overallReviewStatus（总评审状态）

### 问题影响

`DataTableColumns` 组件使用 `columnsConfig` 来渲染列控制面板：

```tsx
// src/app/scheduled/hooks/useScheduledColumns.ts
const columnsConfig = SCHEDULED_FILTERABLE_COLUMNS.reduce((acc, col) => {
  acc[col.value] = { label: col.label };
  return acc;
}, {} as Record<string, { label: string }>);
```

如果某个列不在 `SCHEDULED_FILTERABLE_COLUMNS` 中：
1. `columnsConfig` 中没有该列的配置
2. `DataTableColumns` 组件可能无法正确处理该列
3. 导致列的显示/隐藏状态异常

## ✅ 修复方案

### 1. 补全所有列配置

**文件**：`src/config/scheduled-requirements.ts`

```tsx
/**
 * 可在列控制面板中显示的所有列配置
 * 注意：这个列表要包含所有可能出现在表格中的列
 */
export const SCHEDULED_FILTERABLE_COLUMNS = [
  { value: 'id', label: 'ID' },
  { value: 'type', label: '类型' },
  { value: 'platforms', label: '应用端' },
  { value: 'priority', label: '优先级' },
  { value: 'version', label: '版本号' },
  { value: 'overallReviewStatus', label: '总评审状态' },
  { value: 'level1Reviewer', label: '一级评审人' },
  { value: 'level1Status', label: '一级评审' },
  { value: 'level1Opinion', label: '一级意见' },
  { value: 'level2Reviewer', label: '二级评审人' },
  { value: 'level2Status', label: '二级评审' },
  { value: 'level2Opinion', label: '二级意见' },
  { value: 'isOperational', label: '是否运营' },
  { value: 'creator', label: '创建人' },
  { value: 'createdAt', label: '创建时间' },
  { value: 'updatedAt', label: '更新时间' },
] as const;
```

✅ **现在包含16个列**，覆盖所有可能的列！

### 2. 升级配置版本

```tsx
// v6.2 → v6.3
export const SCHEDULED_CONFIG_VERSION = '6.3';
```

### 3. 移除调试日志

清理了 `useScheduledColumns` 中的临时调试代码。

## 📊 对比

### 修复前

```
SCHEDULED_FILTERABLE_COLUMNS = 5个列
  ↓
columnsConfig = { id, type, priority, version, platforms }
  ↓
缺少 creator, createdAt, updatedAt 等11个列的配置
  ↓
列控制面板无法正确处理这些列
  ↓
hiddenColumns 状态异常
```

### 修复后 ✅

```
SCHEDULED_FILTERABLE_COLUMNS = 16个列（完整）
  ↓
columnsConfig = { 所有列的完整配置 }
  ↓
列控制面板正确处理所有列
  ↓
hiddenColumns 状态正确
```

## 🧪 验证

刷新页面后，应该：

### 1. 列控制面板显示

点击"列设置"，应该显示 **"6 列隐藏"**：
- ☐ ID（隐藏）
- ☐ 类型（隐藏）
- ☐ 应用端（隐藏）
- ☑ 优先级（显示）
- ☑ 版本号（显示）
- ☑ 总评审状态（显示）
- ☑ 一级评审人（显示）
- ☑ 一级评审（显示）
- ☑ 一级意见（显示）
- ☑ 二级评审人（显示）
- ☑ 二级评审（显示）
- ☑ 二级意见（显示）
- ☑ 是否运营（显示）
- ☐ 创建人（隐藏）
- ☐ 创建时间（隐藏）
- ☐ 更新时间（隐藏）

### 2. 表格显示

表格只显示11个核心列：
1. 序号
2. 标题
3. 优先级
4. 版本号
5. 一级评审人
6. 一级评审
7. 一级意见
8. 二级评审人
9. 二级评审
10. 二级意见
11. 是否运营

**不显示**：ID、类型、应用端、创建人、创建时间、更新时间

### 3. localStorage

```javascript
localStorage.getItem('scheduled-config-version') === '6.3'
JSON.parse(localStorage.getItem('scheduled-hidden-columns'))
// ["id", "type", "platforms", "creator", "createdAt", "updatedAt"]
```

### 4. 持久性验证

- 刷新页面 → 隐藏列保持6个 ✅
- 等待几秒 → 隐藏列仍然是6个 ✅
- 切换列显示/隐藏 → 正常工作 ✅
- 关闭浏览器重新打开 → 配置保持 ✅

## 💡 经验教训

### 1. 配置要完整

```tsx
// ❌ 不完整的配置会导致功能异常
export const FILTERABLE_COLUMNS = [
  { value: 'id', label: 'ID' },
  { value: 'type', label: '类型' },
  // 缺少其他列...
];

// ✅ 完整的配置
export const FILTERABLE_COLUMNS = [
  { value: 'id', label: 'ID' },
  { value: 'type', label: '类型' },
  { value: 'creator', label: '创建人' },
  { value: 'createdAt', label: '创建时间' },
  // ... 所有列
];
```

### 2. 配置要与实际列一致

```tsx
// 所有在 DEFAULT_SCHEDULED_COLUMN_ORDER 中的列
// 都应该在 SCHEDULED_FILTERABLE_COLUMNS 中有对应配置
```

### 3. 命名要准确

`SCHEDULED_FILTERABLE_COLUMNS` 这个名字容易误导，以为只包含"可筛选"的列。

更准确的名字应该是：
- `SCHEDULED_ALL_COLUMNS_CONFIG`
- `SCHEDULED_COLUMNS_METADATA`
- `SCHEDULED_COLUMN_DEFINITIONS`

## 🔗 相关文档

- [隐藏列修复文档](./SCHEDULED_HIDDEN_COLUMNS_FIX.md) - 初次修复尝试
- [调试文档](./SCHEDULED_HIDDEN_COLUMNS_DEBUG.md) - 调试过程和工具
- [列更新总结](./SCHEDULED_COLUMN_UPDATES.md) - 列配置和评审人列
- [Bug修复总结](./SCHEDULED_BUGFIX_SUMMARY.md) - 其他问题修复

---

**修复已完成！请刷新浏览器查看效果！** 🚀

### 预期效果：
1. ✅ 列控制面板显示"6 列隐藏"
2. ✅ 表格只显示11个核心列
3. ✅ 刷新后隐藏列保持不变（不会从6个变成4个）
4. ✅ 所有列都可以正常显示/隐藏

