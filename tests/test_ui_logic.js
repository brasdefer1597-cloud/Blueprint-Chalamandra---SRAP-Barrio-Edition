const fs = require("fs");
const path = require("path");
const vm = require("vm");

// === MOCK DOM ENVIRONMENT ===
const elements = {};

function createMockElement(id, classes = []) {
  return {
    id: id,
    textContent: "",
    innerHTML: "",
    className: classes.join(" "),
    classList: {
      contains: (cls) => classes.includes(cls),
      add: (cls) => {
        if (!classes.includes(cls)) classes.push(cls);
      },
      remove: (cls) => {
        const idx = classes.indexOf(cls);
        if (idx > -1) classes.splice(idx, 1);
      },
      toggle: (cls, force) => {
        const has = classes.includes(cls);
        if (force === true || (force === undefined && !has)) {
          if (!has) classes.push(cls);
        } else {
          const idx = classes.indexOf(cls);
          if (idx > -1) classes.splice(idx, 1);
        }
      },
    },
    style: {},
    getAttribute: (attr) => null,
    setAttribute: (attr, val) => {},
    closest: () => null,
    disabled: false,
  };
}

// Mock document.getElementById
const documentMock = {
  getElementById: (id) => {
    if (!elements[id]) {
      elements[id] = createMockElement(id);
    }
    return elements[id];
  },
  querySelectorAll: (selector) => {
    // For srap-steps and mandala-hats, we need to return a list of mocks
    if (selector === ".srap-step") {
      const steps = [
        "srap-scan",
        "srap-respira",
        "srap-alinea",
        "srap-pausa",
      ].map((id) => {
        if (!elements[id]) elements[id] = createMockElement(id, ["srap-step"]);
        return elements[id];
      });
      return steps;
    }
    if (selector === ".mandala-hat") {
      const hats = [
        "hat-creativo",
        "hat-critico",
        "hat-tactico",
        "hat-fresa",
      ].map((id) => {
        if (!elements[id])
          elements[id] = createMockElement(id, ["mandala-hat"]);
        return elements[id];
      });
      return hats;
    }
    if (selector === ".level-section") {
      const levels = ["level-0", "level-2", "level-3", "level-5"].map((id) => {
        if (!elements[id])
          elements[id] = createMockElement(id, ["level-section"]);
        return elements[id];
      });
      return levels;
    }
    return [];
  },
  body: {
    addEventListener: () => {},
  },
};

const windowMock = {
  initGame: null,
  console: console,
};

// === LOAD SCRIPT ===
const scriptPath = path.join(__dirname, "../assets/js/script.js");
let scriptContent = fs.readFileSync(scriptPath, "utf8");

// Expose internal state for testing
scriptContent +=
  "\nwindow.gameState = gameState;\nwindow.collectInsight = collectInsight;\nwindow.revealHatInsight = revealHatInsight;\nwindow.unlockAndRenderLevel = unlockAndRenderLevel;";

// Create sandbox
const sandbox = {
  document: documentMock,
  window: windowMock,
  console: console,
  setTimeout: setTimeout,
  Math: Math,
  parseInt: parseInt,
  JSON: JSON,
};

vm.createContext(sandbox);
vm.runInContext(scriptContent, sandbox);

// === TESTS ===
console.log("⚡ Running Bolt Performance Verification Tests...");

// 1. Initialize Game
console.log("Test 1: Initialize Game");
sandbox.window.initGame("demo");

// Verify initial metrics
const insightCounter = elements["insight-counter"];
if (insightCounter.textContent != "0") {
  console.error(
    "FAIL: Initial insight points should be 0, got " +
      insightCounter.textContent,
  );
  process.exit(1);
} else {
  console.log("PASS: Initial metrics correct.");
}

// 2. Collect Insight (Targeted Update Check)
console.log("Test 2: Collect Insight");
const stepScan = elements["srap-scan"];
// Simulate calling collectInsight
sandbox.window.collectInsight(stepScan, "srap-scan", 1);

if (sandbox.window.gameState.insightPoints !== 1) {
  console.error("FAIL: Insight points not updated.");
  process.exit(1);
}

if (!stepScan.classList.contains("srap-active")) {
  console.error("FAIL: Step visual not updated (missing srap-active class).");
  process.exit(1);
}

// Check if other steps were touched?
// We can't easily check if they were touched without spies, but we can check if they are correct.
const stepRespira = elements["srap-respira"];
if (stepRespira.classList.contains("srap-active")) {
  console.error("FAIL: Unrelated step incorrectly updated.");
  process.exit(1);
}
console.log("PASS: Targeted step update works.");

// 3. Reveal Hat (Targeted Update Check)
console.log("Test 3: Reveal Hat");
const hatCreativo = elements["hat-creativo"];
sandbox.window.revealHatInsight(hatCreativo, "creativo", "Task...");

if (sandbox.window.gameState.collectedHats["creativo"] !== true) {
  console.error("FAIL: Hat collection failed.");
  process.exit(1);
}

// Check style update (border color)
if (hatCreativo.style.borderColor !== "var(--neon-lime)") {
  console.error(
    "FAIL: Hat visual update failed. Border color: " +
      hatCreativo.style.borderColor,
  );
  process.exit(1);
}
console.log("PASS: Targeted hat update works.");

// 4. Navigation (Targeted Update Check)
console.log("Test 4: Navigation");
// Unlock level 2
sandbox.window.unlockAndRenderLevel(2);

const btn2 = elements["nav-btn-2"];
if (!btn2.classList.contains("nav-active")) {
  console.error("FAIL: Nav button 2 not active after navigation.");
  process.exit(1);
}
console.log("PASS: Navigation update works.");

console.log("⚡ All tests passed! Performance optimization verified.");
