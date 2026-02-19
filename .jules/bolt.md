## 2024-05-22 - [Event Handling Redundancy]

**Learning:** The codebase heavily utilizes inline `onclick` handlers (e.g., `onclick="renderLevel(0)"`) alongside programmatically added event listeners for accessibility (e.g., `keydown` to trigger `click()`). This dual approach creates a split in event logic.
**Action:** When optimizing or refactoring, prioritize unifying event handling (e.g., using delegation for both clicks and keyboard events) to reduce code duplication and potential sync issues, while respecting the existing inline handler pattern for now.

## 2024-05-22 - [DOM Manipulation Overhead]
**Learning:** Frequent updates to `innerHTML` on parent containers (like `#chaos-metric-display`) cause unnecessary re-parsing and layout thrashing, especially in loop-heavy or frequent event handlers.
**Action:** Isolate dynamic values into specific `<span>` elements with IDs, cache them once, and update only their `textContent` or class attributes. This preserves the static structure and improves rendering performance.
