## 2024-05-22 - [Event Handling Redundancy]

**Learning:** The codebase heavily utilizes inline `onclick` handlers (e.g., `onclick="renderLevel(0)"`) alongside programmatically added event listeners for accessibility (e.g., `keydown` to trigger `click()`). This dual approach creates a split in event logic.
**Action:** When optimizing or refactoring, prioritize unifying event handling (e.g., using delegation for both clicks and keyboard events) to reduce code duplication and potential sync issues, while respecting the existing inline handler pattern for now.

## 2024-05-22 - [DOM Manipulation Efficiency]

**Learning:** Frequent UI updates using `innerHTML` on static containers (like `#chaos-metric-display`) force unnecessary re-parsing and layout thrashing.
**Action:** For high-frequency updates, use static HTML structures with specific ID targets (e.g., `<span id="metric-val">`) and update `textContent` and `className` directly. This preserves the DOM tree and improves rendering performance.

## 2024-05-23 - [Array Equality Comparison Serialization]

**Learning:** Using `JSON.stringify` to compare arrays (`JSON.stringify(lastThree) === JSON.stringify(requiredSequence)`) in game logic loops or frequently checked conditions causes unnecessary string serialization and memory allocation overhead.
**Action:** Replace `JSON.stringify` and `slice(-n)` calls with direct bounded array index checks (e.g., `arr[len - 3] === expected[0] && arr[len - 2] === expected[1] && arr[len - 1] === expected[2]`) to change algorithm complexity from O(N) memory allocation to an O(1) constant-time string comparison.
