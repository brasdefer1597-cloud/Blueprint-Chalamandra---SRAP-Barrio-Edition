## 2024-05-18 - [CRITICAL] Reverse Tabnabbing Vulnerability
**Vulnerability:** Found an anchor tag `<a href="..." target="_blank">` without the `rel="noopener noreferrer"` attributes in `showPaywallModal()`.
**Learning:** This is a classic "Reverse Tabnabbing" vulnerability where the newly opened tab can gain access to the `window.opener` object, potentially allowing it to navigate the original tab to a malicious URL (e.g., a phishing page).
**Prevention:** Always ensure that `target="_blank"` on external links is accompanied by `rel="noopener noreferrer"` to prevent the new tab from referencing the original tab.
