# PALETTE'S JOURNAL

## 2025-02-17 - Programmatic Accessibility Enhancement

**Learning:** Custom interactive elements (e.g., `.srap-step` divs) lacked native keyboard support and ARIA roles. Adding these programmatically via a central `enhanceAccessibility` function was cleaner than modifying multiple HTML files and ensures consistency.
**Action:** When working with legacy or custom UI components, consider a centralized JavaScript solution to inject accessibility attributes and event listeners rather than refactoring HTML structure if the structure is complex or repeated across multiple files.

## 2025-02-18 - Navigation State Accessibility in SPAs

**Learning:** For SPAs where navigation is simulated via DOM visibility toggling, relying on `disabled` attributes is insufficient. `aria-current` is crucial for conveying location, and `aria-disabled` reinforces the state for screen readers.
**Action:** Always implement dynamic `aria-current="step"` or `"page"` in the central navigation update logic of SPAs to ensure screen reader users know where they are in the application flow.
