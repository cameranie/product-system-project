# 预排期页面重构 - 快速实施指南

## 📌 概览

将 **2203行** 的巨型文件拆分为 **17个** 职责清晰的模块文件。

## 🎯 拆分结果对比

### 重构前
```
src/app/scheduled/
└── page.tsx (2203行) ❌ 难以维护
```

### 重构后
```
src/app/scheduled/
├── page.tsx (150行) ✅ 清晰的主入口
├── hooks/ (5个文件, 770行)
│   ├── useScheduledData.ts
│   ├── useScheduledSelection.ts
│   ├── useScheduledBatchActions.ts
│   ├── useScheduledColumns.ts
│   └── useScheduledReview.ts
├── components/ (10个文件, 1200行)
│   ├── ScheduledHeader.tsx
│   ├── ScheduledFilters/
│   ├── BatchActionsBar.tsx
│   └── ScheduledTable/
└── utils/ (2个文件, 200行)
    ├── scheduled-helpers.ts
    └── table-renderer.ts
```

---

## ⚡ 快速开始（3步走）

### 第1天：创建 Hooks（核心逻辑迁移）

```bash
# 1. 创建目录
mkdir -p src/app/scheduled/hooks

# 2. 创建 Hook 文件（按依赖顺序）
touch src/app/scheduled/hooks/useScheduledColumns.ts
touch src/app/scheduled/hooks/useScheduledSelection.ts
touch src/app/scheduled/hooks/useScheduledReview.ts
touch src/app/scheduled/hooks/useScheduledBatchActions.ts
touch src/app/scheduled/hooks/useScheduledData.ts
```

**实施顺序**（从独立到依赖）:
1. ✅ `useScheduledColumns` - 最独立，只管理列配置
2. ✅ `useScheduledSelection` - 依赖分组数据
3. ✅ `useScheduledReview` - 独立的对话框状态
4. ✅ `useScheduledBatchActions` - 依赖选择状态
5. ✅ `useScheduledData` - 最核心，整合筛选逻辑

---

### 第2天：创建组件（UI层拆分）

```bash
# 1. 创建组件目录
mkdir -p src/app/scheduled/components/ScheduledFilters
mkdir -p src/app/scheduled/components/ScheduledTable

# 2. 创建组件文件
# 筛选相关
touch src/app/scheduled/components/ScheduledFilters/index.tsx
touch src/app/scheduled/components/ScheduledFilters/SearchInput.tsx
touch src/app/scheduled/components/ScheduledFilters/FilterSettings.tsx
touch src/app/scheduled/components/ScheduledFilters/ColumnSettings.tsx

# 表格相关
touch src/app/scheduled/components/ScheduledTable/index.tsx
touch src/app/scheduled/components/ScheduledTable/TableHeader.tsx
touch src/app/scheduled/components/ScheduledTable/VersionGroup.tsx
touch src/app/scheduled/components/ScheduledTable/TableRow.tsx

# 其他组件
touch src/app/scheduled/components/ScheduledHeader.tsx
touch src/app/scheduled/components/BatchActionsBar.tsx
```

**实施顺序**:
1. ✅ 小组件优先：`SearchInput`, `ScheduledHeader`
2. ✅ 独立功能：`BatchActionsBar`, `FilterSettings`
3. ✅ 复杂组件：`ScheduledTable`, `ColumnSettings`

---

### 第3天：重构主文件

```bash
# 备份原文件
cp src/app/scheduled/page.tsx src/app/scheduled/page.tsx.backup

# 开始重构主文件
# 逐步替换原有代码，每替换一部分就测试一次
```

---

## 📋 详细实施步骤

### 步骤 1: 创建 `useScheduledColumns` Hook

**迁移内容**：
- ✅ `hiddenColumns` 状态
- ✅ `columnOrder` 状态
- ✅ localStorage 读写逻辑
- ✅ 列显示/隐藏逻辑
- ✅ 列排序逻辑

**从原文件中提取**：
```tsx
// page.tsx 第 318-352 行
const [hiddenColumns, setHiddenColumns] = useState<string[]>(...)
const [columnOrder, setColumnOrder] = useState<string[]>(...)

// page.tsx 第 1023-1046 行
const handleToggleColumn = useCallback(...)
const handleColumnReorder = useCallback(...)
const isColumnVisible = useCallback(...)
```

**新文件位置**：`src/app/scheduled/hooks/useScheduledColumns.ts`

**验证**：
```tsx
// 在 page.tsx 中测试导入
import { useScheduledColumns } from './hooks/useScheduledColumns';

const {
  columnOrder,
  hiddenColumns,
  isColumnVisible,
  toggleColumnVisibility,
  handleColumnReorder,
  resetColumns,
} = useScheduledColumns();

console.log('列配置加载成功:', columnOrder.length);
```

---

### 步骤 2: 创建 `useScheduledSelection` Hook

