## 2024-05-22 - [Event Handling Redundancy]

**Learning:** The codebase heavily utilizes inline `onclick` handlers (e.g., `onclick="renderLevel(0)"`) alongside programmatically added event listeners for accessibility (e.g., `keydown` to trigger `click()`). This dual approach creates a split in event logic.
**Action:** When optimizing or refactoring, prioritize unifying event handling (e.g., using delegation for both clicks and keyboard events) to reduce code duplication and potential sync issues, while respecting the existing inline handler pattern for now.

## 2024-05-23 - [DOM Manipulation Overhead]
**Learning:** The `updateUI` function was reconstructing the entire `innerHTML` of the chaos metric display on every interaction, causing unnecessary parsing and layout thrashing, even for small number updates.
**Action:** Implemented a targeted update pattern using `textContent` on specific cached child elements (`<span>`), reducing the browser's workload during the game loop.
