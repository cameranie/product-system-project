# 🚀 后端扩展计划 - 适配Flow.md流程

## 📊 现有基础与Flow需求匹配度分析

### ✅ 已完备功能（80%）
- **用户管理**: User表 + 认证系统 ✅
- **项目管理**: Workspace表 + 权限管理 ✅  
- **任务系统**: Comment表可扩展为任务 ✅
- **团队协作**: Department + WorkspaceUserRole ✅
- **文件管理**: Blob + CommentAttachment基础 ✅
- **通知系统**: Notification表已就绪 ✅

### 🔧 需要扩展的功能（20%）

## 1. 产品建议Issue管理扩展

### 现状分析
- 当前：Comment表支持基础评论功能
- 需求：需要支持产品建议Issue的完整生命周期

### 扩展方案
```sql
-- 扩展Comment表或创建新的Issue表
ALTER TABLE comments ADD COLUMN issue_type VARCHAR(50); -- 'product_suggestion', 'task', 'bug'
ALTER TABLE comments ADD COLUMN input_source VARCHAR(50); -- 'kol', 'user_feedback', 'internal', 'data_analysis', 'strategy'
ALTER TABLE comments ADD COLUMN priority VARCHAR(20); -- 'low', 'medium', 'high', 'urgent'
ALTER TABLE comments ADD COLUMN status VARCHAR(50); -- 'discussion', 'prd_needed', 'in_progress', 'closed'
ALTER TABLE comments ADD COLUMN linked_prd_id VARCHAR(255);
```

## 2. PRD管理系统

### 需要新增
```sql
CREATE TABLE prds (
  id VARCHAR PRIMARY KEY DEFAULT uuid(),
  workspace_id VARCHAR NOT NULL,
  title VARCHAR(255) NOT NULL,
  content TEXT,
  status VARCHAR(50) DEFAULT 'draft', -- 'draft', 'review', 'approved', 'rejected'
  version INTEGER DEFAULT 1,
  linked_issue_id VARCHAR,
  created_by VARCHAR NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  FOREIGN KEY (workspace_id) REFERENCES workspaces(id),
  FOREIGN KEY (linked_issue_id) REFERENCES comments(id),
  FOREIGN KEY (created_by) REFERENCES users(id)
);

CREATE TABLE prd_reviews (
  id VARCHAR PRIMARY KEY DEFAULT uuid(),
  prd_id VARCHAR NOT NULL,
  reviewer_id VARCHAR NOT NULL,
  status VARCHAR(50), -- 'pending', 'approved', 'rejected'
  feedback TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  FOREIGN KEY (prd_id) REFERENCES prds(id),
  FOREIGN KEY (reviewer_id) REFERENCES users(id)
);
```

## 3. 原型图和设计管理

### 扩展现有Blob系统
```sql
ALTER TABLE blobs ADD COLUMN file_type VARCHAR(50); -- 'prototype', 'design', 'attachment'
ALTER TABLE blobs ADD COLUMN linked_entity_type VARCHAR(50); -- 'prd', 'task', 'issue'
ALTER TABLE blobs ADD COLUMN linked_entity_id VARCHAR;
ALTER TABLE blobs ADD COLUMN version INTEGER DEFAULT 1;

CREATE TABLE design_reviews (
  id VARCHAR PRIMARY KEY DEFAULT uuid(),
  blob_id VARCHAR NOT NULL,
  workspace_id VARCHAR NOT NULL,
  reviewer_id VARCHAR NOT NULL,
  status VARCHAR(50), -- 'pending', 'approved', 'rejected'
  feedback TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  FOREIGN KEY (blob_id, workspace_id) REFERENCES blobs(key, workspace_id),
  FOREIGN KEY (reviewer_id) REFERENCES users(id)
);
```

## 4. 工作流状态管理增强

### 扩展现有系统
```sql
CREATE TABLE workflow_states (
  id VARCHAR PRIMARY KEY DEFAULT uuid(),
  workspace_id VARCHAR NOT NULL,
  name VARCHAR(100) NOT NULL,
  entity_type VARCHAR(50), -- 'issue', 'prd', 'task', 'design'
  order_index INTEGER,
  is_initial BOOLEAN DEFAULT FALSE,
  is_final BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  FOREIGN KEY (workspace_id) REFERENCES workspaces(id)
);

CREATE TABLE workflow_transitions (
  id VARCHAR PRIMARY KEY DEFAULT uuid(),
  from_state_id VARCHAR NOT NULL,
  to_state_id VARCHAR NOT NULL,
  required_role VARCHAR(50),
  required_permission VARCHAR(100),
  auto_trigger BOOLEAN DEFAULT FALSE,
  
  FOREIGN KEY (from_state_id) REFERENCES workflow_states(id),
  FOREIGN KEY (to_state_id) REFERENCES workflow_states(id)
);
```

