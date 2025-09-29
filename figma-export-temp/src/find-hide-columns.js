const fs = require('fs');
const content = fs.readFileSync('./components/RequirementPoolPageWithReviewers.tsx', 'utf8');

// 查找包含隐藏列菜单的部分
const lines = content.split('\n');
let inDropdown = false;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  
  if (line.includes('DropdownMenuContent') && line.includes('align="start"')) {
    inDropdown = true;
    console.log(`=== Dropdown starts at line ${i + 1} ===`);
  }
  
  if (inDropdown && (line.includes('DropdownMenuItem') || line.includes('reviewe'))) {
    console.log(`${i + 1}: ${line.trim()}`);
  }
  
  if (inDropdown && line.includes('</DropdownMenuContent>')) {
    console.log(`=== Dropdown ends at line ${i + 1} ===`);
    break;
  }
}