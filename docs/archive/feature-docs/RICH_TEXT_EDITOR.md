# 富文本编辑器使用说明

## 概述

在需求创建页、需求编辑页、需求详情页以及评论区中，我们集成了基于 Tiptap 的富文本编辑器，提供了丰富的文本编辑功能。

## 功能特性

### 基本编辑功能

1. **撤销/重做**
   - 支持编辑操作的撤销和重做
   - 快捷键：Ctrl/Cmd + Z（撤销）、Ctrl/Cmd + Shift + Z（重做）

2. **标题样式**
   - 支持三级标题（H1、H2、H3）
   - 可快速设置段落为标题样式

3. **文本格式**
   - **粗体**：加粗重要文本（Ctrl/Cmd + B）
   - *斜体*：强调特定内容（Ctrl/Cmd + I）
   - ~~删除线~~：标记删除或过时的内容
   - `行内代码`：标记代码片段

4. **列表**
   - 无序列表（项目符号）
   - 有序列表（数字编号）
   - ✅ 任务列表（待办事项）

5. **文本对齐**
   - 左对齐
   - 居中对齐
   - 右对齐

6. **链接**
   - 插入超链接
   - 点击工具栏链接按钮，输入 URL 即可

7. **图片**
   - 📷 点击图片按钮选择文件上传
   - 📋 支持复制粘贴图片
   - 🖱️ 支持拖拽图片直接插入
   - 图片自动适应宽度，保持比例

8. **引用**
   - 插入引用块
   - 适合引用他人观点或重要说明

9. **代码块**
   - 插入代码块，支持语法高亮
   - 适合分享代码片段

10. **表格**
    - 插入表格（默认 3x3，带表头）
    - 支持调整列宽
    - 适合展示结构化数据

## 使用场景

### 1. 需求描述（创建/编辑页）
- 完整工具栏，所有功能可用
- 最小高度 200px
- 支持拖拽图片

### 2. 需求详情（只读显示）
- 只读模式，无工具栏
- 完整渲染富文本内容
- 保留所有格式和样式

### 3. 评论区（紧凑模式）
- 紧凑工具栏，隐藏标题和对齐功能
- 最小高度 100px
- 适合快速输入评论

## 技术实现

### 组件位置

- **富文本编辑器组件**：`src/components/ui/rich-text-editor.tsx`
- **使用页面**：
  - 需求创建页：`src/app/requirements/new/page.tsx`（编辑模式）
  - 需求编辑页：`src/app/requirements/[id]/edit/page.tsx`（编辑模式）
  - 需求详情页：`src/app/requirements/[id]/page.tsx`（只读模式）
  - 评论组件：`src/components/requirements/CommentSection.tsx`（紧凑模式）

### 依赖库

使用了 Tiptap 富文本编辑器框架，包括以下扩展：

```json
{
  "@tiptap/react": "富文本编辑器核心",
  "@tiptap/starter-kit": "基础功能包",
  "@tiptap/extension-link": "链接支持",
  "@tiptap/extension-color": "文字颜色",
  "@tiptap/extension-text-style": "文本样式",
  "@tiptap/extension-text-align": "文本对齐",
  "@tiptap/extension-image": "图片支持",
  "@tiptap/extension-task-list": "任务列表",
  "@tiptap/extension-task-item": "任务列表项",
  "@tiptap/extension-blockquote": "引用块",
  "@tiptap/extension-code-block-lowlight": "代码块高亮",
  "@tiptap/extension-table": "表格支持",
  "lowlight": "代码语法高亮"
}
```

### 组件接口

```typescript
interface RichTextEditorProps {
  value: string;              // 富文本内容（HTML格式）
  onChange: (value: string) => void;  // 内容变化回调
  placeholder?: string;       // 占位符文本
  className?: string;         // 自定义样式类
  readOnly?: boolean;         // 只读模式
  compact?: boolean;          // 紧凑模式（用于评论等）
}
```

### 使用示例

#### 编辑模式（创建/编辑页面）

```tsx
import { RichTextEditor } from '@/components/ui/rich-text-editor';

function CreatePage() {
  const [description, setDescription] = useState('');

  return (
    <RichTextEditor
      placeholder="请输入内容..."
      value={description}
      onChange={setDescription}
    />
  );
}
```

#### 只读模式（详情页面）

```tsx
import { RichTextEditor } from '@/components/ui/rich-text-editor';

function DetailPage({ requirement }) {
  return (
    <RichTextEditor
      value={requirement.description}
      onChange={() => {}} // 只读模式不需要处理变化
      readOnly={true}
    />
  );
}
```

#### 紧凑模式（评论区）

```tsx
import { RichTextEditor } from '@/components/ui/rich-text-editor';

function CommentForm() {
  const [comment, setComment] = useState('');

  return (
    <RichTextEditor
      placeholder="发表评论..."
      value={comment}
      onChange={setComment}
      compact={true}  // 紧凑模式，隐藏部分工具栏
    />
  );
}
```

## 数据格式

