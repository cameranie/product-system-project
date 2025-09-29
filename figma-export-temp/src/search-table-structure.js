const fs = require('fs');

// 读取文件内容
const content = fs.readFileSync('./components/RequirementPoolPageWithHeaderSort.tsx', 'utf8');

// 查找Table相关的内容
const tableHeaderMatch = content.match(/<TableHeader[^>]*>[\s\S]*?<\/TableHeader>/);
const tableBodyMatch = content.match(/<TableBody[^>]*>[\s\S]*?<\/TableBody>/);

console.log('=== TABLE HEADER ===');
if (tableHeaderMatch) {
  console.log(tableHeaderMatch[0]);
} else {
  console.log('Table header not found');
}

console.log('\n=== TABLE BODY (first part) ===');
if (tableBodyMatch) {
  const bodyContent = tableBodyMatch[0];
  const lines = bodyContent.split('\n');
  // 只显示前50行避免过长
  console.log(lines.slice(0, 50).join('\n'));
} else {
  console.log('Table body not found');
}