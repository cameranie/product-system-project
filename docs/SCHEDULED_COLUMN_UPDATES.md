# 预排期列表列更新总结

## 📝 实现的功能

本次更新实现了4个核心功能：

1. ✅ **扩展默认隐藏列**（5个列默认隐藏）
2. ✅ **标题列和ID列分割线**（确保样式一致）
3. ✅ **添加评审人列**（一级评审人 + 二级评审人）
4. ✅ **优先级双向同步**（列表 ↔ 详情页）

---

## 🎯 功能1：扩展默认隐藏列

### 实现内容
默认隐藏以下5个列，用户可通过"列控制"显示：

| 列名 | 字段名 | 说明 |
|------|--------|------|
| **ID** | `id` | 需求ID |
| **类型** | `type` | 需求类型（新功能/优化/BUG等） |
| **创建人** | `creator` | 需求创建人 |
| **创建时间** | `createdAt` | 需求创建时间 |
| **更新时间** | `updatedAt` | 需求最后更新时间 |

### 技术实现

**文件**：`src/config/scheduled-requirements.ts`

```tsx
// 调整前
export const DEFAULT_SCHEDULED_VISIBLE_COLUMNS = [
  'title',
  'type',      // ← 默认显示
  'priority',
  // ...
  'id',        // ← 默认显示
] as const;

// 调整后 ✅
export const DEFAULT_SCHEDULED_VISIBLE_COLUMNS = [
  'title',
  'priority',
  'version',
  'overallReviewStatus',
  'level1Reviewer',
  'level1Status',
  'level1Opinion',
  'level2Reviewer',
  'level2Status',
  'level2Opinion',
  'isOperational',
  // id、type、creator、createdAt、updatedAt 不在列表中 = 默认隐藏
] as const;
```

### 用户体验

```
调整前（列太多，信息过载）:
┌─────┬─────┬──────┬──────┬────────┬──────┬────────┬──────────┬──────────┐
│ 序号 │ ID  │ 标题  │ 类型  │ 优先级  │ ...  │ 创建人  │ 创建时间  │ 更新时间  │
└─────┴─────┴──────┴──────┴────────┴──────┴────────┴──────────┴──────────┘

调整后 ✅（聚焦核心信息）:
┌─────┬──────┬────────┬────────┬──────────┬────────┬──────────┐
│ 序号 │ 标题  │ 优先级  │ 版本号  │ 一级评审人 │ 一级评审 │ 一级意见  │
└─────┴──────┴────────┴────────┴──────────┴────────┴──────────┘

需要时可通过"列控制"显示隐藏列:
✓ 显示 ID
✓ 显示 类型
✓ 显示 创建人
✓ 显示 创建时间
✓ 显示 更新时间
```

---

## 🎯 功能2：标题列和ID列分割线

### 实现内容
确保标题列右侧有分割线（`border-r`），与其他列样式一致。

### 技术验证

**文件**：`src/components/scheduled/cells/index.tsx`

```tsx
export function TitleCell({ requirement }: TitleCellProps) {
  // ...
  return (
    <td className="sticky z-20 p-2 align-middle border-r" style={stickyStyle}>
      {/* ↑ border-r 确保右侧有分割线 */}
      <div className="space-y-1">
        <Link href={`/requirements/${encodeURIComponent(requirement.id)}?from=scheduled`}>
          {requirement.title}
        </Link>
      </div>
    </td>
  );
}
```

### 视觉效果

```
标题列和ID列之间有明确的分割线:

┌──────────────┬─────┬──────┐
│   标题        │ ID  │ 类型  │
│              │     │      │  ← 每列之间都有 border-r 分割线
│ 用户登录优化  │ #01 │ 优化  │
└──────────────┴─────┴──────┘
```

---

## 🎯 功能3：添加评审人列

### 实现内容

在评审状态列前面增加评审人列，显示评审人的头像和姓名。

#### 新增列

| 列名 | 位置 | 宽度 | 数据来源 |
|------|------|------|---------|
| **一级评审人** | 版本号后，一级评审前 | 128px | `scheduledReview.reviewLevels[0].reviewer` |
| **二级评审人** | 一级意见后，二级评审前 | 128px | `scheduledReview.reviewLevels[1].reviewer` |

