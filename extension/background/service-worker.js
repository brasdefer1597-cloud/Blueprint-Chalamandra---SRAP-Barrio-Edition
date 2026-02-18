// Service Worker para persistencia de estado y lógica de fondo
chrome.runtime.onInstalled.addListener(() => {
  console.log("Blueprint Chalamandra: Instalada con éxito.");
  // Inicializar estado si no existe
  chrome.storage.local.get(["gameState"], (result) => {
    if (!result.gameState) {
      const initialGameState = {
        currentLevel: 0,
        insightPoints: 0,
        epicDisasterLevel: 0,
        collectedSteps: {},
        collectedHats: {},
        hatSequence: [],
        unlockedLevels: { 0: true, 2: false, 3: false, 5: false },
        gameMode: "demo"
      };
      chrome.storage.local.set({ gameState: initialGameState });
    }
  });
});

// Listener para mensajes (opcional por ahora, pero escalable)
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === "GET_STATE") {
    chrome.storage.local.get(["gameState"], (result) => {
      sendResponse(result.gameState);
    });
    return true; // Asíncrono
  }

  if (request.type === "UPDATE_STATE") {
    chrome.storage.local.set({ gameState: request.state }, () => {
      sendResponse({ success: true });
    });
    return true;
  }
});
