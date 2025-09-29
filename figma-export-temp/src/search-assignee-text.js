// Script to search for assignee/负责人 related text
const fs = require('fs');

const filePath = './components/VersionRequirementsPageSubtasksFixed.tsx';
const content = fs.readFileSync(filePath, 'utf8');

// Find lines containing "负责人", "assignee", or table headers
const lines = content.split('\n');
const matchingLines = [];

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  
  if (line.includes('负责人') || 
      line.includes('assignee') || 
      line.includes('TableHead') ||
      line.includes('产品负责人') ||
      line.includes('productManager')) {
    matchingLines.push(`${i + 1}: ${line}`);
  }
}

console.log('Found lines with assignee/负责人:');
matchingLines.forEach(line => console.log(line));