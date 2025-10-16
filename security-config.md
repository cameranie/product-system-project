# 安全配置说明

## 🔒 安全扫描配置

### 1. 依赖漏洞扫描

**工具**: npm audit
**频率**: 每次推送和 PR
**阈值**: moderate 级别及以上

```bash
# 手动运行
npm audit --audit-level=moderate
```

### 2. 代码安全扫描

**工具**: ESLint + security 插件
**规则**: 安全相关规则
**文件**: `.eslintrc.security.js`

```bash
# 手动运行
npx eslint . --config .eslintrc.security.js
```

### 3. 敏感信息扫描

**工具**: TruffleHog
**扫描**: 密钥、令牌、密码等
**频率**: 每次推送

### 4. 许可证检查

**工具**: license-checker
**检查**: 依赖许可证合规性
**输出**: JSON 格式报告

### 5. 容器安全扫描

**工具**: Trivy
**扫描**: Dockerfile 安全漏洞
**条件**: 存在 Dockerfile 时

## 🛡️ 安全最佳实践

### 环境变量安全

1. **敏感信息不要暴露给客户端**
   ```bash
   # ❌ 错误 - 会暴露给客户端
   NEXT_PUBLIC_DATABASE_PASSWORD=secret
   
   # ✅ 正确 - 仅服务端使用
   DATABASE_PASSWORD=secret
   ```

2. **使用强随机密钥**
   ```bash
   # 生成32位随机密钥
   node -e "console.log(require('crypto').randomBytes(16).toString('hex'))"
   ```

3. **定期轮换密钥**
   - 生产环境密钥应定期更换
   - 使用密钥管理服务

### 代码安全

1. **输入验证**
   ```typescript
   // ✅ 使用验证库
   import { validateSearchTerm } from '@/lib/input-validation';
   
   const result = validateSearchTerm(userInput);
   if (!result.valid) {
     throw new Error(result.error);
   }
   ```

2. **XSS 防护**
   ```typescript
   // ✅ 使用 React 的自动转义
   <div>{userContent}</div>
   
   // ❌ 避免 dangerouslySetInnerHTML
   <div dangerouslySetInnerHTML={{__html: userContent}} />
   ```

3. **SQL 注入防护**
   ```typescript
   // ✅ 使用参数化查询
   const query = 'SELECT * FROM users WHERE id = ?';
   const result = await db.query(query, [userId]);
   ```

### 权限控制

1. **最小权限原则**
   ```typescript
   // ✅ 检查具体权限
   if (authManager.hasPermission(Permission.REQUIREMENTS_DELETE)) {
     // 执行删除操作
   }
   ```

2. **角色分离**
   ```typescript
   // ✅ 不同角色不同权限
   const adminPermissions = [Permission.ADMIN_FULL_ACCESS];
   const userPermissions = [Permission.REQUIREMENTS_VIEW];
   ```

## 📊 安全指标

### 目标指标

| 指标 | 目标值 | 当前值 |
|------|--------|--------|
| 依赖漏洞 | 0 个 critical | 待扫描 |
| 代码复杂度 | < 10 | 待分析 |
| 安全规则违规 | 0 个 | 待检查 |
| 敏感信息泄露 | 0 个 | 待扫描 |

### 监控指标

1. **依赖安全**
   - 定期检查新漏洞
   - 及时更新依赖
   - 使用安全版本

2. **代码质量**
   - 复杂度控制
   - 安全规则遵循
   - 代码审查

3. **运行时安全**
   - 错误监控
   - 异常检测
   - 访问日志

## 🚨 安全事件响应

### 发现漏洞时

1. **立即评估影响**
   - 漏洞严重程度
   - 影响范围
   - 利用难度

2. **快速修复**
   - 应用安全补丁
   - 更新依赖版本
   - 修改配置

3. **通知相关人员**
   - 开发团队
   - 安全团队
   - 管理层

### 预防措施

1. **定期安全扫描**
   - 每日自动扫描
   - 手动深度扫描
   - 第三方安全审计

2. **安全培训**
   - 开发人员安全意识
   - 安全编码规范
   - 最佳实践分享

3. **安全工具集成**
   - IDE 安全插件
   - Git hooks 安全检查
   - CI/CD 安全门禁

## 📋 安全检查清单

### 开发阶段

- [ ] 输入验证和清理
- [ ] 输出编码和转义
- [ ] 身份认证和授权
- [ ] 会话管理
- [ ] 错误处理

### 部署阶段

- [ ] 环境变量安全
- [ ] 密钥管理
- [ ] 网络安全
- [ ] 容器安全
- [ ] 监控配置

### 运维阶段

- [ ] 日志监控
- [ ] 异常检测
- [ ] 备份安全
- [ ] 访问控制
- [ ] 安全更新

---

**最后更新**: 2025-10-14
**维护者**: 安全团队


