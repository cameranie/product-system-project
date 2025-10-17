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
  description: string;           // 需求描述（支持HTML富文本）
  tags: string[];               // 标签
  createdAt: string;            // 创建时间 (YYYY-MM-DD HH:MM)
  updatedAt: string;            // 更新时间 (YYYY-MM-DD HH:MM)
  platforms: string[];          // 应用端 ['Web端', 'PC端', '移动端']
  plannedVersion?: string;       // 计划版本
  isOpen: boolean;              // 是否开放
  needToDo?: '是' | '否';        // 是否要做
  isOperational?: 'yes' | 'no';  // 是否运营（预排期使用）
  delayTag?: string;            // 延期标签
  reviewer1?: User;             // 一级评审人
  reviewer2?: User;             // 二级评审人
  reviewer1Status?: 'pending' | 'approved' | 'rejected';  // 一级评审状态
  reviewer2Status?: 'pending' | 'approved' | 'rejected';  // 二级评审状态
  reviewStatus?: 'pending' | 'first_review' | 'second_review' | 'approved' | 'rejected';  // 整体评审状态
  assignee?: User;              // 指派人
  prototypeId?: string;         // 原型ID/链接
  prdId?: string;               // PRD文档ID/链接
  attachments: Attachment[];     // 附件列表
  comments?: Comment[];          // 评论列表
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

## 12. 预排期管理接口

### 12.1 获取预排期需求列表

**接口路径：** `GET /api/requirements/scheduled`

**功能说明：** 获取已标记为"是否要做=是"的需求列表，按版本号分组展示

**请求参数：**

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| page | number | 否 | 页码，默认1 |
| pageSize | number | 否 | 每页数量，默认50 |
| search | string | 否 | 搜索关键词（搜索标题、ID、创建人） |
| version | string | 否 | 版本号筛选 |
| status | string | 否 | 状态筛选 |
| sortBy | string | 否 | 排序字段 |
| sortOrder | string | 否 | 排序方向：asc/desc |

**自定义筛选条件：**
```typescript
{
  customFilters?: Array<{
    column: string;      // 筛选列
    operator: 'contains' | 'equals' | 'not_equals' | 'is_empty' | 'is_not_empty';
    value: string;       // 筛选值
  }>;
}
```

**响应数据：**
```typescript
{
  code: number;
  message: string;
  data: {
    list: Requirement[];
    total: number;
    groupedByVersion: {
      [version: string]: Requirement[];
    };
  };
}
```

### 12.2 批量分配版本

**接口路径：** `PUT /api/requirements/batch/version`

**功能说明：** 批量设置需求的计划版本号

**请求参数：**
```typescript
{
  ids: string[];           // 需求ID列表（最多100个）
  plannedVersion: string;  // 目标版本号
}
```

**请求示例：**
```json
{
  "ids": ["#1", "#2", "#3"],
  "plannedVersion": "v3.2.0"
}
```

**响应数据：**
```typescript
{
  code: number;
  message: string;
  data: {
    updated: string[];     // 成功更新的需求ID
    failed: string[];      // 更新失败的需求ID
  };
}
```

### 12.3 批量评审

**接口路径：** `PUT /api/requirements/batch/review`

**功能说明：** 批量更新需求的评审状态（一级或二级）

**请求参数：**
```typescript
{
  ids: string[];                              // 需求ID列表（最多100个）
  level: 1 | 2;                               // 评审级别
  status: 'pending' | 'approved' | 'rejected'; // 评审状态
  opinion?: string;                            // 评审意见（可选）
  reviewer?: string;                           // 评审人ID（可选）
}
```

**请求示例：**
```json
{
  "ids": ["#1", "#2", "#3"],
  "level": 1,
  "status": "approved",
  "opinion": "需求合理，同意通过"
}
```

**响应数据：**
```typescript
{
  code: number;
  message: string;
  data: {
    updated: string[];
    failed: string[];
  };
}
```

