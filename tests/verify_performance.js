const fs = require('fs');
const vm = require('vm');

const scriptCode = fs.readFileSync('assets/js/script.js', 'utf8');

let domWriteCounts = {
    insightCounterContent: 0,
    metricDisasterContent: 0,
    metricFlowContent: 0,
    metricFlowClass: 0,
};

function resetCounts() {
    domWriteCounts = {
        insightCounterContent: 0,
        metricDisasterContent: 0,
        metricFlowContent: 0,
        metricFlowClass: 0,
    };
}

class MockElement {
    constructor(id) {
        this.id = id;
        this._textContent = "";
        this._className = "";
        this.classList = {
            add: () => {},
            remove: () => {},
            toggle: () => {},
            contains: () => false
        };
        this.style = {};
    }

    get textContent() {
        return this._textContent;
    }

    set textContent(val) {
        if (this.id === 'insight-counter') domWriteCounts.insightCounterContent++;
        if (this.id === 'metric-disaster') domWriteCounts.metricDisasterContent++;
        if (this.id === 'metric-flow') domWriteCounts.metricFlowContent++;
        this._textContent = String(val);
    }

    get className() {
        return this._className;
    }

    set className(val) {
        if (this.id === 'metric-flow') domWriteCounts.metricFlowClass++;
        this._className = String(val);
    }

    setAttribute() {}
    removeAttribute() {}
    addEventListener() {}
    removeEventListener() {}
    closest() { return null; }
    click() {}
}

const documentMock = {
    getElementById: (id) => new MockElement(id),
    querySelectorAll: (selector) => {
        if (selector === '.level-section' || selector === '.srap-step' || selector === '.mandala-hat' || selector.includes(',')) return [new MockElement('mock')];
        return [];
    },
    body: new MockElement('body')
};

const windowMock = {
    initGame: () => {},
    console: console,
};

const context = vm.createContext({
    document: documentMock,
    window: windowMock,
    console: console,
    Math: Math,
    parseInt: parseInt,
    Object: Object,
    JSON: JSON,
    DOMParser: class { parseFromString() { return { querySelectorAll: () => [], body: { innerHTML: "" } }; } },
});

// Run script to initialize
vm.runInContext(scriptCode, context);

// Test optimization
console.log('--- Initial updateScores call ---');
resetCounts();
vm.runInContext('updateScores()', context);
console.log('DOM writes on first call:', domWriteCounts);

console.log('--- Consecutive call (no state change) ---');
resetCounts();
vm.runInContext('updateScores()', context);
console.log('DOM writes on second call:', domWriteCounts);

if (domWriteCounts.insightCounterContent > 0 ||
    domWriteCounts.metricDisasterContent > 0 ||
    domWriteCounts.metricFlowContent > 0 ||
    domWriteCounts.metricFlowClass > 0) {
    console.error('❌ FAILED: Redundant DOM updates detected.');
    process.exit(1);
}

console.log('--- Call after state change ---');
vm.runInContext('gameState.insightPoints = 5; gameState.epicDisasterLevel = 2;', context);
resetCounts();
vm.runInContext('updateScores()', context);
console.log('DOM writes after state change:', domWriteCounts);

if (domWriteCounts.insightCounterContent === 0 ||
    domWriteCounts.metricDisasterContent === 0) {
    console.error('❌ FAILED: Expected DOM updates were skipped.');
    process.exit(1);
}

console.log('✅ PASSED: Dirty checking is working correctly.');
