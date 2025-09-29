const fs = require('fs');
const content = fs.readFileSync('./components/ScheduledRequirementsPageUpdated.tsx', 'utf8');

// Find the batch actions section
const lines = content.split('\n');
let startIndex = -1;
let endIndex = -1;

for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('showBatchActions &&')) {
    startIndex = i;
    break;
  }
}

if (startIndex !== -1) {
  // Find the end of batch actions section (usually the closing of the conditional render)
  let braceCount = 0;
  for (let i = startIndex; i < lines.length; i++) {
    if (lines[i].includes('{')) braceCount++;
    if (lines[i].includes('}')) braceCount--;
    if (braceCount === 0 && i > startIndex) {
      endIndex = i;
      break;
    }
  }
  
  console.log(`Batch actions section found from line ${startIndex + 1} to ${endIndex + 1}:`);
  for (let i = startIndex; i <= endIndex; i++) {
    console.log(`${i + 1}: ${lines[i]}`);
  }
} else {
  console.log('Batch actions section not found');
}