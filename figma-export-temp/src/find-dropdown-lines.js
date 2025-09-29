const fs = require('fs');

const content = fs.readFileSync('./components/RequirementPoolPageWithReviewers.tsx', 'utf8');
const lines = content.split('\n');

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  if (line.includes('一级评审状态') || line.includes('二级评审状态') || 
      (line.includes('reviewer1Status') && line.includes('DropdownMenuItem'))) {
    console.log(`Line ${i + 1}: ${line}`);
    console.log(`Line ${i + 2}: ${lines[i + 1]}`);
    console.log(`Line ${i + 3}: ${lines[i + 2]}`);
    console.log('---');
  }
}