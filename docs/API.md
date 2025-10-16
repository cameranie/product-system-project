# API 文档

## 概述

本文档描述了 AiCoin OS 系统的 API 接口规范。所有 API 都遵循 RESTful 设计原则，使用 JSON 格式进行数据交换。

## 基础信息

- **Base URL**: `https://api.aicoinos.com/v1`
- **认证方式**: Bearer Token
- **数据格式**: JSON
- **字符编码**: UTF-8

## 通用响应格式

### 成功响应

```json
{
  "success": true,
  "data": {
    // 响应数据
  },
  "message": "操作成功",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "requestId": "req_123456789"
}
```

### 错误响应

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "参数验证失败",
    "details": {
      "field": "email",
      "reason": "Invalid email format"
    }
  },
  "timestamp": "2024-01-01T00:00:00.000Z",
  "requestId": "req_123456789"
}
```

## 认证

### 获取访问令牌

```http
POST /auth/login
Content-Type: application/json

{
  "username": "string",
  "password": "string"
}
```

**响应:**

```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 3600,
    "user": {
      "id": "1",
      "username": "admin",
      "email": "admin@example.com",
      "role": "admin",
      "permissions": ["*"]
    }
  }
}
```

### 刷新访问令牌

```http
POST /auth/refresh
Content-Type: application/json

{
  "refreshToken": "string"
}
```

### 登出

```http
POST /auth/logout
Authorization: Bearer {accessToken}
```

## 用户管理

### 获取用户列表

```http
GET /users?page=1&size=10&search=keyword&role=admin
Authorization: Bearer {accessToken}
```

**查询参数:**

| 参数 | 类型 | 必需 | 描述 |
|------|------|------|------|
| page | integer | 否 | 页码，默认 1 |
| size | integer | 否 | 每页数量，默认 10 |
| search | string | 否 | 搜索关键词 |
| role | string | 否 | 角色筛选 |
| status | string | 否 | 状态筛选 |

**响应:**

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "1",
        "username": "admin",
        "email": "admin@example.com",
        "displayName": "管理员",
        "role": "admin",
        "status": "active",
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "size": 10,
      "total": 100,
      "totalPages": 10,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

### 获取用户详情

```http
GET /users/{id}
Authorization: Bearer {accessToken}
```

### 创建用户

```http
POST /users
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "username": "string",
  "email": "string",
  "displayName": "string",
  "role": "user",
  "password": "string"
}
```

### 更新用户

```http
PUT /users/{id}
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "displayName": "string",
  "email": "string",
  "role": "user",
  "status": "active"
}
```

### 删除用户

```http
DELETE /users/{id}
Authorization: Bearer {accessToken}
```

## 需求管理

### 获取需求列表

```http
GET /requirements?page=1&size=10&status=draft&priority=high&assignee=user1
Authorization: Bearer {accessToken}
```

**查询参数:**

| 参数 | 类型 | 必需 | 描述 |
|------|------|------|------|
| page | integer | 否 | 页码 |
| size | integer | 否 | 每页数量 |
| status | string | 否 | 状态筛选 |
| priority | string | 否 | 优先级筛选 |
| assignee | string | 否 | 负责人筛选 |
| search | string | 否 | 搜索关键词 |
| sortBy | string | 否 | 排序字段 |
| sortOrder | string | 否 | 排序方向 (asc/desc) |

**响应:**

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "REQ-001",
        "title": "用户登录功能",
        "description": "实现用户登录功能",
        "priority": "high",
        "status": "in_progress",
        "assignee": {
          "id": "1",
          "username": "developer",
          "displayName": "开发人员"
        },
        "dueDate": "2024-01-15T00:00:00.000Z",
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "size": 10,
      "total": 50,
      "totalPages": 5,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

### 获取需求详情

```http
GET /requirements/{id}
Authorization: Bearer {accessToken}
```

### 创建需求

```http
POST /requirements
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "title": "string",
  "description": "string",
  "priority": "low|medium|high|urgent",
  "status": "draft|in_progress|review|completed|cancelled",
  "assignee": "string",
  "dueDate": "2024-01-15T00:00:00.000Z",
  "tags": ["tag1", "tag2"],
  "attachments": ["file1.pdf", "file2.jpg"]
}
```

### 更新需求

```http
PUT /requirements/{id}
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "title": "string",
  "description": "string",
  "priority": "low|medium|high|urgent",
  "status": "draft|in_progress|review|completed|cancelled",
  "assignee": "string",
  "dueDate": "2024-01-15T00:00:00.000Z"
}
```

### 删除需求

```http
DELETE /requirements/{id}
Authorization: Bearer {accessToken}
```

### 批量操作需求

```http
POST /requirements/batch
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "action": "update_status|assign|delete",
  "ids": ["REQ-001", "REQ-002"],
  "data": {
    "status": "completed",
    "assignee": "user1"
  }
}
```

## 预排期管理

### 获取预排期列表

```http
GET /scheduled-requirements?date=2024-01-01&version=v1.0
Authorization: Bearer {accessToken}
```

### 创建预排期

```http
POST /scheduled-requirements
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "requirementId": "REQ-001",
  "version": "v1.0",
  "scheduledDate": "2024-01-15T00:00:00.000Z",
  "reviewDate": "2024-01-20T00:00:00.000Z",
  "notes": "string"
}
```

### 更新预排期

```http
PUT /scheduled-requirements/{id}
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "scheduledDate": "2024-01-15T00:00:00.000Z",
  "reviewDate": "2024-01-20T00:00:00.000Z",
  "notes": "string"
}
```

## 评论系统

### 获取评论列表

```http
GET /requirements/{id}/comments?page=1&size=10
Authorization: Bearer {accessToken}
```

### 创建评论

```http
POST /requirements/{id}/comments
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "content": "string",
  "parentId": "string",
  "mentions": ["user1", "user2"]
}
```

### 更新评论

```http
PUT /comments/{id}
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "content": "string"
}
```

### 删除评论

```http
DELETE /comments/{id}
Authorization: Bearer {accessToken}
```

## 文件管理

### 上传文件

```http
POST /files/upload
Authorization: Bearer {accessToken}
Content-Type: multipart/form-data

