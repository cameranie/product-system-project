// Script to search for assignee-related content
const fs = require('fs');

const filePath = './components/VersionRequirementsPageWithSubtasksTable.tsx';
const content = fs.readFileSync(filePath, 'utf8');

// Search for lines containing assignee or 负责人
const lines = content.split('\n');
const searchTerms = ['负责人', 'assignee', 'TableHead'];

console.log('Searching for assignee-related content:');
lines.forEach((line, index) => {
  if (searchTerms.some(term => line.toLowerCase().includes(term.toLowerCase()))) {
    console.log(`Line ${index + 1}: ${line.trim()}`);
  }
});