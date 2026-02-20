## 2024-05-22 - [Event Handling Redundancy]
**Learning:** The codebase heavily utilizes inline `onclick` handlers (e.g., `onclick="renderLevel(0)"`) alongside programmatically added event listeners for accessibility (e.g., `keydown` to trigger `click()`). This dual approach creates a split in event logic.
**Action:** When optimizing or refactoring, prioritize unifying event handling (e.g., using delegation for both clicks and keyboard events) to reduce code duplication and potential sync issues, while respecting the existing inline handler pattern for now.

## 2024-05-22 - [DOM Updates Performance]
**Learning:** High-frequency UI updates were using `innerHTML` on a parent container to update multiple child values. This causes unnecessary parsing and layout thrashing, especially when only text content changes.
**Action:** Replace `innerHTML` with `textContent` on cached child elements (`span`) for dynamic values. This avoids re-parsing HTML and improves rendering performance, particularly in the main game loop (`updateUI`).
