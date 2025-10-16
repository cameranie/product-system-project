# API文档生成指南

> 📚 使用TypeDoc自动生成API文档

---

## 📖 概述

本项目使用TypeDoc从TypeScript源代码和JSDoc注释自动生成API文档。文档包括：

- 所有导出的函数、类、接口、类型
- 参数说明和返回值
- 使用示例
- 相关链接

---

## 🚀 快速开始

### 生成文档

```bash
# 生成API文档
npm run docs:api

# 在浏览器中查看文档
npm run docs:serve
```

生成的文档将保存在 `docs/api/` 目录。

---

## ✍️ 编写文档注释

### 基本格式

```typescript
/**
 * 函数简短描述（一句话）
 * 
 * 详细描述可以多行，解释函数的作用、使用场景、注意事项等。
 * 
 * @param paramName - 参数说明
 * @param optionalParam - 可选参数说明（可选）
 * @returns 返回值说明
 * 
 * @example
 * ```typescript
 * const result = myFunction('hello', 123);
 * console.log(result); // 输出: ...
 * ```
 * 
 * @see {@link RelatedFunction} 相关函数
 * @since 1.0.0
 */
export function myFunction(paramName: string, optionalParam?: number): ReturnType {
  // 实现
}
```

### 组件文档

```typescript
/**
 * 按钮组件
 * 
 * 一个支持多种样式的可复用按钮组件
 * 
 * @component
 * 
 * @example
 * ```tsx
 * <Button variant="primary" size="md" onClick={handleClick}>
 *   点击我
 * </Button>
 * ```
 */
export function Button({ variant, size, onClick, children }: ButtonProps) {
  // 实现
}

/**
 * 按钮组件属性
 */
export interface ButtonProps {
  /** 按钮样式变体 */
  variant?: 'primary' | 'secondary' | 'outline';
  /** 按钮大小 */
  size?: 'sm' | 'md' | 'lg';
  /** 点击事件处理函数 */
  onClick?: () => void;
  /** 子元素 */
  children: React.ReactNode;
}
```

### Hook文档

```typescript
/**
 * 防抖Hook
 * 
 * 延迟更新值，在指定时间内如果值持续变化，只保留最后一次。
 * 
 * 使用场景：
 * - 搜索输入框
 * - 自动保存
 * - API请求防抖
 * 
 * @param value - 需要防抖的值
 * @param delay - 延迟时间（毫秒）
 * @returns 防抖后的值
 * 
 * @example
 * ```tsx
 * const [searchTerm, setSearchTerm] = useState('');
 * const debouncedSearch = useDebounce(searchTerm, 500);
 * 
 * useEffect(() => {
 *   if (debouncedSearch) {
 *     performSearch(debouncedSearch);
 *   }
 * }, [debouncedSearch]);
 * ```
 * 
 * @category Hooks
 */
export function useDebounce<T>(value: T, delay: number = 500): T {
  // 实现
}
```

---

## 🏷️ 支持的JSDoc标签

### 常用标签

| 标签 | 说明 | 示例 |
|------|------|------|
| `@param` | 参数说明 | `@param name - 用户名` |
| `@returns` | 返回值说明 | `@returns 用户对象` |
| `@example` | 使用示例 | 见上方示例 |
| `@throws` | 可能抛出的异常 | `@throws {Error} 当输入无效时` |
| `@see` | 相关链接 | `@see {@link OtherFunction}` |
| `@since` | 添加版本 | `@since 1.0.0` |
| `@deprecated` | 标记为废弃 | `@deprecated 使用newFunction代替` |
| `@category` | 分类 | `@category Utils` |
| `@internal` | 内部API，不生成文档 | `@internal` |

### 类型相关

| 标签 | 说明 | 示例 |
|------|------|------|
| `@typeParam` | 泛型参数说明 | `@typeParam T - 元素类型` |
| `@template` | 同`@typeParam` | `@template T` |

---

## 📂 文档结构

```
docs/
├── api/                    # TypeDoc生成的API文档
│   ├── index.html         # 文档首页
│   ├── modules.html       # 模块列表
│   ├── classes/           # 类文档
│   ├── interfaces/        # 接口文档
│   ├── functions/         # 函数文档
│   └── types/             # 类型文档
├── API.md                 # API概览（手写）
├── ARCHITECTURE.md        # 架构文档
└── DEVELOPMENT_GUIDE.md   # 开发指南
```

---

## 📋 文档检查清单

在提交代码前，请确保：

- [ ] 所有导出的函数/类/接口都有文档注释
- [ ] 文档注释包含简短描述（第一行）
- [ ] 所有参数都有`@param`说明
- [ ] 返回值有`@returns`说明
- [ ] 至少有一个`@example`使用示例
- [ ] 复杂功能有详细描述
- [ ] 使用了合适的`@category`分类
- [ ] 废弃的API标记了`@deprecated`

---

## 🎯 最佳实践

### 1. 简洁明了

❌ **不好**
```typescript
/**
 * 这个函数用来做一些事情
 */
export function doSomething() {}
```

✅ **好**
```typescript
/**
 * 验证用户输入并返回清理后的数据
 * 
 * @param input - 用户输入字符串
 * @returns 清理并验证后的字符串
 */
export function validateInput(input: string): string {}
```

### 2. 提供实际示例

❌ **不好**
```typescript
/**
 * 发送请求
 * @example
 * sendRequest()
 */
```

✅ **好**
```typescript
/**
 * 发送HTTP请求
 * 
 * @example
 * ```typescript
 * const response = await sendRequest({
 *   method: 'POST',
 *   url: '/api/users',
 *   data: { name: 'Alice' }
 * });
 * console.log(response.data);
 * ```
 */
```

### 3. 说明使用场景

❌ **不好**
```typescript
/**
 * 防抖函数
 */
export function debounce() {}
```

✅ **好**
```typescript
/**
 * 防抖函数
 * 
 * 使用场景：
 * - 搜索输入框（避免频繁请求）
 * - 窗口resize事件
 * - 滚动事件
 * 
 * 为什么需要防抖？
 * - 减少不必要的函数调用
 * - 提升性能
 * - 节省API请求配额
 */
export function debounce() {}
```

### 4. 标注重要信息

```typescript
/**
 * 删除用户账户（不可恢复）
 * 
 * ⚠️ 警告：此操作不可逆，请谨慎使用
 * 
 * @param userId - 用户ID
 * @throws {Error} 当用户不存在时
 * @throws {PermissionError} 当权限不足时
 * 
 * @since 1.2.0
 */
export async function deleteUser(userId: string): Promise<void> {}
```

---

## 🔄 持续更新

文档应该随着代码一起更新：

1. **新增功能**：添加完整的文档注释
2. **修改功能**：更新文档说明
3. **废弃功能**：添加`@deprecated`标记
4. **删除功能**：同时删除相关文档

---

## 📊 文档覆盖率

运行以下命令检查文档覆盖率：

```bash
# 生成文档并检查覆盖率
npm run docs:api

# 查看报告
# 在docs/api/index.html中查看统计信息
```

目标：文档覆盖率 ≥ 90%

---

## 🔗 相关资源

- [TypeDoc官方文档](https://typedoc.org/)
- [JSDoc标签参考](https://jsdoc.app/)
- [TSDoc规范](https://tsdoc.org/)

---

*最后更新：2025-10-15*




