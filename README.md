# Complemento Matemático — versión estática (HTML + CSS + JavaScript)

Repositorio de problemas PAES (M1 · M2 · Física) listo para **GitHub Pages**.
Sin servidor, sin Python, sin dependencias. Gratis y rápido para cientos de estudiantes.

## Estructura
```
complemento-matematico/
├── index.html        ← la app completa (abre esto)
├── problemas.js      ← los datos: window.PROBLEMS = [...]
├── actividades.js    ← las actividades interactivas del modal
├── LogoCM.png        ← logo
└── images/m1/...     ← imágenes de los enunciados (agrégalas tú)
```

## Cómo probar en tu compu
Abre `index.html` con doble clic. Funciona directo (usa archivos `.js`, no `fetch`, así que
no necesitas levantar ningún servidor). Si no ves las imágenes es porque falta la carpeta
`images/` — cópiala aquí y listo.

## Cómo subir a GitHub Pages
1. Crea un repositorio (ej. `COMPLEMENTO_MATEMATICO`).
2. Sube estos archivos + la carpeta `images/`.
3. En el repo: **Settings → Pages → Source: Deploy from a branch → main / (root)**.
4. En ~1 minuto queda en `https://TU-USUARIO.github.io/COMPLEMENTO_MATEMATICO/`.

## Cómo actualizar los problemas
1. Abre tu generador (`server.py` + `index.html`) como siempre.
2. Registra/edita problemas.
3. Botón **⬇ Exportar problemas.js** (o **📋 Copiar para pegar**).
4. Reemplaza el `problemas.js` de este repo por el nuevo. Commit + push. Fin.

Las imágenes que uses en el generador deben quedar en la misma ruta que dice cada
problema (ej. `images/m1/P27-...png`) dentro de este repo.
