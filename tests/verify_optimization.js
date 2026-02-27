const fs = require('fs');
const vm = require('vm');
const path = require('path');

const code = fs.readFileSync(path.join(__dirname, '../assets/js/script.js'), 'utf8');

class MockClassList {
  constructor(id) {
    this.id = id;
    this.classes = new Set();
    this.addCount = 0;
    this.removeCount = 0;
  }
  add(cls) {
    this.classes.add(cls);
    if (cls === 'hidden') {
        this.addCount++;
    }
  }
  remove(cls) {
    this.classes.delete(cls);
    if (cls === 'hidden') {
        this.removeCount++;
    }
  }
  contains(cls) {
    return this.classes.has(cls);
  }
  toggle(cls, force) {
    if (force === undefined) {
      force = !this.classes.has(cls);
    }
    if (force) this.add(cls);
    else this.remove(cls);
  }
}

class MockElement {
  constructor(id) {
    this.id = id;
    this.classList = new MockClassList(id);
    this.style = {};
    this.textContent = '';
    this.innerHTML = '';
    this.disabled = false;
  }

  setAttribute(name, value) {
      this[name] = value;
  }

  closest(selector) {
      return this;
  }

  click() {}
}

const elements = {};
const getElement = (id) => {
  if (!elements[id]) {
    elements[id] = new MockElement(id);
  }
  return elements[id];
};

const mockDocument = {
  getElementById: (id) => getElement(id),
  querySelectorAll: (selector) => {
    if (selector === '.level-section') {
      // Return a NodeList-like array of level sections
      return [0, 2, 3, 5].map(id => getElement(`level-${id}`));
    }
    if (selector === '.srap-step') return [];
    if (selector === '.mandala-hat') return [];
    if (selector === '.chaos-ritual') return [];
    return [];
  },
  body: {
      addEventListener: () => {}
  }
};

const mockWindow = {
  console: console,
};

const sandbox = {
  document: mockDocument,
  window: mockWindow,
  console: console,
  HTMLElement: MockElement
};

vm.createContext(sandbox);
vm.runInContext(code, sandbox);

// Helper to get gameState from sandbox
const getGameState = () => vm.runInContext('gameState', sandbox);
const renderLevel = (lvl) => vm.runInContext(`renderLevel(${lvl})`, sandbox);

// Setup: Unlock level 2
const gameState = getGameState();
gameState.unlockedLevels[2] = true;

// Initial render (Level 0)
console.log('--- Initial Render (Level 0) ---');
renderLevel(0);

// Reset counters for the level sections
[0, 2, 3, 5].forEach(id => {
  const el = elements[`level-${id}`];
  if (el) {
    el.classList.addCount = 0;
    el.classList.removeCount = 0;
  }
});

// Transition to Level 2
console.log('--- Transition to Level 2 ---');
renderLevel(2);

// Analyze results
console.log('--- Results ---');
let touchedSections = 0;

[0, 2, 3, 5].forEach(id => {
  const el = elements[`level-${id}`];
  if (el) {
    console.log(`Section level-${id}: add('hidden') called ${el.classList.addCount} times`);
    if (el.classList.addCount > 0) {
      touchedSections++;
    }
  }
});

console.log(`Total sections touched (hidden): ${touchedSections}`);
if (touchedSections > 1) {
    console.log("FAIL: O(N) behavior detected. More than 1 section was hidden.");
    process.exit(1);
} else {
    console.log("PASS: O(1) behavior detected. Only 1 section was hidden.");
    process.exit(0);
}