**迁移内容**：
- ✅ `selectedRequirements` 状态
- ✅ `selectedIndexes` 状态
- ✅ `versionBatchModes` 状态
- ✅ 选择处理逻辑

**从原文件中提取**：
```tsx
// page.tsx 第 356-363 行
const [selectedRequirements, setSelectedRequirements] = useState<string[]>([])
const [versionBatchModes, setVersionBatchModes] = useState<Record<string, boolean>>({})
const [selectedIndexes, setSelectedIndexes] = useState<string[]>([])

// page.tsx 第 789-816 行
const handleSelectRequirement = useCallback(...)
const handleSelectAll = useCallback(...)
```

**新文件位置**：`src/app/scheduled/hooks/useScheduledSelection.ts`

---

### 步骤 3: 创建 `useScheduledReview` Hook

**迁移内容**：
- ✅ `reviewDialogOpen` 状态
- ✅ `currentReviewRequirement` 状态
- ✅ `reviewLevel` 状态
- ✅ `reviewOpinion` 状态
- ✅ 评审提交逻辑

**从原文件中提取**：
```tsx
// page.tsx 第 367-370 行
const [reviewDialogOpen, setReviewDialogOpen] = useState(false)
const [currentReviewRequirement, setCurrentReviewRequirement] = useState<Requirement | null>(null)
const [reviewLevel, setReviewLevel] = useState<number>(1)
const [reviewOpinion, setReviewOpinion] = useState('')

// page.tsx 第 740-784 行
const handleOpenReviewDialog = useCallback(...)
const handleSubmitReview = useCallback(...)
```

**新文件位置**：`src/app/scheduled/hooks/useScheduledReview.ts`

---

### 步骤 4: 创建 `useScheduledBatchActions` Hook

**迁移内容**：
- ✅ 批量分配版本逻辑
- ✅ 批量评审逻辑
- ✅ 批量设置运营逻辑

**从原文件中提取**：
```tsx
// page.tsx 第 821-847 行
const handleBatchAssignVersion = useCallback(...)

// page.tsx 第 852-898 行
const handleBatchReview = useCallback(...)

// page.tsx 第 903-931 行
const handleBatchIsOperational = useCallback(...)
```

**新文件位置**：`src/app/scheduled/hooks/useScheduledBatchActions.ts`

---

### 步骤 5: 创建 `useScheduledData` Hook

**迁移内容**：
- ✅ 数据获取逻辑
- ✅ 筛选和排序逻辑
- ✅ 分组逻辑
- ✅ 版本管理

**从原文件中提取**：
```tsx
// page.tsx 第 283-293 行
const allRequirements = useRequirementsStore(state => state.requirements)
const { getVersionNumbers, initFromStorage } = useVersionStore()

// page.tsx 第 421-477 行
const scheduledRequirements = useMemo(...)
const filteredRequirements = useMemo(...)
const groupedRequirements = useMemo(...)
```

**新文件位置**：`src/app/scheduled/hooks/useScheduledData.ts`

---

### 步骤 6: 创建 `SearchInput` 组件

**迁移内容**：
```tsx
// page.tsx 第 1734-1742 行
<div className="relative w-80">
  <Search className="..." />
  <Input placeholder="搜索..." />
</div>
```

**新文件位置**：`src/app/scheduled/components/ScheduledFilters/SearchInput.tsx`

---

### 步骤 7: 创建 `FilterSettings` 组件

**迁移内容**：
```tsx
// page.tsx 第 1745-1825 行
<DropdownMenu>
  <DropdownMenuTrigger>筛选设置</DropdownMenuTrigger>
  <DropdownMenuContent>
    {/* 筛选条件列表 */}
  </DropdownMenuContent>
</DropdownMenu>
```

**新文件位置**：`src/app/scheduled/components/ScheduledFilters/FilterSettings.tsx`

---

### 步骤 8: 创建 `ColumnSettings` 组件

**迁移内容**：
```tsx
// page.tsx 第 1828-1885 行
<DropdownMenu>
  <DropdownMenuTrigger>列隐藏</DropdownMenuTrigger>
  <DropdownMenuContent>
    {/* 列显示/隐藏控制 */}
  </DropdownMenuContent>
</DropdownMenu>
```

**新文件位置**：`src/app/scheduled/components/ScheduledFilters/ColumnSettings.tsx`

---

### 步骤 9: 创建 `BatchActionsBar` 组件

**迁移内容**：
```tsx
// page.tsx 第 1889-1969 行
{showBatchActions && (
  <div className="bg-blue-50 ...">
    {/* 批量操作按钮 */}
  </div>
)}
```

**新文件位置**：`src/app/scheduled/components/BatchActionsBar.tsx`

---

### 步骤 10: 创建 `ScheduledTable` 组件

