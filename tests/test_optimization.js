const fs = require('fs');
const path = require('path');
const vm = require('vm');

const scriptPath = path.join(__dirname, '../assets/js/script.js');
const scriptContent = fs.readFileSync(scriptPath, 'utf8');

// --- Mocking Infrastructure ---

function createSpy(name) {
    const spy = (...args) => {
        spy.calls.push(args);
        spy.count++;
    };
    spy.calls = [];
    spy.count = 0;
    spy.spyName = name;
    return spy;
}

const elements = {};

function getOrCreateElement(id) {
    if (!elements[id]) {
        elements[id] = {
            id: id,
            classList: {
                add: createSpy(`classList.add for ${id}`),
                remove: createSpy(`classList.remove for ${id}`),
                toggle: createSpy(`classList.toggle for ${id}`),
                contains: () => false
            },
            style: {},
            textContent: '',
            innerHTML: '',
            addEventListener: () => {},
            getAttribute: () => '',
            setAttribute: () => {},
            click: () => {},
            disabled: false
        };
    }
    return elements[id];
}

// Pre-create level elements to ensure querySelectorAll finds them
['level-0', 'level-2', 'level-3', 'level-5'].forEach(id => getOrCreateElement(id));

const mockDocument = {
    getElementById: (id) => getOrCreateElement(id),
    querySelectorAll: (selector) => {
        if (selector === '.level-section') {
            return [
                elements['level-0'],
                elements['level-2'],
                elements['level-3'],
                elements['level-5']
            ];
        }
        if (selector === '.srap-step' || selector === '.mandala-hat' || selector === '.chaos-ritual') {
            return []; // Return empty for these to avoid errors
        }
        return [];
    },
    body: {
        addEventListener: () => {}
    }
};

const mockWindow = {
    document: mockDocument,
    console: { log: () => {} }, // Silence logs
    parseInt: parseInt,
    Math: Math,
    Object: Object,
    JSON: JSON
};
mockWindow.window = mockWindow; // Self-reference

// --- Execute Script ---
console.log("Loading script...");
vm.createContext(mockWindow);
vm.runInContext(scriptContent, mockWindow);

// --- Test Logic ---

console.log("Initializing Game...");
// Reset spies after initial load (which calls renderLevel(0))
['level-0', 'level-2', 'level-3', 'level-5'].forEach(id => {
    elements[id].classList.add.calls = [];
    elements[id].classList.add.count = 0;
    elements[id].classList.remove.calls = [];
    elements[id].classList.remove.count = 0;
});

// We need to initialize game state.
// script.js sets `gameState` globally.
// We can access it via `mockWindow.gameState` ONLY IF it was assigned to window.
// BUT `const gameState` is not attached to window automatically in vm context unless explicit.
// However, `renderLevel` is a global function in script scope, so `mockWindow.renderLevel` handles it.
// Wait, `const renderLevel = ...` or `function renderLevel`?
// `function renderLevel` is hoisted to global object in non-strict mode or script mode?
// In Node vm, top-level vars declared with `const`/`let` are NOT added to the global object.
// But `function renderLevel` IS added if using `runInContext`? No, it depends.
// Let's check script content.
// `function renderLevel(level) { ... }`
// This should be available.

// Issue: `const gameState` is not available on `mockWindow`.
// But `renderLevel` closes over it. So calling `renderLevel` works.
// BUT to verify the optimization, I need to know `gameState.currentLevel`.
// Or just observe side effects.
// I can execute `renderLevel(2)` via `vm.runInContext('renderLevel(2)', mockWindow)`.

console.log("Unlocking Level 2...");
vm.runInContext('gameState.unlockedLevels[2] = true;', mockWindow);

console.log("Calling renderLevel(2)...");
vm.runInContext('renderLevel(2)', mockWindow);

// Analyze Calls
let totalAddHiddenCalls = 0;
let levelsHidden = [];

['level-0', 'level-2', 'level-3', 'level-5'].forEach(id => {
    const addCalls = elements[id].classList.add.calls.filter(args => args[0] === 'hidden');
    totalAddHiddenCalls += addCalls.length;
    if (addCalls.length > 0) levelsHidden.push(id);
});

console.log(`Total 'classList.add("hidden")' calls: ${totalAddHiddenCalls}`);
console.log(`Levels hidden: ${levelsHidden.join(', ')}`);

// Correctness Check
// Level 0 should be hidden (it was current)
// Level 2 should be shown (it is new)
// Level 2 should NOT be hidden (or hidden then shown in loop logic)

const level0Hidden = elements['level-0'].classList.add.calls.some(args => args[0] === 'hidden');
const level2Shown = elements['level-2'].classList.remove.calls.some(args => args[0] === 'hidden');

if (level0Hidden && level2Shown) {
    console.log("VERIFICATION: Visibility logic CORRECT.");
} else {
    console.error("VERIFICATION: Visibility logic FAILED.");
    console.error(`Level 0 hidden? ${level0Hidden}`);
    console.error(`Level 2 shown? ${level2Shown}`);
    process.exit(1);
}

// Performance Check
// Baseline: Loops 4 times -> 4 calls to add('hidden').
// Optimized: Hides 1 time -> 1 call to add('hidden').

if (totalAddHiddenCalls >= 4) {
    console.log("PERFORMANCE: Baseline O(N) behavior detected.");
} else if (totalAddHiddenCalls === 1) {
    console.log("PERFORMANCE: Optimized O(1) behavior detected.");
} else {
    console.log(`PERFORMANCE: Unknown behavior (calls=${totalAddHiddenCalls}).`);
}
