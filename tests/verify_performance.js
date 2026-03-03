const fs = require('fs');
const vm = require('vm');

// Mock DOM
let textContentAssignments = 0;
let styleAssignments = 0;
let classListAssignments = 0;

class DOMTokenList {
    constructor() {
        this.tokens = new Set();
    }
    add(token) { this.tokens.add(token); classListAssignments++; }
    remove(token) { this.tokens.delete(token); classListAssignments++; }
    toggle(token, force) {
        if (force !== undefined) {
            if (force) this.tokens.add(token);
            else this.tokens.delete(token);
        } else {
            if (this.tokens.has(token)) this.tokens.delete(token);
            else this.tokens.add(token);
        }
        classListAssignments++;
    }
    contains(token) { return this.tokens.has(token); }
}

class HTMLElement {
    constructor(id) {
        this.id = id || '';
        this._textContent = '';
        this._className = '';
        this.classList = new DOMTokenList();
        this._style = {};
        this._disabled = false;
    }

    get textContent() { return this._textContent; }
    set textContent(val) { textContentAssignments++; this._textContent = String(val); }

    get className() { return this._className; }
    set className(val) { classListAssignments++; this._className = String(val); }

    get style() {
        return new Proxy(this._style, {
            set: (target, prop, value) => {
                styleAssignments++;
                target[prop] = value;
                return true;
            },
            get: (target, prop) => {
                return target[prop] || '';
            }
        });
    }

    get disabled() { return this._disabled; }
    set disabled(val) { this._disabled = val; }

    setAttribute() {}
}

const mockDocument = {
    getElementById: (id) => new HTMLElement(id),
    querySelectorAll: (selector) => {
        if (selector === '.level-section') return [new HTMLElement('level-0')];
        if (selector === '.srap-step') return [new HTMLElement('step-1'), new HTMLElement('step-2')];
        if (selector === '.mandala-hat') return [new HTMLElement('hat-creativo')];
        return [new HTMLElement()];
    },
    body: {
        addEventListener: () => {}
    }
};

const scriptCode = fs.readFileSync('assets/js/script.js', 'utf8');

const context = vm.createContext({
    document: mockDocument,
    window: {},
    console: { log: () => {} }
});

vm.runInContext(scriptCode, context);

// Test updateUI calling Multiple Times without State Changes
textContentAssignments = 0;
styleAssignments = 0;
classListAssignments = 0;

vm.runInContext('updateUI()', context);
const initialText = textContentAssignments;
const initialStyle = styleAssignments;

// Second time, state hasn't changed
vm.runInContext('updateUI()', context);
const diffText = textContentAssignments - initialText;
const diffStyle = styleAssignments - initialStyle;

console.log('--- Performance Test Results ---');
console.log(`DOM Assignments on redundant updateUI() call:`);
console.log(`TextContent writes: ${diffText}`);
console.log(`Style writes: ${diffStyle}`);

if (diffText === 0 && diffStyle === 0) {
    console.log('✅ Optimization successful! Zero redundant DOM modifications.');
} else {
    console.log('❌ Redundant DOM modifications detected.');
}
