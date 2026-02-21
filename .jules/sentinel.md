## 2026-02-21 - Reverse Tabnabbing & InnerHTML Risks
**Vulnerability:** Identified `target="_blank"` without `rel="noopener noreferrer"` and potential XSS via `innerHTML`.
**Learning:** Even in static sites, external links can expose users to reverse tabnabbing attacks. `innerHTML` is convenient but risky.
**Prevention:** Always use `rel="noopener noreferrer"` with `target="_blank"`. Sanitize inputs before using `innerHTML` or prefer `textContent`.
