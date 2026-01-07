// === 1. ESTADO CENTRAL DEL JUEGO (GAMESTATE) ===
const gameState = {
    currentLevel: 0,
    insightPoints: 0,
    epicDisasterLevel: 0,
    collectedSteps: {}, // Pasos SRAP completados
    collectedHats: {},  // Sombreros activados
    hatSequence: [],    // Secuencia de sombreros activados para el bonus de sinergia
    unlockedLevels: { 0: true, 2: false, 3: false, 5: false }
};

// === 2. REFERENCIAS Y MAPEO DE UI ===
const levelSections = document.querySelectorAll('.level-section');
const mainTitle = document.getElementById('main-title');
const insightCounter = document.getElementById('insight-counter');
const chaosMetricDisplay = document.getElementById('chaos-metric-display');

const levelTitles = {
    0: 'Blueprint Chalamandra™',
    2: '🌀 SRAP Flow Premium',
    3: '🌪 Caos Controlado: Labs',
    5: '🎩 Mandala Multiconsciente VIP'
};

// Modal elements
const customModal = document.getElementById('custom-modal');
const modalTitle = document.getElementById('modal-title');
const modalMessage = document.getElementById('modal-message');

// === 3. FUNCIONES DE UI Y ALERTA PERSONALIZADA ===

// Reemplazo de alert() con un modal estilizado
function showCustomAlert(message, title = '¡Notificación Warrior!') {
    modalTitle.textContent = title;
    modalMessage.innerHTML = message;
    customModal.classList.remove('hidden');
    customModal.classList.add('flex');
}

function hideCustomAlert() {
    customModal.classList.add('hidden');
    customModal.classList.remove('flex');
}

// Actualiza el contador global y la métrica de caos
function updateUI() {
    insightCounter.textContent = gameState.insightPoints;

    // Lógica de la Métrica de Desmadre/Caos (Premium)
    // Esto es una medida de cuánto caos has generado vs. cuánto Insight tienes.
    const totalActivity = Object.keys(gameState.collectedSteps).length + gameState.epicDisasterLevel + Object.keys(gameState.collectedHats).length;
    const flowControl = totalActivity > 0 ? (gameState.insightPoints / totalActivity).toFixed(2) : 0;

    chaosMetricDisplay.innerHTML =
        `Desastre Épico: <span class="text-red-400">${gameState.epicDisasterLevel}</span> | Flow Control (Ratio Insight/Actividad): <span class="${flowControl > 1.5 ? 'text-lime-400' : 'text-yellow-400'}">${flowControl}</span>`;

    // Refrescar estado de los pasos SRAP
    document.querySelectorAll('.srap-step').forEach(step => {
        const stepId = step.id;
        if (gameState.collectedSteps[stepId]) {
            step.classList.add('srap-active');
            step.style.cursor = 'default';
        } else {
            step.classList.remove('srap-active');
            step.style.cursor = 'pointer';
        }
    });

    // Refrescar estado de los sombreros
    document.querySelectorAll('.mandala-hat').forEach(hat => {
        const hatType = hat.id.replace('hat-', '');
        if (gameState.collectedHats[hatType]) {
            // Si ya está activo, permitimos que el usuario lo active/desactive visualmente
            hat.style.borderColor = 'var(--neon-lime)';
        } else {
                hat.style.borderColor = 'var(--neon-purple)';
        }
    });

    // Actualizar barra de navegación
    Object.keys(gameState.unlockedLevels).forEach(level => {
        const btn = document.getElementById(`nav-btn-${level}`);
        const isLocked = !gameState.unlockedLevels[level];
        if (btn) {
            btn.classList.toggle('nav-locked', isLocked);
            btn.classList.toggle('nav-active', parseInt(level) === gameState.currentLevel);
            btn.disabled = isLocked;
        }
    });
}

// === 4. FUNCIONES DE NAVEGACIÓN Y FLUJO LÓGICO ===

// Renderiza el nivel actual (llamado por la navegación)
function renderLevel(level) {
    level = parseInt(level);

    if (!gameState.unlockedLevels[level]) {
        showCustomAlert(`¡Calma, carnal! El Nivel ${level} está bloqueado. Termina la tarea anterior para avanzar.`, 'Acceso Restringido');
        return;
    }

    gameState.currentLevel = level;

    // Ocultar todos y mostrar el activo
    levelSections.forEach(section => {
        section.classList.add('hidden');
    });

    const activeSection = document.getElementById(`level-${level}`);
    if (activeSection) {
        activeSection.classList.remove('hidden');
    }

    // Actualizar título y UI
    mainTitle.textContent = levelTitles[level];
    updateUI();
}

// Desbloquea un nivel y luego lo renderiza (llamado por los CTAs de avance)
function unlockAndRenderLevel(level) {
    gameState.unlockedLevels[level] = true;
    renderLevel(level);
}

// === 5. GAMIFICACIÓN (Lógica de Interacción Premium) ===

// Nivel 2: Pasos SRAP (Ahora con diferentes puntos de Insight)
function collectInsight(element, stepId, points) {
    if (gameState.collectedSteps[stepId]) {
            showCustomAlert(`Ya dominaste este paso SRAP: ${stepId}. Busca el siguiente Insight.`, 'Paso Completo');
            return;
    }

    // Ganar punto
    gameState.insightPoints += points;
    gameState.collectedSteps[stepId] = true;

    // Mensaje de recompensa
    let message = `¡Paso SRAP **${stepId.toUpperCase()}** completado! Has ganado **${points} Insights**.`;

    if (points === 2) {
        message += '<br/><span class="text-lime-500 font-bold">¡Doble Insight por la Intención Poderosa!</span>';
    }

    // Refuerza el mensaje de dominio por práctica
    message += `<br/><br/>**REGLA:** El sistema registra tu click asumiendo que **completaste la Tarea de Reflexión** asociada. ¡Bien jugado, Warrior!`;


    showCustomAlert(message, 'SRAP Dominado');
    updateUI();
}

