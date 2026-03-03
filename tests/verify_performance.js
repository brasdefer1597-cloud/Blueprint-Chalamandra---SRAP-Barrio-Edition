const fs = require('fs');
const vm = require('vm');

// Read script.js
const scriptCode = fs.readFileSync('assets/js/script.js', 'utf8');

// Performance tracker
let domUpdateCount = 0;
function logDomUpdate(type, elementId, value) {
  // console.log(`DOM Update [${type}] on #${elementId}: ${value}`);
  domUpdateCount++;
}

// Mock DOM classes
class ClassList {
  constructor(elementId) {
    this.classes = new Set();
    this.elementId = elementId;
  }
  add(cls) {
    if (!this.classes.has(cls)) {
      this.classes.add(cls);
    }
    // Track every call to add/remove/toggle as a potential unoptimized DOM manipulation
    // logDomUpdate('classList.add', this.elementId, cls);
    domUpdateCount++;
  }
  remove(cls) {
    if (this.classes.has(cls)) {
      this.classes.delete(cls);
    }
    // logDomUpdate('classList.remove', this.elementId, cls);
    domUpdateCount++;
  }
  toggle(cls, force) {
    const shouldAdd = force !== undefined ? force : !this.classes.has(cls);
    if (shouldAdd) {
      this.classes.add(cls);
    } else {
      this.classes.delete(cls);
    }
    // logDomUpdate('classList.toggle', this.elementId, cls);
    domUpdateCount++;
  }
  contains(cls) {
    return this.classes.has(cls);
  }
}

class Style {
  constructor(elementId) {
    this.elementId = elementId;
    this._borderColor = '';
    this._cursor = '';
  }
  get borderColor() { return this._borderColor; }
  set borderColor(val) {
    // logDomUpdate('style.borderColor', this.elementId, val);
    domUpdateCount++;
    this._borderColor = val;
  }
  get cursor() { return this._cursor; }
  set cursor(val) {
    // logDomUpdate('style.cursor', this.elementId, val);
    domUpdateCount++;
    this._cursor = val;
  }
}

class HTMLElement {
  constructor(id, tagName = 'div') {
    this.id = id;
    this.tagName = tagName;
    this.classList = new ClassList(id);
    this.style = new Style(id);
    this._textContent = '';
    this._className = '';
    this._disabled = false;
  }

  get textContent() { return this._textContent; }
  set textContent(val) {
    // logDomUpdate('textContent', this.id, val);
    domUpdateCount++;
    this._textContent = val;
  }

  get className() { return this._className; }
  set className(val) {
    // logDomUpdate('className', this.id, val);
    domUpdateCount++;
    this._className = val;
  }

  get disabled() { return this._disabled; }
  set disabled(val) {
    // logDomUpdate('disabled', this.id, val);
    domUpdateCount++;
    this._disabled = val;
  }

  setAttribute(name, val) {}
}

// Mock DOM Elements
const elements = {
  'main-title': new HTMLElement('main-title'),
  'insight-counter': new HTMLElement('insight-counter'),
  'chaos-metric-display': new HTMLElement('chaos-metric-display'),
  'metric-disaster': new HTMLElement('metric-disaster'),
  'metric-flow': new HTMLElement('metric-flow'),
  'custom-modal': new HTMLElement('custom-modal'),
  'modal-title': new HTMLElement('modal-title'),
  'modal-message': new HTMLElement('modal-message'),
  'level-0': new HTMLElement('level-0'),
  'level-2': new HTMLElement('level-2'),
  'level-3': new HTMLElement('level-3'),
  'level-5': new HTMLElement('level-5'),
  'nav-btn-0': new HTMLElement('nav-btn-0'),
  'nav-btn-2': new HTMLElement('nav-btn-2'),
  'nav-btn-3': new HTMLElement('nav-btn-3'),
  'nav-btn-5': new HTMLElement('nav-btn-5')
};

const srapSteps = [
  new HTMLElement('step-s', 'div'),
  new HTMLElement('step-r', 'div'),
  new HTMLElement('step-a', 'div'),
  new HTMLElement('step-p', 'div')
];

const mandalaHats = [
  new HTMLElement('hat-creativo', 'div'),
  new HTMLElement('hat-critico', 'div'),
  new HTMLElement('hat-tactico', 'div')
];

const levelSections = [
  elements['level-0'],
  elements['level-2'],
  elements['level-3'],
  elements['level-5']
];

// Mock Document
const documentMock = {
  getElementById: (id) => elements[id],
  querySelectorAll: (selector) => {
    if (selector === '.level-section') return levelSections;
    if (selector === '.srap-step') return srapSteps;
    if (selector === '.mandala-hat') return mandalaHats;
    if (selector === '.srap-step, .chaos-ritual, .mandala-hat') return []; // For enhanceAccessibility
    return [];
  },
  body: {
    addEventListener: () => {}
  }
};

// Mock Window
const windowMock = {};

// Create Context
const context = vm.createContext({
  document: documentMock,
  window: windowMock,
  console: console
});

// Run script
vm.runInContext(scriptCode, context);

// Test updateUI performance
console.log('--- Testing updateUI() Performance ---');

// Setup some initial state
vm.runInContext(`
  gameState.insightPoints = 10;
  gameState.epicDisasterLevel = 2;
  gameState.collectedSteps = { 'step-s': true };
  gameState.collectedHats = { 'creativo': true };
  gameState.unlockedLevels = { 0: true, 2: true, 3: false, 5: false };
  gameState.currentLevel = 2;
`, context);

// First call to updateUI() should set everything
domUpdateCount = 0;
vm.runInContext('updateUI();', context);
const initialUpdateCount = domUpdateCount;
console.log(`Initial updateUI() DOM manipulations: ${initialUpdateCount}`);

// Second consecutive call to updateUI() should NOT manipulate DOM if optimized
domUpdateCount = 0;
vm.runInContext('updateUI();', context);
const consecutiveUpdateCount = domUpdateCount;
console.log(`Consecutive updateUI() DOM manipulations: ${consecutiveUpdateCount}`);

// Verify expectations
if (consecutiveUpdateCount > 0) {
  console.log(`❌ FAILED: Redundant DOM updates detected (${consecutiveUpdateCount}). Dirty checking needed.`);
} else {
  console.log(`✅ PASSED: No redundant DOM updates detected. Dirty checking works!`);
}

// Ensure the first update actually did something
if (initialUpdateCount === 0) {
    console.log(`❌ FAILED: Initial update did not modify DOM.`);
}
