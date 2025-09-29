// 搜索版本需求管理表格中Badge的位置
const fs = require('fs');

const content = fs.readFileSync('/components/VersionRequirementsPageWithSubtasksTable.tsx', 'utf8');

// 查找表格中的需求标题和Badge显示部分
const lines = content.split('\n');
let foundTable = false;
let foundBadge = false;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  
  // 寻找 Badge 的使用位置
  if (line.includes('<Badge') && line.includes('type') || line.includes('priority') || line.includes('platform')) {
    console.log(`Line ${i + 1}: ${line.trim()}`);
    for (let j = Math.max(0, i - 3); j < Math.min(lines.length, i + 4); j++) {
      if (j === i) {
        console.log(`>>> ${j + 1}: ${lines[j]}`);
      } else {
        console.log(`    ${j + 1}: ${lines[j]}`);
      }
    }
    console.log('---');
  }
}