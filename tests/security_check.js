const fs = require('fs');
const path = require('path');

function scanDir(dir) {
  const files = fs.readdirSync(dir);
  let hasError = false;

  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      if (file !== 'node_modules' && file !== '.git' && file !== 'tests') {
        if (scanDir(fullPath)) hasError = true;
      }
    } else if (file.endsWith('.js') || file.endsWith('.html')) {
      const content = fs.readFileSync(fullPath, 'utf8');
      const lines = content.split('\n');

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (line.includes('target="_blank"') && !line.includes('rel="noopener noreferrer"') && !line.includes('rel="noreferrer"')) {
            console.error(`ERROR: Insecure target="_blank" found in ${fullPath}:${i + 1}`);
            console.error(line.trim());
            hasError = true;
        }
      }
    }
  }
  return hasError;
}

const rootDir = path.resolve(__dirname, '..');
console.log(`Scanning directory: ${rootDir}`);

if (scanDir(rootDir)) {
  console.error('Security check failed: Found target="_blank" without rel="noopener noreferrer".');
  process.exit(1);
} else {
  console.log('Security check passed: No insecure target="_blank" found.');
  process.exit(0);
}
