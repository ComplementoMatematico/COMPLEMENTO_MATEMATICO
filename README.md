# Complemento Matemático · Práctica PAES (HTML + CSS + JavaScript)

Repositorio de problemas PAES (M1 · M2 · Física) listo para **GitHub Pages**.
Sin servidor, sin Python y sin dependencias. Es gratis y rápido para cientos de estudiantes.

## Estructura

```
complemento_matematico/
├── index.html            ← estructura de la página (abre esto)
├── css/app.css           ← diseño (misma identidad que el libro y la portada)
├── js/app.js             ← la aplicación: filtros, cronómetro, ensayo, progreso…
├── problemas.js          ← los datos: window.PROBLEMS = [...]  (lo exporta el generador)
├── actividades.js        ← las actividades interactivas: window.ACTIVIDADES = [...]
├── img/                  ← logo, íconos y fondo del camino (versiones livianas)
├── images/m1, m2, fisica ← imágenes de los enunciados
├── manifest.webmanifest  ← permite instalarla como app en el celular
└── sw.js                 ← la deja guardada en el aparato (abre más rápido y sin conexión)
```

`problemas.js` y `actividades.js` mantienen **exactamente el mismo formato** de antes: el generador sigue funcionando igual.

## Qué ofrece

**Lo que ya tenía, rediseñado:**

- **Bienvenida:** con las recomendaciones, el enlace al DEMRE y al canal de YouTube. Aparece solo la primera vez y se vuelve a abrir desde el pie.
- **Filtros:** prueba, eje, habilidades, contenidos y búsqueda por código, con los filtros activos a la vista y el botón «Limpiar todo».
- **Modo examen:** 90 s, 120 s o **Libre**, con cronómetro circular. Al iniciar aparece el enunciado y el tiempo parte a la vez.
- **Video de solución:** aparece al responder. Se carga recién al tocarlo, así la página no se pone lenta.
- **Preguntas vistas:** «🔒 Ya la hice» o «marcar al responder». No se repiten en la aleatoria durante la sesión.
- **Actividades interactivas:** filtradas por eje.

**Lo nuevo:**

- **⌂ Inicio** lleva a la portada principal (Teoría o Práctica) y **📖 Teoría**, al libro.
- **Mapa de preguntas:** números de color según la última respuesta (verde o rojo) y candado si está marcada como vista.
- **Mi progreso:** respondidas, porcentaje de acierto, tiempo promedio y avance por eje. También lista las preguntas «para repasar». Queda guardado en el aparato del estudiante.
- **Descargar / cargar progreso:** en «Mi progreso», **⬇ Descargar mi progreso** guarda un archivo `progreso-paes-AAAA-MM-DD.json` con las respuestas y las preguntas vistas. Con **⬆ Cargar progreso** se recupera en el mismo u otro aparato: se une con lo que ya había (por pregunta gana la respuesta más reciente) y todo lo respondido o visto queda fuera de la aleatoria y del mini ensayo, para no repetir preguntas.
- **Mini ensayo:** 5, 10 o 20 preguntas seguidas con los filtros activos. Al final muestra puntaje, tiempo y revisión de cada pregunta con su video.
- **Enunciados:** zoom al tocarlos.
- **Enlace directo** a cada pregunta (botón 🔗; por ejemplo `…/#P27-PAES-M1-AD-2026-R-DEMRE`).
- **Atajos de teclado:** `Enter` iniciar · `A`–`E` responder · `←` `→` moverse · `N` aleatoria · `R` reiniciar.
- **Celular:** barra de acciones abajo (con el tiempo a la vista) y filtros en un panel lateral.

## Enlaces al resto del proyecto

Están al comienzo de `js/app.js`:

```js
const URL_PORTADA = 'https://complementomatematico.github.io/ComplementoMatematicoPAES/';
```

Si la portada del libro se publica en otra dirección, cambia solo esa línea.

## Cómo probar en tu computador

Abre `index.html` con doble clic. Funciona directo: usa archivos `.js`, no `fetch`, así que no necesitas levantar ningún servidor.

## Cómo subir a GitHub Pages

En el repositorio: **Settings → Pages → Source: Deploy from a branch → main / (root)**.

## Cómo actualizar los problemas

1. Abre tu generador (`server.py` + `index.html`) como siempre.
2. Registra o edita problemas.
3. Usa el botón **⬇ Exportar problemas.js** (o **📋 Copiar para pegar**).
4. Reemplaza el `problemas.js` de este repositorio por el nuevo. Haz commit y push.

Las imágenes que uses en el generador deben quedar en la misma ruta que indica cada problema (por ejemplo, `images/m1/P27-...png`).

Si cambias el diseño (`css/` o `js/`), sube el nombre de la caché en `sw.js` (por ejemplo, `cm-practica-v3` → `-v4`). Así los aparatos que la tienen instalada toman la versión nueva.
