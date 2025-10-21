# 预排期隐藏列问题调试

## 🐛 问题描述

用户反馈："刷新一瞬间是一套数据，一会又恢复旧的数据"

这说明存在两套数据源冲突：
1. 新的默认配置（v6.2）
2. localStorage中的旧配置

## 🔍 修复措施

### 1. 添加调试日志

在`useScheduledColumns` hook中添加了详细的console.log，可以追踪：
- 保存的版本号
- 当前版本号
- 默认隐藏列
- 从localStorage加载的隐藏列
- 每次保存到localStorage的值

### 2. 升级配置版本号

```tsx
// v6.1 → v6.2
export const SCHEDULED_CONFIG_VERSION = '6.2';
```

这会强制所有用户（包括你）清除旧配置，使用新的默认隐藏列。

### 3. 默认隐藏列配置

```tsx
export const DEFAULT_SCHEDULED_VISIBLE_COLUMNS = [
  'title',       // 标题 - 始终显示
  'priority',    // 优先级
  'version',     // 版本号
  'overallReviewStatus',
  'level1Reviewer',  // 一级评审人
  'level1Status',    // 一级评审
  'level1Opinion',   // 一级意见
  'level2Reviewer',  // 二级评审人
  'level2Status',    // 二级评审
  'level2Opinion',   // 二级意见
  'isOperational',   // 是否运营
] as const;

// 以下列不在上面的数组中，所以默认隐藏：
// - id
// - type
// - platforms
// - creator
// - createdAt
// - updatedAt
```

## 📋 调试步骤

### 步骤1：打开浏览器控制台

1. 访问预排期页面
2. 按 **F12** 打开开发者工具
3. 切换到 **Console（控制台）** 标签

### 步骤2：查看调试日志

刷新页面后，你会看到类似这样的日志：

```
[useScheduledColumns] 初始化
  保存的版本: 6.1
  当前版本: 6.2
  默认隐藏列: ["id", "type", "platforms", "creator", "createdAt", "updatedAt"]
  版本不匹配，使用默认配置
[useScheduledColumns] 保存hiddenColumns到localStorage: ["id", "type", "platforms", "creator", "createdAt", "updatedAt"]
```

### 步骤3：验证配置

在控制台运行：

```javascript
// 查看当前localStorage中的配置
console.log('版本:', localStorage.getItem('scheduled-config-version'));
console.log('隐藏列:', JSON.parse(localStorage.getItem('scheduled-hidden-columns')));
```

**期望输出**：
```
版本: "6.2"
隐藏列: ["id", "type", "platforms", "creator", "createdAt", "updatedAt"]
```

### 步骤4：检查列控制面板

点击右上角的"4 列隐藏"按钮（如果显示的数字不是6，说明有问题）

**期望状态**：
- ☐ ID（未勾选 = 隐藏）
- ☐ 类型（未勾选 = 隐藏）
- ☐ 应用端（未勾选 = 隐藏）
- ☑ 优先级（勾选 = 显示）
- ☑ 版本号（勾选 = 显示）
- ☐ 创建人（未勾选 = 隐藏）
- ☐ 创建时间（未勾选 = 隐藏）
- ☐ 更新时间（未勾选 = 隐藏）

## 🔧 如果问题仍然存在

### 方案1：清除所有localStorage

```javascript
// 在控制台运行
localStorage.clear();
location.reload();
```

### 方案2：只清除预排期相关的配置

```javascript
// 在控制台运行
localStorage.removeItem('scheduled-config-version');
localStorage.removeItem('scheduled-hidden-columns');
localStorage.removeItem('scheduled-column-order');
localStorage.removeItem('scheduled-custom-filters');
location.reload();
```

### 方案3：检查是否有代码覆盖了hiddenColumns

在控制台设置断点：

```javascript
// 监听localStorage变化
const originalSetItem = localStorage.setItem;
localStorage.setItem = function(key, value) {
  if (key.includes('scheduled')) {
    console.trace('localStorage.setItem:', key, value);
  }
  return originalSetItem.apply(this, arguments);
};
```

