# Blueprint Chalamandra - SRAP Barrio Edition

Este es un proyecto web ligero y gamificado para el desarrollo personal, enfocado en manejar el caos y encontrar el flow.

## Arquitectura de Flujo Premium

El siguiente diagrama ilustra el flujo del usuario desde la versión Demo hasta la versión Premium Completa:

```mermaid
graph TD
    User([Usuario]) --> Demo[Demo Gratis (Nivel 0-2)]
    Demo --> |Intentar Avanzar| Paywall{Paywall}
    Paywall --> |Comprar| Payment[Proceso de Pago (Ko-fi)]
    Payment --> |Éxito| Full[Versión Completa (Nivel 0-5)]
    Full --> Mastery([Dominio del Flow])
```

## Estructura del Proyecto

El proyecto ha sido reorganizado para mayor claridad y mantenibilidad:

- `assets/`: Contiene los archivos CSS y JS compartidos.
  - `css/styles.css`: Estilos visuales del proyecto.
  - `js/script.js`: Lógica de la aplicación y gamificación (Soporte Multi-Modo).
- `demo/`: Versión de demostración del proyecto.
  - `index.html`: Punto de entrada para la demo (Modo 'demo').
- `full/`: Versión completa del entrenamiento.
  - `index.html`: Punto de entrada para la versión completa (Modo 'full').

## Cómo usar

1.  **Demo**: Abre `demo/index.html`. Tendrás acceso limitado.
2.  **Premium**: Tras el pago, el usuario es redirigido a `full/index.html` donde tiene acceso total.

## Desarrollo

Para editar el código:

1.  Modifica `assets/css/styles.css` para cambios visuales.
2.  Modifica `assets/js/script.js` para cambios en la lógica.
3.  Los archivos HTML en `demo/` y `full/` consumen estos recursos compartidos inicializando el juego con `initGame('demo')` o `initGame('full')`.

## Comandos

- `npm install`: Instala dependencias de desarrollo.
- `npm run start`: Inicia un servidor local.

## Tecnologías

- HTML5
- CSS3 (con Tailwind CSS vía CDN)
- JavaScript (Vanilla)
