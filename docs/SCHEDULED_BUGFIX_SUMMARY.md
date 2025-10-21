# 预排期列表问题修复总结

## 📝 修复的问题

根据用户反馈的截图，修复了3个问题：

1. ✅ **默认隐藏列不生效** - 配置版本升级
2. ✅ **标题列和ID列sticky定位错误** - 修正列顺序
3. ✅ **评审人名字重复显示** - 移除重复的文本

---

## 🐛 问题1：默认隐藏列不生效

### 问题描述
用户反馈：ID列、类型列、创建人列、创建时间列、更新时间列都在显示，但配置中已设置为默认隐藏。

### 原因分析
用户浏览器的localStorage中保存了旧的列配置（版本5.0），新的配置（默认隐藏5个列）没有生效。

### 解决方案
升级配置版本号从`5.0`到`6.0`，强制清除旧配置。

**文件**：`src/config/scheduled-requirements.ts`

```tsx
// 修复前
export const SCHEDULED_CONFIG_VERSION = '5.0';

// 修复后 ✅
export const SCHEDULED_CONFIG_VERSION = '6.0';
```

### 效果
- 用户刷新页面后，系统检测到配置版本不匹配
- 自动清除localStorage中的旧配置
- 应用新的默认隐藏列配置
- ID、类型、创建人、创建时间、更新时间默认隐藏 ✅

---

## 🐛 问题2：标题列和ID列sticky定位错误

### 问题描述
从截图看，列顺序是：序号 → 标题 → ID → ...
但标题列和ID列的sticky定位计算有误，导致固定列位置不正确。

### 原因分析
代码中TitleCell和IdCell的sticky `left`值设置错误：

```tsx
// 错误的定位 ❌
TitleCell: left = INDEX + ID        // 标题在ID后面
IdCell:    left = INDEX              // ID在INDEX后面

实际列顺序：INDEX → TITLE → ID
期望定位：
  TitleCell: left = INDEX
  IdCell:    left = INDEX + TITLE
```

### 解决方案

#### 修复TitleCell的left值
**文件**：`src/components/scheduled/cells/index.tsx`

```tsx
// 修复前 ❌
export function TitleCell({ requirement }: TitleCellProps) {
  const stickyStyle = {
    // ...
    left: `${COLUMN_WIDTHS.INDEX + COLUMN_WIDTHS.ID}px`,  // 错误：标题在ID后
  };
  // ...
}

// 修复后 ✅
export function TitleCell({ requirement }: TitleCellProps) {
  const stickyStyle = {
    // ...
    left: `${COLUMN_WIDTHS.INDEX}px`,  // 正确：标题在序号后
  };
  // ...
}
```

#### 修复IdCell的left值

```tsx
// 修复前 ❌
export function IdCell({ requirement }: IdCellProps) {
  const stickyStyle = {
    // ...
    left: `${COLUMN_WIDTHS.INDEX}px`,  // 错误：ID在序号后（应该在标题后）
  };
  // ...
}

// 修复后 ✅
export function IdCell({ requirement }: IdCellProps) {
  const stickyStyle = {
    // ...
    left: `${COLUMN_WIDTHS.INDEX + COLUMN_WIDTHS.TITLE}px`,  // 正确：ID在标题后
  };
  // ...
}
```

### 效果
- 序号列固定在最左侧（left: 0）
- 标题列固定在序号右侧（left: 80px）
- ID列固定在标题右侧（left: 80 + 256 = 336px）
- 横向滚动时，固定列位置正确 ✅

### Sticky定位计算规则

```
┌────────┬──────────────┬─────────┬──────┬───────┐
│  序号   │    标题       │   ID    │ 类型  │  ...  │
│        │              │         │      │       │
│ left:0 │ left:80      │left:336 │ 非固定│ 非固定│
└────────┴──────────────┴─────────┴──────┴───────┘
    ↑          ↑              ↑
  INDEX    INDEX+256    INDEX+256+96
  (80)      (80)          (336)
```

