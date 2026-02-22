# PALETTE'S JOURNAL

## 2025-02-17 - Programmatic Accessibility Enhancement

**Learning:** Custom interactive elements (e.g., `.srap-step` divs) lacked native keyboard support and ARIA roles. Adding these programmatically via a central `enhanceAccessibility` function was cleaner than modifying multiple HTML files and ensures consistency.
**Action:** When working with legacy or custom UI components, consider a centralized JavaScript solution to inject accessibility attributes and event listeners rather than refactoring HTML structure if the structure is complex or repeated across multiple files.
\n## 2026-02-22 - Modal Accessibility Pattern\n**Learning:** Custom modals in this project require manual focus management and ARIA setup as they are not native `<dialog>` elements.\n**Action:** Use `setupModalAccessibility()` pattern for any new modal components to ensure keyboard and screen reader support.
