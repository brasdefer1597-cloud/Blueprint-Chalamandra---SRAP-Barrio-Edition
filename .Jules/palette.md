# PALETTE'S JOURNAL

## 2025-02-17 - Programmatic Accessibility Enhancement
**Learning:** Custom interactive elements (e.g., `.srap-step` divs) lacked native keyboard support and ARIA roles. Adding these programmatically via a central `enhanceAccessibility` function was cleaner than modifying multiple HTML files and ensures consistency.
**Action:** When working with legacy or custom UI components, consider a centralized JavaScript solution to inject accessibility attributes and event listeners rather than refactoring HTML structure if the structure is complex or repeated across multiple files.

## 2025-02-17 - Modal Focus Management
**Learning:** Adding `role="dialog"`, `aria-modal="true"`, and managing focus (saving on open, restoring on close) significantly improves the accessibility of custom modals without needing a full UI library.
**Action:** Always verify that custom modals trap or manage focus and support the Escape key for closure.
