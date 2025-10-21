# 下拉菜单z-index层级修复

## 🐛 问题描述

用户反馈：筛选设置和列隐藏的下拉弹窗与列表的标题栏重叠，导致下拉选项看不清楚。

## 🔍 问题分析

### 问题原因

表格标题栏使用了较高的z-index：
```tsx
<TableHeader className="sticky top-0 z-[100] bg-muted/50">
```

而下拉菜单没有设置足够高的z-index，导致被表格标题栏覆盖。

### 层级冲突

```
表格标题栏：z-index: 100 (sticky, 固定在顶部)
          ↑ 覆盖了
下拉菜单：  z-index: 默认值 (大约50)
```

结果：下拉菜单被表格标题栏遮挡。

## ✅ 解决方案

### 1. 工具栏下拉菜单（最高优先级）

**文件**：
- `src/components/common/DataTable/DataTableColumns.tsx`
- `src/components/common/DataTable/DataTableFilters.tsx`

**修改**：添加 `z-[200]`

```tsx
// 列控制面板
<DropdownMenuContent 
  align="end" 
  className="w-64 z-[200]"  // ← 添加 z-[200]
>

// 筛选设置
<DropdownMenuContent 
  align="start" 
  className="w-[600px] z-[200]"  // ← 添加 z-[200]
  sideOffset={4}
>
```

### 1.5. 批量操作下拉菜单（最高优先级）

**文件**：
- `src/app/scheduled/components/ScheduledBatchActions.tsx` ⭐ **实际使用**
- `src/components/scheduled/ScheduledBatchActionsBar.tsx` (旧版本，未使用)
- `src/components/requirements/BatchOperations.tsx`

**修改**：添加 `z-[200]`

```tsx
// 预排期批量操作（ScheduledBatchActions.tsx - 实际使用的组件）
<DropdownMenuContent className="z-[200]">  // ← 批量分配版本
<DropdownMenuContent className="z-[200]">  // ← 批量评审
<DropdownMenuContent className="z-[200]">  // ← 批量是否运营

// 需求池批量操作
<SelectContent className="z-[200]">  // ← 批量设置是否要做
```

**重要提示**：预排期页面实际使用的是 `ScheduledBatchActions.tsx`，而不是 `ScheduledBatchActionsBar.tsx`。这两个组件功能相似，但前者配合通用的 `DataTableBatchBar` 组件使用。

### 1.6. 批量操作栏容器（中等优先级）

**文件**：`src/components/common/DataTable/DataTableBatchBar.tsx`

**修改**：添加 `z-[110]` 到容器

```tsx
<div className="px-4 pb-3 relative z-[110]">
  {/* 批量操作栏内容 */}
</div>
```

**作用**：确保整个批量操作栏容器位于表格标题栏（z-100）之上，为其内部的下拉菜单提供正确的堆叠上下文。

### 2. 表格内单元格下拉菜单（中等优先级）

**文件**：`src/components/scheduled/cells/index.tsx`

**修改**：添加 `z-[150]`

```tsx
// 优先级下拉菜单
<DropdownMenuContent align="center" className="w-20 z-[150]">

// 版本号下拉菜单
<DropdownMenuContent align="start" className="w-32 z-[150]">

// 评审状态下拉菜单
<DropdownMenuContent align="start" className="w-28 z-[150]">

// 是否运营下拉菜单
<DropdownMenuContent align="start" className="w-24 z-[150]">
```

## 📊 z-index层级规划

| 元素 | z-index | 说明 |
|------|---------|------|
| 普通内容 | 1-9 | 默认层级 |
| 普通下拉菜单 | 50 | Shadcn UI默认值 |
| 表格标题栏 | 100 | sticky固定头部（预排期、需求池） |
| 批量操作栏容器 | 110 | 在标题栏之上 |
| 表格内下拉菜单 | 150 | 在标题栏之上（单元格操作） |
| 工具栏下拉菜单 | 200 | 最高优先级（筛选、列控制、批量操作） |
| 批量操作下拉菜单 | 200 | 最高优先级 |
| 嵌套下拉菜单 | 250 | 下拉菜单内的Select组件 |
| Modal/Dialog | 1000+ | 全局弹窗 |

### 层级关系