- **存储格式**：HTML 字符串
- **示例**：
  ```html
  <h2>需求背景</h2>
  <p>这是一段<strong>重要</strong>的需求描述。</p>
  <ul>
    <li>功能点 1</li>
    <li>功能点 2</li>
  </ul>
  <ul data-type="taskList">
    <li data-checked="true">已完成的任务</li>
    <li data-checked="false">待完成的任务</li>
  </ul>
  <img src="data:image/png;base64,..." />
  <blockquote>
    <p>这是一段引用</p>
  </blockquote>
  <pre><code class="language-javascript">console.log('Hello World');</code></pre>
  <table>
    <thead>
      <tr>
        <th>列1</th>
        <th>列2</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>数据1</td>
        <td>数据2</td>
      </tr>
    </tbody>
  </table>
  ```

## 图片处理

### 上传方式

1. **点击按钮上传**
   - 点击工具栏的图片图标
   - 选择本地图片文件
   - 支持 jpg、png、gif 等常见格式

2. **复制粘贴**
   - 复制图片到剪贴板
   - 在编辑器中粘贴（Ctrl/Cmd + V）
   - 自动插入到当前光标位置

3. **拖拽插入**
   - 从文件管理器拖拽图片到编辑器
   - 松开鼠标即可插入

### 图片限制

- **大小限制**：单张图片不超过 5MB
- **格式限制**：仅支持图片文件（image/*）
- **存储方式**：Base64 编码（嵌入在 HTML 中）

### 注意事项

⚠️ **生产环境建议**：
- Base64 适合小图片和快速原型
- 对于大图片或生产环境，建议：
  1. 上传图片到 CDN 或对象存储
  2. 在编辑器中插入图片 URL
  3. 可以扩展组件支持自定义上传逻辑

## 表单验证

富文本内容在提交前会经过以下验证：

1. **必填检查**：提取纯文本内容，确保不为空
2. **长度限制**：纯文本内容不超过 5000 个字符
3. **安全检查**：防止注入危险脚本（`<script>`、`<iframe>` 等）

验证逻辑位于：`src/hooks/requirements/useRequirementForm.ts`

## 样式定制

富文本编辑器支持明暗主题自动切换，样式定义在组件内部的 `<style jsx global>` 标签中。

### 主要样式类

- `.rich-text-editor`：编辑器容器
- `.ProseMirror`：编辑区域
- `.task-list`：任务列表
- `.code-block`：代码块
- 工具栏按钮使用 shadcn/ui 的 Button 组件

### 自定义样式

可以通过 `className` prop 传入自定义样式：

```tsx
<RichTextEditor
  value={content}
  onChange={setContent}
  className="my-custom-editor"
/>
```

## 键盘快捷键

| 功能 | Windows/Linux | macOS |
|------|--------------|-------|
| 粗体 | Ctrl + B | Cmd + B |
| 斜体 | Ctrl + I | Cmd + I |
| 撤销 | Ctrl + Z | Cmd + Z |
| 重做 | Ctrl + Shift + Z | Cmd + Shift + Z |
| 创建链接 | Ctrl + K | Cmd + K |
| 粘贴纯文本 | Ctrl + Shift + V | Cmd + Shift + V |

## 注意事项

1. **React 19 兼容性**：Tiptap 支持 React 19，使用 `--legacy-peer-deps` 安装
2. **内容安全**：所有用户输入都会经过 XSS 防护验证
3. **性能优化**：
   - 编辑器使用 `useEditor` hook，避免不必要的重渲染
   - 图片使用 Base64，适合小图片
   - 代码块使用 lowlight 进行语法高亮
4. **数据同步**：外部 value 变化时，编辑器内容会自动同步
5. **SSR 支持**：设置 `immediatelyRender: false` 避免水合问题

## 最佳实践

### 需求描述

```tsx
// ✅ 推荐：使用完整功能
<RichTextEditor
  value={description}
  onChange={setDescription}
  placeholder="请详细描述需求内容、目标和预期效果..."
/>
```

### 评论输入

```tsx
// ✅ 推荐：使用紧凑模式
<RichTextEditor
  value={comment}
  onChange={setComment}
  placeholder="发表评论..."
  compact={true}
/>
```

### 只读显示

```tsx
// ✅ 推荐：使用只读模式
<RichTextEditor
  value={content}
  onChange={() => {}}
  readOnly={true}
/>
```

## 故障排除

### 问题：编辑器不显示

**原因**：SSR 水合问题  
**解决**：确保设置了 `immediatelyRender: false`

### 问题：图片上传失败

**原因**：图片超过 5MB 限制  
**解决**：压缩图片或调整限制

### 问题：工具栏按钮不响应

**原因**：编辑器未聚焦  
**解决**：点击编辑区域后再使用工具栏

## 未来扩展

可以考虑添加的功能：

- [x] 图片上传和插入
- [x] 任务列表
- [x] 引用
- [x] 代码块
- [x] 表格支持
- [ ] 视频嵌入
- [ ] 文件附件管理
- [ ] @提及用户
- [ ] 表情符号选择器
- [ ] Markdown 快捷输入
- [ ] 协同编辑
- [ ] 导出为 PDF/Markdown
- [ ] 字数统计
- [ ] 自动保存草稿
