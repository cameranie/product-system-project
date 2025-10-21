# 📝 接下来的步骤 - 完成最后20%

## 当前状态：80% ✅

您已经完成了核心的重构工作！现在只需要完成表格集成和测试验证即可。

---

## 🎉 最新更新 (2025-10-21)

### ✅ 预排期表格粘性列优化完成

**实现功能：**
- ✅ 纵向滚动时表头固定显示
- ✅ 横向滚动时序号列和标题列固定显示
- ✅ 版本标题行的复选框列同步固定
- ✅ 添加阴影效果区分固定区域和滚动区域

**详细文档：** 查看 [`SCHEDULED_STICKY_COLUMNS.md`](./SCHEDULED_STICKY_COLUMNS.md)

---

## ⏰ 预计耗时：6小时

| 任务 | 耗时 | 难度 |
|------|------|------|
| 表格组件集成 | 2-3小时 | 🟡 中等 |
| 接口适配 | 1小时 | 🟢 简单 |
| 功能测试 | 2小时 | 🟢 简单 |
| 性能验证 | 1小时 | 🟢 简单 |

---

## 🚀 Step 1: 集成表格组件（2-3小时）

### 1.1 打开文件

```bash
code /Users/applychart/product-system-project/src/app/scheduled/page.tsx
```

### 1.2 在文件顶部添加导入

```tsx
// 在现有导入后添加
import { ScheduledMainTable } from '@/components/scheduled/ScheduledMainTable';
```

### 1.3 找到临时占位代码（约第115-120行）

```tsx
{/* ✅ 预排期专用表格（版本分组 + 评审） */}
<div className="px-4 pb-4">
  <div className="text-center text-muted-foreground py-8">
    <p>表格组件正在迁移中...</p>
    <p className="text-sm mt-2">原有表格功能已集成到新架构</p>
  </div>
</div>
```

### 1.4 替换为实际表格组件

```tsx
{/* ✅ 预排期专用表格（版本分组 + 评审） */}
<div className="px-4 pb-4">
  <ScheduledMainTable
    groupedRequirements={groupedRequirements}
    expandedVersions={expandedVersions}
    selectedRequirements={selectedIds}
    selectedIndexes={[]} // 如需要序号列选择
    versionBatchModes={{}} // 如需要版本批量模式
    columnOrder={columnOrder}
    hiddenColumns={hiddenColumns}
    sortConfig={sortConfig}
    onToggleVersion={toggleVersion}
    onSelectRequirement={selectionActions.toggle}
    onSelectAll={(version, checked) => {
      // 实现版本全选逻辑
      const versionReqs = groupedRequirements[version] || [];
      versionReqs.forEach(req => selectionActions.toggle(req.id, checked));
    }}
    onToggleVersionBatchMode={(version, enabled) => {
      // 如需要批量模式
      console.log('Toggle batch mode', version, enabled);
    }}
    onOpenReviewDialog={reviewDialog.open}
    onSort={onSort}
    isColumnVisible={isColumnVisible}
  />
</div>
```

### 1.5 可能需要的调整

检查 `ScheduledMainTable` 组件的props定义，确保传递的props匹配。

**参考原文件**：
```bash
# 查看原始实现
code /Users/applychart/product-system-project/src/app/scheduled/page.tsx.backup
# 跳转到第1976行查看原表格实现
```

---

## 🔧 Step 2: 适配ReviewDialog接口（1小时）

### 2.1 检查当前ReviewDialog调用（约第130行）

```tsx
<ReviewDialog
  open={reviewDialog.isOpen}
  onClose={reviewDialog.close}
  requirement={reviewDialog.requirement}
  level={reviewDialog.level}
  onSaveReview={(reqId, level, opinion) => {
    reviewDialog.setOpinion(opinion);
    reviewDialog.submit('approved'); // 简化处理
  }}
/>
```

### 2.2 修改为完整实现

```tsx
<ReviewDialog
  open={reviewDialog.isOpen}
  onClose={reviewDialog.close}
  requirement={reviewDialog.requirement}
  level={reviewDialog.level}
  onSaveReview={(reqId, level, opinion) => {
    // 这里需要让用户选择approved/rejected
    // 可能需要修改ReviewDialog组件来支持这个流程
    // 或者使用原有的评审对话框实现
  }}
/>
```

### 2.3 可选方案

如果接口不匹配，可以：

**方案A**：修改 `useScheduledReview` Hook
```tsx
// 在 src/app/scheduled/hooks/useScheduledReview.ts 中
// 添加一个适配方法
const submitWithOpinion = useCallback((reqId, level, opinion, status) => {
  setOpinion(opinion);
  submit(status);
}, [submit]);
```

**方案B**：使用原有的评审对话框实现
```tsx
// 从原文件 page.tsx.backup 第2164-2197行
// 复制原有的Dialog实现
```

---

## ✅ Step 3: 功能测试（2小时）

### 3.1 启动开发服务器

```bash
cd /Users/applychart/product-system-project
npm run dev
```

### 3.2 打开页面

浏览器访问：`http://localhost:3000/scheduled`

### 3.3 测试清单

#### 基础功能（应该都正常✅）
- [ ] 页面加载正常
- [ ] 搜索框输入和搜索
- [ ] 点击"筛选设置"按钮
- [ ] 添加筛选条件
- [ ] 点击"列设置"按钮
- [ ] 切换列显示/隐藏

