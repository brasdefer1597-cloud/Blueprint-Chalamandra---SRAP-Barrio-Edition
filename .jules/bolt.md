## 2024-05-22 - [Event Handling Redundancy]

**Learning:** The codebase heavily utilizes inline `onclick` handlers (e.g., `onclick="renderLevel(0)"`) alongside programmatically added event listeners for accessibility (e.g., `keydown` to trigger `click()`). This dual approach creates a split in event logic.
**Action:** When optimizing or refactoring, prioritize unifying event handling (e.g., using delegation for both clicks and keyboard events) to reduce code duplication and potential sync issues, while respecting the existing inline handler pattern for now.

## 2024-05-22 - [DOM Manipulation Efficiency]

**Learning:** Frequent UI updates using `innerHTML` on static containers (like `#chaos-metric-display`) force unnecessary re-parsing and layout thrashing.
**Action:** For high-frequency updates, use static HTML structures with specific ID targets (e.g., `<span id="metric-val">`) and update `textContent` and `className` directly. This preserves the DOM tree and improves rendering performance.

## 2026-02-26 - [DOM Access Optimization]

**Learning:** Storing a global `NodeList` (e.g., `levelSections`) solely for iterating to "reset" visibility (O(N)) is inefficient and consumes memory. Tracking state (e.g., `currentLevel`) allows O(1) targeted updates.
**Action:** Replace "hide all, show one" patterns with "hide previous, show current" logic using specific IDs. Remove unused global DOM references to free memory.
