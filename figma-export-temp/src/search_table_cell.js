const fs = require('fs');

// Read the current file
const content = fs.readFileSync('/components/ScheduledRequirementsPageUpdated.tsx', 'utf8');

// Split by lines to find the problematic area
const lines = content.split('\n');

// Find lines around 1055 where the error occurs
console.log('Lines around 1050-1060:');
for (let i = 1045; i < 1065; i++) {
  if (lines[i]) {
    console.log(`${i + 1}: ${lines[i]}`);
  }
}

// Also search for common patterns that might indicate the broken structure
console.log('\n--- Looking for table cell patterns ---');
const tableCellLines = lines.map((line, index) => ({ line, num: index + 1 }))
  .filter(item => item.line.includes('TableCell') && (item.line.includes('title') || item.line.includes('requirement.title')))
  .slice(0, 10);

tableCellLines.forEach(item => {
  console.log(`Line ${item.num}: ${item.line.trim()}`);
});

// Look for div structures that might be incomplete
console.log('\n--- Looking for space-y divs ---');
const spaceYDivs = lines.map((line, index) => ({ line, num: index + 1 }))
  .filter(item => item.line.includes('space-y') && item.line.includes('<div'))
  .slice(0, 5);

spaceYDivs.forEach(item => {
  console.log(`Line ${item.num}: ${item.line.trim()}`);
});