### 12.4 批量设置是否运营

**接口路径：** `PUT /api/requirements/batch/operational`

**功能说明：** 批量设置需求的"是否运营"字段

**请求参数：**
```typescript
{
  ids: string[];                  // 需求ID列表（最多100个）
  isOperational: 'yes' | 'no';    // 是否运营
}
```

**请求示例：**
```json
{
  "ids": ["#1", "#2", "#3"],
  "isOperational": "yes"
}
```

**响应数据：**
```typescript
{
  code: number;
  message: string;
  data: {
    updated: string[];
    failed: string[];
  };
}
```

### 12.5 更新需求预排期信息

**接口路径：** `PUT /api/requirements/{id}/scheduled`

**功能说明：** 更新单个需求的预排期相关信息

**请求参数：**
```typescript
{
  plannedVersion?: string;                    // 版本号
  isOperational?: 'yes' | 'no';               // 是否运营
  scheduledReview?: {
    reviewLevels: Array<{
      level: number;                          // 评审级别（1或2）
      levelName: string;                      // 级别名称
      status: 'pending' | 'approved' | 'rejected';
      reviewer?: User;                        // 评审人
      opinion?: string;                       // 评审意见
    }>;
  };
}
```

## 13. 版本号管理接口

### 13.1 版本数据模型

```typescript
interface Version {
  id: string;
  platform: string;          // 应用端平台（PC/iOS/安卓/web等）
  versionNumber: string;     // 版本号（如：3.2.0）
  releaseDate: string;       // 上线时间（YYYY-MM-DD）
  schedule: {
    prdStartDate: string;        // PRD开始时间
    prdEndDate: string;          // PRD结束时间
    prototypeStartDate: string;  // 原型设计开始时间
    prototypeEndDate: string;    // 原型设计结束时间
    devStartDate: string;        // 开发开始时间
    devEndDate: string;          // 开发结束时间
    testStartDate: string;       // 测试开始时间
    testEndDate: string;         // 测试结束时间（等于上线时间）
  };
  createdAt: string;
  updatedAt: string;
}
```

### 13.2 获取版本列表

**接口路径：** `GET /api/versions`

**请求参数：**

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| search | string | 否 | 搜索版本号或平台 |
| platform | string | 否 | 平台筛选 |
| sortBy | string | 否 | 排序字段：releaseDate/createdAt |
| sortOrder | string | 否 | 排序方向：asc/desc |

**响应数据：**
```typescript
{
  code: number;
  message: string;
  data: Version[];
}
```

### 13.3 创建版本

**接口路径：** `POST /api/versions`

**功能说明：** 创建新版本，系统根据上线时间自动计算各个时间节点

**时间计算规则：**
- PRD时间：上线前20个工作日开始，持续3个工作日
- 原型设计：PRD结束后开始，持续5个工作日
- 开发时间：原型完成后开始，持续10个工作日
- 测试时间：开发完成后至上线日期

**请求参数：**
```typescript
{
  platform: string;        // 应用端平台 *
  versionNumber: string;   // 版本号（如：3.2.0）*
  releaseDate: string;     // 上线时间（YYYY-MM-DD）*
}
```

**请求示例：**
```json
{
  "platform": "iOS",
  "versionNumber": "3.2.0",
  "releaseDate": "2024-03-15"
}
```

**响应数据：**
```typescript
{
  code: number;
  message: string;
  data: Version;  // 包含自动计算的所有时间节点
}
```

### 13.4 更新版本

**接口路径：** `PUT /api/versions/{id}`

**功能说明：** 更新版本信息，系统重新计算时间节点

**请求参数：**
```typescript
{
  platform?: string;
  versionNumber?: string;
  releaseDate?: string;     // 修改上线时间会触发重新计算
}
```

**响应数据：**
```typescript
{
  code: number;
  message: string;
  data: Version;
}
```

