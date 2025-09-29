// Script to search for table header in VersionRequirementsPageSubtasksFixed.tsx
const fs = require('fs');

const filePath = './components/VersionRequirementsPageSubtasksFixed.tsx';
const content = fs.readFileSync(filePath, 'utf8');

// Search for table header
const lines = content.split('\n');
let foundTableHeader = false;
let headerLines = [];

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  
  if (line.includes('TableHeader') && !foundTableHeader) {
    foundTableHeader = true;
    // Get 20 lines from TableHeader
    for (let j = i; j < Math.min(i + 20, lines.length); j++) {
      headerLines.push(`${j + 1}: ${lines[j]}`);
    }
    break;
  }
}

if (headerLines.length > 0) {
  console.log('Found main table header:');
  headerLines.forEach(line => console.log(line));
} else {
  console.log('Table header not found');
}