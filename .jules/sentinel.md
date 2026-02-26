## 2026-02-26 - [CRITICAL] Reverse Tabnabbing Vulnerability
**Vulnerability:** Found an external link using `target="_blank"` without `rel="noopener noreferrer"`. This exposes the user to reverse tabnabbing attacks where the new page can control the original page via `window.opener`.
**Learning:** Even in simple projects, missing `rel="noopener noreferrer"` is a common oversight when manually crafting HTML strings. Modern browsers mitigate this, but explicit protection is required for defense-in-depth and older browser support.
**Prevention:** Always pair `target="_blank"` with `rel="noopener noreferrer"`. Use automated linters or security scanners to catch this pattern in the codebase.
