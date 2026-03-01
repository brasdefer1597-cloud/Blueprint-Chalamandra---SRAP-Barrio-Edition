const vm = require('vm');
const fs = require('fs');

let classListAddCalls = 0;
let classListRemoveCalls = 0;

class MockHTMLElement {
  constructor(id) {
    this.id = id;
    this.classList = {
      add: (className) => {
        if (className === 'hidden') classListAddCalls++;
      },
      remove: (className) => {
        if (className === 'hidden') classListRemoveCalls++;
      },
      contains: () => false,
      toggle: () => {}
    };
    this.style = {};
  }
  setAttribute() {}
  addEventListener() {}
  closest() { return null; }
  click() {}
}

const mockElements = {
  'main-title': new MockHTMLElement('main-title'),
  'insight-counter': new MockHTMLElement('insight-counter'),
  'chaos-metric-display': new MockHTMLElement('chaos-metric-display'),
  'metric-disaster': new MockHTMLElement('metric-disaster'),
  'metric-flow': new MockHTMLElement('metric-flow'),
  'custom-modal': new MockHTMLElement('custom-modal'),
  'modal-title': new MockHTMLElement('modal-title'),
  'modal-message': new MockHTMLElement('modal-message'),
  'level-0': new MockHTMLElement('level-0'),
  'level-2': new MockHTMLElement('level-2'),
  'level-3': new MockHTMLElement('level-3'),
  'level-5': new MockHTMLElement('level-5'),
};

const mockDocument = {
  getElementById: (id) => mockElements[id] || new MockHTMLElement(id),
  querySelectorAll: (selector) => {
    if (selector === '.level-section') {
      return [mockElements['level-0'], mockElements['level-2'], mockElements['level-3'], mockElements['level-5']];
    }
    return [new MockHTMLElement('mock')];
  },
  body: {
    addEventListener: () => {}
  }
};

const context = {
  window: {},
  document: mockDocument,
  console: console,
  Math: Math,
  parseInt: parseInt,
  Object: Object,
  JSON: JSON
};

vm.createContext(context);

const scriptContent = fs.readFileSync('./assets/js/script.js', 'utf8');

try {
  vm.runInContext(scriptContent, context);

  // Need to unlock levels to render them
  vm.runInContext('gameState.unlockedLevels = {0: true, 2: true, 3: true, 5: true};', context);

  classListAddCalls = 0;
  classListRemoveCalls = 0;

  // Render level 2
  vm.runInContext('renderLevel(2);', context);

  console.log(`classList.add('hidden') calls: ${classListAddCalls}`);
  console.log(`classList.remove('hidden') calls: ${classListRemoveCalls}`);

  // In the original unoptimized O(N) approach, it should add 'hidden' to 4 sections
  // In the optimized O(1) approach, it should add 'hidden' to 1 section (or 0 if initial activeLevelSection is null)

  if (classListAddCalls <= 1 && classListRemoveCalls === 1) {
    console.log('SUCCESS: O(1) DOM Optimization verified.');
    process.exit(0);
  } else if (classListAddCalls === 4) {
    console.log('UNOPTIMIZED: Original O(N) behavior detected.');
    process.exit(1);
  } else {
    console.log('ERROR: Unexpected behavior.');
    process.exit(1);
  }

} catch (error) {
  console.error('Script evaluation failed:', error);
  process.exit(1);
}
