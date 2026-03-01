const fs = require('fs');
const path = require('path');
const vm = require('vm');

function verifyPerformance() {
  const code = fs.readFileSync(path.resolve(__dirname, '../assets/js/script.js'), 'utf8');

  let classListAddCalls = 0;
  let classListRemoveCalls = 0;

  class MockElement {
    constructor(id) {
      this.id = id;
      this.classList = {
        add: (cls) => {
          if (cls === 'hidden') classListAddCalls++;
        },
        remove: (cls) => {
          if (cls === 'hidden') classListRemoveCalls++;
        },
        contains: () => false,
        toggle: () => {},
      };
      this.style = {};
    }
    setAttribute() {}
    addEventListener() {}
    closest() { return null; }
    click() {}
  }

  const elements = {};

  const documentMock = {
    getElementById: (id) => {
      if (!elements[id]) {
        elements[id] = new MockElement(id);
      }
      return elements[id];
    },
    querySelectorAll: () => [],
    body: new MockElement('body'),
  };

  const windowMock = {};

  const context = {
    document: documentMock,
    window: windowMock,
    console: { log: () => {} },
    parseInt: parseInt,
    Object: Object,
    Math: Math,
    JSON: JSON,
    setTimeout: setTimeout,
  };

  vm.createContext(context);
  vm.runInContext(code, context);

  // Expose test helpers
  vm.runInContext(`
    function testRenderLevel(level) {
      renderLevel(level);
    }
    function unlockLevel(level) {
      gameState.unlockedLevels[level] = true;
    }
  `, context);

  console.log('--- Initial Setup ---');
  // Initially no active section, renderLevel(0) will remove hidden from level-0
  context.testRenderLevel(0);

  console.log('classListAddCalls (hidden):', classListAddCalls);
  console.log('classListRemoveCalls (hidden):', classListRemoveCalls);

  classListAddCalls = 0;
  classListRemoveCalls = 0;

  console.log('--- Rendering Level 2 ---');
  context.unlockLevel(2);
  context.testRenderLevel(2);

  console.log('classListAddCalls (hidden):', classListAddCalls);
  console.log('classListRemoveCalls (hidden):', classListRemoveCalls);

  if (classListAddCalls > 1) {
    console.error(`Performance Test FAILED! renderLevel caused ${classListAddCalls} additions of "hidden" class, expected at most 1 (O(1) logic).`);
    process.exit(1);
  } else {
    console.log('Performance Test PASSED! O(1) DOM updates confirmed.');
  }
}

verifyPerformance();