**迁移内容**：
```tsx
// page.tsx 第 1976-2160 行
<div className="border rounded-lg ...">
  {/* 表格头部和内容 */}
</div>
```

**新文件位置**：`src/app/scheduled/components/ScheduledTable/index.tsx`

---

## ✅ 每步验证清单

### Hook 验证
```tsx
// 在 page.tsx 中添加临时测试代码
const test = useScheduledColumns();
console.log('Hook 工作正常:', test.columnOrder);
```

### 组件验证
```tsx
// 在 page.tsx 中临时渲染组件
<SearchInput value="" onChange={() => {}} />
```

### 功能验证
- [ ] 搜索功能正常
- [ ] 筛选功能正常
- [ ] 排序功能正常
- [ ] 选择功能正常
- [ ] 批量操作正常
- [ ] 评审功能正常

---

## 🔍 常见问题

### Q1: Hook 之间如何传递数据？
**A**: 在主文件 `page.tsx` 中协调各个 Hook，通过 props 传递数据。

```tsx
const data = useScheduledData();
const selection = useScheduledSelection(data.groupedRequirements);
const batchActions = useScheduledBatchActions(selection.selectedIds);
```

### Q2: 如何避免循环依赖？
**A**: 遵循依赖层级：
```
useScheduledData (底层)
    ↓
useScheduledSelection (中层)
    ↓
useScheduledBatchActions (顶层)
```

### Q3: 如何测试 Hook？
**A**: 使用 `@testing-library/react-hooks`

```tsx
import { renderHook } from '@testing-library/react-hooks';
import { useScheduledColumns } from './useScheduledColumns';

test('应该正确管理列配置', () => {
  const { result } = renderHook(() => useScheduledColumns());
  expect(result.current.columnOrder).toBeDefined();
});
```

### Q4: 重构过程中如何保证不影响线上？
**A**: 采用渐进式重构：
1. 在新分支开发
2. 保留原文件备份
3. 逐步替换，每步测试
4. 完成后整体测试
5. Code Review 后合并

---

## 📊 进度追踪表

| 任务 | 文件 | 行数 | 状态 | 预计时间 |
|------|------|------|------|---------|
| Hook 1 | useScheduledColumns.ts | 120 | ⬜ 待开始 | 2h |
| Hook 2 | useScheduledSelection.ts | 150 | ⬜ 待开始 | 2h |
| Hook 3 | useScheduledReview.ts | 100 | ⬜ 待开始 | 1.5h |
| Hook 4 | useScheduledBatchActions.ts | 200 | ⬜ 待开始 | 3h |
| Hook 5 | useScheduledData.ts | 200 | ⬜ 待开始 | 3h |
| 组件 1 | SearchInput.tsx | 50 | ⬜ 待开始 | 0.5h |
| 组件 2 | FilterSettings.tsx | 150 | ⬜ 待开始 | 2h |
| 组件 3 | ColumnSettings.tsx | 150 | ⬜ 待开始 | 2h |
| 组件 4 | BatchActionsBar.tsx | 150 | ⬜ 待开始 | 2h |
| 组件 5 | ScheduledTable/ | 400 | ⬜ 待开始 | 4h |
| 重构 | page.tsx | 150 | ⬜ 待开始 | 3h |
| 测试 | 全部功能 | - | ⬜ 待开始 | 4h |

**总计预计时间**: 29小时 ≈ **4个工作日**

---

## 🎉 完成后的收益

### 代码质量
- ✅ 主文件从 2203行 降至 150行（减少 93%）
- ✅ 最长文件不超过 200行
- ✅ 每个模块职责单一清晰

### 开发体验
- ✅ 查找代码更快速
- ✅ 修改功能更安全
- ✅ 新增功能更容易
- ✅ Code Review 更高效

### 团队协作
- ✅ 减少代码冲突
- ✅ 并行开发更容易
- ✅ 新人上手更快

### 可测试性
- ✅ 可以为每个 Hook 编写单元测试
- ✅ 可以独立测试组件
- ✅ 测试覆盖率更高

---

## 📚 相关文档

- 📄 [完整重构方案](./SCHEDULED_REFACTOR_PLAN.md) - 详细的架构设计
- 💻 [代码示例](./SCHEDULED_REFACTOR_EXAMPLES.md) - 完整的实现代码
- 🔍 [代码质量报告](./SCHEDULED_CODE_QUALITY_REPORT.md) - 优化前后对比

---

## 💪 开始行动

```bash
# 1. 创建分支
git checkout -b refactor/scheduled-page

# 2. 创建目录结构
mkdir -p src/app/scheduled/{hooks,components,utils}

# 3. 开始第一个 Hook
# 复制示例代码到 useScheduledColumns.ts

# 4. 测试验证
npm run dev

# 5. 提交进度
git add .
git commit -m "refactor: 创建 useScheduledColumns hook"
```

**祝你重构顺利！** 🚀

