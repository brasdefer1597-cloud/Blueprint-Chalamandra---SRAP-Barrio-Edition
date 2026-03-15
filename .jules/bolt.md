## 2024-05-24 - Unnecessary DOM writes in updateScores
**Learning:** `updateScores` repeatedly writes to the DOM (updating textContent and className) even when the values haven't changed, causing unnecessary reflows/repaints.
**Action:** Implement "dirty checking" by introducing a `lastRenderedState` object to cache the currently rendered values in JavaScript, only writing to the DOM when actual changes occur.