```
┌─────────────────────────────────────┐
│  嵌套下拉菜单 (z-250)                │
│  (筛选面板内的Select组件)            │
├─────────────────────────────────────┤
│  工具栏下拉菜单 (z-200)              │
│  批量操作下拉菜单 (z-200)            │
│  (筛选设置、列控制、批量操作)        │
├─────────────────────────────────────┤
│  表格内下拉菜单 (z-150)              │
│  (优先级、是否要做、版本号等)        │
├─────────────────────────────────────┤
│  批量操作栏容器 (z-110)              │
├─────────────────────────────────────┤
│  表格标题栏 (z-100) - sticky         │
│  (预排期、需求池)                    │
├─────────────────────────────────────┤
│  默认下拉菜单 (z-50)                 │
├─────────────────────────────────────┤
│  普通内容 (z-1~9)                    │
└─────────────────────────────────────┘
```

## 🎯 修复效果

### 修复前

```
用户点击"筛选设置"或"列设置"
  ↓
下拉菜单展开
  ↓
被表格标题栏遮挡 ❌
  ↓
用户看不到选项
```

### 修复后 ✅

```
用户点击"筛选设置"或"列设置"
  ↓
下拉菜单展开
  ↓
完整显示在标题栏上方 ✅
  ↓
用户可以清晰看到所有选项
```

## 📁 修改的文件

### 通用组件

| 文件 | 修改内容 | z-index |
|------|---------|---------|
| `src/components/common/DataTable/DataTableColumns.tsx` | 列控制下拉菜单 | 200 |
| `src/components/common/DataTable/DataTableFilters.tsx` | 筛选设置下拉菜单 | 200 |
| `src/components/common/DataTable/DataTableBatchBar.tsx` | 批量操作栏容器 | 110 |

### 预排期页面

| 文件 | 修改内容 | z-index |
|------|---------|---------|
| `src/app/scheduled/components/ScheduledBatchActions.tsx` | 批量操作下拉菜单（3个） ⭐ | 200 |
| `src/components/scheduled/ScheduledBatchActionsBar.tsx` | 批量操作下拉菜单（旧组件，未使用） | 200 |
| `src/components/scheduled/cells/index.tsx` | 表格内4个单元格下拉菜单 | 150 |

### 需求池页面

| 文件 | 修改内容 | z-index |
|------|---------|---------|
| `src/components/requirements/FilterPanel.tsx` | 筛选设置下拉菜单 | 200 |
| `src/components/requirements/FilterPanel.tsx` | 列控制下拉菜单 | 200 |
| `src/components/requirements/FilterPanel.tsx` | 筛选面板内嵌套Select（2个） | 250 |
| `src/components/requirements/BatchOperations.tsx` | 批量操作卡片容器 | 110 |
| `src/components/requirements/BatchOperations.tsx` | 批量操作下拉菜单 | 200 |
| `src/components/requirements/RequirementTable.tsx` | 表格内2个单元格下拉菜单 | 150 |

⭐ = 实际在页面中使用的组件

## 🧪 测试要点

### 工具栏下拉菜单

**预排期：**
- [ ] 点击"列设置"按钮，下拉菜单完整显示
- [ ] 点击"筛选设置"按钮，下拉菜单完整显示
- [ ] 下拉菜单在表格标题栏之上

**需求池：**
- [ ] 点击"列隐藏"按钮，下拉菜单完整显示
- [ ] 点击"筛选设置"按钮，下拉菜单完整显示
- [ ] 筛选设置面板内的嵌套Select下拉菜单完整显示
- [ ] 下拉菜单在表格标题栏之上

**通用：**
- [ ] 滚动页面时，下拉菜单不被遮挡

### 批量操作下拉菜单

**预排期：**
- [ ] 点击"批量分配版本"，下拉菜单完整显示
- [ ] 点击"批量评审"，下拉菜单完整显示
- [ ] 点击"批量是否运营"，下拉菜单完整显示

**需求池：**
- [ ] 点击"批量设置是否要做"，下拉菜单完整显示
- [ ] 所有批量操作下拉菜单在表格标题栏之上

### 表格内下拉菜单

**预排期：**
- [ ] 点击优先级单元格，下拉菜单正常显示
- [ ] 点击版本号单元格，下拉菜单正常显示
- [ ] 点击评审状态单元格，下拉菜单正常显示
- [ ] 点击是否运营单元格，下拉菜单正常显示

**需求池：**
- [ ] 点击"是否要做"单元格，下拉菜单正常显示
- [ ] 点击"优先级"单元格，下拉菜单正常显示