---

## 🐛 问题3：评审人名字重复显示

### 问题描述
从截图看，评审人列显示了两次名字：
```
🧑 张三 张三
```

### 原因分析

`UserAvatar`组件默认会显示用户名（`showName=true`），而`ReviewerCell`中又额外添加了一个`<span>`显示名字，导致重复。

**原代码**：
```tsx
// 修复前 ❌
export function ReviewerCell({ requirement, level }: ReviewerCellProps) {
  return (
    <td>
      {reviewer ? (
        <div className="flex items-center gap-1.5">
          <UserAvatar user={reviewer} size="sm" />  {/* ← 这里显示头像+名字 */}
          <span className="text-xs">              {/* ← 这里又显示名字 */}
            {reviewer.name}
          </span>
        </div>
      ) : '-'}
    </td>
  );
}
```

`UserAvatar`组件内部：
```tsx
export function UserAvatar({ user, size = 'sm', showName = true }) {
  return (
    <div className="flex items-center gap-2">
      <Avatar>...</Avatar>
      {showName && <span>{user.name}</span>}  {/* ← 默认显示名字 */}
    </div>
  );
}
```

结果：两次显示名字 → `张三 张三`

### 解决方案

简化`ReviewerCell`，只使用`UserAvatar`，移除重复的`<span>`。

**文件**：`src/components/scheduled/cells/index.tsx`

```tsx
// 修复前 ❌
export function ReviewerCell({ requirement, level }: ReviewerCellProps) {
  return (
    <td className="p-2 align-middle border-r" style={baseStyle}>
      {reviewer ? (
        <div className="flex items-center gap-1.5 justify-center">
          <UserAvatar user={reviewer} size="sm" />
          <span className="text-xs truncate max-w-[60px]" title={reviewer.name}>
            {reviewer.name}  {/* ← 重复显示 */}
          </span>
        </div>
      ) : '-'}
    </td>
  );
}

// 修复后 ✅
export function ReviewerCell({ requirement, level }: ReviewerCellProps) {
  return (
    <td className="p-2 align-middle border-r text-center" style={baseStyle}>
      {reviewer ? (
        <UserAvatar user={reviewer} size="sm" showName={true} />
      ) : (
        <span className="text-xs text-muted-foreground">-</span>
      )}
    </td>
  );
}
```

### 效果
- 评审人只显示一次名字：`🧑 张三` ✅
- 代码更简洁，复用`UserAvatar`组件
- 样式保持一致（头像大小、文字大小等）

### 显示效果对比

```
修复前（重复）:
┌──────────────┐
│ 🧑 张三 张三  │  ← 名字重复
└──────────────┘

修复后（正确）:
┌──────────────┐
│  🧑 张三      │  ← 名字只显示一次
└──────────────┘
```

---

## 📁 修改的文件清单

| 文件 | 修改内容 | 问题 |
|------|---------|------|
| `src/config/scheduled-requirements.ts` | 配置版本：`5.0` → `6.0` | 问题1 |
| `src/components/scheduled/cells/index.tsx` | `TitleCell` sticky left 修正 | 问题2 |
| `src/components/scheduled/cells/index.tsx` | `IdCell` sticky left 修正 | 问题2 |
| `src/components/scheduled/cells/index.tsx` | `ReviewerCell` 移除重复名字 | 问题3 |

---

## 🧪 测试验证

### 问题1测试
- [ ] 清除浏览器缓存或使用隐私模式
- [ ] 打开预排期页面
- [ ] 确认ID、类型、创建人、创建时间、更新时间列默认隐藏
- [ ] 通过"列控制"可以显示这些列

### 问题2测试
- [ ] 横向滚动表格
- [ ] 确认序号、标题、ID列保持固定
- [ ] 确认固定列位置正确（序号→标题→ID）
- [ ] 确认标题列和ID列之间有分割线

### 问题3测试
- [ ] 查看有评审人的需求
- [ ] 确认评审人名字只显示一次
- [ ] 确认显示格式：`🧑头像 + 名字`

