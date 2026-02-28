const fs = require('fs');
const path = require('path');
const vm = require('vm');

// Simple DOM Mocking
class DOMTokenList {
    constructor() {
        this.tokens = new Set();
        this.addCalls = 0;
        this.removeCalls = 0;
        this.toggleCalls = 0;
    }
    add(token) {
        this.tokens.add(token);
        this.addCalls++;
    }
    remove(token) {
        this.tokens.delete(token);
        this.removeCalls++;
    }
    toggle(token, force) {
        this.toggleCalls++;
        if (force !== undefined) {
            if (force) {
                this.add(token);
            } else {
                this.remove(token);
            }
        } else {
            if (this.tokens.has(token)) {
                this.remove(token);
            } else {
                this.add(token);
            }
        }
    }
    contains(token) {
        return this.tokens.has(token);
    }
}

class HTMLElement {
    constructor(id) {
        this.id = id;
        this.classList = new DOMTokenList();
        this.style = {};
        this.textContent = '';
        this.innerHTML = '';
        this.className = '';
        this.attributes = new Map();
    }
    setAttribute(name, value) {
        this.attributes.set(name, value);
    }
    getAttribute(name) {
        return this.attributes.get(name);
    }
    closest() { return null; }
    click() {}
}

const documentMock = {
    elements: new Map(),
    getElementById: function(id) {
        if (!this.elements.has(id)) {
            this.elements.set(id, new HTMLElement(id));
        }
        return this.elements.get(id);
    },
    querySelectorAll: function(selector) {
        // Return dummy arrays for querySelectorAll
        if (selector === ".srap-step" || selector === ".mandala-hat") {
            return [];
        }
        return [];
    },
    body: {
        addEventListener: function() {}
    }
};

const windowMock = {
    console: console,
};

// Expose variables for tracking
let domCallsTracker = {
    classListAddCalls: 0
};

// Initialize specific elements expected by the script
[0, 2, 3, 5].forEach(level => documentMock.getElementById(`level-${level}`));
documentMock.getElementById('main-title');
documentMock.getElementById('insight-counter');
documentMock.getElementById('chaos-metric-display');
documentMock.getElementById('metric-disaster');
documentMock.getElementById('metric-flow');
documentMock.getElementById('custom-modal');
documentMock.getElementById('modal-title');
documentMock.getElementById('modal-message');

const context = vm.createContext({
    document: documentMock,
    window: windowMock,
    console: console,
    Math: Math,
    parseInt: parseInt,
    Object: Object,
    JSON: JSON,
    domCallsTracker: domCallsTracker
});

const scriptContent = fs.readFileSync(path.join(__dirname, '../assets/js/script.js'), 'utf8');

// Run the script to attach to context and capture gameState
const scriptContentWithExports = scriptContent + `
    // Attach to context window explicitly for testing
    window.gameState = gameState;
    window.renderLevel = renderLevel;
`;

// Compile and run the script
const script = new vm.Script(scriptContentWithExports);
script.runInContext(context);

// Track classList.add specifically for 'hidden' on level sections
function trackAddHiddenCalls() {
    let addHiddenCount = 0;
    documentMock.elements.forEach((el, id) => {
        if (id.startsWith('level-')) {
            addHiddenCount += el.classList.addCalls;
        }
    });
    return addHiddenCount;
}

// Start simulation
console.log("Initializing Game...");
context.window.initGame('full');

// Clear initial calls
documentMock.elements.forEach(el => {
    el.classList.addCalls = 0;
    el.classList.removeCalls = 0;
});

console.log("Simulating level transitions to test renderLevel O(1) performance...");

// Unlock a level
context.window.gameState.unlockedLevels[2] = true;

// Transition to level 2
let initialAddHiddenCount = trackAddHiddenCalls();
context.window.renderLevel(2);
let currentAddHiddenCount = trackAddHiddenCalls();

let newAddHiddenCalls = currentAddHiddenCount - initialAddHiddenCount;
console.log(`classList.add('hidden') calls on level sections during renderLevel(2): ${newAddHiddenCalls}`);

if (newAddHiddenCalls > 1) {
    console.error(`❌ Performance Verification Failed. Expected 1 or 0 classList.add('hidden') calls for O(1) rendering, but got ${newAddHiddenCalls}. This indicates O(N) iteration is still occurring.`);
    process.exit(1);
} else {
    console.log(`✅ Performance Verification Passed. renderLevel uses O(1) DOM updates.`);
}

console.log("All tests passed.");
