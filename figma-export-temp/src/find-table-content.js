const fs = require('fs');

// 读取文件内容
const content = fs.readFileSync('./components/RequirementPoolPageWithHeaderSort.tsx', 'utf8');
const lines = content.split('\n');

// 查找隐藏列菜单部分
let hiddenMenuStart = -1;
let tableStart = -1;
let hiddenMenuEnd = -1;
let tableEnd = -1;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  
  if (line.includes('toggleColumnVisibility') && line.includes('reviewStatus')) {
    hiddenMenuStart = i - 5;
    // 找到该段的结束
    for (let j = i; j < lines.length; j++) {
      if (lines[j].includes('</DropdownMenuContent>')) {
        hiddenMenuEnd = j + 5;
        break;
      }
    }
    break;
  }
}

// 查找表格部分
for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  
  if (line.includes('<Table') && !tableStart) {
    tableStart = i;
  }
  
  if (tableStart !== -1 && line.includes('</Table>')) {
    tableEnd = i;
    break;
  }
}

console.log('=== 隐藏列菜单部分 ===');
if (hiddenMenuStart !== -1 && hiddenMenuEnd !== -1) {
  for (let i = hiddenMenuStart; i <= hiddenMenuEnd; i++) {
    console.log(`${i + 1}: ${lines[i]}`);
  }
} else {
  console.log('未找到隐藏列菜单部分');
}

console.log('\n=== 表格部分（前100行）===');
if (tableStart !== -1 && tableEnd !== -1) {
  const endLine = Math.min(tableStart + 100, tableEnd);
  for (let i = tableStart; i <= endLine; i++) {
    console.log(`${i + 1}: ${lines[i]}`);
  }
} else {
  console.log('未找到表格部分');
}