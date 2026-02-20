## 2024-05-22 - [Event Handling Redundancy]

**Learning:** The codebase heavily utilizes inline `onclick` handlers (e.g., `onclick="renderLevel(0)"`) alongside programmatically added event listeners for accessibility (e.g., `keydown` to trigger `click()`). This dual approach creates a split in event logic.
**Action:** When optimizing or refactoring, prioritize unifying event handling (e.g., using delegation for both clicks and keyboard events) to reduce code duplication and potential sync issues, while respecting the existing inline handler pattern for now.

## 2024-05-22 - [Duplicate DOM Structures]
**Learning:** The application relies on separate HTML files (`demo/index.html`, `full/index.html`) that share identical UI components like the chaos metric display. Optimizations to shared UI logic in `script.js` require modifying all HTML entry points to prevent breakage.
**Action:** Always grep for component IDs across all HTML files when refactoring shared JavaScript logic to ensure consistent DOM structure.
