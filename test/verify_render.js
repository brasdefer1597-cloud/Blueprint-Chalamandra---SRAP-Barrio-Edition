const fs = require('fs');
const path = require('path');

// --- Mock DOM ---
const levelStates = {
  "level-0": new Set(["hidden"]),
  "level-2": new Set(["hidden"]),
  "level-3": new Set(["hidden"]),
  "level-5": new Set(["hidden"]),
  "srap-scan": new Set() // Example step
};

// Mock HTMLElement
class MockElement {
  constructor(id) {
    this.id = id;
    this.style = {};
  }

  // Simplified classList mock
  get classList() {
    const id = this.id;
    const methods = {
      add: (cls) => {
        if (!levelStates[id]) levelStates[id] = new Set();
        levelStates[id].add(cls);
      },
      remove: (cls) => {
        if (levelStates[id]) levelStates[id].delete(cls);
      },
      contains: (cls) => {
        return levelStates[id] ? levelStates[id].has(cls) : false;
      },
      toggle: (cls, force) => {
        const has = methods.contains(cls);
        const shouldAdd = force !== undefined ? force : !has;
        if (shouldAdd) methods.add(cls);
        else methods.remove(cls);
      }
    };
    return methods;
  }
}

// Mock document
global.document = {
  getElementById: (id) => {
    return new MockElement(id);
  },
  querySelectorAll: (selector) => {
    if (selector === ".level-section") {
      return [
        new MockElement("level-0"),
        new MockElement("level-2"),
        new MockElement("level-3"),
        new MockElement("level-5")
      ];
    }
    if (selector === ".srap-step") {
        return [ new MockElement("srap-scan") ];
    }
    if (selector === ".mandala-hat") return [];
    return [];
  },
  body: {
    addEventListener: () => {}
  }
};
global.window = {};

// --- Load Script ---
const scriptPath = path.join(__dirname, '../assets/js/script.js');
let scriptContent = fs.readFileSync(scriptPath, 'utf8');

// Append exposure logic
scriptContent += `
;
window.gameState = gameState;
window.renderLevel = renderLevel;
window.unlockAndRenderLevel = unlockAndRenderLevel;
`;

try {
  (function() {
    eval(scriptContent);
  })();
  console.log("Script loaded successfully.");
} catch (e) {
  console.error("Error loading script:", e);
  process.exit(1);
}

// Access exposed globals
const { gameState, renderLevel, unlockAndRenderLevel, initGame } = window;

if (!renderLevel) {
  console.error("Error: renderLevel not exposed to window.");
  process.exit(1);
}

// --- Verification Logic ---

function assert(condition, message) {
  if (!condition) {
    console.error(`❌ Assertion Failed: ${message}`);
    console.error("Current Level States:", JSON.stringify(levelStates, (key, value) => {
        if (value instanceof Set) return [...value];
        return value;
    }, 2));
    process.exit(1);
  } else {
    console.log(`✅ ${message}`);
  }
}

function isHidden(levelId) {
  const s = levelStates[levelId];
  return s && s.has("hidden");
}

console.log("\n--- Testing renderLevel ---");

// 1. Init
initGame('demo');

assert(!isHidden("level-0"), "Level 0 should be visible (not hidden) after init");
assert(isHidden("level-2"), "Level 2 should be hidden after init");

// 2. Change to Level 2
console.log("-> renderLevel(2)");
gameState.unlockedLevels[2] = true;
renderLevel(2);

assert(isHidden("level-0"), "Level 0 should be hidden after switching to Level 2");
assert(!isHidden("level-2"), "Level 2 should be visible after switching to Level 2");

// 3. Change back to Level 0
console.log("-> renderLevel(0)");
renderLevel(0);

assert(!isHidden("level-0"), "Level 0 should be visible after switching back");
assert(isHidden("level-2"), "Level 2 should be hidden after switching back");

// 4. Idempotency
console.log("-> renderLevel(0) again");
renderLevel(0);
assert(!isHidden("level-0"), "Level 0 should still be visible");

console.log("\n--- Testing updateUI Optimization ---");
// Simulate step collection
gameState.collectedSteps['srap-scan'] = true;
// Trigger UI update (via renderLevel or manually if we exposed updateUI, but renderLevel calls it)
renderLevel(0); // calls updateUI

const stepState = levelStates['srap-scan'];
assert(stepState && stepState.has('srap-active'), "Step should have srap-active class");

// Simulate un-collection (not possible in game but possible in state)
gameState.collectedSteps['srap-scan'] = false;
renderLevel(0);
assert(stepState && !stepState.has('srap-active'), "Step should NOT have srap-active class");


console.log("\nAll tests passed!");