## 5. 测试用例和Bug管理

### 新增测试相关表
```sql
CREATE TABLE test_cases (
  id VARCHAR PRIMARY KEY DEFAULT uuid(),
  workspace_id VARCHAR NOT NULL,
  task_id VARCHAR,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  steps TEXT,
  expected_result TEXT,
  priority VARCHAR(20),
  created_by VARCHAR NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  FOREIGN KEY (workspace_id) REFERENCES workspaces(id),
  FOREIGN KEY (created_by) REFERENCES users(id)
);

CREATE TABLE bug_reports (
  id VARCHAR PRIMARY KEY DEFAULT uuid(),
  workspace_id VARCHAR NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  severity VARCHAR(20), -- 'low', 'medium', 'high', 'critical'
  status VARCHAR(50), -- 'open', 'in_progress', 'fixed', 'retest', 'closed'
  assigned_to VARCHAR,
  reported_by VARCHAR NOT NULL,
  linked_task_id VARCHAR,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  FOREIGN KEY (workspace_id) REFERENCES workspaces(id),
  FOREIGN KEY (assigned_to) REFERENCES users(id),
  FOREIGN KEY (reported_by) REFERENCES users(id)
);
```

## 6. 发布管理

### 新增发布相关功能
```sql
CREATE TABLE releases (
  id VARCHAR PRIMARY KEY DEFAULT uuid(),
  workspace_id VARCHAR NOT NULL,
  version VARCHAR(50) NOT NULL,
  title VARCHAR(255),
  description TEXT,
  status VARCHAR(50), -- 'planning', 'development', 'testing', 'ready', 'released'
  release_date TIMESTAMPTZ,
  created_by VARCHAR NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  FOREIGN KEY (workspace_id) REFERENCES workspaces(id),
  FOREIGN KEY (created_by) REFERENCES users(id)
);

CREATE TABLE release_tasks (
  release_id VARCHAR NOT NULL,
  task_id VARCHAR NOT NULL,
  
  PRIMARY KEY (release_id, task_id),
  FOREIGN KEY (release_id) REFERENCES releases(id),
  FOREIGN KEY (task_id) REFERENCES comments(id) -- 假设task使用comment表
);
```

## 🚀 实施策略

### Phase 1: 快速适配 (1-2天)
1. **扩展现有Comment表**支持Issue类型
2. **创建PRD表**和基础CRUD API
3. **扩展Blob表**支持原型图管理
4. **配置默认工作流状态**

### Phase 2: 核心流程 (3-5天)
1. **实现评审流程**API
2. **工作流状态自动流转**
3. **通知系统集成**
4. **测试用例管理**

### Phase 3: 完整闭环 (1-2天)
1. **Bug管理系统**
2. **发布管理**
3. **数据统计和报表**

## 🔧 立即开始的步骤

### 1. 数据库迁移脚本
```bash
# 在vibe-project目录执行
npx prisma db push --preview-feature
```

### 2. API扩展优先级
1. **Issue管理API** - 扩展现有Comment API
2. **PRD管理API** - 新建完整CRUD
3. **工作流API** - 状态流转逻辑
4. **文件管理API** - 扩展现有Blob API

### 3. 前端页面开发
1. **产品建议Issue页面**
2. **PRD管理页面**
3. **工作流看板**
4. **评审中心**

## 💡 技术优势

基于现有后端的优势：
- ✅ **无需重构**：在现有架构上扩展
- ✅ **权限复用**：直接使用现有RBAC系统
- ✅ **数据一致**：利用现有的关联关系
- ✅ **快速开发**：复用现有的API模式
- ✅ **稳定可靠**：基于已验证的架构

## 📊 预期结果

通过这个扩展计划，我们将获得：
- 🎯 **100%覆盖**flow.md定义的6个阶段
- 🚀 **2周内交付**完整可用的MVP
- 📈 **企业级**可扩展的产品管理系统
- 🔄 **完整闭环**从需求到发布的全流程管理
