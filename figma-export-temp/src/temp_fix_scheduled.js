const fs = require('fs');

// Read the current file
const filePath = '/components/ScheduledRequirementsPageUpdated.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// Find the pattern where tags are displayed and remove it
// Look for the div with tags.map pattern
const tagsPattern = /\s*<div className="flex flex-wrap gap-1">\s*\{requirement\.tags\.map\([^}]+\}\)\)\}\s*<\/div>/g;

// Replace the tags pattern with empty string
content = content.replace(tagsPattern, '');

// Write back to file
fs.writeFileSync(filePath, content, 'utf8');
console.log('Fixed tags removal in ScheduledRequirementsPageUpdated.tsx');