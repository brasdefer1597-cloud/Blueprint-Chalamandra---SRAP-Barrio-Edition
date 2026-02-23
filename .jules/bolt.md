## 2024-05-22 - [Event Handling Redundancy]

**Learning:** The codebase heavily utilizes inline `onclick` handlers (e.g., `onclick="renderLevel(0)"`) alongside programmatically added event listeners for accessibility (e.g., `keydown` to trigger `click()`). This dual approach creates a split in event logic.
**Action:** When optimizing or refactoring, prioritize unifying event handling (e.g., using delegation for both clicks and keyboard events) to reduce code duplication and potential sync issues, while respecting the existing inline handler pattern for now.

## 2024-05-22 - [DOM Manipulation Efficiency]

**Learning:** Frequent UI updates using `innerHTML` on static containers (like `#chaos-metric-display`) force unnecessary re-parsing and layout thrashing.
**Action:** For high-frequency updates, use static HTML structures with specific ID targets (e.g., `<span id="metric-val">`) and update `textContent` and `className` directly. This preserves the DOM tree and improves rendering performance.
## 2026-02-23 - [Visibility Toggling Complexity]
**Learning:** The `renderLevel` function iterated over all section elements (O(N)) to hide them on every navigation event, regardless of N size. This creates unnecessary DOM writes and layout recalculations.
**Action:** Implement O(1) state management for mutually exclusive UI sections by tracking the `previousState` and targeting only the relevant elements for `hidden` class toggling. This scales better and reduces layout thrashing.
