const fs = require('fs');
const path = require('path');

function checkFile(filepath) {
  const content = fs.readFileSync(filepath, 'utf8');
  const lines = content.split('\n');
  let issues = 0;

  lines.forEach((line, index) => {
    if (line.includes('target="_blank"') && !line.includes('rel="noopener noreferrer"')) {
      console.log(`[VULNERABILITY] Reverse Tabnabbing in ${filepath}:${index + 1}`);
      console.log(`  Line: ${line.trim()}`);
      issues++;
    }
  });

  return issues;
}

function scanDir(dir) {
  const files = fs.readdirSync(dir);
  let totalIssues = 0;

  files.forEach(file => {
    const filepath = path.join(dir, file);
    const stats = fs.statSync(filepath);

    if (stats.isDirectory()) {
      if (file !== 'node_modules' && file !== '.git') {
        totalIssues += scanDir(filepath);
      }
    } else if (file.endsWith('.js') || file.endsWith('.html')) {
      totalIssues += checkFile(filepath);
    }
  });

  return totalIssues;
}

console.log('Starting security scan...');
const issues = scanDir('.');
if (issues > 0) {
  console.log(`Scan completed with ${issues} vulnerabilities found.`);
  process.exit(1);
} else {
  console.log('Scan completed. No vulnerabilities found.');
  process.exit(0);
}