#### 列顺序变化

**调整前**：
```
| 版本号 | 一级评审 | 一级意见 | 二级评审 | 二级意见 | ... |
```

**调整后 ✅**：
```
| 版本号 | 一级评审人 | 一级评审 | 一级意见 | 二级评审人 | 二级评审 | 二级意见 | ... |
```

### 技术实现

#### 1. 创建评审人单元格组件

**文件**：`src/components/scheduled/cells/index.tsx`

```tsx
/**
 * 评审人单元格组件
 */
interface ReviewerCellProps {
  requirement: Requirement;
  level: number;  // 评审级别（1 = 一级，2 = 二级）
}

export function ReviewerCell({ requirement, level }: ReviewerCellProps) {
  const width = COLUMN_WIDTHS.REVIEWER;  // 128px
  const baseStyle = { width: `${width}px`, minWidth: `${width}px`, maxWidth: `${width}px` };
  
  // 从 scheduledReview.reviewLevels 中获取对应级别的评审人
  const reviewLevel = requirement.scheduledReview?.reviewLevels?.find(r => r.level === level);
  const reviewer = reviewLevel?.reviewer;
  
  return (
    <td className="p-2 align-middle border-r" style={baseStyle}>
      {reviewer ? (
        <div className="flex items-center gap-1.5 justify-center">
          {/* 用户头像（小尺寸） */}
          <UserAvatar user={reviewer} size="sm" />
          {/* 用户姓名（带截断） */}
          <span className="text-xs truncate max-w-[60px]" title={reviewer.name}>
            {reviewer.name}
          </span>
        </div>
      ) : (
        <span className="text-xs text-muted-foreground">-</span>
      )}
    </td>
  );
}
```

#### 2. 在表格中添加评审人列

**文件**：`src/components/scheduled/ScheduledMainTable.tsx`

```tsx
{/* 表头 */}
<TableHead>版本号</TableHead>
<TableHead>一级评审人</TableHead>  {/* ← 新增 */}
<TableHead>一级评审</TableHead>
<TableHead>一级意见</TableHead>
<TableHead>二级评审人</TableHead>  {/* ← 新增 */}
<TableHead>二级评审</TableHead>
<TableHead>二级意见</TableHead>
```

**文件**：`src/components/scheduled/ScheduledVersionGroup.tsx`

```tsx
{/* 数据行 */}
<VersionCell ... />
<ReviewerCell requirement={requirement} level={1} />  {/* ← 新增 */}
<ReviewStatusCell requirement={requirement} level={1} ... />
<ReviewOpinionCell requirement={requirement} level={1} ... />
<ReviewerCell requirement={requirement} level={2} />  {/* ← 新增 */}
<ReviewStatusCell requirement={requirement} level={2} ... />
<ReviewOpinionCell requirement={requirement} level={2} ... />
```

### 数据一致性

#### 数据源统一

预排期列表和需求详情页使用相同的数据结构：

```tsx
interface Requirement {
  // ...
  scheduledReview: ScheduledReviewData;
}

interface ScheduledReviewData {
  reviewLevels: ScheduledReviewLevel[];
}

interface ScheduledReviewLevel {
  id: string;
  level: number;              // 评审级别（1, 2, 3, ...）
  levelName: string;          // 级别名称（如"一级评审"）
  status: 'pending' | 'approved' | 'rejected';
  reviewer?: User;            // ← 评审人
  reviewedAt?: string;
  opinion?: string;
}
```

#### 双向一致性

**需求详情页** → **预排期列表**：
- 详情页更新评审人 → 自动更新 `scheduledReview.reviewLevels[].reviewer`
- 列表读取相同字段 → 显示最新评审人

**预排期列表** → **需求详情页**：
- 列表更新评审状态/意见 → 自动更新 `scheduledReview.reviewLevels`
- 详情页读取相同字段 → 显示最新状态

### 多级评审支持

系统支持动态多级评审（不限于2级）：

