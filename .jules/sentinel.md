## 2026-02-18 - Reverse Tabnabbing in External Links

**Vulnerability:** Found a `target="_blank"` link to an external payment provider (Ko-fi) without `rel="noopener noreferrer"`.
**Learning:** Even in static sites, external links can expose users to "Reverse Tabnabbing" attacks where the target page can manipulate the origin page via `window.opener`.
**Prevention:** Always add `rel="noopener noreferrer"` to any `<a>` tag with `target="_blank"`, or use a linter rule to enforce this automatically.
