# PALETTE'S JOURNAL

## 2025-02-17 - Programmatic Accessibility Enhancement

**Learning:** Custom interactive elements (e.g., `.srap-step` divs) lacked native keyboard support and ARIA roles. Adding these programmatically via a central `enhanceAccessibility` function was cleaner than modifying multiple HTML files and ensures consistency.
**Action:** When working with legacy or custom UI components, consider a centralized JavaScript solution to inject accessibility attributes and event listeners rather than refactoring HTML structure if the structure is complex or repeated across multiple files.

## 2025-02-18 - Modal Focus Management
**Learning:** A visually hidden modal (`display: none`) needs programmatic focus management (trapping focus inside, restoring focus on close) to be accessible. Simply showing/hiding it is insufficient for keyboard users.
**Action:** When implementing custom modals, always include a `setupModalAccessibility` function that handles ARIA roles, focus trapping, and Escape key listeners.
