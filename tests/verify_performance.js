const fs = require('fs');
const path = require('path');
const vm = require('vm');

const scriptContent = fs.readFileSync(path.join(__dirname, '../assets/js/script.js'), 'utf-8');

// Simple DOM Mock specifically tracking assignments
let domManipulationCount = 0;

class DOMTokenList {
    constructor() {
        this.classes = new Set();
    }
    add(cls) {
        domManipulationCount++;
        this.classes.add(cls);
    }
    remove(cls) {
        domManipulationCount++;
        this.classes.delete(cls);
    }
    contains(cls) {
        return this.classes.has(cls);
    }
    toggle(cls, force) {
        domManipulationCount++;
        if (force === true) this.classes.add(cls);
        else if (force === false) this.classes.delete(cls);
        else if (this.classes.has(cls)) this.classes.delete(cls);
        else this.classes.add(cls);
    }
}

class CSSStyleDeclaration {
    constructor() {
        this._styles = {};
    }
    get borderColor() { return this._styles.borderColor || ''; }
    set borderColor(val) { domManipulationCount++; this._styles.borderColor = val; }
    get cursor() { return this._styles.cursor || ''; }
    set cursor(val) { domManipulationCount++; this._styles.cursor = val; }
}

class MockElement {
    constructor(id) {
        this.id = id;
        this.classList = new DOMTokenList();
        this.style = new CSSStyleDeclaration();
        this._textContent = '';
        this._className = '';
        this._disabled = false;
        this._attributes = {};
    }
    get textContent() { return this._textContent; }
    set textContent(val) { domManipulationCount++; this._textContent = val; }
    get className() { return this._className; }
    set className(val) { domManipulationCount++; this._className = val; }
    get disabled() { return this._disabled; }
    set disabled(val) { domManipulationCount++; this._disabled = val; }

    setAttribute(key, val) { this._attributes[key] = val; }
    getAttribute(key) { return this._attributes[key]; }
    closest() { return this; }
}

const mockDoc = {
    querySelectorAll: (selector) => {
        if (selector === ".level-section") return [new MockElement('level-0'), new MockElement('level-2'), new MockElement('level-3'), new MockElement('level-5')];
        if (selector === ".srap-step") return [new MockElement('srap-scan'), new MockElement('srap-respira'), new MockElement('srap-alinea'), new MockElement('srap-pausa')];
        if (selector === ".mandala-hat") return [new MockElement('hat-creativo'), new MockElement('hat-critico'), new MockElement('hat-tactico'), new MockElement('hat-fresa')];
        if (selector.includes(',')) return [new MockElement('mock')];
        return [];
    },
    getElementById: (id) => new MockElement(id),
    body: {
        addEventListener: () => {}
    }
};

const sandbox = {
    document: mockDoc,
    window: {},
    console: console,
    Math: Math,
    parseInt: parseInt,
    Object: Object,
    Boolean: Boolean,
    JSON: JSON,
    String: String
};

vm.createContext(sandbox);
vm.runInContext(scriptContent, sandbox);

// Run initial updateUI
sandbox.domManipulationCount = 0;
vm.runInContext('updateUI()', sandbox);
console.log('DOM mutations on first updateUI:', domManipulationCount);

// Run updateUI again WITHOUT changing state
domManipulationCount = 0;
vm.runInContext('updateUI()', sandbox);
console.log('DOM mutations on redundant updateUI (should be 0):', domManipulationCount);

// Run updateUI with small state change
domManipulationCount = 0;
vm.runInContext('gameState.insightPoints += 1; updateUI()', sandbox);
console.log('DOM mutations on small update (should be small):', domManipulationCount);

if (domManipulationCount < 5) {
    console.log('✅ Optimization verified! DOM manipulations are minimized.');
} else {
    console.log('❌ Optimization failed. Too many DOM manipulations:', domManipulationCount);
    process.exit(1);
}