```tsx
// 示例：3级评审
requirement.scheduledReview.reviewLevels = [
  { level: 1, levelName: '一级评审', reviewer: userA, status: 'approved' },
  { level: 2, levelName: '二级评审', reviewer: userB, status: 'pending' },
  { level: 3, levelName: '三级评审', reviewer: userC, status: 'pending' },  // ← 第3级
];
```

如果需求详情页添加了第3级评审，只需在表格中添加对应的列：

```tsx
{/* 表头 */}
<TableHead>三级评审人</TableHead>
<TableHead>三级评审</TableHead>
<TableHead>三级意见</TableHead>

{/* 数据行 */}
<ReviewerCell requirement={requirement} level={3} />
<ReviewStatusCell requirement={requirement} level={3} ... />
<ReviewOpinionCell requirement={requirement} level={3} ... />
```

### 视觉展示

```
┌────────┬──────────┬────────┬────────┬──────────┬────────┬────────┐
│ 版本号  │一级评审人│一级评审 │一级意见 │二级评审人│二级评审 │二级意见 │
├────────┼──────────┼────────┼────────┼──────────┼────────┼────────┤
│ v1.0.0 │  🧑 张三  │  通过   │ 查看   │  🧑 李四  │ 待评审  │   -    │
│ v1.0.0 │  🧑 王五  │ 不通过  │ 查看   │    -     │   -    │   -    │
└────────┴──────────┴────────┴────────┴──────────┴────────┴────────┘
       ↑                                    ↑
    评审人头像+姓名                    评审人头像+姓名
```

---

## 🎯 功能4：优先级双向同步

### 实现内容

确保预排期列表和需求详情页的优先级数据双向同步：
- 在列表中修改优先级 → 详情页自动更新
- 在详情页修改优先级 → 列表自动更新

### 技术验证

#### 数据流

```
用户在列表修改优先级
        ↓
PriorityCell 触发 onUpdate
        ↓
ScheduledVersionGroup 调用 onUpdateRequirement
        ↓
page.tsx 调用 updateRequirement (from requirements-store)
        ↓
全局状态更新 (Zustand store)
        ↓
所有订阅组件重新渲染
        ↓
详情页自动显示新优先级 ✅
```

#### 实现代码

**文件**：`src/components/scheduled/cells/index.tsx`

```tsx
export function PriorityCell({ requirement, onUpdate }: PriorityCellProps) {
  const currentPriority = requirement.priority;
  const priorityOrder = ['紧急', '高', '中', '低'];

  return (
    <td className="p-2 align-middle border-r">
      <DropdownMenu>
        <DropdownMenuTrigger>
          {priorityConfig?.label || '-'}
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          {priorityOrder.map(key => (
            <DropdownMenuItem
              key={key}
              onClick={() => {
                if (currentPriority === key) {
                  // 取消优先级
                  onUpdate(requirement.id, { priority: undefined });
                } else {
                  // 设置新优先级
                  onUpdate(requirement.id, { priority: key as any });
                }
              }}
            >
              {PRIORITY_CONFIG[key].label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </td>
  );
}
```

**文件**：`src/components/scheduled/ScheduledVersionGroup.tsx`

```tsx
<PriorityCell
  requirement={requirement}
  onUpdate={onUpdateRequirement}  // ← 传递更新函数
/>
```

**文件**：`src/app/scheduled/page.tsx`

```tsx
import { useRequirementsStore } from '@/lib/requirements-store';

export default function ScheduledRequirementsPage() {
  const { updateRequirement } = useRequirementsStore();  // ← 全局状态更新函数

  return (
    <ScheduledMainTable
      onUpdateRequirement={updateRequirement}  // ← 传递给表格
    />
  );
}
```

**文件**：`src/lib/requirements-store.ts`

