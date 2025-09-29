# 统一字体规范

## 字体设置标准

为了保证整个应用的视觉一致性，制定以下字体使用规范：

### 表格相关字体
- **表格标题头部**: `text-sm font-medium` (14px，中等粗细)
- **表格内容**: `text-sm font-normal` (14px，正常粗细)  
- **表格内辅助信息**: `text-xs font-normal` (12px，正常粗细，灰色)

### Badge和标签字体
- **所有Badge**: `text-xs font-medium` (12px，中等粗细)
- **状态标签**: `text-xs font-medium` (12px，中等粗细)

### 全局强制字体设置

在 `globals.css` 中已经设置了全局强制规则：

```css
/* 表格统一字体 */
table thead th {
  @apply text-sm font-medium;
}

table tbody td {
  @apply text-sm;
}

/* Badge 统一字体 */
.badge, [data-badge] {
  @apply text-xs;
}

/* 辅助文本统一 */
.text-muted-foreground {
  @apply text-xs;
}
```

### 统一CSS类
在 `globals.css` 中定义了以下统一类：

```css
.table-header-unified     /* 表格头部 */
.table-content-unified    /* 表格内容 */
.table-helper-text-unified /* 表格辅助信息 */
.badge-unified           /* Badge标签 */
```

## 实施要求

### 表格组件
表格组件已经内置了统一的字体设置：
- `Table` 组件默认使用 `text-sm`
- `TableHead` 组件默认使用 `font-medium`
- `Badge` 组件默认使用 `text-xs font-medium`

**无需额外添加字体类，组件会自动应用正确的字体大小**

### 特殊情况处理
如果需要覆盖默认字体，可以使用以下类：

```tsx
// 表格头部
<TableHead>标题</TableHead> // 自动应用 text-sm font-medium

// 表格内容
<TableCell>内容</TableCell> // 自动应用 text-sm

// 辅助信息（表格内会自动变为text-xs）
<div className="text-muted-foreground">辅助信息</div>

// Badge（已内置text-xs font-medium）
<Badge>标签</Badge>
```

### 自定义字体类
如果需要明确指定字体，使用这些统一类：

```tsx
<div className="table-header-unified">表格标题</div>
<div className="table-content-unified">表格内容</div>
<div className="table-helper-text-unified">辅助信息</div>
<div className="badge-unified">标签</div>
```

### 需要更新的页面
以下页面需要统一字体设置：
- 需求池页面 (RequirementPoolPageWithReviewers)
- PRD管理页面 (PRDPageUpdated)
- 原型管理页面 (PrototypePageCompleteFixed)
- 设计管理页面 (DesignPageCompleteFixed)
- BUG管理页面 (BugsPageWithNavigation)
- 预排期需求页面 (ScheduledRequirementsPageUpdated)
- 我的分配页面 (MyAssignedRequirementsPage)
- 我的看板页面 (MyKanbanPage)
- 我的待办页面 (MyTodoPage)
- 版本需求页面 (VersionRequirementsPageWithSubtasksTable)

## 字体大小对照表

| 类名 | 实际大小 | 用途 |
|------|----------|------|
| text-xs | 12px | Badge、辅助信息、小标签 |
| text-sm | 14px | 表格内容、按钮文字 |
| text-base | 16px | 正文、输入框 |
| text-lg | 18px | 小标题 |
| text-xl | 20px | 副标题 |
| text-2xl | 24px | 主标题 |

## 注意事项

1. **优先使用明确的字体类**：避免依赖默认字体设置
2. **保持一致性**：同类型的内容使用相同的字体设置
3. **辅助信息**：使用 `text-muted-foreground` 来降低视觉权重
4. **重要信息**：使用 `font-medium` 来增加视觉权重
5. **避免混用**：不要在同一个表格中混用不同的字体大小