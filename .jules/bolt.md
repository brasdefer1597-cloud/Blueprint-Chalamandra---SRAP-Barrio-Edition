## 2024-05-22 - DOM Query Optimization
**Learning:** In vanilla JS applications with frequent UI updates (like `updateUI`), repeated `document.querySelectorAll` calls inside the loop can accumulate overhead, especially if the DOM structure is static.
**Action:** Always cache static DOM element collections (NodeLists) at the initialization phase and reuse them in render loops.