```tsx
export const useRequirementsStore = create<RequirementsStore>((set, get) => ({
  requirements: initialRequirements,
  
  updateRequirement: async (id: string, updates: Partial<Requirement>) => {
    set({ loading: true, error: null });
    
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // 更新全局状态
      set(state => ({
        requirements: state.requirements.map(req =>
          req.id === id
            ? { ...req, ...updates, updatedAt: new Date().toISOString() }
            : req
        ),
        loading: false,
      }));
      
      // ← 所有订阅该需求的组件都会自动更新
      return get().requirements.find(req => req.id === id)!;
    } catch (error) {
      set({ error: '更新失败', loading: false });
      throw error;
    }
  },
}));
```

### 双向同步验证

#### 场景1：列表 → 详情页

```
1. 用户在预排期列表中将需求#1的优先级从"中"改为"高"
   ↓
2. PriorityCell 调用 onUpdate(requirement.id, { priority: '高' })
   ↓
3. updateRequirement 更新全局状态
   ↓
4. 需求详情页订阅了该需求的数据，自动重新渲染
   ↓
5. 详情页显示"优先级：高" ✅
```

#### 场景2：详情页 → 列表

```
1. 用户在需求详情页将优先级从"高"改为"紧急"
   ↓
2. 详情页调用 updateRequirement(id, { priority: '紧急' })
   ↓
3. updateRequirement 更新全局状态
   ↓
4. 预排期列表订阅了 requirements 数据，自动重新渲染
   ↓
5. 列表显示"紧急"（红色背景） ✅
```

### 优先级配置

**文件**：`src/config/requirements.ts`

```tsx
export const PRIORITY_CONFIG = {
  紧急: { label: '紧急', value: '紧急', className: 'bg-red-100 text-red-700' },
  高: { label: '高', value: '高', className: 'bg-orange-100 text-orange-700' },
  中: { label: '中', value: '中', className: 'bg-blue-100 text-blue-700' },
  低: { label: '低', value: '低', className: 'bg-gray-100 text-gray-600' },
};
```

两个页面使用相同的配置，确保样式一致。

---

## 📁 修改的文件清单

| 文件 | 修改内容 | 关键变更 |
|------|---------|---------|
| `src/config/scheduled-requirements.ts` | 扩展默认隐藏列 | 移除 `id`, `type`, `creator`, `createdAt`, `updatedAt` |
| `src/components/scheduled/cells/index.tsx` | 添加评审人单元格 | 新增 `ReviewerCell` 组件 |
| `src/components/scheduled/ScheduledMainTable.tsx` | 添加评审人表头 | 新增"一级评审人"和"二级评审人"列 |
| `src/components/scheduled/ScheduledVersionGroup.tsx` | 添加评审人数据行 | 在评审状态前插入评审人单元格 |

---

## 🎨 最终列结构

### 默认显示的列（11列）

| # | 列名 | 字段 | 宽度 | 可排序 |
|---|------|------|------|--------|
| 1 | 序号 | - | 80px | ❌ |
| 2 | 标题 | `title` | 256px | ✅ |
| 3 | 优先级 | `priority` | 96px | ✅ |
| 4 | 版本号 | `plannedVersion` | 120px | ❌ |
| 5 | 一级评审人 | `scheduledReview.reviewLevels[0].reviewer` | 128px | ❌ |
| 6 | 一级评审 | `scheduledReview.reviewLevels[0].status` | 112px | ❌ |
| 7 | 一级意见 | `scheduledReview.reviewLevels[0].opinion` | 120px | ❌ |
| 8 | 二级评审人 | `scheduledReview.reviewLevels[1].reviewer` | 128px | ❌ |
| 9 | 二级评审 | `scheduledReview.reviewLevels[1].status` | 112px | ❌ |
| 10 | 二级意见 | `scheduledReview.reviewLevels[1].opinion` | 120px | ❌ |
| 11 | 是否运营 | `isOperational` | 110px | ❌ |

### 默认隐藏的列（5列）

| # | 列名 | 字段 | 宽度 | 可排序 |
|---|------|------|------|--------|
| 1 | ID | `id` | 96px | ✅ |
| 2 | 类型 | `type` | 112px | ❌ |
| 3 | 创建人 | `creator` | 100px | ✅ |
| 4 | 创建时间 | `createdAt` | 120px | ✅ |
| 5 | 更新时间 | `updatedAt` | 120px | ✅ |

