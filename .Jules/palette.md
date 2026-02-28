# PALETTE'S JOURNAL

## 2025-02-17 - Programmatic Accessibility Enhancement

**Learning:** Custom interactive elements (e.g., `.srap-step` divs) lacked native keyboard support and ARIA roles. Adding these programmatically via a central `enhanceAccessibility` function was cleaner than modifying multiple HTML files and ensures consistency.
**Action:** When working with legacy or custom UI components, consider a centralized JavaScript solution to inject accessibility attributes and event listeners rather than refactoring HTML structure if the structure is complex or repeated across multiple files.

## 2025-02-18 - Modal Accessibility & Focus Management

**Learning:** When replacing native `window.alert()` with custom HTML modals, screen readers and keyboard users lose critical context if ARIA roles (`role="dialog"`, `aria-modal="true"`) and focus management (trapping focus inside the modal and restoring it afterwards) are missing.
**Action:** Always store `document.activeElement` before opening a custom modal, shift focus to an interactive element within the modal, and restore the stored focus when the modal closes.
