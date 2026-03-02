# PALETTE'S JOURNAL

## 2025-10-24 - Focus Management and Standardized Focus Visibility

**Learning:** Custom modals replacing native `alert()` lack built-in focus trapping. Furthermore, generic and custom interactive elements (like the modal buttons and custom `.srap-step` divs) often lack clear focus indicators, which is critical for keyboard accessibility.
**Action:** Always implement explicit programmatic focus management for custom modals: save `document.activeElement` before opening, shift focus into the modal (`aria-hidden="false"`), and restore focus upon closing (`aria-hidden="true"`). Standardize visual focus indicators (e.g., using Tailwind `focus-visible` utility classes) programmatically across all interactive elements.

## 2025-02-17 - Programmatic Accessibility Enhancement

**Learning:** Custom interactive elements (e.g., `.srap-step` divs) lacked native keyboard support and ARIA roles. Adding these programmatically via a central `enhanceAccessibility` function was cleaner than modifying multiple HTML files and ensures consistency.
**Action:** When working with legacy or custom UI components, consider a centralized JavaScript solution to inject accessibility attributes and event listeners rather than refactoring HTML structure if the structure is complex or repeated across multiple files.
