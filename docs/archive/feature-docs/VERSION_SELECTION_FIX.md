# 预排期页面版本号选择问题解决方案

## 问题描述

预排期页面列表中，选择、修改版本号不生效的问题。

## 问题原因

**这不是模拟数据的问题！** 版本号选择功能依赖于版本管理系统的真实数据。

预排期页面的版本号来源：
1. 使用 `useVersionStore` 从版本管理系统获取数据
2. 数据存储在浏览器的 `localStorage` 中
3. 键名：`version_management_versions`
4. 版本号格式：`{平台} {版本号}`（例如：`iOS 1.0.0`）

**如果版本管理页面没有添加任何版本记录，下拉列表中只会显示"暂无版本号"。**

## 代码分析

### 1. 版本号数据获取（`src/app/scheduled/page.tsx` 288-289行）

```typescript
const { getVersionNumbers, initFromStorage } = useVersionStore();
const VERSION_OPTIONS = getVersionNumbers();
```

### 2. 版本号列表生成（`src/lib/version-store.ts` 162-169行）

```typescript
getVersionNumbers: () => {
  const state = get();
  const versionNumbers = state.versions
    .map((v) => `${v.platform} ${v.versionNumber}`)
    .sort()
    .reverse();
  return ['暂无版本号', ...versionNumbers];
},
```

### 3. 版本号更新（`src/app/scheduled/page.tsx` 1433行）

```typescript
onClick={() => {
  updateRequirement(requirement.id, { 
    plannedVersion: version === '暂无版本号' ? undefined : version 
  });
  toast.success('版本号已更新');
}}
```

## 解决方案

### 方案一：使用浏览器控制台快速添加测试数据（推荐）

1. **打开浏览器开发者工具**
   - 按 `F12` 或 `Cmd+Option+I` (Mac)

2. **检查当前版本数据**
   ```javascript
   // 在控制台输入：
   console.log(JSON.parse(localStorage.getItem('version_management_versions') || '[]'));
   ```

3. **加载初始化脚本**
   - 打开文件：`scripts/init-version-data.js`
   - 复制全部内容
   - 粘贴到浏览器控制台并回车

4. **初始化测试数据**
   ```javascript
   // 在控制台输入：
   initVersionData();
   ```

5. **刷新页面**
   - 按 `F5` 或 `Cmd+R` 刷新页面
   - 现在版本号下拉列表应该有数据了

### 方案二：通过版本管理页面手动添加

1. **访问版本管理页面**
   - 导航到：`/versions`

2. **点击"新建版本"按钮**

3. **填写版本信息**
   - 应用端：选择或添加（iOS、安卓、PC、web等）
   - 版本号：输入版本号（格式：x.y.z，如：1.0.0）
   - 上线时间：选择日期

4. **保存**
   - 系统会自动计算 PRD、原型、开发、测试时间节点

5. **返回预排期页面**
   - 刷新页面
   - 版本号下拉列表会显示：`{应用端} {版本号}`

### 方案三：直接操作 localStorage（适合开发调试）

```javascript
// 在浏览器控制台输入：
const testVersions = [
  {
    id: 'test-1',
    platform: 'iOS',
    versionNumber: '1.0.0',
    releaseDate: '2025-11-01',
    schedule: {
      prdStartDate: '2025-10-07',
      prdEndDate: '2025-10-09',
      prototypeStartDate: '2025-10-14',
      prototypeEndDate: '2025-10-18',
      devStartDate: '2025-10-21',
      devEndDate: '2025-10-25',
      testStartDate: '2025-10-28',
      testEndDate: '2025-11-01'
    },
    createdAt: new Date().toLocaleString('zh-CN'),
    updatedAt: new Date().toLocaleString('zh-CN')
  },
  {
    id: 'test-2',
    platform: '安卓',
    versionNumber: '2.0.0',
    releaseDate: '2025-11-15',
    schedule: {
      prdStartDate: '2025-10-21',
      prdEndDate: '2025-10-23',
      prototypeStartDate: '2025-10-28',
      prototypeEndDate: '2025-11-01',
      devStartDate: '2025-11-04',
      devEndDate: '2025-11-08',
      testStartDate: '2025-11-11',
      testEndDate: '2025-11-15'
    },
    createdAt: new Date().toLocaleString('zh-CN'),
    updatedAt: new Date().toLocaleString('zh-CN')
  }
];

localStorage.setItem('version_management_versions', JSON.stringify(testVersions));
console.log('✅ 测试版本数据已添加！请刷新页面。');
```

