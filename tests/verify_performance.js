const fs = require('fs');
const vm = require('vm');

class MockElement {
  constructor(id) {
    this.id = id;
    this._textContent = '';
    this._className = '';
    this.assignmentCount = 0;
  }

  get textContent() { return this._textContent; }
  set textContent(val) {
    this.assignmentCount++;
    this._textContent = String(val);
  }

  get className() { return this._className; }
  set className(val) {
    this.assignmentCount++;
    this._className = String(val);
  }

  classList = {
    add: () => {},
    remove: () => {},
    toggle: () => {},
    contains: () => false
  };
  style = {};
  setAttribute() {}
  removeAttribute() {}
  addEventListener() {}
}

const mockElements = {};
const document = {
  getElementById: (id) => {
    if (!mockElements[id]) mockElements[id] = new MockElement(id);
    return mockElements[id];
  },
  querySelectorAll: () => [],
  body: new MockElement('body')
};

const window = {
  console: console
};

const scriptCode = fs.readFileSync('assets/js/script.js', 'utf8');

const context = vm.createContext({ document, window, console, process, DOMParser: class { parseFromString() { return { querySelectorAll: () => [], body: { innerHTML: '' } }; } } });

vm.runInContext(scriptCode, context);

vm.runInContext(`
  // First call
  updateScores();
  const firstCounts = {
    insight: insightCounter.assignmentCount,
    disaster: metricDisaster.assignmentCount,
    flow: metricFlow.assignmentCount
  };

  // Second call
  updateScores();
  const secondCounts = {
    insight: insightCounter.assignmentCount,
    disaster: metricDisaster.assignmentCount,
    flow: metricFlow.assignmentCount
  };

  const totalFirst = firstCounts.insight + firstCounts.disaster + firstCounts.flow;
  const totalSecond = secondCounts.insight + secondCounts.disaster + secondCounts.flow;

  console.log('Total assignments after first call:', totalFirst);
  console.log('Total assignments after second call:', totalSecond);

  if (totalSecond > totalFirst) {
    console.error('ERROR: Redundant assignments detected!');
    process.exit(1);
  } else {
    console.log('SUCCESS: Dirty checking working correctly!');
  }
`, context);
