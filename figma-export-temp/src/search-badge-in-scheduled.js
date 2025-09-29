const fs = require('fs');

const content = fs.readFileSync('/components/ScheduledRequirementsPageVersionGrouped.tsx', 'utf8');

// 搜索Badge相关的代码行
const lines = content.split('\n');
const badgeLines = [];

lines.forEach((line, index) => {
  if (line.includes('Badge') && (line.includes('type') || line.includes('project') || line.includes('platform') || line.includes('priority'))) {
    badgeLines.push({
      lineNumber: index + 1,
      content: line.trim()
    });
  }
});

console.log('Found Badge lines:');
badgeLines.forEach(item => {
  console.log(`Line ${item.lineNumber}: ${item.content}`);
});

// 搜索类型、项目、应用端的TableCell部分
const typeCells = [];
let inTableBody = false;
let currentCell = '';
let braceCount = 0;

lines.forEach((line, index) => {
  if (line.includes('TableBody')) {
    inTableBody = true;
  }
  
  if (inTableBody && (line.includes('/* 类型 */') || line.includes('/* 项目 */') || line.includes('/* 应用端 */'))) {
    currentCell = line.trim();
    typeCells.push({
      startLine: index + 1,
      type: line.includes('类型') ? '类型' : line.includes('项目') ? '项目' : '应用端'
    });
  }
});

console.log('\nFound cells:');
typeCells.forEach(item => {
  console.log(`${item.type} at line ${item.startLine}`);
});