// Nivel 3: Rituales de Caos (Impacto en la Métrica de Desmadre y Riesgo/Recompensa)
function startChaosRitual(ritualType) {
    let insightGained = 0;
    let title = 'Ritual Activado';
    let message = '';

    // Mensaje base de la regla de dominio por práctica
    let practiceRule = `<br/><br/>**REGLA:** El sistema registra tu click asumiendo que **ejecutaste este Ritual de Caos** en un problema real. ¡Sigue rompiendo el patrón!`;


    if (ritualType === 'error') {
        gameState.epicDisasterLevel += 1;
        title = '💥 Error Creativo (Riesgo)';

        // Simulación de Riesgo/Recompensa con 30% de super-recompensa (+5) y 20% de penalización (-2)
        const roll = Math.random();

        if (roll < 0.3) {
            insightGained = 5; // Super Insight
            message = `¡**SUPER INSIGHT**! El error te dio una visión épica. Ganaste **+${insightGained} Insights**.`;
        } else if (roll < 0.5) {
            insightGained = -2; // Penalización de Caos
            gameState.insightPoints += insightGained; // Aplicar la penalización directamente
            message = `¡**CHAOS FEEDBACK**! Perdiste ${Math.abs(insightGained)} Insights. El caos te recordó que el aprendizaje duele.`;
        } else {
            insightGained = 1; // Recompensa base
            message = `¡Orale! Ganaste **+${insightGained} Insight** por atreverte al caos.`;
        }

    } else if (ritualType === 'fiesta') {
        gameState.epicDisasterLevel += 2;
        insightGained = 2; // Fiesta siempre garantiza Insights
        title = '🌮 Fiesta Estratégica (Seguro)';
        message = `¡Fiesta completa! **Desastre Épico** incrementa. Ganaste **+${insightGained} Insights** garantizados.`;
    }

    if (insightGained >= 0) {
            gameState.insightPoints += insightGained;
    }

    const epicDisasterMessage = `**Desastre Épico** actual: ${gameState.epicDisasterLevel}.`;

    showCustomAlert(message + '<br/><br/>' + epicDisasterMessage + practiceRule, title);
    updateUI();
}

// Función para verificar la sinergia del Mandala (Creativo -> Crítico -> Táctico)
function checkMandalaSynergy() {
    const requiredSequence = ['creativo', 'critico', 'tactico'];

    // Chequea si la secuencia actual contiene la requerida
    if (gameState.hatSequence.length >= 3) {
        const lastThree = gameState.hatSequence.slice(-3); // Get the last 3 activated hats

        // Check if the last three match the required pattern
        if (JSON.stringify(lastThree) === JSON.stringify(requiredSequence)) {
            // Synergy achieved! Reset sequence and grant bonus
            const bonus = 10;
            gameState.insightPoints += bonus;
            gameState.hatSequence = []; // Resetear la secuencia después de la sinergia

            showCustomAlert(`🎉 ¡SINERGIA CHALAMANDRA ACTIVADA! 🎉 Has pasado del CAOS (Creativo) al CONTROL (Táctico) perfectamente. **BONUS: +${bonus} Insights**.`, '¡ÉPICO COMBO!');
            updateUI();
            return true;
        }
    }
    return false;
}


// Nivel 5: Sombreros Mandala (Doble/Triple Insight por cada activación + Sinergia)
function revealHatInsight(element, hatType, insightText) {

    const isRevealed = element.classList.contains('hat-revealed');
    const points = 3; // Insights Premium por Sombrero

    // Si ya fue revelado, solo toggle visual del insight (para ocultar/mostrar tip)
    if (gameState.collectedHats[hatType]) {
        element.classList.toggle('hat-revealed', !isRevealed);

        // Añadir a la secuencia solo si es la última acción, para evitar secuencias largas y falsas.
        if (gameState.hatSequence[gameState.hatSequence.length - 1] !== hatType) {
            gameState.hatSequence.push(hatType);
        }

        checkMandalaSynergy(); // Check synergy even if re-clicking
        return;
    }

    // Primera activación: Ganar Insights y registrar
    gameState.insightPoints += points;
    gameState.collectedHats[hatType] = true;
    gameState.hatSequence.push(hatType); // Add to sequence

    // Mostrar Insight
    element.classList.add('hat-revealed');

    // Refuerza el mensaje de dominio por perspectiva/rol
    let message = `¡Sombrero **${hatType.toUpperCase()}** activado! Has ganado **+${points} Insights**. <br/><br/>**Tu Tarea:** ${insightText}`;
    message += `<br/><br/>**REGLA:** El sistema te premia por **cambiar tu Rol de Conciencia** y ejecutar la Tarea que se revela.`;

    showCustomAlert(message, 'Mandala Activo');

    checkMandalaSynergy(); // Check synergy
    updateUI();
}

// === 6. INICIALIZACIÓN ===
document.addEventListener('DOMContentLoaded', () => {
    renderLevel(0); // Iniciar siempre en el nivel 0
});
