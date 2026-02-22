## 2024-05-22 - [Event Handling Redundancy]

**Learning:** The codebase heavily utilizes inline `onclick` handlers (e.g., `onclick="renderLevel(0)"`) alongside programmatically added event listeners for accessibility (e.g., `keydown` to trigger `click()`). This dual approach creates a split in event logic.
**Action:** When optimizing or refactoring, prioritize unifying event handling (e.g., using delegation for both clicks and keyboard events) to reduce code duplication and potential sync issues, while respecting the existing inline handler pattern for now.

## 2024-05-22 - [DOM Manipulation Efficiency]

**Learning:** Frequent UI updates using `innerHTML` on static containers (like `#chaos-metric-display`) force unnecessary re-parsing and layout thrashing.
**Action:** For high-frequency updates, use static HTML structures with specific ID targets (e.g., `<span id="metric-val">`) and update `textContent` and `className` directly. This preserves the DOM tree and improves rendering performance.

## 2024-05-23 - [O(1) Navigation Logic]

**Learning:** Iterating over all `level-section` elements to hide them on every navigation is O(N) and creates unnecessary DOM operations.
**Action:** Use targeted ID lookups (e.g., `previousSection` and `activeSection`) to only toggle the visibility of the elements that actually change state, reducing layout invalidations.

## 2024-05-23 - [DOM Read-Before-Write]

**Learning:** Blindly setting `classList.add` or `style.cursor` in frequent update loops (like `updateUI`) causes redundant style calculations.
**Action:** Always check the current state (e.g., `classList.contains`) before applying changes. This "guard clause" prevents the browser from invalidating the layout if the state hasn't changed.
