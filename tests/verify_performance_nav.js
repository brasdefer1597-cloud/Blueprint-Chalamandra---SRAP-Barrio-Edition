const fs = require('fs');
const vm = require('vm');

const scriptCode = fs.readFileSync('assets/js/script.js', 'utf8');

let methodCalls = 0;

const mockClassList = {
  classes: new Set(),
  add: function(cls) { this.classes.add(cls); },
  remove: function(cls) { this.classes.delete(cls); },
  toggle: function(cls, force) {
    methodCalls++;
    if (force === true) this.classes.add(cls);
    else if (force === false) this.classes.delete(cls);
    else if (this.classes.has(cls)) this.classes.delete(cls);
    else this.classes.add(cls);
  },
  contains: function(cls) { return this.classes.has(cls); }
};

const mockElement = (id) => {
  const classList = {
    classes: new Set(),
    add: function(cls) { this.classes.add(cls); },
    remove: function(cls) { this.classes.delete(cls); },
    toggle: function(cls, force) {
      methodCalls++;
      if (force === true) this.classes.add(cls);
      else if (force === false) this.classes.delete(cls);
      else if (this.classes.has(cls)) this.classes.delete(cls);
      else this.classes.add(cls);
    },
    contains: function(cls) { return this.classes.has(cls); }
  };

  return {
    id,
    _textContent: "",
    get textContent() { return this._textContent; },
    set textContent(val) {
      this._textContent = String(val);
    },
    _className: "",
    get className() { return this._className; },
    set className(val) {
      this._className = String(val);
    },
    classList: classList,
    style: {},
    removeAttribute: () => {},
    setAttribute: () => {},
    _disabled: false,
    get disabled() { return this._disabled; },
    set disabled(val) { if(this._disabled !== val) { methodCalls++; this._disabled = val; } }
  };
};

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
vm.runInContext('updateNavigation()', context);

let initialCalls = methodCalls;
methodCalls = 0;

// Call updateNavigation 100 times without changing state
for (let i = 0; i < 100; i++) {
  vm.runInContext('updateNavigation()', context);
}

console.log(`Initial nav method calls: ${initialCalls}`);
console.log(`Subsequent nav method calls (should be much lower if optimized): ${methodCalls}`);
