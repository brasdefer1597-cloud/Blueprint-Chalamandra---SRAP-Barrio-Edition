# PALETTE'S JOURNAL

## 2025-02-17 - Programmatic Accessibility Enhancement
**Learning:** Custom interactive elements (e.g., `.srap-step` divs) lacked native keyboard support and ARIA roles. Adding these programmatically via a central `enhanceAccessibility` function was cleaner than modifying multiple HTML files and ensures consistency.
**Action:** When working with legacy or custom UI components, consider a centralized JavaScript solution to inject accessibility attributes and event listeners rather than refactoring HTML structure if the structure is complex or repeated across multiple files.

## 2025-02-18 - Modal Accessibility & Idempotency
**Learning:** Enhancing modal accessibility (Focus Trap, Escape Key, ARIA roles) programmatically is powerful but requires careful initialization management. Since `initGame` can be called multiple times (e.g., resets), adding global event listeners inside it can lead to duplicate listeners if not guarded.
**Action:** Always use an idempotency flag (e.g., `isModalAccessibilitySetup`) or move global event listener attachments outside of re-runnable initialization functions to prevent memory leaks and duplicate behaviors.
