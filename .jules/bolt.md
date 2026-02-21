## 2024-05-22 - [Event Handling Redundancy]
**Learning:** The codebase heavily utilizes inline `onclick` handlers (e.g., `onclick="renderLevel(0)"`) alongside programmatically added event listeners for accessibility (e.g., `keydown` to trigger `click()`). This dual approach creates a split in event logic.
**Action:** When optimizing or refactoring, prioritize unifying event handling (e.g., using delegation for both clicks and keyboard events) to reduce code duplication and potential sync issues, while respecting the existing inline handler pattern for now.

## 2024-05-23 - [DOM Layout Thrashing]
**Learning:** The `updateUI` function was rebuilding the entire `innerHTML` of the chaos metric display on every interaction, forcing unnecessary layout recalculations and HTML parsing.
**Action:** Identify static vs. dynamic content early. Pre-build the static HTML structure during initialization and cache references to dynamic elements (e.g., `<span>`) to update only their `textContent` or classes in the render loop.
