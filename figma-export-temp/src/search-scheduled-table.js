const fs = require('fs');

const content = fs.readFileSync('./components/ScheduledRequirementsPageUpdated.tsx', 'utf8');
const lines = content.split('\n');

// 查找表格中的评审相关内容
let foundTableContent = false;
for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  
  // 找到表格开始
  if (line.includes('<TableHeader>') || line.includes('<TableBody>')) {
    foundTableContent = true;
    console.log(`=== Table content starts at line ${i + 1} ===`);
  }
  
  if (foundTableContent && (
    line.includes('一级评审') || 
    line.includes('二级评审') || 
    line.includes('reviewer1') || 
    line.includes('reviewer2') ||
    line.includes('TableCell') && (
      line.includes('Avatar') || 
      line.includes('reviewer')
    )
  )) {
    console.log(`${i + 1}: ${line.trim()}`);
  }
  
  // 如果表格结束，停止
  if (foundTableContent && line.includes('</Table>')) {
    console.log(`=== Table ends at line ${i + 1} ===`);
    break;
  }
}