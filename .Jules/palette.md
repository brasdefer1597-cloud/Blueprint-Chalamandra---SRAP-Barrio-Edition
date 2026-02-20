# PALETTE'S JOURNAL

## 2025-02-17 - Programmatic Accessibility Enhancement
**Learning:** Custom interactive elements (e.g., `.srap-step` divs) lacked native keyboard support and ARIA roles. Adding these programmatically via a central `enhanceAccessibility` function was cleaner than modifying multiple HTML files and ensures consistency.
**Action:** When working with legacy or custom UI components, consider a centralized JavaScript solution to inject accessibility attributes and event listeners rather than refactoring HTML structure if the structure is complex or repeated across multiple files.

## 2025-05-22 - Dead Buttons vs. Accessible Feedback
**Learning:** Using the native `disabled` attribute on buttons prevents click events entirely, making it impossible to provide feedback (like a "Locked" modal) to users who attempt to interact with them. This creates a confusing "dead" UI state.
**Action:** Use `aria-disabled="true"` instead of `disabled` when you want to keep an element interactive for the purpose of showing an explanation or feedback message, while still semantically indicating it is not fully active.
