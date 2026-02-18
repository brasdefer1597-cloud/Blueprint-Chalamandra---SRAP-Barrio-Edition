// === 1. ESTADO CENTRAL DEL JUEGO (PERSISTENTE) ===
let gameState = {
  currentLevel: 0,
  insightPoints: 0,
  epicDisasterLevel: 0,
  collectedSteps: {},
  collectedHats: {},
  hatSequence: [],
  unlockedLevels: { 0: true, 2: false, 3: false, 5: false },
  gameMode: "demo",
  stats: {
    interactions: 0,
    lastLevel: 0
  }
};

// Cargar estado inicial
async function loadState() {
  return new Promise((resolve) => {
    chrome.storage.local.get(["gameState"], (result) => {
      if (result.gameState) {
        gameState = result.gameState;
      }
      resolve();
    });
  });
}

// Guardar estado
async function saveState() {
  return new Promise((resolve) => {
    chrome.storage.local.set({ gameState }, () => {
      resolve();
    });
  });
}

// === 2. REFERENCIAS Y MAPEO DE UI ===
const levelSections = document.querySelectorAll(".level-section");
const mainTitle = document.getElementById("main-title");
const insightCounter = document.getElementById("insight-counter");
const chaosMetricDisplay = document.getElementById("chaos-metric-display");

const levelTitles = {
  0: "Blueprint Chalamandra™",
  2: "🌀 SRAP Flow Premium",
  3: "🌪 Caos Controlado: Labs",
  5: "🎩 Mandala Multiconsciente VIP",
};

// Modal elements
const customModal = document.getElementById("custom-modal");
const modalTitle = document.getElementById("modal-title");
const modalMessage = document.getElementById("modal-message");

// === 3. FUNCIONES DE UI ===

function showCustomAlert(message, title = "¡Notificación Warrior!") {
  modalTitle.textContent = title;
  modalMessage.innerHTML = message;
  customModal.classList.remove("hidden");
  customModal.classList.add("flex");
}

function hideCustomAlert() {
  customModal.classList.add("hidden");
  customModal.classList.remove("flex");
}

function showPaywallModal() {
  const kofiUrl = "https://ko-fi.com/s/8b46c1c1cd";
  const message = `
    <p class="mb-4">¡Alto ahí, Warrior! Has dominado la Demo.</p>
    <p class="mb-4">Para acceder al <strong>Nivel 3</strong> y <strong>Nivel 5</strong>, necesitas la versión completa.</p>
    <a href="${kofiUrl}" target="_blank" class="cta-button px-6 py-2 rounded-full text-xs font-bold inline-block mt-2 text-black hover:text-black">
      🔓 Desbloquear Premium
    </a>
  `;
  showCustomAlert(message, "🔒 Contenido Premium");
}

function updateUI() {
  insightCounter.textContent = gameState.insightPoints;

  const totalActivity =
    Object.keys(gameState.collectedSteps).length +
    gameState.epicDisasterLevel +
    Object.keys(gameState.collectedHats).length;

  const flowControl =
    totalActivity > 0
      ? (gameState.insightPoints / totalActivity).toFixed(2)
      : 0;

  if (chaosMetricDisplay) {
    chaosMetricDisplay.innerHTML = `Desastre: <span class="text-red-400">${gameState.epicDisasterLevel}</span> | Flow: <span class="${flowControl > 1.5 ? "text-lime-400" : "text-yellow-400"}">${flowControl}</span>`;
  }

  document.querySelectorAll(".srap-step").forEach((step) => {
    const stepId = step.dataset.id;
    if (gameState.collectedSteps[stepId]) {
      step.classList.add("srap-active");
    } else {
      step.classList.remove("srap-active");
    }
  });

  document.querySelectorAll(".mandala-hat").forEach((hat) => {
    const hatType = hat.dataset.hat;
    if (gameState.collectedHats[hatType]) {
      hat.style.borderColor = "var(--neon-lime)";
    } else {
      hat.style.borderColor = "var(--neon-purple)";
    }
  });

  Object.keys(gameState.unlockedLevels).forEach((level) => {
    const btn = document.getElementById(`nav-btn-${level}`);
    const isLocked = !gameState.unlockedLevels[level];
    if (btn) {
      btn.classList.toggle("nav-locked", isLocked);
      btn.classList.toggle(
        "nav-active",
        parseInt(level) === gameState.currentLevel,
      );
      btn.disabled = isLocked;
    }
  });
}

// === 4. NAVEGACIÓN ===

