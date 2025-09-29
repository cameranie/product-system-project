// Search for the specific line that's causing the issue
const fs = require('fs');

const content = fs.readFileSync('/components/PRDPage.tsx', 'utf8');
const lines = content.split('\n');

// Look for the problematic line around 1926
const start = Math.max(0, 1920 - 1);
const end = Math.min(lines.length, 1930);

console.log('Lines around 1926:');
for (let i = start; i < end; i++) {
  console.log(`${i + 1}: ${lines[i]}`);
}

// Search for any function definitions that contain "标签" or similar
console.log('\nSearching for tag-related code:');
lines.forEach((line, index) => {
  if (line.includes('标签') || line.includes('tags') && line.includes('Card')) {
    console.log(`Line ${index + 1}: ${line}`);
  }
});