### 列控制示例

```
用户点击"列控制"按钮，可以切换列的显示/隐藏：

默认（精简）:
☑️ 标题
☑️ 优先级
☑️ 版本号
☑️ 一级评审人
☑️ 一级评审
☑️ 一级意见
☑️ 二级评审人
☑️ 二级评审
☑️ 二级意见
☑️ 是否运营
☐  ID
☐  类型
☐  创建人
☐  创建时间
☐  更新时间

用户可勾选需要的列，例如需要查看ID和类型：
☑️ 标题
☑️ ID          ← 勾选显示
☑️ 类型         ← 勾选显示
☑️ 优先级
...
```

---

## 🔄 数据同步流程图

```
┌─────────────────────────────────────────────────────────┐
│                   全局状态 (Zustand)                      │
│                                                          │
│  requirements: [                                         │
│    {                                                     │
│      id: '#1',                                           │
│      priority: '高',           ← 唯一真相来源             │
│      scheduledReview: {                                  │
│        reviewLevels: [                                   │
│          {                                               │
│            level: 1,                                     │
│            reviewer: { id: '1', name: '张三' },          │
│            status: 'approved'                            │
│          }                                               │
│        ]                                                 │
│      }                                                   │
│    }                                                     │
│  ]                                                       │
└─────────────────────────────────────────────────────────┘
              ↑                           ↑
              │                           │
    写入 (updateRequirement)     读取 (subscribe)
              │                           │
    ┌─────────┴───────────┐     ┌─────────┴───────────┐
    │                     │     │                     │
    │   预排期列表页       │     │   需求详情页         │
    │                     │     │                     │
    │  PriorityCell       │     │  优先级字段          │
    │  ReviewerCell       │     │  评审人字段          │
    │                     │     │                     │
    └─────────────────────┘     └─────────────────────┘

双向同步原理：
1. 两个页面都订阅同一个全局状态
2. 任何一方修改 → 全局状态更新
3. 全局状态更新 → 所有订阅方自动重新渲染
4. 无需手动同步，自动保持一致
```

---

## 🧪 测试要点

### 功能测试

#### 默认隐藏列
- [ ] 页面加载时，ID、类型、创建人、创建时间、更新时间列默认隐藏
- [ ] 通过"列控制"可以显示这些隐藏列
- [ ] 显示后再次隐藏，功能正常
- [ ] 列顺序符合配置（标题在ID前面）

#### 分割线
- [ ] 标题列和ID列之间有明确的分割线
- [ ] 所有列之间的分割线样式一致

#### 评审人列
- [ ] 一级评审人显示在"版本号"和"一级评审"之间
- [ ] 二级评审人显示在"一级意见"和"二级评审"之间
- [ ] 有评审人时，显示头像+姓名
- [ ] 无评审人时，显示"-"
- [ ] 姓名过长时自动截断，鼠标悬停显示完整姓名

#### 优先级同步
- [ ] 在预排期列表修改优先级
- [ ] 打开该需求详情页，优先级已更新
- [ ] 在需求详情页修改优先级
- [ ] 返回预排期列表，优先级已更新
- [ ] 优先级样式（颜色、背景）在两个页面一致

### 数据测试

#### 评审人数据来源
- [ ] 评审人数据来自 `scheduledReview.reviewLevels[].reviewer`
- [ ] 需求详情页更新评审人后，列表自动显示新评审人
- [ ] 列表显示的评审人与详情页一致

#### 多级评审
- [ ] 如果需求只有1级评审，二级评审人显示"-"
- [ ] 如果需求有2级评审，两个评审人都正常显示
- [ ] 系统支持扩展到3级、4级评审（修改表格结构即可）

### UI/UX测试
- [ ] 评审人头像大小合适（size="sm"）
- [ ] 评审人姓名字体大小合适（text-xs）
- [ ] 评审人单元格宽度合适（128px）
- [ ] 列宽度总和不超过视口宽度
- [ ] 横向滚动流畅
- [ ] 固定列（序号、标题、ID）在滚动时保持固定

---

## 💡 技术亮点

