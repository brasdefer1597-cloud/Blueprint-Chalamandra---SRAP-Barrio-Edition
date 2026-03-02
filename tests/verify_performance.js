const vm = require('vm');
const fs = require('fs');

// Mock DOM
const mockDocument = {
  querySelectorAll: () => [],
  getElementById: (id) => ({
    id,
    classList: { add: () => {}, remove: () => {}, toggle: () => {}, contains: () => false },
    style: {},
    textContent: '',
    innerHTML: '',
    setAttribute: () => {},
  }),
  body: {
    addEventListener: () => {}
  }
};

const mockWindow = {
  console: console
};

// Create a context that includes our mocks
const context = vm.createContext({
  document: mockDocument,
  window: mockWindow,
  console: console
});

// Load the script
const scriptCode = fs.readFileSync('assets/js/script.js', 'utf8');
vm.runInContext(scriptCode, context);

// We need to extract the global variables from the VM context that were declared with const/let
// Since they aren't directly attached to `context` when declared with const/let at the top level,
// we'll run additional code in the VM to fetch them or test the logic.

vm.runInContext(`
  // Helper to assert
  function assert(condition, message) {
    if (!condition) {
      throw new Error("Assertion failed: " + message);
    }
  }

  // Override updateUI and showCustomAlert to not throw errors with our mock DOM if they try anything complex
  updateUI = function() {};
  showCustomAlert = function() {};

  console.log("Testing checkMandalaSynergy...");

  // Test case 1: Not enough elements
  gameState.hatSequence = ["creativo", "critico"];
  gameState.insightPoints = 0;
  assert(checkMandalaSynergy() === false, "Should return false for sequence length < 3");
  assert(gameState.insightPoints === 0, "Points should not increase");
  assert(gameState.hatSequence.length === 2, "Sequence should not reset");

  // Test case 2: Wrong sequence
  gameState.hatSequence = ["creativo", "tactico", "critico"];
  assert(checkMandalaSynergy() === false, "Should return false for incorrect sequence");

  // Test case 3: Correct sequence
  gameState.hatSequence = ["creativo", "critico", "tactico"];
  assert(checkMandalaSynergy() === true, "Should return true for correct sequence");
  assert(gameState.insightPoints === 10, "Points should increase by 10");
  assert(gameState.hatSequence.length === 0, "Sequence should reset");

  // Test case 4: Correct sequence with preceding elements
  gameState.hatSequence = ["fresa", "tactico", "creativo", "critico", "tactico"];
  assert(checkMandalaSynergy() === true, "Should return true for sequence embedded at the end");
  assert(gameState.insightPoints === 20, "Points should increase by 10 again");
  assert(gameState.hatSequence.length === 0, "Sequence should reset again");

  console.log("All performance/logic tests passed!");
`, context);
