const fs = require('fs');
const path = require('path');

const dirs = ['assets', 'demo', 'full'];
const extensions = ['.html', '.js'];

let hasError = false;

function scanDir(dir) {
  if (!fs.existsSync(dir)) return;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      scanDir(filePath);
    } else if (extensions.includes(path.extname(file))) {
      checkFile(filePath);
    }
  }
}

function checkFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  // Simple regex to find anchor tags with target="_blank"
  // Note: This is not a full HTML parser and might miss edge cases or have false positives.
  // Ideally use a proper parser, but for this task, regex is sufficient.

  // Regex explanation:
  // <a\s+ : match starting <a with whitespace
  // [^>]* : match anything except > (attributes)
  // target=["']_blank["'] : match target="_blank"
  // [^>]* : match anything except >
  // > : match closing >

  // To handle attributes in any order, we first find the tag, then check its content.
  const tagRegex = /<a\s+[^>]*>/gi;
  let match;
  while ((match = tagRegex.exec(content)) !== null) {
    const tag = match[0];
    if (/target=["']_blank["']/i.test(tag)) {
      if (!/rel=["'][^"']*noopener[^"']*["']/i.test(tag)) {
        console.error(`[FAIL] ${filePath}: Found target="_blank" without rel="noopener" in tag: ${tag.trim()}`);
        hasError = true;
      }
    }
  }
}

console.log('Scanning for reverse tabnabbing vulnerabilities...');
dirs.forEach(scanDir);

if (hasError) {
  console.log('Security check FAILED.');
  process.exit(1);
} else {
  console.log('Security check PASSED.');
  process.exit(0);
}