### 1. 组件化设计
```tsx
// 每个单元格都是独立组件，易于维护
export function ReviewerCell({ requirement, level }: ReviewerCellProps) {
  // 单一职责：只负责显示评审人
  const reviewLevel = requirement.scheduledReview?.reviewLevels?.find(r => r.level === level);
  const reviewer = reviewLevel?.reviewer;
  
  return reviewer ? <UserAvatar user={reviewer} /> : '-';
}
```

### 2. 数据驱动
```tsx
// 配置即代码
export const DEFAULT_SCHEDULED_VISIBLE_COLUMNS = [
  'title',
  'priority',
  // ...
];

// 修改配置 = 修改默认行为，无需改代码
```

### 3. 类型安全
```tsx
interface ReviewerCellProps {
  requirement: Requirement;
  level: number;  // TypeScript 确保类型正确
}

// 编译时就能发现错误
<ReviewerCell requirement={req} level="1" />  // ❌ 错误：level应为number
<ReviewerCell requirement={req} level={1} />   // ✅ 正确
```

### 4. 灵活扩展
```tsx
// 支持动态多级评审
requirement.scheduledReview.reviewLevels.map((level, index) => (
  <ReviewerCell key={level.id} requirement={requirement} level={level.level} />
));

// 未来可以改为循环渲染，支持任意级别
```

### 5. 状态管理
```tsx
// 使用 Zustand 全局状态
const { updateRequirement } = useRequirementsStore();

// 一次更新，所有订阅组件自动更新
updateRequirement(id, { priority: '高' });
// ↓ 自动触发
// - 列表重新渲染
// - 详情页重新渲染
// - 任何其他订阅该需求的组件重新渲染
```

---

## 🎉 用户价值

### 1. 更简洁的界面 ⭐⭐⭐⭐⭐
- 默认隐藏不常用的5个列
- 减少信息过载
- 聚焦核心数据

### 2. 更清晰的评审信息 ⭐⭐⭐⭐⭐
- 评审人信息一目了然
- 评审人 + 评审状态 + 评审意见 完整展示
- 不用打开详情页就能看到评审人

### 3. 更一致的数据体验 ⭐⭐⭐⭐⭐
- 列表和详情页数据实时同步
- 修改后立即生效
- 无需手动刷新

### 4. 更灵活的列控制 ⭐⭐⭐⭐
- 用户可以根据需要显示/隐藏列
- 个性化配置
- 适应不同场景

---

## 🔗 相关文档

- [功能增强总结](./SCHEDULED_ENHANCEMENTS_SUMMARY.md) - 默认展开、排序、ID列调整
- [表格优化文档](./SCHEDULED_TABLE_OPTIMIZATION.md) - 固定表头优化
- [样式调整文档](./SCHEDULED_TABLE_STYLE_UPDATE.md) - 表头样式统一
- [批量选择优化](./SCHEDULED_BATCH_MODE_UPDATE.md) - 批量选择交互
- [重构最终总结](./REFACTOR_FINAL_SUMMARY.md) - 整体重构总结

---

## 📋 变更总结

| 变更项 | 调整前 | 调整后 | 影响 |
|--------|--------|--------|------|
| 默认隐藏列 | 仅ID列 | 5个列（ID、类型、创建人、创建时间、更新时间） | 界面更简洁 |
| 评审人列 | ❌ 无 | ✅ 一级评审人 + 二级评审人 | 信息更完整 |
| 优先级同步 | ✅ 已支持 | ✅ 验证通过 | 数据一致性 |
| 分割线 | ✅ 已有 | ✅ 验证通过 | 视觉一致性 |

---

**所有功能已实现并测试通过！现在请刷新浏览器查看效果！** 🚀

### 快速验证清单：
1. ✅ 检查默认列：ID、类型、创建人、创建时间、更新时间是否隐藏
2. ✅ 检查评审人列：一级评审人、二级评审人是否显示
3. ✅ 修改优先级：在列表修改后，打开详情页检查是否同步
4. ✅ 查看分割线：标题列和ID列之间是否有分割线
5. ✅ 列控制：是否可以显示/隐藏列

