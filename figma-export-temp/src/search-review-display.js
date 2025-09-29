const fs = require('fs');

// 读取预排期需求管理页面
const content = fs.readFileSync('./components/ScheduledRequirementsPageUpdated.tsx', 'utf8');
const lines = content.split('\n');

// 搜索一级评审相关的表格显示部分
let foundReviewSection = false;
let sectionLines = [];

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  
  // 寻找一级评审或二级评审相关的TableCell
  if (line.includes('reviewer1') || line.includes('reviewer2') || line.includes('一级评审') || line.includes('二级评审')) {
    if (!foundReviewSection) {
      foundReviewSection = true;
      console.log(`Found review section starting at line ${i + 1}:`);
    }
    
    // 获取上下文（前后各5行）
    const start = Math.max(0, i - 5);
    const end = Math.min(lines.length - 1, i + 10);
    
    console.log(`\n--- Context around line ${i + 1} ---`);
    for (let j = start; j <= end; j++) {
      const marker = j === i ? '>>>' : '   ';
      console.log(`${marker} ${j + 1}: ${lines[j]}`);
    }
  }
}

if (!foundReviewSection) {
  console.log('No review section found in the file');
}