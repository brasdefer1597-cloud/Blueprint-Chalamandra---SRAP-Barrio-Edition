const fs = require('fs');
const path = require('path');

const SCAN_DIRS = ['assets', 'demo', 'full'];
const EXTS = ['.js', '.html'];

let errors = [];

function scanDir(dir) {
  if (!fs.existsSync(dir)) return;

  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      scanDir(fullPath);
    } else if (EXTS.includes(path.extname(fullPath))) {
      checkFile(fullPath);
    }
  }
}

function checkFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');

  lines.forEach((line, index) => {
    if (line.includes('target="_blank"')) {
      if (!line.includes('rel="noopener noreferrer"')) {
        errors.push(`[FAIL] ${filePath}:${index + 1} - Found target="_blank" without rel="noopener noreferrer"`);
      }
    }
  });
}

console.log('🛡️ Sentinel Security Scan: Checking for Reverse Tabnabbing Vulnerabilities...');
SCAN_DIRS.forEach(dir => scanDir(dir));

if (errors.length > 0) {
  console.error('\n🚨 Security Issues Found:');
  errors.forEach(err => console.error(err));
  process.exit(1);
} else {
  console.log('\n✅ No reverse tabnabbing vulnerabilities found.');
  process.exit(0);
}