function renderLevel(level) {
  level = parseInt(level);

  if (!gameState.unlockedLevels[level]) {
    if (gameState.gameMode === "demo" && level >= 3) {
      showPaywallModal();
      return;
    }
    showCustomAlert(`Nivel ${level} bloqueado.`, "Acceso Restringido");
    return;
  }

  gameState.currentLevel = level;
  gameState.stats.interactions++;
  gameState.stats.lastLevel = level;
  saveState();

  levelSections.forEach((section) => section.classList.add("hidden"));
  const activeSection = document.getElementById(`level-${level}`);
  if (activeSection) activeSection.classList.remove("hidden");

  mainTitle.textContent = levelTitles[level];
  updateUI();
}

function unlockAndRenderLevel(level) {
  if (gameState.gameMode === "demo" && level >= 3) {
    showPaywallModal();
    return;
  }
  gameState.unlockedLevels[level] = true;
  renderLevel(level);
}

// === 5. LÓGICA DE JUEGO ===

function collectInsight(stepId, points) {
  if (gameState.collectedSteps[stepId]) return;
  gameState.insightPoints += parseInt(points);
  gameState.collectedSteps[stepId] = true;
  saveState();
  showCustomAlert(`¡Paso **${stepId.toUpperCase()}** completado! +${points} Insights.`, "SRAP Dominado");
  updateUI();
}

function startChaosRitual(ritualType) {
  let insightGained = 0;
  if (ritualType === "error") {
    gameState.epicDisasterLevel += 1;
    const roll = Math.random();
    if (roll < 0.3) insightGained = 5;
    else if (roll < 0.5) insightGained = -2;
    else insightGained = 1;
  } else if (ritualType === "fiesta") {
    gameState.epicDisasterLevel += 2;
    insightGained = 2;
  }
  gameState.insightPoints += insightGained;
  saveState();
  showCustomAlert(`Ritual completado. Insights: ${insightGained}`, "Caos Procesado");
  updateUI();
}

function revealHatInsight(hatBtn, hatType) {
  const points = 3;
  if (!gameState.collectedHats[hatType]) {
    gameState.insightPoints += points;
    gameState.collectedHats[hatType] = true;
  }

  gameState.hatSequence.push(hatType);
  if (gameState.hatSequence.length > 3) gameState.hatSequence.shift();

  hatBtn.classList.toggle("hat-revealed");
  saveState();
  updateUI();

  // Sinergia
  const required = ["creativo", "critico", "tactico"];
  if (JSON.stringify(gameState.hatSequence) === JSON.stringify(required)) {
    gameState.insightPoints += 10;
    gameState.hatSequence = [];
    saveState();
    showCustomAlert("¡SINERGIA ACTIVADA! +10 Insights.", "Combo Épico");
    updateUI();
  }
}

// === 6. FLUJO INVERSO (APRENDIZAJE) ===
function applyUserLearning() {
  if (gameState.stats.interactions > 20) {
    showCustomAlert("¡Warrior Legendario! Tu actividad es épica. +5 Insights de bono.", "Nivel Maestro");
    gameState.insightPoints += 5;
    gameState.stats.interactions = 0;
    saveState();
    updateUI();
  }
}

// === 7. EVENT LISTENERS (NECESARIOS EN MV3) ===
function setupEventListeners() {
  // Nav buttons
  document.querySelectorAll(".nav-btn").forEach(btn => {
    btn.addEventListener("click", () => renderLevel(btn.dataset.level));
  });

  // Unlock buttons
  document.getElementById("btn-unlock-2")?.addEventListener("click", () => unlockAndRenderLevel(2));
  document.getElementById("btn-unlock-3")?.addEventListener("click", () => unlockAndRenderLevel(3));
  document.getElementById("btn-unlock-5")?.addEventListener("click", () => unlockAndRenderLevel(5));
  document.getElementById("btn-finish")?.addEventListener("click", () => showCustomAlert("¡Felicidades Warrior!"));

  // SRAP steps
  document.querySelectorAll(".srap-btn").forEach(btn => {
    btn.addEventListener("click", () => collectInsight(btn.dataset.id, btn.dataset.points));
  });

  // Chaos rituals
  document.querySelectorAll(".chaos-btn").forEach(btn => {
    btn.addEventListener("click", () => startChaosRitual(btn.dataset.ritual));
  });

  // Hats
  document.querySelectorAll(".hat-btn").forEach(btn => {
    btn.addEventListener("click", () => revealHatInsight(btn, btn.dataset.hat));
  });

  // Modal OK
  document.getElementById("modal-ok")?.addEventListener("click", hideCustomAlert);
}

// === 8. INICIALIZACIÓN ===
document.addEventListener("DOMContentLoaded", async () => {
  await loadState();
  setupEventListeners();
  renderLevel(gameState.currentLevel);
  applyUserLearning();
});
