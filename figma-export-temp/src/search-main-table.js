// Script to find main table structure
const fs = require('fs');

const filePath = './components/VersionRequirementsPageSubtasksFixed.tsx';
const content = fs.readFileSync(filePath, 'utf8');

// Find return statement and table structure
const lines = content.split('\n');
let inReturn = false;
let tableLines = [];

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  
  // Look for return statement in component
  if (line.includes('return (') && !inReturn) {
    inReturn = true;
  }
  
  if (inReturn) {
    tableLines.push(`${i + 1}: ${line}`);
    
    // Stop after finding table structure (around 50-100 lines should be enough)
    if (tableLines.length > 150) {
      break;
    }
  }
}

console.log('Found table structure:');
tableLines.forEach(line => {
  if (line.includes('TableHead') || line.includes('需求标题') || line.includes('负责人') || line.includes('产品负责人')) {
    console.log(line);
  }
});