const fs = require('fs');
const path = require('path');

// 需要更新的文件列表
const filesToUpdate = [
  '/components/RequirementPoolPageWithReviewers.tsx',
  '/components/PRDPageUpdated.tsx',
  '/components/PrototypePageCompleteFixed.tsx',
  '/components/DesignPageCompleteFixed.tsx',
  '/components/BugsPageWithNavigation.tsx',
  '/components/ScheduledRequirementsPageUpdated.tsx',
  '/components/MyAssignedRequirementsPage.tsx',
  '/components/MyKanbanPage.tsx',
  '/components/MyTodoPage.tsx',
  '/components/VersionRequirementsPageSubtasksUpdated.tsx'
];

// 字体统一替换规则
const fontReplacements = [
  // 表格头部统一字体
  {
    search: /<TableHead([^>]*)>/g,
    replace: '<TableHead$1 className="text-sm font-medium">'
  },
  // 表格内容统一字体 - 移除已有的字体类并添加统一字体
  {
    search: /<TableCell([^>]*?)className="([^"]*?)"([^>]*)>/g,
    replace: (match, p1, className, p3) => {
      // 移除现有的文字相关类
      const cleanClassName = className
        .replace(/\btext-(xs|sm|base|lg|xl|2xl|3xl)\b/g, '')
        .replace(/\bfont-(thin|extralight|light|normal|medium|semibold|bold|extrabold|black)\b/g, '')
        .replace(/\s+/g, ' ')
        .trim();
      
      // 添加统一字体类
      const newClassName = cleanClassName ? `text-sm ${cleanClassName}` : 'text-sm';
      return `<TableCell${p1}className="${newClassName}"${p3}>`;
    }
  },
  // Badge统一字体
  {
    search: /<Badge([^>]*?)className="([^"]*?)"([^>]*)>/g,
    replace: (match, p1, className, p3) => {
      // 移除现有的文字相关类
      const cleanClassName = className
        .replace(/\btext-(xs|sm|base|lg|xl|2xl|3xl)\b/g, '')
        .replace(/\bfont-(thin|extralight|light|normal|medium|semibold|bold|extrabold|black)\b/g, '')
        .replace(/\s+/g, ' ')
        .trim();
      
      // 添加统一字体类
      const newClassName = cleanClassName ? `text-xs ${cleanClassName}` : 'text-xs';
      return `<Badge${p1}className="${newClassName}"${p3}>`;
    }
  },
  // 普通Badge（没有className的）
  {
    search: /<Badge(?![^>]*className)([^>]*)>/g,
    replace: '<Badge$1 className="text-xs">'
  },
  // 辅助信息统一字体
  {
    search: /className="([^"]*?)text-muted-foreground([^"]*?)"/g,
    replace: (match, before, after) => {
      // 移除现有的文字大小类
      const cleanBefore = before.replace(/\btext-(xs|sm|base|lg|xl|2xl|3xl)\b/g, '').replace(/\s+/g, ' ').trim();
      const cleanAfter = after.replace(/\btext-(xs|sm|base|lg|xl|2xl|3xl)\b/g, '').replace(/\s+/g, ' ').trim();
      
      // 构建新的className
      const parts = [];
      if (cleanBefore) parts.push(cleanBefore);
      parts.push('text-xs text-muted-foreground');
      if (cleanAfter) parts.push(cleanAfter);
      
      return `className="${parts.join(' ')}"`;
    }
  }
];

// 处理文件的函数
function updateFileFont(filePath) {
  try {
    const fullPath = path.join(__dirname, filePath);
    if (!fs.existsSync(fullPath)) {
      console.log(`文件不存在: ${filePath}`);
      return;
    }

    let content = fs.readFileSync(fullPath, 'utf8');
    let modified = false;

    // 应用所有替换规则
    fontReplacements.forEach(rule => {
      const originalContent = content;
      if (typeof rule.replace === 'function') {
        content = content.replace(rule.search, rule.replace);
      } else {
        content = content.replace(rule.search, rule.replace);
      }
      if (content !== originalContent) {
        modified = true;
      }
    });

    if (modified) {
      fs.writeFileSync(fullPath, content, 'utf8');
      console.log(`✅ 已更新: ${filePath}`);
    } else {
      console.log(`⏭️  无需更改: ${filePath}`);
    }
  } catch (error) {
    console.error(`❌ 处理文件 ${filePath} 时出错:`, error.message);
  }
}

// 批量处理文件
console.log('开始统一字体设置...\n');

filesToUpdate.forEach(filePath => {
  updateFileFont(filePath);
});

console.log('\n字体统一更新完成!');