## 验证步骤

1. **检查版本数据**
   ```javascript
   const versions = JSON.parse(localStorage.getItem('version_management_versions') || '[]');
   console.log('版本数量:', versions.length);
   console.log('版本列表:', versions.map(v => `${v.platform} ${v.versionNumber}`));
   ```

2. **访问预排期页面**
   - 进入预排期页面：`/scheduled`

3. **测试版本号选择**
   - 找到任意需求的版本号列
   - 点击版本号下拉框
   - 应该能看到所有版本号选项
   - 选择一个版本号
   - 应该显示 "版本号已更新" 的提示

4. **验证更新是否成功**
   - 刷新页面
   - 检查需求的版本号是否已更新

## 常见问题

### Q1: 添加了版本数据，但预排期页面看不到？

**解决方法：**
- 刷新页面（F5）
- 清除浏览器缓存后重新加载
- 检查控制台是否有错误信息

### Q2: 版本号更新后，刷新页面又变回原来的值？

**可能原因：**
- `updateRequirement` 函数没有正确保存到 localStorage
- 需求数据的 localStorage 可能损坏

**解决方法：**
```javascript
// 检查需求数据
const requirements = JSON.parse(localStorage.getItem('requirements') || '[]');
console.log('需求数量:', requirements.length);

// 查找特定需求
const req = requirements.find(r => r.id === 'REQ-XXX');
console.log('需求版本号:', req?.plannedVersion);
```

### Q3: 如何清除所有版本数据重新开始？

```javascript
// 在浏览器控制台输入：
localStorage.removeItem('version_management_versions');
localStorage.removeItem('version_management_custom_platforms');
console.log('✅ 已清除所有版本数据！');
```

### Q4: 版本号格式是什么？

版本号在预排期页面显示时，格式为：`{平台} {版本号}`

例如：
- `iOS 1.0.0`
- `安卓 2.1.0`
- `PC 3.0.0`
- `web 1.5.0`

## 相关文件

- 预排期页面：`src/app/scheduled/page.tsx`
- 版本管理页面：`src/app/versions/page.tsx`
- 版本存储逻辑：`src/lib/version-store.ts`
- 需求存储逻辑：`src/lib/requirements-store.ts`
- 初始化脚本：`scripts/init-version-data.js`

## 数据流程图

```
版本管理页面 (/versions)
    ↓
添加/编辑版本
    ↓
保存到 localStorage
(version_management_versions)
    ↓
useVersionStore.getVersionNumbers()
    ↓
预排期页面 (/scheduled)
    ↓
显示版本号下拉列表
    ↓
选择版本号
    ↓
updateRequirement()
    ↓
保存到 localStorage (requirements)
    ↓
页面刷新后显示更新后的版本号
```

## 技术实现细节

### 版本号存储结构

```typescript
interface Version {
  id: string;
  platform: string;        // 应用端（iOS、安卓等）
  versionNumber: string;   // 版本号（如：1.0.0）
  releaseDate: string;     // 上线日期
  schedule: VersionSchedule; // 时间节点
  createdAt: string;
  updatedAt: string;
}
```

### 需求中的版本号字段

```typescript
interface Requirement {
  // ... 其他字段
  plannedVersion?: string;  // 计划版本号（格式："{平台} {版本号}"）
}
```

## 总结

**预排期页面的版本号选择功能完全正常，不是模拟数据问题！**

只需要在版本管理页面添加版本记录，或使用初始化脚本添加测试数据，版本号选择功能就能正常使用了。

如果仍有问题，请检查：
1. 浏览器控制台是否有错误
2. localStorage 是否被禁用
3. 版本数据格式是否正确