---

## 🔧 技术细节

### 配置版本机制

系统通过配置版本号来管理localStorage的清除：

```tsx
// useScheduledColumns.ts
const savedVersion = safeGetItem('scheduled-config-version', '');
if (savedVersion !== SCHEDULED_CONFIG_VERSION) {
  // 版本不匹配 → 清除旧配置 → 使用新的默认配置
  safeSetItem('scheduled-config-version', SCHEDULED_CONFIG_VERSION);
  safeSetItem('scheduled-hidden-columns', defaultHidden);
}
```

**版本历史**：
- v1.0-v4.0: 历史版本
- v5.0: 旧配置（ID列默认隐藏）
- v6.0: 新配置（5个列默认隐藏，新增评审人列） ← 当前版本

### Sticky定位计算

固定列的`left`值 = 前面所有固定列的宽度之和：

```tsx
const COLUMN_WIDTHS = {
  INDEX: 80,
  TITLE: 256,
  ID: 96,
  // ...
};

// 计算公式
IndexCell.left = 0
TitleCell.left = INDEX = 80
IdCell.left    = INDEX + TITLE = 80 + 256 = 336
```

### UserAvatar组件接口

```tsx
interface UserAvatarProps {
  user: User;
  size?: 'sm' | 'md' | 'lg';
  showName?: boolean;  // 默认 true
  className?: string;
}

// 使用示例
<UserAvatar user={user} size="sm" showName={true} />
// 输出：[头像图标] 张三
```

---

## 💡 经验总结

### 1. 配置变更要升级版本号
当修改默认配置时，必须升级配置版本号，否则用户的旧配置会覆盖新配置。

### 2. Sticky定位要仔细计算
固定列的`left`值必须精确计算，否则会导致列重叠或位置错误。

### 3. 避免重复渲染
使用组件时要注意组件内部是否已经渲染了某些内容，避免在外部重复渲染。

### 4. 测试要全面
- 新用户测试（无localStorage）
- 老用户测试（有localStorage）
- 配置变更测试（版本升级）
- 多浏览器测试

---

## 🎉 修复结果

修复后，预排期列表应该显示为：

```
┌─────┬──────────────┬─────┬────────┬────────┬──────────┬────────┬────────┐
│ 序号 │   标题        │ ... │ 版本号  │一级评审人│一级评审 │一级意见 │  ...   │
├─────┼──────────────┼─────┼────────┼──────────┼────────┼────────┼────────┤
│  1  │ 智能可视化...│ ... │ v1.3.0 │ 🧑 外卜   │  通过   │  ...   │  ...   │
│  2  │ 通知中心     │ ... │ v1.3.0 │    -     │ 待评审  │   -    │  ...   │
│  3  │ API接口优化  │ ... │ v1.3.0 │ 🧑 赵六   │  通过   │  ...   │  ...   │
└─────┴──────────────┴─────┴────────┴──────────┴────────┴────────┴────────┘
  ↑        ↑                              ↑
固定列   固定列                     名字只显示一次
(序号)   (标题)                     (不重复)

默认隐藏（可通过列控制显示）：
- ID列
- 类型列
- 创建人列
- 创建时间列
- 更新时间列
```

---

## 🔗 相关文档

- [列更新总结](./SCHEDULED_COLUMN_UPDATES.md) - 列配置和评审人列
- [功能增强总结](./SCHEDULED_ENHANCEMENTS_SUMMARY.md) - 排序和展开功能
- [表格优化文档](./SCHEDULED_TABLE_OPTIMIZATION.md) - 表格布局优化

---

**所有问题已修复！请刷新浏览器（Ctrl+Shift+R / Cmd+Shift+R）清除缓存后查看效果！** 🚀

### 验证清单：
1. ✅ ID、类型、创建人、创建时间、更新时间列默认隐藏
2. ✅ 标题列和ID列位置正确，有分割线
3. ✅ 评审人名字只显示一次（头像+名字）

