# Checklist Final Visual de QA SRAP - Chalamandra Magistral

Este documento detalla los pasos para realizar una revisión visual completa (QA) antes de aprobar cambios en producción. El objetivo es asegurar coherencia en UX, performance y monetización.

## 1. UX & Flujo (SRAP)
- [ ] **Navegación:** Verificar que los botones de navegación (Home, N.2, N.3, N.5) funcionen correctamente y cambien de estado activo/inactivo.
- [ ] **Flow de Niveles:** Completar el flujo desde el Nivel 0 hasta el Nivel 5.
    - [ ] Nivel 2: Confirmar que los pasos SRAP (Scan, Respira, Alinea, Pausa) se marquen como completados y sumen puntos.
    - [ ] Nivel 3: Ejecutar rituales de caos y verificar actualizaciones en la métrica de desmadre.
    - [ ] Nivel 5: Activar los sombreros y confirmar la aparición de insights.
- [ ] **Modal de Alertas:** Asegurar que los mensajes de alerta (Insights, errores, etc.) se muestren con el estilo neon correcto y sean legibles.
- [ ] **Responsividad:** Revisar la visualización en móvil y escritorio. Los elementos no deben romperse.

## 2. Monetización (Buy Me a Coffee)
- [ ] **Visibilidad:** El botón "Buy me a coffee" debe aparecer fijo en la esquina inferior derecha.
- [ ] **Estilo:** Debe respetar el diseño oficial (amarillo #FFDD00, fuente Cookie) y no interferir con otros elementos de la UI.
- [ ] **Funcionalidad:** Al hacer clic, debe abrir el widget o la página de donación correspondiente.
- [ ] **Persistencia:** Debe estar presente tanto en la versión `docs/` como en `full/`.

## 3. Performance & Assets
- [ ] **Carga de Scripts:** Verificar en la consola del navegador que no haya errores de carga (404) para `styles.css` o `script.js`.
- [ ] **Fuentes:** Confirmar que las fuentes (Monoton, Inter) se carguen correctamente desde Google Fonts.
- [ ] **Tailwind:** Asegurar que los estilos de utilidad de Tailwind se apliquen.
- [ ] **Animaciones:** Las animaciones (fadeIn, dance de la salamandra) deben ser fluidas.

## 4. Estructura del Repositorio
- [ ] **Carpetas:** Confirmar existencia de `docs/`, `full/` y `assets/`.
- [ ] **Limpieza:** No deben existir archivos de build (`package.json`, `node_modules`) en la raíz.

---
*Si todos los puntos están marcados, el cambio está listo para merge.*
