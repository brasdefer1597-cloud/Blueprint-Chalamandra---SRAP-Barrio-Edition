const vm = require('vm');
const fs = require('fs');
const path = require('path');

// Read the script
const scriptContent = fs.readFileSync(path.join(__dirname, '../assets/js/script.js'), 'utf8');

// Mock DOM element with tracking
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
    this._textContent = val;
  }

  get className() { return this._className; }
  set className(val) {
    this.assignmentCount++;
    this._className = val;
  }
}

// Global mocks
const elements = {
  'insight-counter': new MockElement('insight-counter'),
  'chaos-metric-display': new MockElement('chaos-metric-display'),
  'metric-disaster': new MockElement('metric-disaster'),
  'metric-flow': new MockElement('metric-flow'),
  'main-title': new MockElement('main-title'),
  'modal-title': new MockElement('modal-title'),
  'modal-message': new MockElement('modal-message'),
  'custom-modal': new MockElement('custom-modal')
};

const documentMock = {
  getElementById: (id) => elements[id],
  querySelectorAll: () => [],
  body: {
    addEventListener: () => {}
  }
};

const context = {
  document: documentMock,
  window: {},
  console: console,
  DOMParser: class { parseFromString() { return { querySelectorAll: () => [], body: { innerHTML: '' } }; } }
};

vm.createContext(context);
vm.runInContext(scriptContent, context);

// Reset counts
Object.values(elements).forEach(el => el.assignmentCount = 0);

// Run updateScores 10 times with the same state
vm.runInContext(`
  gameState.insightPoints = 5;
  gameState.epicDisasterLevel = 2;
  gameState.collectedSteps = { a: true };
  gameState.collectedHats = { b: true };

  for(let i = 0; i < 10; i++) {
    updateScores();
  }
`, context);

const totalAssignments = elements['insight-counter'].assignmentCount +
                       elements['metric-disaster'].assignmentCount +
                       elements['metric-flow'].assignmentCount;

console.log(`Total DOM assignments: ${totalAssignments}`);
