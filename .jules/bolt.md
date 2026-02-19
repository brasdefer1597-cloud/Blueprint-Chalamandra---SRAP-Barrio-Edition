## 2024-05-22 - [Event Handling Redundancy]

**Learning:** The codebase heavily utilizes inline `onclick` handlers (e.g., `onclick="renderLevel(0)"`) alongside programmatically added event listeners for accessibility (e.g., `keydown` to trigger `click()`). This dual approach creates a split in event logic.
**Action:** When optimizing or refactoring, prioritize unifying event handling (e.g., using delegation for both clicks and keyboard events) to reduce code duplication and potential sync issues, while respecting the existing inline handler pattern for now.

## 2026-02-19 - [DOM Update Efficiency]

**Learning:** The application updates UI metrics (Chaos/Insight) on every user interaction. Using `innerHTML` to update these metrics was causing unnecessary HTML parsing and layout thrashing, especially since the structure was static.
**Action:** Replaced `innerHTML` with targeted `textContent` updates on cached `<span>` elements. This pattern should be used for all high-frequency UI updates to improve performance and reduce memory churn.