然后刷新页面，看console中的调用栈，找出是哪里修改了配置。

## 🐛 可能的问题原因

### 1. 初始化时机问题

```tsx
// useScheduledColumns.ts
const [hiddenColumns, setHiddenColumns] = useState<string[]>(() => {
  // 初始化逻辑
  const defaultHidden = [...];  // ← 计算默认隐藏列
  
  if (savedVersion !== SCHEDULED_CONFIG_VERSION) {
    // 版本不匹配，使用默认配置
    safeSetItem('scheduled-hidden-columns', defaultHidden);
    return defaultHidden;  // ← 返回默认值
  }
  
  // 版本匹配，从localStorage加载
  return safeGetItem('scheduled-hidden-columns', defaultHidden);
});

// 问题：useEffect会在初始化后立即执行
useEffect(() => {
  safeSetItem('scheduled-hidden-columns', hiddenColumns);
  // ↑ 如果hiddenColumns在某处被修改，这里会保存错误的值
}, [hiddenColumns]);
```

### 2. 列控制面板的状态不同步

列控制面板显示的勾选状态基于：
```tsx
isVisible={!hiddenColumns.includes(col.value)}
```

如果`hiddenColumns`的值不正确，列控制面板就会显示错误的状态。

### 3. 多个组件同时修改hiddenColumns

检查是否有多个地方在调用`setHiddenColumns`或`toggleColumnVisibility`。

## 📊 调试日志解读

### 正常情况

```
[useScheduledColumns] 初始化
  保存的版本: 6.2
  当前版本: 6.2
  默认隐藏列: ["id", "type", "platforms", "creator", "createdAt", "updatedAt"]
  从localStorage加载的隐藏列: ["id", "type", "platforms", "creator", "createdAt", "updatedAt"]
```

### 版本升级

```
[useScheduledColumns] 初始化
  保存的版本: 6.1  ← 旧版本
  当前版本: 6.2    ← 新版本
  默认隐藏列: ["id", "type", "platforms", "creator", "createdAt", "updatedAt"]
  版本不匹配，使用默认配置  ← 强制重置
[useScheduledColumns] 保存hiddenColumns到localStorage: ["id", "type", "platforms", "creator", "createdAt", "updatedAt"]
```

### 异常情况

```
[useScheduledColumns] 初始化
  保存的版本: 6.2
  当前版本: 6.2
  默认隐藏列: ["id", "type", "platforms", "creator", "createdAt", "updatedAt"]
  从localStorage加载的隐藏列: ["platforms", "creator", "createdAt", "updatedAt"]  ← 缺少id和type
  
// 稍后
[useScheduledColumns] 保存hiddenColumns到localStorage: []  ← 被清空了！
```

如果看到类似上面的日志，说明某处代码修改了`hiddenColumns`。

## ✅ 验证修复

### 1. 列控制面板显示

点击"列设置"按钮，应该显示**"6 列隐藏"**

### 2. 表格显示

表格应该只显示以下列：
- 序号
- 标题
- 优先级
- 版本号
- 一级评审人
- 一级评审
- 一级意见
- 二级评审人
- 二级评审
- 二级意见
- 是否运营

**不应该显示**：
- ID
- 类型
- 应用端
- 创建人
- 创建时间
- 更新时间

### 3. localStorage内容

```javascript
localStorage.getItem('scheduled-config-version') === '6.2'
JSON.parse(localStorage.getItem('scheduled-hidden-columns')).length === 6
```

## 📞 如果问题仍未解决

请提供以下信息：

1. **控制台日志截图**（显示所有`[useScheduledColumns]`开头的日志）
2. **localStorage内容**（运行上面的调试命令）
3. **列控制面板截图**（显示勾选状态）
4. **表格截图**（显示实际显示的列）

---

**现在请刷新浏览器，查看控制台日志，并告诉我看到了什么！** 🔍

