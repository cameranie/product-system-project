# 文档归档目录

本目录保存了项目开发过程中的历史文档，这些文档已从Git仓库中移除，但保留在本地供参考。

> **归档日期**: 2025年10月17日  
> **归档原因**: 清理仓库，移除临时开发文档，保持远端仓库整洁

---

## 📂 目录结构

```
docs/archive/
├── code-reviews/          # 代码审查文档
├── commits/               # 提交总结和审查
├── feature-docs/          # 功能文档和测试记录
├── logs/                  # 日志和配置文件
├── optimization-reports/  # 优化报告和改进记录
└── README.md             # 本文件
```

---

## 📋 文档分类索引

### 1️⃣ 代码审查文档 (`code-reviews/`)

**文件数**: 4个  
**总大小**: ~58KB

- `CODE_REVIEW_COMPLETE_SUMMARY.md` - 完整代码审查总结
- `CODE_REVIEW_P2_FIXES.md` - P2优先级问题修复
- `CODE_REVIEW_P3_FIXES.md` - P3优先级问题修复
- `REQUIREMENTS_PAGES_CODE_REVIEW.md` - 需求页面代码审查

**用途**: 记录了项目各阶段的代码审查结果和改进建议

---

### 2️⃣ 提交总结 (`commits/`)

**文件数**: 4个  
**总大小**: ~24KB

- `BUG_FIX_SUMMARY.md` - Bug修复总结
- `COMMIT_REVIEW.md` - 提交审查记录
- `FINAL_COMMIT_SUMMARY.md` - 最终提交总结
- `P0_COMMIT_SUMMARY.md` - P0优先级提交总结

**用途**: 记录了重要的代码提交和修复历史

---

### 3️⃣ 功能文档 (`feature-docs/`)

**文件数**: 18个  
**总大小**: ~179KB

#### 功能开发文档
- `P1_QUICK_REFERENCE.md` - P1功能快速参考
- `RICH_TEXT_EDITOR.md` - 富文本编辑器文档
- `RICH_TEXT_EDITOR_FEATURES.md` - 富文本编辑器功能说明
- `TABLE_REFACTORING_SUMMARY.md` - 表格重构总结
- `VERSION_DISPLAY_STYLE_UPDATE.md` - 版本显示样式更新
- `VERSION_SELECTION_FIX.md` - 版本选择修复

#### 需求页面相关
- `REQUIREMENTS_PAGES_ACTION_ITEMS.md` - 需求页面行动项
- `REQUIREMENTS_PAGES_OPTIMIZATION_EXAMPLES.md` - 需求页面优化示例
- `REQUIREMENTS_PAGES_REVIEW_SUMMARY.md` - 需求页面审查总结

#### 测试文档
- `STICKY_COLUMNS_TEST.md` - 固定列测试
- `TEST_STATUS.md` - 测试状态记录

#### UI/样式调整文档（中文）
- `全系统字体统一完成.md` - 系统字体统一
- `字体大小调整完成.md` - 字体大小调整
- `版本号蓝色显示更新.md` - 版本号样式更新
- `版本号高级样式方案.md` - 版本号高级样式
- `表格字体统一最终调整完成.md` - 表格字体统一
- `需求池页面字体统一完成.md` - 需求池字体调整
- `预排期版本号问题快速修复.md` - 预排期问题修复

**用途**: 记录了各个功能的开发、测试和样式调整历史

---

### 4️⃣ 日志和配置 (`logs/`)

**文件数**: 4个  
**总大小**: ~358KB

- `npminstall-debug.log` - npm安装调试日志
- `yarn.lock` - Yarn依赖锁定文件（已废弃，项目使用npm）
- `package.json.test-scripts` - 测试脚本备份
- `product-system-project.code-workspace` - VSCode工作区配置

**用途**: 保留的调试日志和历史配置文件

---

### 5️⃣ 优化报告 (`optimization-reports/`)

**文件数**: 13个  
**总大小**: ~183KB

#### 综合优化报告
- `CODE_OPTIMIZATION_REPORT.md` - 代码优化报告
- `ENTERPRISE_CODE_REVIEW.md` - 企业级代码审查
- `FINAL_OPTIMIZATION_REPORT.md` - 最终优化报告
- `OVERALL_IMPROVEMENTS_SUMMARY.md` - 总体改进摘要
- `优化完成摘要.md` - 优化完成总结（中文）

#### 按阶段分类
- `OPTIMIZATION_COMPLETED.md` - 已完成的优化
- `OPTIMIZATION_IMPLEMENTATION_SUMMARY.md` - 优化实施总结
- `OPTIMIZATION_SUMMARY.md` - 优化摘要

#### P0-P2优先级改进
- `P0_FIXES_COMPLETED.md` - P0问题修复完成
- `P0_FIXES_README.md` - P0修复说明
- `P0_IMPLEMENTATION_SUMMARY.md` - P0实施总结
- `P1_IMPROVEMENTS_COMPLETED.md` - P1改进完成
- `P2_IMPROVEMENTS_COMPLETED.md` - P2改进完成

**用途**: 记录了项目各阶段的优化工作和性能改进

---

## 📊 统计信息

| 分类 | 文件数 | 总大小 | 主要语言 |
|------|--------|--------|----------|
| 代码审查 | 4 | ~58KB | Markdown |
| 提交总结 | 4 | ~24KB | Markdown |
| 功能文档 | 18 | ~179KB | Markdown |
| 日志配置 | 4 | ~358KB | 日志/JSON |
| 优化报告 | 13 | ~183KB | Markdown |
| **总计** | **43** | **~802KB** | - |

---

## 🔍 快速查找指南

### 按时间线查找
1. **项目初期**: `ENTERPRISE_CODE_REVIEW.md`
2. **P0阶段**: `P0_*.md` 系列文件
3. **P1-P2阶段**: `P1_*.md`, `P2_*.md` 系列
4. **UI优化阶段**: 字体和样式相关的中文文档
5. **最终阶段**: `FINAL_*.md` 系列

### 按问题类型查找
- **性能优化**: `optimization-reports/` 目录
- **代码质量**: `code-reviews/` 目录
- **功能开发**: `feature-docs/` 目录
- **Bug修复**: `commits/BUG_FIX_SUMMARY.md`

### 按功能模块查找
- **需求池**: `REQUIREMENTS_PAGES_*.md`
- **富文本编辑器**: `RICH_TEXT_EDITOR*.md`
- **表格相关**: `TABLE_*.md`, `STICKY_COLUMNS_*.md`
- **版本管理**: `VERSION_*.md`, 版本号相关中文文档

---

## 📝 使用说明

1. **查阅历史**: 这些文档记录了项目的开发历程，可作为技术决策参考
2. **问题排查**: 如遇到类似问题，可查阅相关修复文档
3. **知识传承**: 新成员可通过这些文档了解项目演进过程
4. **定期清理**: 建议每季度审查一次，删除过时内容

---

## ⚠️ 注意事项

- ✅ 这些文档**不在Git跟踪中**，仅保存在本地
- ✅ 所有文档均为**只读参考**，不应继续编辑
- ✅ 如需引用文档内容，请使用正式的项目文档
- ✅ 定期备份本目录，避免意外丢失

---

## 🔗 相关链接

- **当前项目文档**: `/docs/` 目录
- **开发指南**: `/docs/DEVELOPMENT_GUIDE.md`
- **架构文档**: `/docs/ARCHITECTURE.md`
- **API文档**: `/docs/API.md`

---

*归档创建于: 2025年10月17日*  
*由AI助手整理并分类*

