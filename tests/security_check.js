const fs = require('fs');
const path = require('path');

const directoriesToCheck = ['assets', 'demo', 'full'];
const fileExtensionsToCheck = ['.js', '.html'];

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

let hasVulnerability = false;

directoriesToCheck.forEach(dir => {
  if (fs.existsSync(dir)) {
    walkDir(dir, (filePath) => {
      const ext = path.extname(filePath);
      if (fileExtensionsToCheck.includes(ext)) {
        const content = fs.readFileSync(filePath, 'utf8');

        // Simple regex to find target="_blank" without rel="noopener noreferrer"
        // This is a basic check, a real parser might be needed for complex cases,
        // but it suffices for this project's structure.

        // Let's find all instances of target="_blank"
        const targetBlankRegex = /target\s*=\s*(['"])_blank\1/gi;
        let match;

        while ((match = targetBlankRegex.exec(content)) !== null) {
          // We found a target="_blank". Let's check the context around it (e.g. within 100 chars)
          const contextStart = Math.max(0, match.index - 100);
          const contextEnd = Math.min(content.length, match.index + 100);
          const context = content.substring(contextStart, contextEnd);

          if (!/rel\s*=\s*(['"])noopener noreferrer\1/i.test(context)) {
            console.error(`🚨 SECURITY VULNERABILITY FOUND in ${filePath} at index ${match.index}`);
            console.error(`Found target="_blank" without rel="noopener noreferrer".`);
            console.error(`Context: ${context}`);
            hasVulnerability = true;
          }
        }
      }
    });
  }
});

if (hasVulnerability) {
  console.error("❌ Security check failed.");
  process.exit(1);
} else {
  console.log("✅ Security check passed. No reverse tabnabbing vulnerabilities found.");
}
