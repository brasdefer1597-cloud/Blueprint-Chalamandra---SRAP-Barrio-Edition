## 2024-05-22 - Fix Reverse Tabnabbing Vulnerability
**Vulnerability:** Found `target="_blank"` without `rel="noopener noreferrer"` in `assets/js/script.js` (Ko-fi link in paywall modal).
**Learning:** Even hardcoded links can expose users to reverse tabnabbing attacks if the destination page is compromised or malicious. The `window.opener` object is exposed to the new window, allowing it to redirect the original page.
**Prevention:** Always add `rel="noopener noreferrer"` (or `rel="noreferrer"`) when using `target="_blank"`. Enforced by automated security scan (`tests/security_check.js`).
