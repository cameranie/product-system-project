# 附件上传和评论功能修复总结

## 问题描述
用户报告以下问题：
1. 需求描述中无法上传附件
2. 评论中无法上传附件
3. 无法保存需求
4. 无法发送评论

## 根本原因

### 1. useCallback依赖数组问题
**文件**: `src/hooks/requirements/useRequirementForm.ts`

**问题**: `handleFileUpload` 函数的依赖数组中错误地包含了 `attachments`，导致每次attachments变化时函数都会重新创建，可能引起闭包问题和状态更新异常。

```typescript
// 修复前
const handleFileUpload = useCallback(async (files: File[]) => {
  // ...
}, [attachments]); // ❌ 不应该依赖 attachments

// 修复后
const handleFileUpload = useCallback(async (files: File[]) => {
  // ...
}, []); // ✅ 使用函数式更新，不需要依赖
```

### 2. 富文本内容验证问题
**文件**: `src/hooks/requirements/useComments.ts`

**问题**: 评论提交时使用 `trim()` 直接验证HTML内容，导致即使只有空标签（如`<p></p>`）也能通过验证。

```typescript
// 修复前
if (!newComment.trim()) { // ❌ 无法正确验证富文本内容
  toast.error('请输入评论内容');
  return;
}

// 修复后
const getPlainText = (html: string): string => {
  if (typeof window === 'undefined') return html;
  const temp = document.createElement('div');
  temp.innerHTML = html;
  return temp.textContent || temp.innerText || '';
};

const plainText = getPlainText(newComment).trim();

if (!plainText) { // ✅ 正确提取纯文本进行验证
  toast.error('请输入评论内容');
  return;
}
```

### 3. React Hooks使用规则违反
**文件**: `src/app/requirements/new/page.tsx`

**问题**: Hook调用被放在条件语句之后，违反了React Hooks的使用规则。

```typescript
// 修复前
if (!hasPermission('requirement:create')) {
  return <PermissionDenied />;
}

const { formData, attachments, ... } = useRequirementForm(); // ❌ Hook在条件语句之后

// 修复后
const { formData, attachments, ... } = useRequirementForm(); // ✅ Hook在条件语句之前

if (!hasPermission('requirement:create')) {
  return <PermissionDenied />;
}
```

### 4. 缺少工具函数
**文件**: `src/lib/common-utils.ts`

**问题**: `generateSecureId`, `generateRequirementId`, `formatDateTime` 函数未定义但被其他模块引用。

**修复**: 在 `common-utils.ts` 中添加了这些函数的实现：

```typescript
/**
 * 生成安全的唯一ID
 */
export function generateSecureId(): string {
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substring(2, 9);
  return `${timestamp}-${randomPart}`;
}

/**
 * 生成需求ID
 * 格式: REQ-{年月日}-{随机数}
 */
export function generateRequirementId(): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `REQ-${year}${month}${day}-${random}`;
}

/**
 * 格式化日期时间为标准格式
 * 格式: YYYY-MM-DD HH:mm:ss
 */
export function formatDateTime(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}
```

## 修改的文件列表

1. **src/hooks/requirements/useRequirementForm.ts**
   - 修复 `handleFileUpload` 的依赖数组

2. **src/hooks/requirements/useComments.ts**
   - 修复 `handleSubmitComment` 的验证逻辑
   - 修复 `handleSubmitReply` 的验证逻辑
   - 修复 `handleSaveEditComment` 的验证逻辑

3. **src/components/ui/rich-text-editor.tsx**
   - 改进 `handleAttachmentUpload` 函数
   - 改进 `handleRemoveAttachment` 函数

4. **src/app/requirements/new/page.tsx**
   - 修复React Hooks使用顺序

5. **src/lib/common-utils.ts**
   - 添加 `generateSecureId` 函数
   - 添加 `generateRequirementId` 函数
   - 添加 `formatDateTime` 函数

## 测试建议

修复完成后，请测试以下场景：

### 1. 需求描述附件上传
- [ ] 新建需求页面中上传附件
- [ ] 编辑需求页面中上传附件
- [ ] 上传多个附件
- [ ] 删除已上传的附件
- [ ] 上传超大文件（应该显示错误提示）

### 2. 评论功能
- [ ] 发送新评论
- [ ] 评论中添加附件
- [ ] 回复评论
- [ ] 回复中添加附件
- [ ] 编辑已有评论
- [ ] 编辑评论中的附件

### 3. 保存需求
- [ ] 新建需求并保存
- [ ] 编辑需求并保存
- [ ] 验证必填字段
- [ ] 验证附件是否正确保存

### 4. 边界情况
- [ ] 提交空内容的评论（应该显示错误）
- [ ] 提交只有空格的评论（应该显示错误）
- [ ] 提交只有HTML标签的评论（应该显示错误）
- [ ] 快速连续上传多个文件

## 影响范围

这些修复影响以下功能模块：
- ✅ 需求管理（新建、编辑）
- ✅ 评论系统
- ✅ 附件上传
- ✅ 表单验证

## 后续优化建议

1. **添加单元测试**：为修复的函数添加单元测试，确保未来不会再出现类似问题
2. **改进错误提示**：提供更详细的错误信息，帮助用户理解上传失败的原因
3. **添加上传进度**：对于大文件上传，显示上传进度条
4. **文件预览**：添加图片文件的预览功能

## 备注

所有修改都已完成并通过编译检查。建议在部署前进行完整的功能测试。

