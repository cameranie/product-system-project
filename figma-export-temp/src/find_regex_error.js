const fs = require('fs');

// Read the file content
const content = fs.readFileSync('/components/ScheduledRequirementsPageUpdated.tsx', 'utf8');

// Split into lines to find line 890
const lines = content.split('\n');

// Check lines around 890
console.log('Lines around 890:');
for (let i = 885; i < 895; i++) {
  if (lines[i]) {
    console.log(`${i + 1}: ${lines[i]}`);
  }
}

// Look for unterminated string literals or regex patterns
console.log('\n--- Searching for potential regex issues ---');

// Look for lines with unterminated quotes
lines.forEach((line, index) => {
  // Check for unterminated className attributes
  if (line.includes('className="') && !line.includes('">')) {
    console.log(`Line ${index + 1}: Potentially unterminated className: ${line.trim()}`);
  }
  
  // Check for division operators that might be parsed as regex
  if (line.includes('/') && !line.includes('//') && !line.includes('/*')) {
    const lineNum = index + 1;
    if (lineNum >= 885 && lineNum <= 895) {
      console.log(`Line ${lineNum}: Contains division: ${line.trim()}`);
    }
  }
});