file: [binary data]
```

**响应:**

```json
{
  "success": true,
  "data": {
    "id": "file_123",
    "filename": "document.pdf",
    "size": 1024000,
    "mimeType": "application/pdf",
    "url": "https://cdn.aicoinos.com/files/file_123.pdf",
    "uploadedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### 获取文件信息

```http
GET /files/{id}
Authorization: Bearer {accessToken}
```

### 删除文件

```http
DELETE /files/{id}
Authorization: Bearer {accessToken}
```

## 权限管理

### 获取权限列表

```http
GET /permissions
Authorization: Bearer {accessToken}
```

### 获取用户权限

```http
GET /users/{id}/permissions
Authorization: Bearer {accessToken}
```

### 更新用户权限

```http
PUT /users/{id}/permissions
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "permissions": ["requirements:view", "requirements:edit"]
}
```

## 系统管理

### 获取系统状态

```http
GET /system/status
Authorization: Bearer {accessToken}
```

### 获取系统配置

```http
GET /system/config
Authorization: Bearer {accessToken}
```

### 更新系统配置

```http
PUT /system/config
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "appName": "AiCoin OS",
  "version": "1.0.0",
  "maintenance": false
}
```

## 错误代码

| 代码 | HTTP状态 | 描述 |
|------|----------|------|
| VALIDATION_ERROR | 400 | 参数验证失败 |
| UNAUTHORIZED | 401 | 未授权访问 |
| FORBIDDEN | 403 | 权限不足 |
| NOT_FOUND | 404 | 资源不存在 |
| CONFLICT | 409 | 资源冲突 |
| RATE_LIMITED | 429 | 请求频率限制 |
| INTERNAL_ERROR | 500 | 服务器内部错误 |
| SERVICE_UNAVAILABLE | 503 | 服务不可用 |

## 限流规则

- **认证接口**: 5次/分钟
- **普通接口**: 100次/分钟
- **文件上传**: 10次/分钟
- **批量操作**: 20次/分钟

## 版本控制

当前 API 版本: v1

版本兼容性:
- v1.0: 初始版本
- v1.1: 添加批量操作支持
- v1.2: 添加文件管理功能

## 示例代码

### JavaScript/TypeScript

```typescript
// 获取需求列表
const response = await fetch('/api/requirements?page=1&size=10', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});

const data = await response.json();
```

### Python

```python
import requests

# 创建需求
response = requests.post(
    'https://api.aicoinos.com/v1/requirements',
    headers={
        'Authorization': f'Bearer {token}',
        'Content-Type': 'application/json'
    },
    json={
        'title': '新功能需求',
        'description': '详细描述',
        'priority': 'high',
        'assignee': 'user1'
    }
)
```

### cURL

```bash
# 获取用户列表
curl -X GET "https://api.aicoinos.com/v1/users" \
  -H "Authorization: Bearer your_token_here" \
  -H "Content-Type: application/json"
```

## 更新日志

### v1.2.0 (2024-01-15)
- 添加文件管理 API
- 优化批量操作接口
- 增加错误详情字段

### v1.1.0 (2024-01-01)
- 添加批量操作支持
- 优化分页参数
- 增加搜索功能

### v1.0.0 (2023-12-01)
- 初始版本发布
- 基础 CRUD 操作
- 用户认证系统











