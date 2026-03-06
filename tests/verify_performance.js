const fs = require('fs');
const vm = require('vm');

const scriptCode = fs.readFileSync('assets/js/script.js', 'utf8');

let assignments = 0;
let reads = 0;

const mockElement = (id) => ({
  id,
  _textContent: "",
  get textContent() { reads++; return this._textContent; },
  set textContent(val) {
    assignments++;
    this._textContent = String(val);
  },
  _className: "",
  get className() { reads++; return this._className; },
  set className(val) {
    assignments++;
    this._className = String(val);
  },
  classList: {
    add: () => {},
    remove: () => {},
    toggle: () => {},
    contains: () => false
  },
  style: {},
  removeAttribute: () => {},
  setAttribute: () => {}
});

const mockDoc = {
  querySelectorAll: () => [mockElement('a'), mockElement('b')],
  getElementById: (id) => mockElement(id),
  body: { addEventListener: () => {} },
  createElement: () => mockElement('new')
};

const context = {
  document: mockDoc,
  window: {},
  console: console,
  Math: Math,
  parseInt: parseInt,
  Object: Object,
  String: String,
  JSON: JSON,
  DOMParser: class { parseFromString() { return { querySelectorAll: () => [], body: { innerHTML: '' }}; } }
};

vm.createContext(context);
vm.runInContext(scriptCode, context);

// Initialize some state
vm.runInContext('updateScores()', context);

let initialAssignments = assignments;
assignments = 0;

// Call updateScores 100 times without changing state
for (let i = 0; i < 100; i++) {
  vm.runInContext('updateScores()', context);
}

console.log(`Initial assignments: ${initialAssignments}`);
console.log(`Subsequent assignments (should be 0 if optimized): ${assignments}`);
