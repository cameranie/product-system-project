# 需求管理系统 - API接口文档

## 1. 数据模型定义

### 1.1 基础数据类型

```typescript
// 用户信息
interface User {
  id: string;
  name: string;
  avatar: string;
  email: string;
}

// 项目信息
interface Project {
  id: string;
  name: string;
  color: string;
}

// 附件信息
interface Attachment {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
}

// 端负责人意见
interface EndOwnerOpinion {
  needToDo?: boolean;
  priority?: '低' | '中' | '高' | '紧急';
  opinion: string;
  owner?: User;
}

// 评审级别
interface ScheduledReviewLevel {
  id: string;
  level: number;
  levelName: string;
  status: 'pending' | 'approved' | 'rejected';
  reviewer?: User;
  opinion?: string;
}

// 预排期评审数据
interface ScheduledReviewData {
  reviewLevels: ScheduledReviewLevel[];
}

// 评论信息
interface Comment {
  id: string;
  content: string;
  author: User;
  createdAt: string;
  attachments: Attachment[];
  replies: Reply[];
}

// 回复信息
interface Reply {
  id: string;
  content: string;
  author: User;
  createdAt: string;
  attachments: Attachment[];
}

// 修改记录
interface HistoryRecord {
  id: string;
  action: string;
  field: string;
  oldValue: string;
  newValue: string;
  user: User;
  timestamp: string;
}
```

### 1.2 需求数据模型

```typescript
interface Requirement {
  id: string;                    // 需求ID，格式：#1, #2, #3...
  title: string;                 // 需求标题
  type: '新功能' | '优化' | 'BUG' | '用户反馈' | '商务需求';  // 需求类型
  status: '待评审' | '评审中' | '评审通过' | '评审不通过' | '已关闭' | '开发中' | '已完成' | '设计中';  // 需求状态
  priority: '低' | '中' | '高' | '紧急';  // 优先级
  creator: User;                 // 创建人
  project: Project;              // 所属项目
  description: string;           // 需求描述
  tags: string[];               // 标签
  createdAt: string;            // 创建时间 (YYYY-MM-DD HH:MM)
  updatedAt: string;            // 更新时间 (YYYY-MM-DD HH:MM)
  platforms: string[];          // 应用端 ['Web端', 'PC端', '移动端']
  plannedVersion?: string;       // 计划版本
  isOpen: boolean;              // 是否开放
  needToDo?: '是' | '否';        // 是否要做
  reviewer1?: User;             // 一级评审人
  reviewer2?: User;             // 二级评审人
  reviewer1Status?: 'pending' | 'approved' | 'rejected';  // 一级评审状态
  reviewer2Status?: 'pending' | 'approved' | 'rejected';  // 二级评审状态
  reviewStatus?: 'pending' | 'first_review' | 'second_review' | 'approved' | 'rejected';  // 整体评审状态
  assignee?: User;              // 指派人
  prototypeId?: string;         // 原型ID
  prdId?: string;               // PRD文档ID
  attachments: Attachment[];     // 附件列表
  endOwnerOpinion: EndOwnerOpinion;  // 端负责人意见
  scheduledReview: ScheduledReviewData;  // 预排期评审
}
```

## 2. 需求池相关接口

### 2.1 获取需求列表

**接口路径：** `GET /api/requirements`

**请求参数：**

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| page | number | 否 | 页码，默认1 |
| pageSize | number | 否 | 每页数量，默认20 |
| search | string | 否 | 搜索关键词（搜索标题、创建人、ID、应用端） |
| status | string | 否 | 状态筛选：all/open/closed |
| type | string | 否 | 需求类型筛选 |
| priority | string | 否 | 优先级筛选 |
| creator | string | 否 | 创建人筛选 |
| platform | string | 否 | 应用端筛选 |
| sortBy | string | 否 | 排序字段：id/title/priority/createdAt/updatedAt |
| sortOrder | string | 否 | 排序方向：asc/desc |

**请求示例：**
```
GET /api/requirements?page=1&pageSize=20&search=登录&status=open&sortBy=createdAt&sortOrder=desc
```

**响应数据：**
```typescript
interface GetRequirementsResponse {
  code: number;
  message: string;
  data: {
    list: Requirement[];
    total: number;
    page: number;
    pageSize: number;
    stats: {
      total: number;
      open: number;
      closed: number;
    };
  };
}
```

