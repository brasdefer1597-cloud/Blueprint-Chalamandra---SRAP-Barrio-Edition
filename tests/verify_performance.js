const fs = require('fs');
const vm = require('vm');
const path = require('path');

const scriptPath = path.join(__dirname, '../assets/js/script.js');
const scriptContent = fs.readFileSync(scriptPath, 'utf8');

// Simple mock fn
function createMockFn() {
  const fn = function(...args) {
    fn.calls.push(args);
  };
  fn.calls = [];
  fn.mockClear = () => { fn.calls = []; };
  return fn;
}

// Mock DOM
const mockDocument = {
  getElementById: createMockFn(),
  querySelectorAll: createMockFn(),
  body: {
    addEventListener: createMockFn()
  }
};

const elements = {};

// Override getElementById to return consistent elements
mockDocument.getElementById = function(id) {
  if (!elements[id]) {
    elements[id] = {
      _textContent: '',
      get textContent() { return this._textContent; },
      set textContent(val) {
        this.textContentSets.push(val);
        this._textContent = val;
      },
      textContentSets: [],

      _className: '',
      get className() { return this._className; },
      set className(val) {
        this.classNameSets.push(val);
        this._className = val;
      },
      classNameSets: [],

      classList: {
        add: createMockFn(),
        remove: createMockFn(),
        toggle: createMockFn()
      },
      style: {},
      setAttribute: createMockFn(),
      addEventListener: createMockFn()
    };
  }
  return elements[id];
};

mockDocument.querySelectorAll = function(selector) {
  return [mockDocument.getElementById('mock-' + selector)];
};


const mockWindow = {
  initGame: null
};

const context = vm.createContext({
  document: mockDocument,
  window: mockWindow,
  console: console,
  DOMParser: class {
    parseFromString() {
      return {
        querySelectorAll: () => [],
        body: { innerHTML: '' }
      };
    }
  }
});

// Run script
vm.runInContext(scriptContent, context);

// Test updateScores dirty checking
const runTest = `
  const testInsightCounter = document.getElementById("insight-counter");
  const testMetricDisaster = document.getElementById("metric-disaster");
  const testMetricFlow = document.getElementById("metric-flow");

  // Clear tracking
  testInsightCounter.textContentSets = [];
  testMetricDisaster.textContentSets = [];
  testMetricFlow.textContentSets = [];
  testMetricFlow.classNameSets = [];

  // Call 1
  updateScores();

  // Call 2
  updateScores();

  // Call 3
  updateScores();
`;

vm.runInContext(runTest, context);

const testInsightCounter = elements["insight-counter"];
const testMetricDisaster = elements["metric-disaster"];
const testMetricFlow = elements["metric-flow"];

console.log("insightCounter assignments:", testInsightCounter.textContentSets.length);
console.log("metricDisaster assignments:", testMetricDisaster.textContentSets.length);
console.log("metricFlow content assignments:", testMetricFlow.textContentSets.length);
console.log("metricFlow class assignments:", testMetricFlow.classNameSets.length);