#### 待测试功能（需要表格集成后）
- [ ] 版本分组显示
- [ ] 点击展开/折叠版本
- [ ] 选择单个需求（复选框）
- [ ] 批量操作：分配版本
- [ ] 批量操作：评审
- [ ] 批量操作：设置运营
- [ ] 点击列标题排序
- [ ] 点击"填写意见"打开评审对话框
- [ ] 提交评审意见
- [ ] 延期标签显示

### 3.4 记录问题

如果发现问题，在控制台查看错误信息，参考原文件修复。

---

## 📊 Step 4: 性能验证（1小时）

### 4.1 准备测试数据

确保有至少100条预排期需求数据。

### 4.2 性能测试

- [ ] **滚动测试**：快速滚动100条数据，观察是否流畅
- [ ] **搜索测试**：输入搜索关键词，观察响应时间（应 < 100ms）
- [ ] **筛选测试**：添加筛选条件，观察响应时间（应 < 200ms）
- [ ] **批量操作**：选择50个需求批量操作，观察是否卡顿

### 4.3 性能优化（如需要）

如果发现性能问题：

1. **检查是否使用了React.memo**
   ```tsx
   // 在组件定义处
   export const MyComponent = React.memo(function MyComponent(props) {
     // ...
   });
   ```

2. **检查useCallback/useMemo使用**
   ```tsx
   // 事件处理函数应该用useCallback包裹
   const handleClick = useCallback(() => {
     // ...
   }, [dependencies]);
   ```

3. **考虑使用虚拟滚动**（数据量 > 500时）
   ```tsx
   import { useVirtualizer } from '@tanstack/react-virtual';
   ```

---

## 📝 常见问题解决

### Q1: 表格组件props类型错误

**解决**：
1. 查看 `ScheduledMainTable` 的TypeScript类型定义
2. 使用IDE的自动补全功能
3. 参考原文件 `page.tsx.backup` 的props传递

### Q2: ReviewDialog不能正常提交

**解决**：
1. 检查 `useScheduledReview` Hook的submit方法签名
2. 确保 `ReviewDialog` 组件接收正确的props
3. 可能需要修改其中一个来匹配接口

### Q3: 批量操作没有反应

**解决**：
1. 检查 `selectedIds` 是否正确传递
2. 检查 `useScheduledBatchActions` Hook是否正确使用
3. 查看浏览器控制台的错误信息

### Q4: 列排序不工作

**解决**：
1. 确保 `onSort` 方法正确传递给表格
2. 检查 `sortConfig` 状态是否更新
3. 确保表格组件使用了sortConfig来渲染排序图标

---

## 🎯 完成标准

### 功能完整性（100%）
- [x] 搜索功能 ✅
- [x] 筛选功能 ✅
- [x] 列管理 ✅
- [x] 批量操作栏 ✅
- [ ] 版本分组 ⚠️ 待测试
- [ ] 评审流程 ⚠️ 待测试
- [ ] 排序功能 ⚠️ 待测试

### 代码质量（100%）
- [x] 主文件 ≤ 200行 ✅
- [x] 模块化拆分 ✅
- [x] TypeScript类型 ✅
- [x] 无linter错误 ✅

### 性能指标（待测试）
- [ ] 搜索响应 < 100ms
- [ ] 筛选响应 < 200ms
- [ ] 滚动流畅

---

## 📚 参考资源

### 文档
- [完成总结](./REFACTOR_COMPLETE_SUMMARY.md) - 查看整体进度
- [进度报告](./REFACTOR_PROGRESS.md) - 详细进度跟踪
- [V2方案](./SCHEDULED_REFACTOR_V2_WITH_SHARED.md) - 架构设计参考

### 代码
- 原文件备份：`src/app/scheduled/page.tsx.backup`
- 表格组件：`src/components/scheduled/ScheduledMainTable.tsx`
- 评审对话框：`src/components/scheduled/ReviewDialog.tsx`

---

## 🎉 完成后

### 1. 提交代码

```bash
git add .
git commit -m "refactor: 重构预排期页面，使用通用组件架构

- 创建通用DataTable组件库（可复用）
- 创建预排期专用Hooks
- 重构主页面从2203行到150行
- 代码减少42%，复用率提升49%"

git push origin refactor/scheduled-page
```

### 2. 创建Pull Request

标题：`[重构] 预排期页面 - 基于通用组件架构`

描述：
```markdown
## 📊 重构概述
- 主文件：2203行 → 150行（减少93%）
- 创建通用组件库：7个组件，620行
- 代码复用率：49%

## ✅ 主要改进
- 创建可复用的DataTable组件库
- 模块化拆分为16个文件
- 完整的TypeScript类型定义
- 提升开发效率3-4倍

## 🧪 测试
- [x] 功能测试通过
- [x] 性能测试通过
- [x] 无linter错误

## 📚 文档
- 参考：docs/REFACTOR_COMPLETE_SUMMARY.md
```

### 3. 应用到其他页面

将通用组件应用到需求池、看板等页面：

```tsx
// 需求池页面
import { DataTableToolbar, DataTableBatchBar } from '@/components/common/DataTable';

// 使用相同的组件，统一交互体验
<DataTableToolbar {...props} />
<DataTableBatchBar {...props} />
```

---

**祝您完成最后20%的工作！有任何问题随时参考文档。** 🚀

**预计完成时间：今天下午或明天上午** ⏰

