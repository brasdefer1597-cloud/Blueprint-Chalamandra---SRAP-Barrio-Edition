# Sentinel Journal - Security Learnings

This journal records CRITICAL security learnings, vulnerability patterns, and architectural gaps found in the codebase.

## Format
## YYYY-MM-DD - [Title]
**Vulnerability:** [What you found]
**Learning:** [Why it existed]
**Prevention:** [How to avoid next time]

## 2025-02-21 - Reverse Tabnabbing in Premium Paywall
**Vulnerability:** External link to Ko-fi in `showPaywallModal` used `target="_blank"` without `rel="noopener noreferrer"`.
**Learning:** Hardcoded HTML strings in JavaScript (`innerHTML`) bypass standard linter checks that might catch this in JSX/templates.
**Prevention:** Implement a custom security scan script (like `tests/security_check.js`) in the CI pipeline to regex-check `.js` files for this pattern.