### 13.5 删除版本

**接口路径：** `DELETE /api/versions/{id}`

**功能说明：** 删除版本（如果有需求使用此版本，需先处理关联）

**响应数据：**
```typescript
{
  code: number;
  message: string;
  data: {
    success: boolean;
    relatedRequirements?: string[];  // 使用此版本的需求ID列表
  };
}
```

### 13.6 获取版本号选项

**接口路径：** `GET /api/versions/options`

**功能说明：** 获取所有版本号的简化列表（用于下拉选择）

**响应数据：**
```typescript
{
  code: number;
  message: string;
  data: string[];  // 版本号列表，如：["v3.2.0", "v3.1.0"]
}
```

### 13.7 获取自定义平台列表

**接口路径：** `GET /api/platforms/custom`

**功能说明：** 获取用户自定义的应用端平台列表

**响应数据：**
```typescript
{
  code: number;
  message: string;
  data: {
    defaultPlatforms: string[];  // 系统默认平台：["PC", "iOS", "安卓", "web"]
    customPlatforms: string[];   // 用户自定义平台
  };
}
```

### 13.8 添加自定义平台

**接口路径：** `POST /api/platforms/custom`

**请求参数：**
```typescript
{
  name: string;  // 平台名称 *
}
```

**请求示例：**
```json
{
  "name": "鸿蒙"
}
```

**响应数据：**
```typescript
{
  code: number;
  message: string;
  data: {
    name: string;
    createdAt: string;
  };
}
```

### 13.9 删除自定义平台

**接口路径：** `DELETE /api/platforms/custom/{name}`

**功能说明：** 删除自定义平台（前提：该平台未被任何版本使用）

**响应数据：**
```typescript
{
  code: number;
  message: string;
  data: {
    success: boolean;
    usedByVersions?: string[];  // 如果被使用，返回版本ID列表
  };
}
```

## 14. 评论和历史记录接口

### 14.1 获取评论列表

**接口路径：** `GET /api/requirements/{id}/comments`

**功能说明：** 获取需求的所有评论（包括回复）

**响应数据：**
```typescript
{
  code: number;
  message: string;
  data: Array<{
    id: string;
    content: string;
    author: User;
    createdAt: string;
    attachments: Attachment[];
    replies: Array<{
      id: string;
      content: string;
      author: User;
      createdAt: string;
      attachments: Attachment[];
    }>;
  }>;
}
```

### 14.2 获取修改记录

**接口路径：** `GET /api/requirements/{id}/history`

**功能说明：** 获取需求的所有修改历史记录

**请求参数：**

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| page | number | 否 | 页码 |
| pageSize | number | 否 | 每页数量，默认20 |

**响应数据：**
```typescript
{
  code: number;
  message: string;
  data: {
    records: Array<{
      id: string;
      action: string;          // 操作类型：创建/修改/删除
      field: string;           // 修改字段
      oldValue: string;        // 旧值
      newValue: string;        // 新值
      user: User;              // 操作人
      timestamp: string;       // 操作时间
    }>;
    total: number;
  };
}
```

### 14.3 删除附件

**接口路径：** `DELETE /api/requirements/{id}/attachments/{attachmentId}`

**功能说明：** 删除需求的某个附件

**路径参数：**
- `id`: 需求ID
- `attachmentId`: 附件ID

**响应数据：**
```typescript
{
  code: number;
  message: string;
  data: {
    success: boolean;
    remainingAttachments: Attachment[];
  };
}
```

---

**文档版本：** v2.0  
**最后更新：** 2025-10-17  
**维护人员：** 开发团队  

**更新日志：**
- v2.0 (2025-10-17): 新增预排期管理接口、版本号管理接口、补充评论历史接口、更新需求数据模型
- v1.0 (2025-09-15): 初始版本，包含需求池和需求详情基础接口

如有疑问或建议，请联系开发团队。