**响应示例：**
```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "list": [
      {
        "id": "#1",
        "title": "用户登录功能优化",
        "type": "优化",
        "status": "评审中",
        "priority": "高",
        "creator": {
          "id": "1",
          "name": "张三",
          "avatar": "",
          "email": "zhangsan@example.com"
        },
        "createdAt": "2024-01-15 10:30",
        "updatedAt": "2024-01-20 14:25",
        "isOpen": true,
        "needToDo": "是"
      }
    ],
    "total": 50,
    "page": 1,
    "pageSize": 20,
    "stats": {
      "total": 50,
      "open": 35,
      "closed": 15
    }
  }
}
```

### 2.2 批量更新需求

**接口路径：** `PUT /api/requirements/batch`

**请求参数：**
```typescript
interface BatchUpdateRequirementsRequest {
  ids: string[];           // 需求ID列表
  updates: {
    needToDo?: '是' | '否';  // 批量设置是否要做
    priority?: '低' | '中' | '高' | '紧急';  // 批量设置优先级
  };
}
```

**请求示例：**
```json
{
  "ids": ["#1", "#2", "#3"],
  "updates": {
    "needToDo": "是"
  }
}
```

**响应数据：**
```typescript
interface BatchUpdateRequirementsResponse {
  code: number;
  message: string;
  data: {
    updated: string[];     // 成功更新的需求ID列表
    failed: string[];      // 更新失败的需求ID列表
  };
}
```

## 3. 需求详情相关接口

### 3.1 获取需求详情

**接口路径：** `GET /api/requirements/{id}`

**路径参数：**
- `id`: 需求ID（需要URL编码，如 %231 代表 #1）

**请求示例：**
```
GET /api/requirements/%231
```

**响应数据：**
```typescript
interface GetRequirementDetailResponse {
  code: number;
  message: string;
  data: {
    requirement: Requirement;
    comments: Comment[];
    historyRecords: HistoryRecord[];
  };
}
```

### 3.2 更新需求状态

**接口路径：** `PUT /api/requirements/{id}/status`

**路径参数：**
- `id`: 需求ID

**请求参数：**
```typescript
interface UpdateRequirementStatusRequest {
  isOpen: boolean;         // 开放/关闭状态
}
```

**请求示例：**
```json
{
  "isOpen": false
}
```

**响应数据：**
```typescript
interface UpdateRequirementStatusResponse {
  code: number;
  message: string;
  data: Requirement;
}
```

### 3.3 添加评论

**接口路径：** `POST /api/requirements/{id}/comments`

**路径参数：**
- `id`: 需求ID

**请求参数：**
- Content-Type: multipart/form-data
- content: string (评论内容)
- attachments: File[] (可选，附件文件列表)

**响应数据：**
```typescript
interface AddCommentResponse {
  code: number;
  message: string;
  data: Comment;
}
```

### 3.4 回复评论

**接口路径：** `POST /api/requirements/{id}/comments/{commentId}/replies`

**路径参数：**
- `id`: 需求ID
- `commentId`: 评论ID

**请求参数：**
- Content-Type: multipart/form-data
- content: string (回复内容)
- attachments: File[] (可选，附件文件列表)

**响应数据：**
```typescript
interface AddReplyResponse {
  code: number;
  message: string;
  data: Reply;
}
```

## 4. 需求创建接口

### 4.1 创建新需求

**接口路径：** `POST /api/requirements`

**请求参数：**
- Content-Type: multipart/form-data

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| title | string | 是 | 需求标题 |
| type | string | 是 | 需求类型：新功能/优化/BUG/用户反馈/商务需求 |
| description | string | 是 | 需求描述 |
| tags | string[] | 否 | 标签数组 |
| platforms | string[] | 是 | 应用端数组 |
| attachments | File[] | 否 | 附件文件列表 |
| endOwnerOpinion | object | 否 | 端负责人意见 |
| scheduledReview | object | 否 | 预排期评审 |

**端负责人意见结构：**
```typescript
{
  needToDo?: boolean;
  priority?: '低' | '中' | '高' | '紧急';
  opinion: string;
  owner?: string;       // 端负责人ID
}
```

