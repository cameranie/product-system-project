# 预排期页面版本号显示样式优化

## 修改内容

将预排期页面中的版本号和需求数量显示样式优化为**蓝色字体**，使其更加明显和突出。

## 修改文件

### 1. ScheduledVersionGroup 组件
**文件路径**: `src/components/scheduled/ScheduledVersionGroup.tsx`

**修改前**:
```tsx
<h3 className="font-semibold text-lg">{version}</h3>
<Badge variant="secondary" className="text-xs">
  {requirements.length} 个需求
</Badge>
```

**修改后**:
```tsx
<h3 className="font-semibold text-lg">
  <span className="text-blue-600">{version}</span>
  <span className="text-blue-600 ml-2">({requirements.length}个需求)</span>
</h3>
```

**效果**:
- 版本号和需求数量合并显示
- 使用蓝色字体 (`text-blue-600`)
- 保持原有的字号大小 (`text-lg`)
- 添加间距 (`ml-2`)

### 2. 预排期主页面
**文件路径**: `src/app/scheduled/page.tsx`

**修改前**:
```tsx
<h3 className="text-sm font-semibold">{version}</h3>
<span className="inline-flex items-center rounded bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground">
  {requirements.length} 个需求
</span>
```

**修改后**:
```tsx
<h3 className="text-base font-semibold text-blue-600">
  {version} ({requirements.length}个需求)
</h3>
```

**效果**:
- 版本号和需求数量合并显示为一行
- 使用蓝色字体 (`text-blue-600`)
- 字号从 `text-sm` 增大到 `text-base`，更加醒目
- 移除了 Badge 背景，使文字更清晰

## 视觉效果对比

### 修改前
```
[>] 版本号 v1.0.0  [5 个需求]
```
- 版本号和需求数量分开显示
- 使用默认黑色/灰色字体
- 需求数量有灰色背景徽章

### 修改后
```
[>] 版本号 v1.0.0 (5个需求)
```
- 版本号和需求数量一起显示
- 使用**蓝色字体** (更醒目)
- 合并为一行，更简洁

## 应用页面

此修改影响以下页面：

1. **预排期主页面** (`/scheduled`)
   - 使用 `src/app/scheduled/page.tsx`
   - 显示版本分组列表

2. **预排期新版页面** (`/scheduled`)
   - 使用 `src/app/scheduled/page-new.tsx`
   - 通过 `ScheduledMainTable` → `ScheduledVersionGroup` 组件链
   - 自动继承 `ScheduledVersionGroup` 的样式改变

## 相关组件

### 组件层级结构
```
page.tsx / page-new.tsx
  └── ScheduledMainTable
      └── ScheduledVersionGroup (已修改✓)
          └── 版本分组标题 (蓝色显示)
              └── CollapsibleContent
                  └── 表格内容
```

## 技术细节

### 使用的 Tailwind CSS 类
- `text-blue-600`: 蓝色字体颜色（#2563eb）
- `text-lg`: 大字号（1.125rem / 18px）
- `text-base`: 基础字号（1rem / 16px）
- `font-semibold`: 半粗体（font-weight: 600）
- `ml-2`: 左边距（0.5rem / 8px）

### 为什么选择 `text-blue-600`？
- 蓝色在视觉层级上比较突出
- `blue-600` 色调适中，既醒目又不过于刺眼
- 与系统其他交互元素（链接、按钮）颜色系统统一
- 符合常见 UI 设计规范中的信息层级表达

### 可选的其他蓝色色调
如果需要调整颜色深浅，可以使用：
- `text-blue-500`: 更亮的蓝色 (#3b82f6)
- `text-blue-700`: 更深的蓝色 (#1d4ed8)
- `text-blue-800`: 深蓝色 (#1e40af)

## 浏览器兼容性

此修改使用的 CSS 类都是标准的 Tailwind CSS 类，支持所有现代浏览器：
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 测试建议

1. **视觉测试**
   - 访问预排期页面 `/scheduled`
   - 确认版本号显示为蓝色
   - 确认文字大小适中，易于阅读

2. **功能测试**
   - 点击版本分组标题，确认折叠/展开功能正常
   - 确认需求数量显示正确
   - 确认已选择数量的徽章仍然正常显示

3. **响应式测试**
   - 在不同屏幕尺寸下测试显示效果
   - 确认文字不会被截断

## 未来优化建议

1. **主题支持**
   - 考虑添加深色模式下的蓝色色调调整
   - 可以使用 CSS 变量统一管理颜色

2. **可配置性**
   - 可以将颜色配置提取到配置文件
   - 允许用户自定义版本号显示样式

3. **交互增强**
   - 鼠标悬停时可以增加高亮效果
   - 添加过渡动画使交互更流畅

## 回滚方案

如果需要恢复到原来的样式，执行以下操作：

### ScheduledVersionGroup.tsx
```tsx
// 恢复为原样式
<h3 className="font-semibold text-lg">{version}</h3>
<Badge variant="secondary" className="text-xs">
  {requirements.length} 个需求
</Badge>
```

### page.tsx
```tsx
// 恢复为原样式
<h3 className="text-sm font-semibold">{version}</h3>
<span className="inline-flex items-center rounded bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground">
  {requirements.length} 个需求
</span>
```

## 相关文档

- [Tailwind CSS 颜色系统](https://tailwindcss.com/docs/customizing-colors)
- [组件设计指南](./DEVELOPMENT_GUIDE.md)
- [预排期页面功能说明](./REQUIREMENTS_PAGES_ACTION_ITEMS.md)

