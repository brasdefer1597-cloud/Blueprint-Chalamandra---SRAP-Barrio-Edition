const fs = require('fs');
const path = require('path');
const vm = require('vm');

function runTest(scriptContent) {
    let classListAddCount = 0;

    const createMockElement = (id) => ({
        id: id || 'mock-id',
        classList: {
            add: (cls) => { if (cls === 'hidden') classListAddCount++; },
            remove: () => {},
            contains: () => false,
            toggle: () => {},
            replace: () => {}
        },
        setAttribute: () => {},
        style: {}
    });

    const mockLevels = [
        createMockElement('level-0'),
        createMockElement('level-2'),
        createMockElement('level-3'),
        createMockElement('level-5')
    ];

    const documentMock = {
        querySelectorAll: (selector) => {
            if (selector === '.level-section') return mockLevels;
            return [createMockElement(), createMockElement()];
        },
        getElementById: (id) => {
            return createMockElement(id);
        },
        body: {
            addEventListener: () => {}
        }
    };

    const context = vm.createContext({
        document: documentMock,
        window: { console: { log: () => {} } },
        console: { log: () => {} },
        parseInt: parseInt,
        Object: Object,
        Math: Math,
        JSON: JSON
    });

    vm.runInContext(scriptContent, context);

    // In a VM context, variables declared with `const` or `let` at the top level
    // might not be attached to the context object directly.
    // We can run additional code in the context to test.
    vm.runInContext(`
        gameState.unlockedLevels[2] = true;
        gameState.unlockedLevels[3] = true;

        // Reset counter
        // (Wait, we can't reset classListAddCount from inside without exposing it)
    `, context);

    // Reset counter and test
    classListAddCount = 0;

    vm.runInContext(`
        renderLevel(0);
        renderLevel(2);
        renderLevel(3);
    `, context);

    return classListAddCount;
}

const scriptCode = fs.readFileSync(path.join(__dirname, '../assets/js/script.js'), 'utf8');
const count = runTest(scriptCode);
console.log(`Hidden classes added: ${count}`);
if (count === 12) {
    console.log('Original O(N) behavior detected.');
} else if (count < 12) {
    console.log('Optimized O(1) behavior detected.');
}
