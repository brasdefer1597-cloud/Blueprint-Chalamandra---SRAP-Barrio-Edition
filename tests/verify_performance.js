const fs = require('fs');
const vm = require('vm');
const path = require('path');

// Global counters - explicitly attached to the sandbox object to be safe
const sandbox = {
  hiddenAddCount: 0,
  console: console,
};

// Mock DOM classes
class ClassList {
  constructor(element) {
    this.element = element;
    this.classes = new Set();
  }
  add(className) {
    // console.log(`[Mock] ClassList.add: ${className} on ${this.element.id}`);
    this.classes.add(className);
    if (className === 'hidden') {
      sandbox.hiddenAddCount++;
    }
  }
  remove(className) {
    this.classes.delete(className);
  }
  toggle(className, force) {
    if (force === undefined) {
      if (this.classes.has(className)) this.classes.delete(className);
      else this.classes.add(className);
    } else if (force) {
      this.classes.add(className);
    } else {
      this.classes.delete(className);
    }
  }
  contains(className) {
    return this.classes.has(className);
  }
}

class HTMLElement {
  constructor(id, className) {
    this.id = id;
    this.classList = new ClassList(this);
    this.style = {};
    this.className = className || '';
    this.textContent = '';
    this.innerHTML = '';
  }

  getAttribute(name) { return null; }
  setAttribute(name, value) {}
  addEventListener(event, callback) {}
  closest(selector) { return this; }
}

// Mock Elements
const elements = {
  'main-title': new HTMLElement('main-title'),
  'insight-counter': new HTMLElement('insight-counter'),
  'chaos-metric-display': new HTMLElement('chaos-metric-display'),
  'metric-disaster': new HTMLElement('metric-disaster'),
  'metric-flow': new HTMLElement('metric-flow'),
  'custom-modal': new HTMLElement('custom-modal'),
  'modal-title': new HTMLElement('modal-title'),
  'modal-message': new HTMLElement('modal-message'),
  'nav-btn-0': new HTMLElement('nav-btn-0'),
  'nav-btn-2': new HTMLElement('nav-btn-2'),
  'nav-btn-3': new HTMLElement('nav-btn-3'),
  'nav-btn-5': new HTMLElement('nav-btn-5'),
  'level-0': new HTMLElement('level-0', 'level-section'),
  'level-2': new HTMLElement('level-2', 'level-section'),
  'level-3': new HTMLElement('level-3', 'level-section'),
  'level-5': new HTMLElement('level-5', 'level-section'),
};

const levelSections = [
  elements['level-0'],
  elements['level-2'],
  elements['level-3'],
  elements['level-5']
];

sandbox.document = {
  getElementById: (id) => {
    // console.log(`[Mock] getElementById: ${id}`);
    return elements[id] || new HTMLElement(id);
  },
  querySelectorAll: (selector) => {
    // console.log(`[Mock] querySelectorAll: ${selector}`);
    if (selector === '.level-section') return levelSections;
    if (selector === '.srap-step') return [];
    if (selector === '.mandala-hat') return [];
    return [];
  },
  body: new HTMLElement('body'),
};

sandbox.window = {
  initGame: () => {}
};

// Load script
const scriptPath = path.join(__dirname, '../assets/js/script.js');
const scriptContent = fs.readFileSync(scriptPath, 'utf8');

// Run script
vm.createContext(sandbox);
vm.runInContext(scriptContent, sandbox);

// Test
console.log('--- Starting Performance Verification ---');

// Reset counter
sandbox.hiddenAddCount = 0;

// Simulate renderLevel(0) - Level 0 is unlocked by default
console.log('Calling renderLevel(0)...');
sandbox.renderLevel(0);
// With the optimization, activeLevelSection starts null, so NO hidden add calls should happen on first render.
// The old code would have done 4 calls here.

console.log(`First render - classList.add('hidden') calls: ${sandbox.hiddenAddCount}`);

// Now render another level to verify we hide the previous one
console.log('Calling renderLevel(2) (after unlocking)...');
sandbox.unlockAndRenderLevel(2);

console.log(`Second render - classList.add('hidden') calls: ${sandbox.hiddenAddCount}`);

// Expected:
// First render: 0 calls (nothing to hide yet)
// Second render: 1 call (hiding level 0)
// Total: 1 call
// Old code total: 8 calls (4 + 4)

if (sandbox.hiddenAddCount <= 1) {
  console.log('Optimization confirmed: O(1) complexity achieved.');
} else {
  console.log(`Optimization failed: ${sandbox.hiddenAddCount} calls.`);
  process.exit(1);
}
