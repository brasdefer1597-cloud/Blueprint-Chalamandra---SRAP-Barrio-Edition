## 2024-05-22 - [Event Handling Redundancy]

**Learning:** The codebase heavily utilizes inline `onclick` handlers (e.g., `onclick="renderLevel(0)"`) alongside programmatically added event listeners for accessibility (e.g., `keydown` to trigger `click()`). This dual approach creates a split in event logic.
**Action:** When optimizing or refactoring, prioritize unifying event handling (e.g., using delegation for both clicks and keyboard events) to reduce code duplication and potential sync issues, while respecting the existing inline handler pattern for now.

## 2024-05-22 - [DOM Manipulation Efficiency]

**Learning:** Frequent UI updates using `innerHTML` on static containers (like `#chaos-metric-display`) force unnecessary re-parsing and layout thrashing.
**Action:** For high-frequency updates, use static HTML structures with specific ID targets (e.g., `<span id="metric-val">`) and update `textContent` and `className` directly. This preserves the DOM tree and improves rendering performance.
## 2025-02-18 - [Optimization Pattern: State-Based Updates vs Full Reconciliation]
**Learning:** The application was using a full reconciliation pattern (O(N) loops in `updateUI`) to sync DOM state with game state on every interaction. For static/additive state like 'collected steps', this is unnecessary.
**Action:** Replaced O(N) loops with O(1) direct DOM updates in event handlers. Use event-driven updates for additive state changes, and state tracking (e.g., `previousLevel`) for exclusive state toggles (e.g., visible section) to avoid iterating entire collections.