**预排期评审结构：**
```typescript
{
  reviewLevels: {
    level: number;
    levelName: string;
    reviewer?: string;  // 评审人ID
    opinion?: string;
  }[];
}
```

**请求示例：**
```json
{
  "title": "用户登录功能优化",
  "type": "优化",
  "description": "优化用户登录流程，提升用户体验",
  "tags": ["用户体验", "登录", "优化"],
  "platforms": ["Web端", "PC端"],
  "endOwnerOpinion": {
    "needToDo": true,
    "priority": "高",
    "opinion": "这个功能很重要，建议优先处理",
    "owner": "user-001"
  },
  "scheduledReview": {
    "reviewLevels": [
      {
        "level": 1,
        "levelName": "一级评审",
        "reviewer": "reviewer-001",
        "opinion": ""
      }
    ]
  }
}
```

**响应数据：**
```typescript
interface CreateRequirementResponse {
  code: number;
  message: string;
  data: Requirement;
}
```

## 5. 需求编辑接口

### 5.1 更新需求

**接口路径：** `PUT /api/requirements/{id}`

**路径参数：**
- `id`: 需求ID

**请求参数：**
- Content-Type: multipart/form-data

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| title | string | 否 | 需求标题 |
| type | string | 否 | 需求类型 |
| description | string | 否 | 需求描述 |
| tags | string[] | 否 | 标签 |
| platforms | string[] | 否 | 应用端 |
| priority | string | 否 | 优先级 |
| needToDo | string | 否 | 是否要做 |
| attachments | File[] | 否 | 新增附件 |
| removeAttachments | string[] | 否 | 要删除的附件ID列表 |
| endOwnerOpinion | object | 否 | 端负责人意见 |
| scheduledReview | object | 否 | 预排期评审 |

**响应数据：**
```typescript
interface UpdateRequirementResponse {
  code: number;
  message: string;
  data: Requirement;
}
```

## 6. 文件上传接口

### 6.1 上传附件

**接口路径：** `POST /api/upload/attachments`

**请求参数：**
- Content-Type: multipart/form-data
- files: File[] (文件列表)

**文件限制：**
- 单个文件大小：最大10MB
- 支持格式：常见文档、图片、压缩包等格式
- 文件名限制：不能包含特殊字符，长度不超过255字符

**响应数据：**
```typescript
interface UploadAttachmentsResponse {
  code: number;
  message: string;
  data: {
    attachments: Attachment[];
  };
}
```

**响应示例：**
```json
{
  "code": 200,
  "message": "上传成功",
  "data": {
    "attachments": [
      {
        "id": "att-001",
        "name": "需求文档.docx",
        "size": 512000,
        "type": "application/docx",
        "url": "https://example.com/files/att-001.docx"
      }
    ]
  }
}
```

## 7. 用户和项目数据接口

### 7.1 获取用户列表

**接口路径：** `GET /api/users`

**请求参数：**

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| search | string | 否 | 搜索用户名或邮箱 |
| role | string | 否 | 角色筛选 |

**响应数据：**
```typescript
interface GetUsersResponse {
  code: number;
  message: string;
  data: User[];
}
```

### 7.2 获取项目列表

**接口路径：** `GET /api/projects`

**请求参数：**

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| status | string | 否 | 项目状态筛选 |

**响应数据：**
```typescript
interface GetProjectsResponse {
  code: number;
  message: string;
  data: Project[];
}
```

## 8. 通用响应格式

所有接口都遵循统一的响应格式：

```typescript
interface ApiResponse<T = any> {
  code: number;      // 状态码：200成功，400客户端错误，500服务器错误
  message: string;   // 响应消息
  data?: T;         // 响应数据
}
```

**成功响应示例：**
```json
{
  "code": 200,
  "message": "操作成功",
  "data": {
    // 具体数据
  }
}
```

**错误响应示例：**
```json
{
  "code": 400,
  "message": "请求参数错误：title不能为空",
  "data": null
}
```

## 9. 错误码定义

