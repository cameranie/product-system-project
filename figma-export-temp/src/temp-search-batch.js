// Search for batch actions in the file
const fs = require('fs');
const content = fs.readFileSync('/components/ScheduledRequirementsPageUpdated.tsx', 'utf8');

// Find lines with batch action related content
const lines = content.split('\n');
lines.forEach((line, index) => {
  if (line.includes('showBatchActions') || 
      line.includes('批量') || 
      line.includes('handleBatch') ||
      line.includes('selectedRequirements.length') ||
      line.includes('批量操作') ||
      line.includes('批量评审')) {
    console.log(`Line ${index + 1}: ${line.trim()}`);
  }
});

// Also find the section with batch action buttons
const batchSectionStart = content.indexOf('{showBatchActions &&');
if (batchSectionStart > -1) {
  const section = content.substring(batchSectionStart, batchSectionStart + 2000);
  console.log('\n\nBatch Actions Section:\n', section);
}