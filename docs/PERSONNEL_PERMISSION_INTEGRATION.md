## 人员与权限接入方案（MVP）

### 目标
- 以 visibleFieldKeys 驱动 UI 显隐，保证「千人千面」与字段分级策略前后一致。
- 列表/详情/导出/验收辅助页/管理页串联起后端 MVP 能力，前端最小改动即可上线。

### 接口总览（GraphQL）
- 列表：`users(filters?) { total users { ...fields } }`
- 详情：`user(id)`
- 可见字段：`visibleFieldKeys(resource: "user", targetUserId?) -> [String]`
- 导出：`exportUsersCsv(filters?) -> String`（CSV 文本）
- 权限预览：`accessPreview(resource?: "user", targetUserId?) -> String(JSON)`
- 管理（仅管理员）：
  - 字段定义/集合：`fieldDefinitions()`、`fieldSets()`
  - 变更：`upsertFieldDefinition(...)`、`upsertFieldSet(...)`、`assignFieldsToSet(...)`
  - 可见性管理：`setUserVisibility(...)`、`updateDepartmentLeaders(...)`
  - 临时授权：`createTemporaryAccessGrant(...)`

### 前端改造点
1) API 层新增
   - `visibilityApi`: `visibleFieldKeys`、`accessPreview`、`exportUsersCsv`
   - `adminApi`: 字段定义/集合查询与变更、`setUserVisibility`、`updateDepartmentLeaders`、`createTemporaryAccessGrant`

2) 人员列表页（`/personnel`）
   - 并行请求 `users(filters?)` 与 `visibleFieldKeys(resource:"user")`。
   - 列集合 = 设计列 ∩ `visibleFieldKeys`。若不含 `contact_phone`，隐藏“手机号”列（标题+单元格）。
   - 去掉模拟扩展数据；接入分页、关键字搜索（防抖）。
   - 新增“导出 CSV”按钮，调用 `exportUsersCsv(filters?)`，403 显示“无导出权限”。

3) 人员详情页（`/personnel/[id]`）
   - 并行请求 `user(id)` 与 `visibleFieldKeys(resource:"user", targetUserId:id)`。
   - 联系方式：默认仅显示“工作邮箱”；手机号/微信/QQ/个人邮箱需在 keys 中存在才显示；对 null 值兜底隐藏。

4) 权限管理（新增路由 `/admin/permissions`）
   - 预览页：展示 `accessPreview` 的 JSON（roles/permissions/visibleFieldKeys）。
   - 临时授权页：调用 `createTemporaryAccessGrant(...)` 提交授权，完成后提示有效期并引导刷新可见字段。

### 字段注册表（建议）
在前端维护一个轻量映射，统一 label 与取值路径，示例：

```ts
const fieldConfig = {
  name: { label: '姓名', accessor: (u) => u.name },
  department: { label: '部门', accessor: (u) => u.department?.name },
  position: { label: '职务', accessor: (u) => u.position },
  employee_no: { label: '工号', accessor: (u) => u.employeeNo },
  employment_status: { label: '人员状态', accessor: (u) => u.employmentStatus },
  contact_work_email: { label: '工作邮箱', accessor: (u) => u.email },
  contact_phone: { label: '手机号码', accessor: (u) => u.phone },
};
```

### 错误与权限提示
- 401/未登录：跳转登录或提示重新登录。
- 403/无权限：显示“无权限访问该数据/操作”。
- 导出失败：提示“无导出权限”或后端返回的错误信息。

### 里程碑与落地顺序
1. 列表页接入 `visibleFieldKeys` 并移除模拟数据。
2. 列表页新增导出 CSV；接入分页与搜索 filters（防抖）。
3. 详情页接入 `visibleFieldKeys(targetUserId)` 并完善联系方式分组显示。
4. 新增权限管理导航与页面：`/admin/permissions`（预览、临时授权）。
5. 二期：字段定义/集合管理页、可见性管理页。


