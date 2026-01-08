# Pull Request: Chalamandra Magistral - Final Release

## Summary
This Pull Request finalizes the "Chalamandra Magistral" project refactor. It transforms the repository into a lightweight, static web application with a structured architecture, removing all build tool dependencies and integrating monetization.

## Changes

### 1. Architecture & Structure
- **Root Cleanup:** Removed `package.json`, `node_modules`, and build configs. The project is now 100% Vanilla JS + Tailwind CDN.
- **Folder Organization:**
  - `assets/`: Shared resources (JS logic, CSS styles).
  - `docs/`: Demo version (renamed from `demo` for GitHub Pages compatibility).
  - `full/`: Complete training version.
- **Routing:** Added `vercel.json` to route the root URL (`/`) to `/docs/index.html`.

### 2. Features
- **Monetization:** Integrated the official **Buy Me a Coffee** widget.
  - Position: Fixed, Bottom-Right (`z-index: 9999`).
  - Scope: Present in both `docs/` and `full/` versions.
- **Documentation:**
  - `README.md`: Updated with clear instructions in Spanish.
  - `QA_CHECKLIST.md`: Added visual QA steps for UX and performance.

### 3. Logic Refactor
- Extracted inline styles and scripts from the monolithic `index.html` into `assets/css/styles.css` and `assets/js/script.js`.
- Implemented modular rendering for levels (Demo vs. Full).

## Verification
- **Automated Tests:** Playwright script (`verify.py`) executed successfully.
  - Screenshots generated for `docs/` and `full/` pages confirming widget visibility.
- **Manual QA:** Visual inspection of screenshots confirms:
  - Neon styling is intact.
  - "Buy Me a Coffee" button appears correctly in the bottom-right corner.
  - Navigation elements are rendered.

## Deployment
- Ready for deployment on **Vercel** (configuration included) or **GitHub Pages** (via `docs/` folder).

---
*Ready for merge to main.*
