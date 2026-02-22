# Sentinel's Journal

This journal records CRITICAL security learnings, vulnerability patterns, and architectural gaps discovered during development.

## 2024-05-22 - Rich Text Rendering via innerHTML

**Vulnerability:** The `showCustomAlert` function uses `innerHTML` to render messages with bold text (`<b>`, `<strong>`) and colors (`<span class="...">`). This creates a persistent XSS sink if untrusted input is ever passed to this function.

**Learning:** The application relies on `innerHTML` for styling notification messages instead of a safer alternative like a structured message object or a Markdown renderer. This design choice prioritizes development speed over security robustness for this specific feature.

**Prevention:** Future developers must ensure that **only trusted, hardcoded strings** are passed to `showCustomAlert`. Any user input must be sanitized or escaped before being included in the message string. A comment has been added to the function to warn about this risk.
