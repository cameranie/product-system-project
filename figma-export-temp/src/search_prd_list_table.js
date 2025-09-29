// 用于搜索PRDListTable的使用位置
const fs = require('fs');

const content = fs.readFileSync('./components/PRDPage.tsx', 'utf8');
const lines = content.split('\n');

// 搜索包含PRDListTable的行
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('PRDListTable') || lines[i].includes('<PRDListTable')) {
    console.log(`Line ${i + 1}: ${lines[i]}`);
    // 显示前后几行上下文
    for (let j = Math.max(0, i - 5); j <= Math.min(lines.length - 1, i + 20); j++) {
      console.log(`${j + 1}: ${lines[j]}`);
    }
    break;
  }
}