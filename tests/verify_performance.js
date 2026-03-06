const fs = require('fs');
const vm = require('vm');
const path = require('path');

// Stats object to track DOM manipulations
const stats = {
  textContentWrites: 0,
  classNameWrites: 0
};

// Create a mock element that tracks modifications
class MockElement {
  constructor(id) {
    this.id = id;
    this._textContent = '';
    this._className = '';
  }

  get textContent() {
    return this._textContent;
  }

  set textContent(value) {
    stats.textContentWrites++;
    this._textContent = value;
  }

  get className() {
    return this._className;
  }

  set className(value) {
    stats.classNameWrites++;
    this._className = value;
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
}

// Set up the mock DOM environment
const mockDocument = {
  getElementById: (id) => new MockElement(id),
  querySelectorAll: () => [],
  body: {
    addEventListener: () => {}
  }
};

const mockDOMParser = class {
  parseFromString() {
    return {
      querySelectorAll: () => [],
      body: { innerHTML: '' }
    };
  }
};

// Create the context variables that script.js expects
const sandbox = {
  document: mockDocument,
  window: {},
  DOMParser: mockDOMParser,
  Math: Math,
  parseInt: parseInt,
  Object: Object,
  console: console
};

// Create the context
vm.createContext(sandbox);

// Read script.js
const scriptPath = path.join(__dirname, '../assets/js/script.js');
const scriptContent = fs.readFileSync(scriptPath, 'utf8');

try {
  // Execute the script in the sandboxed context
  vm.runInContext(scriptContent, sandbox);

  // Expose the updateScores function and gameState to our test
  // We have to use runInContext to extract top-level lets/consts from the script
  const testScript = `
    const testUpdateScores = updateScores;
    const testGameState = gameState;

    // Function to run the test
    function runTest() {
      // Setup initial state
      testGameState.insightPoints = 5;
      testGameState.epicDisasterLevel = 2;

      // Call updateScores multiple times without changing state
      testUpdateScores();
      testUpdateScores();
      testUpdateScores();
    }

    runTest();
  `;

  vm.runInContext(testScript, sandbox);

  console.log('--- Performance Test Results ---');
  console.log(`textContent writes: ${stats.textContentWrites}`);
  console.log(`className writes: ${stats.classNameWrites}`);

  // Since we called it 3 times, without optimization we expect 3x writes
  // For insightCounter, metricDisaster, metricFlow (3 textContent writes per call = 9)
  // For metricFlow className (1 className write per call = 3)

  if (stats.textContentWrites > 3 || stats.classNameWrites > 1) {
    console.log('❌ Optimization needed: Redundant DOM writes detected.');
    process.exit(0); // Exit 0 so the bash script doesn't fail, we just want the output
  } else {
    console.log('✅ Optimization successful: No redundant DOM writes.');
  }

} catch (error) {
  console.error('Error executing script:', error);
  process.exit(1);
}
