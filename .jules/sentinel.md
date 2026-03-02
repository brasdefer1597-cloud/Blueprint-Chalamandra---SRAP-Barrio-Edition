## 2024-05-25 - [Reverse Tabnabbing in Dynamic HTML]
**Vulnerability:** External link generated via JavaScript (`showPaywallModal`) used `target="_blank"` without `rel="noopener noreferrer"`.
**Learning:** Even trusted external links (like Ko-fi) pose a security risk if they can access `window.opener`. Dynamic HTML generation often bypasses linter checks that catch this in static templates.
**Prevention:** Always add `rel="noopener noreferrer"` when using `target="_blank"`. Use a strict Content Security Policy (CSP) to mitigate the impact of malicious redirects.