| 错误码 | 说明 | 常见原因 |
|--------|------|----------|
| 200 | 请求成功 | - |
| 400 | 请求参数错误 | 缺少必填参数、参数格式不正确 |
| 401 | 未授权访问 | 未登录或token过期 |
| 403 | 权限不足 | 没有操作权限 |
| 404 | 资源不存在 | 需求ID不存在、用户不存在等 |
| 409 | 资源冲突 | 需求标题重复等 |
| 413 | 文件过大 | 上传文件超过大小限制 |
| 415 | 不支持的文件类型 | 上传了不支持的文件格式 |
| 500 | 服务器内部错误 | 系统异常 |

## 10. 特殊说明

### 10.1 时间格式
- 所有时间字段使用 `YYYY-MM-DD HH:MM` 格式
- 示例：`2024-01-15 10:30`

### 10.2 需求ID格式
- 需求ID使用 `#1`, `#2`, `#3` 等格式
- 在URL中需要进行URL编码：`#1` → `%231`
- 前端处理：`encodeURIComponent('#1')` → `%231`
- 后端处理：`decodeURIComponent('%231')` → `#1`

### 10.3 文件上传
- 支持多文件上传
- 单个文件大小限制：10MB
- 支持格式：
  - 文档：`.doc`, `.docx`, `.pdf`, `.txt`, `.md`
  - 图片：`.jpg`, `.jpeg`, `.png`, `.gif`, `.bmp`
  - 压缩包：`.zip`, `.rar`, `.7z`
  - 表格：`.xls`, `.xlsx`, `.csv`

### 10.4 权限控制

#### 端负责人意见
- 只有指定的端负责人可以修改 `needToDo`、`priority` 和 `opinion`
- 其他用户可以查看但不能修改
- 端负责人选择本身不需要权限限制

#### 预排期评审
- 只有指定的评审人可以修改 `status` 和 `opinion`
- 其他用户可以查看但不能修改
- 评审人选择本身不需要权限限制

### 10.5 批量操作
- 支持批量更新需求的"是否要做"字段
- 一次批量操作最多支持100个需求
- 如果部分更新失败，会返回成功和失败的ID列表

### 10.6 搜索功能
- 支持跨字段搜索：标题、创建人姓名、需求ID、应用端
- 搜索不区分大小写
- 支持模糊匹配

### 10.7 筛选排序
- 支持多维度筛选：状态、类型、优先级、创建人、应用端
- 支持多字段排序：ID、标题、优先级、创建时间、更新时间
- 默认按更新时间降序排列

### 10.8 分页
- 默认每页20条记录
- 最大每页100条记录
- 返回总数、当前页码、每页数量等分页信息

### 10.9 数据统计
- 需求列表接口返回统计信息：总数、开放中数量、已关闭数量
- 用于前端展示筛选按钮的数量标识

## 11. 接口调用示例

### 11.1 JavaScript 调用示例

```javascript
// 获取需求列表
async function getRequirements(params = {}) {
  const queryString = new URLSearchParams(params).toString();
  const response = await fetch(`/api/requirements?${queryString}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  return response.json();
}

// 创建需求
async function createRequirement(formData) {
  const response = await fetch('/api/requirements', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData  // FormData对象，包含文件和其他字段
  });
  return response.json();
}

// 更新需求状态
async function toggleRequirementStatus(id, isOpen) {
  const encodedId = encodeURIComponent(id);
  const response = await fetch(`/api/requirements/${encodedId}/status`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ isOpen })
  });
  return response.json();
}
```

### 11.2 cURL 调用示例

```bash
# 获取需求列表
curl -X GET "http://localhost:3000/api/requirements?page=1&pageSize=20&status=open" \
  -H "Authorization: Bearer your-token" \
  -H "Content-Type: application/json"

# 创建需求
curl -X POST "http://localhost:3000/api/requirements" \
  -H "Authorization: Bearer your-token" \
  -F "title=用户登录功能优化" \
  -F "type=优化" \
  -F "description=优化用户登录流程" \
  -F "platforms=Web端,PC端" \
  -F "attachments=@./document.pdf"

# 更新需求状态
curl -X PUT "http://localhost:3000/api/requirements/%231/status" \
  -H "Authorization: Bearer your-token" \
  -H "Content-Type: application/json" \
  -d '{"isOpen": false}'
```

---

**文档版本：** v1.0  
**最后更新：** 2024-01-20  
**维护人员：** 开发团队  

如有疑问或建议，请联系开发团队。 