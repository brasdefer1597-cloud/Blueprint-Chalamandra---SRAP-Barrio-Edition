// === 1. ESTADO CENTRAL DEL JUEGO (GAMESTATE) ===
const DEFAULT_STATE = {
  currentLevel: 0,
  insightPoints: 0,
  epicDisasterLevel: 0,
  collectedSteps: {},
  collectedHats: {},
  hatSequence: [],
  unlockedLevels: { 0: true, 2: false, 3: false, 5: false },
  lastActivityTime: 0,
  comboCount: 0,
};

let gameState = { ...DEFAULT_STATE };
let gameMode = "demo"; // 'demo' or 'full'

// PERSISTENCE: Load state from localStorage
function loadState() {
  const savedState = localStorage.getItem("chalamandra_state");
  if (savedState) {
    try {
      gameState = { ...DEFAULT_STATE, ...JSON.parse(savedState) };
    } catch (e) {
      console.error("Error loading state:", e);
    }
  }
}

function saveState() {
  localStorage.setItem("chalamandra_state", JSON.stringify(gameState));
}

// === 2. REFERENCIAS Y MAPEO DE UI ===
const levelSections = document.querySelectorAll(".level-section");
const mainTitle = document.getElementById("main-title");
const insightCounter = document.getElementById("insight-counter");
const chaosMetricDisplay = document.getElementById("chaos-metric-display");
const metricDisaster = document.getElementById("metric-disaster");
const metricFlow = document.getElementById("metric-flow");

// Optimization: Cache frequently accessed DOM elements
const srapSteps = document.querySelectorAll(".srap-step");
const mandalaHats = document.querySelectorAll(".mandala-hat");
const navButtons = {};
[0, 2, 3, 5].forEach((level) => {
  const btn = document.getElementById(`nav-btn-${level}`);
  if (btn) navButtons[level] = btn;
});

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

// === 3. FUNCIONES DE UI Y ALERTA PERSONALIZADA ===

function sanitizeHTML(html) {
  const doc = new DOMParser().parseFromString(html, "text/html");
  const dangerousTags = doc.querySelectorAll(
    "script, iframe, object, embed, base, form, math, svg",
  );
  dangerousTags.forEach((el) => el.remove());
  const allElements = doc.querySelectorAll("*");
  allElements.forEach((el) => {
    for (let i = el.attributes.length - 1; i >= 0; i--) {
      const attr = el.attributes[i];
      const name = attr.name.toLowerCase();
      const value = attr.value.trim().toLowerCase();
      if (
        name.startsWith("on") ||
        name === "srcdoc" ||
        value.startsWith("javascript:") ||
        value.startsWith("data:")
      ) {
        el.removeAttribute(attr.name);
      }
    }
  });
  return doc.body.innerHTML;
}