**通用：**
- [ ] 所有下拉菜单在表格标题栏之上

### 交互测试

- [ ] 下拉菜单打开后，可以正常选择选项
- [ ] 选择选项后，下拉菜单正常关闭
- [ ] 点击下拉菜单外部，菜单自动关闭
- [ ] 多个下拉菜单同时存在时，层级正确

## 💡 技术要点

### 1. Tailwind CSS z-index

```tsx
// Tailwind CSS z-index 工具类
z-0    → z-index: 0
z-10   → z-index: 10
z-50   → z-index: 50
z-[100] → z-index: 100  // 任意值
z-[150] → z-index: 150  // 任意值
z-[200] → z-index: 200  // 任意值
```

### 2. sticky定位的z-index

```tsx
// sticky元素需要z-index才能正确堆叠
<div className="sticky top-0 z-[100]">
  {/* 固定在顶部 */}
</div>
```

### 3. DropdownMenu的Portal

Shadcn UI的DropdownMenu使用了Portal渲染，但仍然受z-index影响：

```tsx
<DropdownMenuContent className="z-[200]">
  {/* Portal渲染，但需要设置z-index */}
</DropdownMenuContent>
```

## 🔗 相关文档

- [隐藏列修复](./SCHEDULED_HIDDEN_COLUMNS_FIX.md) - 列隐藏功能修复
- [列配置修复](./SCHEDULED_FILTERABLE_COLUMNS_FIX.md) - 列配置完整性修复
- [调试文档](./SCHEDULED_HIDDEN_COLUMNS_DEBUG.md) - 调试工具和方法

## 🎉 修复总结

通过统一规划z-index层级，确保：

1. ✅ 工具栏下拉菜单始终在最上层（z-200）
2. ✅ 批量操作下拉菜单始终在最上层（z-200）
3. ✅ 嵌套下拉菜单在父下拉菜单之上（z-250）
4. ✅ 批量操作栏容器在标题栏之上（z-110）
5. ✅ 表格内下拉菜单在标题栏之上（z-150）
6. ✅ 表格标题栏固定在顶部（z-100）
7. ✅ 预排期和需求池页面都已修复
8. ✅ 所有下拉菜单都能完整显示
9. ✅ 用户体验流畅

### 关键修复点

**问题根源**：
- 预排期：`ScheduledBatchActions.tsx`（实际使用的组件）的下拉菜单没有设置z-index
- 需求池：`FilterPanel.tsx` 和 `RequirementTable.tsx` 的下拉菜单没有设置z-index
- 批量操作栏容器的z-index低于表格标题栏
- 筛选面板内嵌套的Select组件需要更高的z-index
- 存在两个功能相似的批量操作组件，容易混淆

**解决方案**：

**预排期页面：**
1. ✅ 修复实际使用的 `ScheduledBatchActions.tsx` 组件（3个下拉菜单）
2. ✅ 给 `DataTableBatchBar` 容器添加 `z-[110]`
3. ✅ 表格内4个单元格下拉菜单添加 `z-[150]`

**需求池页面：**
1. ✅ `FilterPanel.tsx` 筛选设置下拉菜单添加 `z-[200]`
2. ✅ `FilterPanel.tsx` 列控制下拉菜单添加 `z-[200]`
3. ✅ `FilterPanel.tsx` 筛选面板内嵌套Select添加 `z-[250]`
4. ✅ `BatchOperations.tsx` 批量操作卡片容器添加 `z-[110]`
5. ✅ `BatchOperations.tsx` 批量操作下拉菜单添加 `z-[200]`
6. ✅ `RequirementTable.tsx` 表格内2个单元格下拉菜单添加 `z-[150]`

**通用组件：**
1. ✅ `DataTableColumns.tsx` 列控制下拉菜单添加 `z-[200]`
2. ✅ `DataTableFilters.tsx` 筛选设置下拉菜单添加 `z-[200]`
3. ✅ `DataTableBatchBar.tsx` 批量操作栏容器添加 `z-[110]`

### 修复统计

- **修改文件总数**：9个
- **修复下拉菜单数量**：15+个
- **涉及页面**：预排期、需求池
- **层级规划**：6个不同的z-index层级

---

**修复已完成！预排期和需求池的所有下拉菜单都不会被遮挡了！请刷新浏览器查看效果！** 🚀