function showCustomAlert(message, title = "¡Notificación Warrior!") {
  modalTitle.textContent = title;
  modalMessage.innerHTML = sanitizeHTML(message);
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
    <p class="mb-4">Para acceder al <strong>Caos Controlado (Nivel 3)</strong> y al <strong>Mandala Multiconsciente (Nivel 5)</strong>, necesitas la versión completa.</p>
    <a href="${kofiUrl}" target="_blank" class="cta-button px-6 py-3 rounded-full text-base font-bold inline-block mt-2 text-black hover:text-black">
      🔓 Desbloquear Premium
    </a>
    <p class="text-xs text-gray-400 mt-4">Acceso inmediato tras el pago.</p>
  `;
  showCustomAlert(message, "ZONA VIP BLOQUEADA");
}

// Optimization: Cache score state to prevent redundant DOM updates
const _lastScores = {
  insight: null,
  disaster: null,
  flow: null,
  flowClass: null,
};
function updateScores() {
  if (_lastScores.insight !== gameState.insightPoints) {
    insightCounter.textContent = gameState.insightPoints;
    _lastScores.insight = gameState.insightPoints;
  }

  const totalActivity =
    Object.keys(gameState.collectedSteps).length +
    gameState.epicDisasterLevel +
    Object.keys(gameState.collectedHats).length;
  const flowControl =
    totalActivity > 0
      ? (gameState.insightPoints / totalActivity).toFixed(2)
      : 0;

  if (metricDisaster && _lastScores.disaster !== gameState.epicDisasterLevel) {
    metricDisaster.textContent = gameState.epicDisasterLevel;
    _lastScores.disaster = gameState.epicDisasterLevel;
  }

  if (metricFlow) {
    if (_lastScores.flow !== flowControl) {
      metricFlow.textContent = flowControl;
      _lastScores.flow = flowControl;
    }
    const flowClass = flowControl > 1.5 ? "text-lime-400" : "text-yellow-400";
    if (_lastScores.flowClass !== flowClass) {
      metricFlow.className = flowClass;
      _lastScores.flowClass = flowClass;
    }
  }
}

function updateNavigation() {
  Object.keys(gameState.unlockedLevels).forEach((level) => {
    const btn = navButtons[level];
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

function updateStepVisual(step) {
  const stepId = step.id;
  if (gameState.collectedSteps[stepId]) {
    step.classList.add("srap-active");
    step.style.cursor = "default";
  } else {
    step.classList.remove("srap-active");
    step.style.cursor = "pointer";
  }
}

function updateHatVisual(hat) {
  const hatType = hat.id.replace("hat-", "");
  if (gameState.collectedHats[hatType]) {
    hat.style.borderColor = "var(--neon-lime)";
  } else {
    hat.style.borderColor = "var(--neon-purple)";
  }
}

function syncAllVisuals() {
  updateScores();
  updateNavigation();
  srapSteps.forEach(updateStepVisual);
  mandalaHats.forEach(updateHatVisual);
}

// === 4. NAVEGACIÓN ===

function renderLevel(level) {
  level = parseInt(level);
  if (!gameState.unlockedLevels[level]) {
    if (gameMode === "demo" && level >= 3) {
      showPaywallModal();
      return;
    }
    showCustomAlert(
      `¡Calma, carnal! El Nivel ${level} está bloqueado.`,
      "Acceso Restringido",
    );
    return;
  }
  gameState.currentLevel = level;
  levelSections.forEach((section) => section.classList.add("hidden"));
  const activeSection = document.getElementById(`level-${level}`);
  if (activeSection) activeSection.classList.remove("hidden");
  mainTitle.textContent = levelTitles[level];
  syncAllVisuals();
  saveState();
}

function unlockAndRenderLevel(level) {
  if (gameMode === "demo" && level >= 3) {
    showPaywallModal();
    return;
  }
  gameState.unlockedLevels[level] = true;
  renderLevel(level);
}

// === 5. GAMIFICACIÓN Y COMBOS ===

function applyCombo(points) {
  const now = Date.now();
  const timeDiff = (now - gameState.lastActivityTime) / 1000; // in seconds

  if (timeDiff < 60) {
    // If less than a minute between activities
    gameState.comboCount++;
  } else {
    gameState.comboCount = 1;
  }

  gameState.lastActivityTime = now;

  let finalPoints = points;
  if (gameState.comboCount >= 3) {
    const multiplier = Math.min(Math.floor(gameState.comboCount / 3) + 1, 3);
    finalPoints *= multiplier;
    console.log(`COMBO X${multiplier}!`);
  }

  gameState.insightPoints += finalPoints;
  return finalPoints;
}

function collectInsight(element, stepId, points) {
  if (gameState.collectedSteps[stepId]) {
    showCustomAlert(`Ya dominaste este paso SRAP.`, "Paso Completo");
    return;
  }
  const gained = applyCombo(points);
  gameState.collectedSteps[stepId] = true;
  let message = `¡Paso SRAP **${stepId.toUpperCase()}** completado! Has ganado **${gained} Insights**.`;
  if (gameState.comboCount >= 3) {
    message += `<br/><span class="text-neon-blue font-bold">¡COMBO ACTIVADO! (x${Math.min(Math.floor(gameState.comboCount / 3) + 1, 3)})</span>`;
  }
  showCustomAlert(message, "SRAP Dominado");
  updateScores();
  updateStepVisual(element);
  saveState();
}

// Ritual Registry
const RITUALS = {
  error: {
    title: "💥 Error Creativo",
    execute: () => {
      gameState.epicDisasterLevel += 1;
      const roll = Math.random();
      if (roll < 0.3)
        return {
          points: 5,
          message: "¡**SUPER INSIGHT**! El error te dio una visión épica.",
        };
      if (roll < 0.5)
        return {
          points: -2,
          message:
            "¡**CHAOS FEEDBACK**! El caos te recordó que el aprendizaje duele.",
        };
      return {
        points: 1,
        message: "¡Orale! Ganaste insight por atreverte al caos.",
      };
    },
  },
  fiesta: {
    title: "🌮 Fiesta Estratégica",
    execute: () => {
      gameState.epicDisasterLevel += 2;
      return {
        points: 2,
        message: "¡Fiesta completa! Desastre Épico incrementa.",
      };
    },
  },
};

function startChaosRitual(ritualType) {
  const ritual = RITUALS[ritualType];
  if (!ritual) return;
  const result = ritual.execute();
  const gained = applyCombo(result.points);
  let message = `${result.message}<br/>Ganaste **${gained} Insights**.`;
  showCustomAlert(message, ritual.title);
  updateScores();
  saveState();
}

function checkMandalaSynergy() {
  const requiredSequence = ["creativo", "critico", "tactico"];
  if (gameState.hatSequence.length >= 3) {
    const lastThree = gameState.hatSequence.slice(-3);
    if (JSON.stringify(lastThree) === JSON.stringify(requiredSequence)) {
      const bonus = 10;
      gameState.insightPoints += bonus;
      gameState.hatSequence = [];
      showCustomAlert(
        `🎉 ¡SINERGIA CHALAMANDRA! 🎉 BONUS: +${bonus} Insights.`,
        "¡ÉPICO COMBO!",
      );
      updateScores();
      return true;
    }
  }
  return false;
}

function revealHatInsight(element, hatType, insightText) {
  const isRevealed = element.classList.contains("hat-revealed");
  const points = 3;
  if (gameState.collectedHats[hatType]) {
    element.classList.toggle("hat-revealed", !isRevealed);
    if (gameState.hatSequence[gameState.hatSequence.length - 1] !== hatType)
      gameState.hatSequence.push(hatType);
    checkMandalaSynergy();
    return;
  }
  const gained = applyCombo(points);
  gameState.collectedHats[hatType] = true;
  gameState.hatSequence.push(hatType);
  element.classList.add("hat-revealed");
  showCustomAlert(
    `¡Sombrero **${hatType.toUpperCase()}** activado! +${gained} Insights.<br/><br/>**Tarea:** ${insightText}`,
    "Mandala Activo",
  );
  checkMandalaSynergy();
  updateScores();
  updateHatVisual(element);
  saveState();
}

function resetGame() {
  if (confirm("¿Seguro que quieres resetear tu progreso, warrior?")) {
    gameState = { ...DEFAULT_STATE };
    localStorage.removeItem("chalamandra_state");
    renderLevel(0);
  }
}

// === 6. ACCESIBILIDAD ===
function enhanceAccessibility() {
  const interactiveSelectors = [".srap-step", ".chaos-ritual", ".mandala-hat"];
  const selectorString = interactiveSelectors.join(", ");
  document.querySelectorAll(selectorString).forEach((element) => {
    element.setAttribute("role", "button");
    element.setAttribute("tabindex", "0");
  });
  document.body.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      const target = e.target.closest(selectorString);
      if (target) {
        e.preventDefault();
        target.click();
      }
    }
  });
}

// === 7. INICIALIZACIÓN ===
window.initGame = function (mode) {
  gameMode = mode;
  loadState();
  renderLevel(gameState.currentLevel);
  enhanceAccessibility();
};
