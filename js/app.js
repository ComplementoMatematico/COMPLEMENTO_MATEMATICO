/* ══════════════════════════════════════════════════════════════════════
   PRÁCTICA PAES · Complemento Matemático
   ──────────────────────────────────────────────────────────────────────
   Datos: window.PROBLEMS (problemas.js) y window.ACTIVIDADES (actividades.js),
   con el mismo formato que exporta el generador. Este archivo solo los lee.

   Estado que se guarda en el navegador del estudiante (localStorage):
     cm_practica_hist   → última respuesta, intentos y aciertos por pregunta
     cm_practica_pref   → tiempo elegido, largo del mini ensayo, bienvenida vista
   Las preguntas «vistas» (bloqueadas para la aleatoria) duran solo la sesión,
   como en la versión anterior.
   ══════════════════════════════════════════════════════════════════════ */
const App = (() => {
'use strict';

/* ── Enlaces del ecosistema Complemento Matemático ── */
const URL_PORTADA = 'https://complementomatematico.github.io/APCI26/Manual_PAES/';   // ⌂ Inicio (Teoría o Práctica)
const URL_LIBRO = v => URL_PORTADA + 'libro-' + v + '.html';                          // 📖 Teoría

/* ── Catálogos (espejo del generador) ── */
const HABILIDADES_POR_PRUEBA = {
  M1: ['Resolución de problemas', 'Modelar', 'Representar', 'Argumentar y comunicar'],
  M2: ['Resolución de problemas', 'Modelar', 'Representar', 'Argumentar y comunicar'],
  FISICA: ['Observar y plantear preguntas', 'Planificar y conducir una investigación', 'Procesar y analizar la evidencia', 'Evaluar', 'Comunicar'],
};
const EJES_POR_PRUEBA = { M1: ['Números', 'Álgebra', 'Geometría', 'Estadística'], M2: ['Números', 'Álgebra', 'Geometría', 'Estadística'], FISICA: ['Ondas', 'Mecánica', 'Energía y Tierra', 'Electricidad'] };
const CONTENIDOS_POR_EJE = {
  'Números': ['Números naturales', 'Números enteros', 'Números racionales', 'Fracciones', 'Decimales', 'Porcentajes', 'Proporcionalidad', 'Proporcionalidad directa', 'Proporcionalidad inversa', 'Potencias', 'Raíces', 'Números reales'],
  'Álgebra': ['Expresiones algebraicas', 'Ecuaciones de primer grado', 'Ecuaciones cuadráticas', 'Inecuaciones de primer grado', 'Inecuaciones cuadráticas', 'SEL 2x2', 'Funciones', 'Función lineal', 'Función cuadrática', 'Función exponencial'],
  'Geometría': ['Figuras y cuerpos geométricos', 'Perímetro', 'Área', 'Volumen', 'Teorema de Pitágoras', 'Semejanza y congruencia', 'Transformaciones isométricas', 'Geometría analítica', 'Trigonometría'],
  'Estadística': ['Tablas y gráficos estadísticos', 'Medidas de tendencia central', 'Medidas de dispersión', 'Probabilidad', 'Distribuciones'],
  'Ondas': ['Características de las ondas', 'Sonido', 'Luz y óptica geométrica', 'Espectro electromagnético', 'Ondas electromagnéticas'],
  'Mecánica': ['Cinemática', 'Dinámica y Leyes de Newton', 'Trabajo y energía', 'Cantidad de movimiento'],
  'Energía y Tierra': ['Ondas sísmicas', 'Capas de la tierra', 'Núcleo de la tierra'],
  'Electricidad': ['Carga eléctrica y campo eléctrico', 'Circuitos eléctricos', 'Magnetismo', 'Inducción electromagnética'],
};
const COLOR_EJE = { 'Álgebra': '#5aa7ff', 'Números': '#f5b041', 'Geometría': '#3ecf8e', 'Estadística': '#b88bff', 'Ondas': '#27d3d3', 'Mecánica': '#ff7a6b', 'Energía y Tierra': '#d9a066', 'Electricidad': '#ffd84d' };
const NOMBRE_PRUEBA = { Todas: 'Todas', M1: 'M1', M2: 'M2', FISICA: 'Física' };
const RECOMENDACIONES = [
  'Reflexiona sobre tu nivel de interés con la rendición de la evaluación.',
  'Reflexiona e infórmate sobre carreras de nivel superior que se ajusten a tus intereses y posibilidades de ingreso y sostenibilidad.',
  'Gestiona tu tiempo y crea un programa de estudio personalizado. La semana es un conjunto de 168 horas: depende de ti aprovecharlas. El tiempo es un regalo que no se puede controlar, pero sí gestionar.',
  'Infórmate sobre los contenidos que debes dominar y las habilidades que debes desarrollar para tener éxito.',
  'Reflexiona sobre los problemas: ¿cómo se resuelve?, ¿lo abordé bien?, ¿de cuántas formas se resuelve?, ¿qué otra pregunta se puede generar?, ¿cómo me podría haber equivocado?',
  'Date mensajes de éxito. Si crees que no lo lograrás, el resultado ya está sentenciado; si crees en ti y das lo mejor, tu entrenamiento dará frutos.',
  'Concéntrate en conocer la prueba, entrenarte como resolutor(a) de problemas y desarrollar una autoestima académica que te permita gestionar tus emociones y rendir con la convicción de que tendrás éxito.',
];

/* ── Datos ── */
const PROBLEMS = (window.PROBLEMS || []).filter(p => p && (p.nombre || p.id));
const ACTIVIDADES = window.ACTIVIDADES || [];
const nombreDe = p => (p && (p.nombre || p.id)) || '';
const porNombre = new Map(PROBLEMS.map((p, i) => [nombreDe(p), i]));

/* ── Utilidades ── */
const $ = s => document.querySelector(s);
const esc = s => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const leer = (k, d) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } };
const guardar = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };
const mezclar = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const fmt = s => { s = Math.max(0, Math.round(s)); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); };
const fmtLargo = s => { s = Math.round(s); const m = Math.floor(s / 60), r = s % 60; return m ? `${m} min ${r} s` : `${r} s`; };
const colorEje = e => COLOR_EJE[e] || '#9aa4b5';
const codigoCorto = n => { const m = String(n).match(/^P(\d+)/i); return m ? m[1] : String(n).slice(0, 3); };
function ytId(url) { const m = (url || '').match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?(?:.*&)?v=|shorts\/|embed\/|live\/))([A-Za-z0-9_-]{11})/); return m ? m[1] : null; }
function ytInicio(url) { const t = (url || '').match(/[?&#](?:t|start)=(\d+)(?:s)?/); return t ? +t[1] : 0; }
function aviso(txt) { const a = $('#aviso'); a.textContent = txt; a.classList.add('ver'); clearTimeout(aviso._t); aviso._t = setTimeout(() => a.classList.remove('ver'), 2400); }

/* ── Estado ── */
const pref = Object.assign({ tiempo: 90, ensayo: 10, bienvenida: false }, leer('cm_practica_pref', {}));
const hist = leer('cm_practica_hist', {});          // { nombre: {i: intentos, c: correctas, u: 'ok'|'mal', t: segundos, f: fecha} }
const S = {
  prueba: 'Todas', eje: 'Todos', habilidades: [], contenidos: [], busqueda: '',
  idx: 0, seleccion: null, iniciada: false, bloqueadas: new Set(), autoBloquear: false,
  ejeAct: 'Todos', ensayo: null, modal: null,
};
const T = { inicio: null, dur: pref.tiempo, corriendo: false, detenido: false, iv: 0, usado: 0 };
const guardarPref = () => guardar('cm_practica_pref', pref);

/* ═══════════════ FILTRADO ═══════════════ */
const PRUEBAS = ['Todas', 'M1', 'M2', 'FISICA'];
function ejesDe(prueba) { return prueba === 'Todas' ? Object.keys(CONTENIDOS_POR_EJE) : (EJES_POR_PRUEBA[prueba] || Object.keys(CONTENIDOS_POR_EJE)); }
function habilidadesDe(prueba) {
  if (prueba !== 'Todas') return HABILIDADES_POR_PRUEBA[prueba] || [];
  return [...new Set(Object.values(HABILIDADES_POR_PRUEBA).flat())].sort((a, b) => a.localeCompare(b, 'es'));
}
function contenidosDe(eje, prueba) {
  if (eje !== 'Todos') return CONTENIDOS_POR_EJE[eje] || [];
  return [...new Set(ejesDe(prueba).flatMap(e => CONTENIDOS_POR_EJE[e] || []))].sort((a, b) => a.localeCompare(b, 'es'));
}
function filtrar() {
  let l = S.prueba === 'Todas' ? PROBLEMS : PROBLEMS.filter(p => p.prueba === S.prueba);
  if (S.eje !== 'Todos') l = l.filter(p => p.eje === S.eje);
  if (S.habilidades.length) l = l.filter(p => (p.habilidades || []).some(h => S.habilidades.includes(h)));
  if (S.contenidos.length) l = l.filter(p => (p.contenidos || []).some(c => S.contenidos.includes(c)));
  return l;
}
function visibles() {
  const l = filtrar();
  if (!S.busqueda) return l;
  const q = S.busqueda.toLowerCase();
  return l.filter(p => nombreDe(p).toLowerCase().includes(q));
}
const actual = () => PROBLEMS[S.idx];

/* ═══════════════ RENDER: FILTROS Y MAPA ═══════════════ */
function chip(txt, activo, accion, color) {
  return `<button type="button" class="chip${activo ? ' on' : ''}" ${color ? `style="--c:${color}"` : ''} aria-pressed="${activo}" onclick="${accion}">${esc(txt)}</button>`;
}
function renderFiltros() {
  $('#fPrueba').innerHTML = PRUEBAS.map(p => `<button type="button" role="radio" aria-checked="${S.prueba === p}" class="${S.prueba === p ? 'on' : ''}" onclick="App.prueba('${p}')">${NOMBRE_PRUEBA[p]}<small>${p === 'Todas' ? PROBLEMS.length : PROBLEMS.filter(x => x.prueba === p).length}</small></button>`).join('');
  const base = S.prueba === 'Todas' ? PROBLEMS : PROBLEMS.filter(p => p.prueba === S.prueba);
  $('#fEje').innerHTML = chip('Todos', S.eje === 'Todos', "App.eje('Todos')") +
    ejesDe(S.prueba).map(e => { const n = base.filter(p => p.eje === e).length; return n || S.eje === e ? chip(`${e} · ${n}`, S.eje === e, `App.eje('${e}')`, colorEje(e)) : ''; }).join('');
  const habs = habilidadesDe(S.prueba), conts = contenidosDe(S.eje, S.prueba);
  $('#fHab').innerHTML = habs.map(h => chip(h, S.habilidades.includes(h), `App.hab(${JSON.stringify(h).replace(/"/g, '&quot;')})`)).join('') || '<span class="nota">Sin habilidades</span>';
  $('#fCont').innerHTML = conts.map(c => chip(c, S.contenidos.includes(c), `App.cont(${JSON.stringify(c).replace(/"/g, '&quot;')})`)).join('') || '<span class="nota">Sin contenidos</span>';
  $('#nHab').textContent = S.habilidades.length || ''; $('#nCont').textContent = S.contenidos.length || '';
  // filtros activos
  const act = [];
  if (S.prueba !== 'Todas') act.push([NOMBRE_PRUEBA[S.prueba], "App.prueba('Todas')"]);
  if (S.eje !== 'Todos') act.push([S.eje, "App.eje('Todos')"]);
  S.habilidades.forEach(h => act.push([h, `App.hab(${JSON.stringify(h).replace(/"/g, '&quot;')})`]));
  S.contenidos.forEach(c => act.push([c, `App.cont(${JSON.stringify(c).replace(/"/g, '&quot;')})`]));
  if (S.busqueda) act.push([`«${S.busqueda}»`, 'App.buscar("")']);
  $('#activos').innerHTML = act.length ? act.map(([t, a]) => `<button type="button" class="activo" onclick="${a}" title="Quitar filtro">${esc(t)} <i>✕</i></button>`).join('') + `<button type="button" class="limpiar" onclick="App.limpiar()">Limpiar todo</button>` : '';
  renderMapa();
}
function renderMapa() {
  const v = visibles(), n = nombreDe(actual());
  $('#nVis').textContent = v.length; $('#nVisM').textContent = v.length;
  $('#mapa').innerHTML = v.length ? v.map(p => {
    const k = nombreDe(p), h = hist[k], cls = [h ? (h.u === 'ok' ? 'ok' : 'mal') : '', S.bloqueadas.has(k) ? 'blo' : '', k === n ? 'act' : ''].join(' ');
    return `<button type="button" class="celda ${cls}" style="--c:${colorEje(p.eje)}" onclick="App.ir('${esc(k)}')" title="${esc(k)} · ${esc(p.eje || '')}">${codigoCorto(k)}</button>`;
  }).join('') : '<div class="vacio">Ninguna pregunta coincide con los filtros.<br><button class="btn btn-sec" onclick="App.limpiar()">Limpiar filtros</button></div>';
  const b = S.bloqueadas.size; $('#nBloq').textContent = b ? `${b} marcada${b > 1 ? 's' : ''} como vista${b > 1 ? 's' : ''} en esta sesión` : 'Ninguna marcada como vista aún';
}

/* ═══════════════ RENDER: PREGUNTA ═══════════════ */
function renderPregunta() {
  const p = actual(), tarj = $('#tarjeta');
  if (!p) { tarj.innerHTML = '<div class="portada"><h3>No hay preguntas</h3><p>Revisa que el archivo <b>problemas.js</b> esté junto a index.html.</p></div>'; return; }
  const k = nombreDe(p), v = visibles(), pos = v.findIndex(x => nombreDe(x) === k);
  $('#posicion').innerHTML = pos >= 0 ? `<b>${pos + 1}</b> de ${v.length}` : `fuera de los filtros`;
  const h = hist[k];
  $('#etiquetas').innerHTML = `<span class="et et-prueba">${esc(NOMBRE_PRUEBA[p.prueba] || p.prueba || '')}</span>` +
    `<span class="et" style="--c:${colorEje(p.eje)}">${esc(p.eje || '')}</span><span class="et et-cod">${esc(k)}</span>` +
    (S.bloqueadas.has(k) ? '<span class="et et-blo">🔒 Vista</span>' : '') +
    (h ? `<span class="et et-${h.u}">${h.u === 'ok' ? '✔ La acertaste' : '✘ La fallaste'}${h.i > 1 ? ` · ${h.i} intentos` : ''}</span>` : '');
  const bl = S.bloqueadas.has(k); $('#bBloq').textContent = bl ? '🔓 Incluir en aleatoria' : '🔒 Ya la hice'; $('#bBloq').classList.toggle('btn-oro', bl);

  if (!S.iniciada) {
    const contenidos = (p.contenidos || []).slice(0, 5).map(c => `<span>${esc(c)}</span>`).join('');
    tarj.innerHTML = `<div class="portada">
        <div class="portada-reloj">${T.dur ? fmt(T.dur) : '∞'}</div>
        <h3>¿List@ para resolver?</h3>
        <p>${T.dur ? `Tienes <b>${T.dur} segundos</b>. Al iniciar aparece el enunciado y el cronómetro parte al mismo tiempo.` : 'Modo <b>libre</b>: sin límite de tiempo. El cronómetro solo mide cuánto te demoras.'}</p>
        ${contenidos ? `<div class="portada-temas"><small>Contenidos</small>${contenidos}</div>` : ''}
        <button class="btn btn-verde btn-grande" onclick="App.iniciar()">▶ Iniciar pregunta <kbd>Enter</kbd></button>
      </div>`;
    renderSelTiempo(); renderReloj(); return;
  }
  const img = p.imagen ? `<figure class="enunciado"><img src="${esc(p.imagen)}" alt="Enunciado de la pregunta ${esc(k)}" onclick="App.lupa(this.src)" onerror="this.parentNode.outerHTML='<div class=&quot;img-error&quot;>No se encontró la imagen del enunciado (${esc(p.imagen)}).</div>'"><figcaption>Toca el enunciado para ampliarlo</figcaption></figure>` : '<div class="img-error">Esta pregunta no tiene imagen asociada.</div>';
  const alts = p.alternativas && Object.keys(p.alternativas).length ? p.alternativas : { A: '', B: '', C: '', D: '' };
  const correcta = p.respuesta_correcta || '', resp = S.seleccion !== null, enEnsayo = !!S.ensayo;
  const altsHTML = Object.keys(alts).map(L => {
    let c = 'alt';
    if (resp && enEnsayo) c += L === S.seleccion ? ' marcada' : '';                 // en el ensayo no se revela la correcta
    else if (resp) c += L === S.seleccion ? (L === correcta ? ' bien' : ' mal') : (L === correcta ? ' revela' : '');
    return `<button type="button" class="${c}" ${resp ? 'disabled' : ''} onclick="App.responder('${L}')"><span class="alt-l">${L}</span>${alts[L] ? `<span class="alt-t">${esc(alts[L])}</span>` : ''}</button>`;
  }).join('');
  let res = '';
  if (resp && !enEnsayo) {
    const ok = S.seleccion === correcta, tt = T.usado ? ` · ${fmtLargo(T.usado)}` : '';
    res = `<div class="resultado ${ok ? 'r-ok' : 'r-mal'}" role="alert"><span class="r-ico">${ok ? '✔' : '✘'}</span><div><b>${ok ? '¡Correcto! Muy bien.' : `Incorrecto. La respuesta correcta es ${esc(correcta)}.`}</b><small>${ok ? 'Sigue así' : 'Mira el video y compara tu desarrollo'}${tt}</small></div></div>` + videoHTML(p) +
      `<div class="acciones"><button class="btn btn-sec" onclick="App.reiniciar()">↺ Reiniciar pregunta</button><button class="btn btn-oro" onclick="App.aleatoria()">Siguiente aleatoria →</button></div>`;
  }
  if (resp && enEnsayo) res = `<div class="acciones"><button class="btn btn-oro btn-grande" onclick="App.siguienteEnsayo()">${S.ensayo.i + 1 < S.ensayo.lista.length ? 'Siguiente pregunta →' : 'Ver resultados 🏁'}</button></div>`;
  renderSelTiempo();
  tarj.innerHTML = `${img}<div class="alt-tit">Selecciona una alternativa <small>(teclas ${Object.keys(alts).join(', ')})</small></div><div class="alts">${altsHTML}</div>${res}`;
  renderReloj();
}
function videoHTML(p) {
  const id = ytId(p.video_youtube);
  if (id) return `<div class="video"><div class="video-tit">▶ Video de solución</div><button class="yt-lite" style="background-image:url(https://i.ytimg.com/vi/${id}/hqdefault.jpg)" onclick="App.video(this,'${id}',${ytInicio(p.video_youtube)})" aria-label="Reproducir video de solución"><span>▶</span></button></div>`;
  if (p.video_youtube) return `<a class="btn btn-rojo btn-full" href="${esc(p.video_youtube)}" target="_blank" rel="noopener">▶ Ver solución en YouTube</a>`;
  return '';
}

/* ═══════════════ CRONÓMETRO ═══════════════ */
const CIRC = 2 * Math.PI * 52;
function restante() { return T.dur ? Math.max(0, T.dur - (Date.now() - T.inicio) / 1000) : 0; }
function renderReloj() {
  const prog = $('#aProg'), disp = $('#tDisp'), msg = $('#tMsg'), b = $('#bReloj'), am = $('#amPrin'), an = $('#anillo');
  an.classList.remove('urgente', 'agotado', 'listo');
  if (T.corriendo) {
    const trans = (Date.now() - T.inicio) / 1000, r = restante();
    disp.textContent = T.dur ? fmt(Math.ceil(r)) : fmt(trans);
    prog.style.strokeDashoffset = T.dur ? CIRC * (1 - r / T.dur) : 0;
    if (T.dur && r <= 0) { an.classList.add('agotado'); msg.textContent = '¡Tiempo agotado!'; } else if (T.dur && r <= 15) { an.classList.add('urgente'); msg.textContent = 'últimos segundos'; } else msg.textContent = T.dur ? 'restantes' : 'transcurrido';
    b.textContent = '↺ Reiniciar pregunta'; am.textContent = `⏱ ${disp.textContent} · Reiniciar`;
  } else if (T.detenido) {
    an.classList.add('listo'); disp.textContent = fmt(T.usado); msg.textContent = 'tu tiempo';
    prog.style.strokeDashoffset = T.dur ? CIRC * (1 - Math.max(0, T.dur - T.usado) / T.dur) : 0;
    b.textContent = S.ensayo ? '→ Siguiente' : '🎲 Siguiente aleatoria'; am.textContent = S.ensayo ? 'Siguiente' : '🎲 Otra';
  } else {
    disp.textContent = T.dur ? fmt(T.dur) : '∞'; msg.textContent = 'listo para empezar'; prog.style.strokeDashoffset = 0;
    b.textContent = '▶ Iniciar pregunta'; am.textContent = '▶ Iniciar';
  }
}
function renderSelTiempo() {
  $('#fTiempo').innerHTML = [[90, '90 s'], [120, '120 s'], [0, 'Libre']].map(([v, t]) => `<button type="button" role="radio" aria-checked="${pref.tiempo === v}" class="${pref.tiempo === v ? 'on' : ''}" onclick="App.tiempo(${v})" ${T.corriendo ? 'disabled' : ''}>${t}</button>`).join('');
}
function tic() { renderReloj(); if (T.dur && restante() <= 0 && !tic.avisado) { tic.avisado = true; aviso('⏰ ¡Tiempo agotado! Puedes responder igual.'); } }
function pararReloj(reset) { clearInterval(T.iv); T.corriendo = false; if (reset) { T.inicio = null; T.detenido = false; T.usado = 0; } }

/* ═══════════════ ACCIONES ═══════════════ */
function ir(nombre, sinHash) {
  const i = porNombre.get(nombre); if (i === undefined) return;
  S.idx = i; S.seleccion = null; S.iniciada = false; pararReloj(true); T.dur = pref.tiempo; tic.avisado = false;
  if (!sinHash) history.replaceState(null, '', '#' + encodeURIComponent(nombre));
  renderPregunta(); renderMapa(); filtros(false);
  const m = $('#mapa .celda.act'); if (m && m.scrollIntoView) m.scrollIntoView({ block: 'nearest' });
}
function asegurar() { const v = visibles(), k = nombreDe(actual()); if (v.length && !v.some(p => nombreDe(p) === k)) ir(nombreDe(v[0])); }
function refrescar() { asegurar(); renderFiltros(); renderPregunta(); }
function iniciar() {
  if (S.iniciada) return;
  S.iniciada = true; T.dur = pref.tiempo; T.inicio = Date.now(); T.corriendo = true; T.detenido = false; tic.avisado = false;
  clearInterval(T.iv); T.iv = setInterval(tic, 250);
  renderPregunta(); $('#tarjeta').scrollIntoView({ behavior: 'smooth', block: 'start' });
}
function responder(L) {
  if (!S.iniciada || S.seleccion !== null) return;
  const p = actual(), k = nombreDe(p), ok = L === p.respuesta_correcta;
  S.seleccion = L; T.usado = (Date.now() - T.inicio) / 1000; pararReloj(); T.detenido = true;
  const h = hist[k] || { i: 0, c: 0 }; h.i++; if (ok) h.c++; h.u = ok ? 'ok' : 'mal'; h.t = Math.round(T.usado); h.f = Date.now(); hist[k] = h; guardar('cm_practica_hist', hist);
  if (S.autoBloquear) S.bloqueadas.add(k);
  if (S.ensayo) S.ensayo.res[S.ensayo.i] = { k, sel: L, ok, t: T.usado };
  renderPregunta(); renderMapa(); renderAvance();
}
function reiniciar() { S.seleccion = null; S.iniciada = false; pararReloj(true); renderPregunta(); }
function botonReloj() {
  if (!S.iniciada) return iniciar();
  if (S.seleccion === null) return reiniciar();
  if (S.ensayo) return siguienteEnsayo();
  aleatoria();
}
function mover(d) {
  if (S.ensayo) return;
  const v = visibles(); if (!v.length) return;
  const k = nombreDe(actual()); let i = v.findIndex(p => nombreDe(p) === k);
  i = i < 0 ? 0 : (i + d + v.length) % v.length; ir(nombreDe(v[i]));
}
function aleatoria() {
  if (S.ensayo) return aviso('Estás en un mini ensayo: usa «Siguiente pregunta».');
  const l = filtrar(); if (!l.length) return aviso('No hay preguntas con estos filtros.');
  let disp = l.filter(p => !S.bloqueadas.has(nombreDe(p)));
  if (!disp.length) return aviso('🎉 Ya trabajaste todas las preguntas de estos filtros. Desbloquéalas o cambia los filtros.');
  const k = nombreDe(actual()); if (disp.length > 1) disp = disp.filter(p => nombreDe(p) !== k);
  ir(nombreDe(disp[Math.floor(Math.random() * disp.length)]));
}
function alternarBloqueo() { const k = nombreDe(actual()); if (!k) return; S.bloqueadas.has(k) ? S.bloqueadas.delete(k) : S.bloqueadas.add(k); renderPregunta(); renderMapa(); }
function desbloquearTodas() { if (!S.bloqueadas.size) return aviso('No hay preguntas marcadas como vistas.'); S.bloqueadas.clear(); renderPregunta(); renderMapa(); aviso('🔓 Todas las preguntas vuelven a la aleatoria.'); }
function compartir() {
  const url = location.href.split('#')[0] + '#' + encodeURIComponent(nombreDe(actual()));
  if (navigator.clipboard) navigator.clipboard.writeText(url).then(() => aviso('🔗 Enlace copiado: compártelo para abrir esta pregunta.'), () => prompt('Copia el enlace:', url));
  else prompt('Copia el enlace:', url);
}
function video(btn, id, t) {
  btn.outerHTML = `<div class="yt-marco"><iframe src="https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0${t ? '&start=' + t : ''}" title="Video de solución" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div>`;
}

/* ═══════════════ MINI ENSAYO ═══════════════ */
function iniciarEnsayo() {
  const l = filtrar().filter(p => !S.bloqueadas.has(nombreDe(p)));
  if (!l.length) return aviso('No hay preguntas disponibles con estos filtros.');
  const n = Math.min(pref.ensayo, l.length);
  S.ensayo = { lista: mezclar(l).slice(0, n).map(nombreDe), i: 0, res: [], inicio: Date.now() };
  if (n < pref.ensayo) aviso(`Solo hay ${n} preguntas con estos filtros: el ensayo tendrá ${n}.`);
  document.body.classList.add('en-ensayo'); renderEnsayo(); ir(S.ensayo.lista[0]); iniciar();
}
function renderEnsayo() {
  const e = S.ensayo, b = $('#ensayoBarra');
  if (!e) { b.classList.add('hidden'); document.body.classList.remove('en-ensayo'); return; }
  b.classList.remove('hidden');
  b.innerHTML = `<div><b>🏁 Mini ensayo</b> · Pregunta ${e.i + 1} de ${e.lista.length}</div>
    <div class="eb-puntos">${e.lista.map((_, i) => `<i class="${i < e.i ? 'hecha' : i === e.i ? 'actual' : ''}"></i>`).join('')}</div>
    <button class="btn btn-sec" onclick="App.salirEnsayo()">Salir</button>`;
}
function siguienteEnsayo() {
  const e = S.ensayo; if (!e) return;
  if (S.seleccion === null) return aviso('Responde la pregunta para continuar.');
  if (e.i + 1 < e.lista.length) { e.i++; renderEnsayo(); ir(e.lista[e.i]); if (!S.iniciada) iniciar(); }
  else terminarEnsayo();
}
function terminarEnsayo() {
  const e = S.ensayo, total = (Date.now() - e.inicio) / 1000, ok = e.res.filter(r => r && r.ok).length, n = e.lista.length, pct = Math.round(100 * ok / n);
  const filas = e.lista.map((k, i) => { const r = e.res[i] || {}, p = PROBLEMS[porNombre.get(k)] || {};
    return `<button type="button" class="rv ${r.ok ? 'ok' : 'mal'}" onclick="App.revisar('${esc(k)}')"><span class="rv-n">${i + 1}</span><span class="rv-k">${esc(k)}<small style="--c:${colorEje(p.eje)}">${esc(p.eje || '')}</small></span><span class="rv-r">${r.sel ? `Marcaste ${r.sel}${r.ok ? '' : ` · correcta ${esc(p.respuesta_correcta)}`}` : 'Sin responder'}</span><span class="rv-t">${r.t ? fmtLargo(r.t) : ''}</span><i>${r.ok ? '✔' : '✘'}</i></button>`; }).join('');
  $('#resumen').innerHTML = `<div class="m-sobre">Mini ensayo terminado</div><h2 id="tRes">${pct >= 80 ? '¡Excelente trabajo!' : pct >= 50 ? '¡Buen avance!' : 'Cada intento te acerca'}</h2>
    <div class="res-cab"><div class="res-anillo" style="--p:${pct}"><b>${ok}/${n}</b><small>${pct} %</small></div>
      <div class="res-datos"><div><small>Tiempo total</small><b>${fmtLargo(total)}</b></div><div><small>Promedio por pregunta</small><b>${fmtLargo(total / n)}</b></div>
      <p>${pct >= 80 ? 'Dominas estos contenidos. Prueba con otro eje o con la prueba M2.' : 'Revisa las preguntas en rojo: cada una tiene su video de solución.'}</p></div></div>
    <div class="rv-lista">${filas}</div>
    <div class="acciones"><button class="btn btn-sec" onclick="App.cerrar()">Cerrar</button><button class="btn btn-oro" onclick="App.cerrar();App.iniciarEnsayo()">🏁 Otro mini ensayo</button></div>`;
  S.ensayo = null; renderEnsayo(); abrir('resumen');
}
function salirEnsayo() { if (S.ensayo && S.ensayo.res.length && !confirm('¿Salir del mini ensayo? Tus respuestas ya quedaron guardadas en tu progreso.')) return; S.ensayo = null; renderEnsayo(); renderPregunta(); }
function revisar(k) { cerrar(); ir(k); S.iniciada = true; const h = hist[k]; renderPregunta(); aviso(h ? 'Revisión: responde de nuevo y mira el video de solución.' : 'Revisión'); }

/* ═══════════════ AVANCE Y PROGRESO ═══════════════ */
function estadisticas(lista) {
  const resp = lista.filter(p => hist[nombreDe(p)]), ok = resp.filter(p => hist[nombreDe(p)].u === 'ok').length;
  return { total: lista.length, resp: resp.length, ok, pct: resp.length ? Math.round(100 * ok / resp.length) : 0 };
}
function renderAvance() {
  const g = estadisticas(PROBLEMS);
  $('#kpis').innerHTML = `<div><b>${g.resp}</b><small>de ${g.total} respondidas</small></div><div><b>${g.pct}<i>%</i></b><small>de acierto</small></div>`;
  const ejes = [...new Set(PROBLEMS.map(p => p.eje).filter(Boolean))].sort((a, b) => PROBLEMS.filter(p => p.eje === b).length - PROBLEMS.filter(p => p.eje === a).length).slice(0, 5);
  $('#barrasEje').innerHTML = ejes.map(e => { const s = estadisticas(PROBLEMS.filter(p => p.eje === e));
    return `<div class="eb"><span>${esc(e)}</span><div class="eb-barra"><i style="width:${s.total ? 100 * s.resp / s.total : 0}%;--c:${colorEje(e)}"></i></div><small>${s.resp}/${s.total}</small></div>`; }).join('');
  $('#cifras').innerHTML = `<div><b>${PROBLEMS.length}</b><small>preguntas</small></div><div><b>${PROBLEMS.filter(p => p.video_youtube).length}</b><small>videos de solución</small></div><div><b>${g.resp}</b><small>respondidas por ti</small></div>`;
}
function renderProgreso() {
  const g = estadisticas(PROBLEMS), ejes = [...new Set(PROBLEMS.map(p => p.eje).filter(Boolean))];
  const repasar = PROBLEMS.filter(p => hist[nombreDe(p)] && hist[nombreDe(p)].u === 'mal');
  const tiempos = Object.values(hist).map(h => h.t).filter(Boolean), tprom = tiempos.length ? tiempos.reduce((a, b) => a + b, 0) / tiempos.length : 0;
  $('#progreso').innerHTML = `<div class="prog-kpis">
      <div><b>${g.resp}</b><small>respondidas de ${g.total}</small></div><div><b>${g.ok}</b><small>acertadas (última respuesta)</small></div>
      <div><b>${g.pct} %</b><small>de acierto</small></div><div><b>${tprom ? fmtLargo(tprom) : '—'}</b><small>tiempo promedio</small></div></div>
    <h3>Por eje temático</h3>
    <div class="prog-ejes">${ejes.map(e => { const s = estadisticas(PROBLEMS.filter(p => p.eje === e));
      return `<div class="pe" style="--c:${colorEje(e)}"><div class="pe-cab"><b>${esc(e)}</b><span>${s.resp}/${s.total} · ${s.resp ? s.pct + ' % acierto' : 'sin responder'}</span></div>
        <div class="pe-barra"><i class="pe-ok" style="width:${s.total ? 100 * s.ok / s.total : 0}%"></i><i class="pe-mal" style="width:${s.total ? 100 * (s.resp - s.ok) / s.total : 0}%"></i></div>
        <button class="btn btn-sec btn-mini" onclick="App.cerrar();App.eje('${esc(e)}');App.aleatoria()">Practicar ${esc(e)} →</button></div>`; }).join('')}</div>
    <h3>Para repasar <small>${repasar.length ? `(${repasar.length})` : ''}</small></h3>
    ${repasar.length ? `<div class="prog-repaso">${repasar.map(p => `<button class="chip" style="--c:${colorEje(p.eje)}" onclick="App.revisar('${esc(nombreDe(p))}')">${esc(nombreDe(p))}</button>`).join('')}</div>` : '<p class="nota">Aún no hay preguntas falladas. ¡Sigue así!</p>'}
    <div class="acciones"><button class="btn btn-sec" onclick="App.borrarProgreso()">Borrar mi progreso</button></div>`;
}
function borrarProgreso() { if (!confirm('¿Borrar todo tu progreso guardado en este aparato?')) return; Object.keys(hist).forEach(k => delete hist[k]); guardar('cm_practica_hist', hist); renderProgreso(); renderAvance(); renderMapa(); renderPregunta(); aviso('Progreso borrado.'); }

/* ═══════════════ ACTIVIDADES ═══════════════ */
function renderActividades() {
  const ejes = ['Todos', ...[...new Set(ACTIVIDADES.map(a => a.eje).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'es'))];
  $('#actEjes').innerHTML = ejes.map(e => chip(e, S.ejeAct === e, `App.ejeAct('${esc(e)}')`, e === 'Todos' ? '' : colorEje(e))).join('');
  const l = S.ejeAct === 'Todos' ? ACTIVIDADES : ACTIVIDADES.filter(a => a.eje === S.ejeAct);
  $('#actGrid').innerHTML = l.map(a => `<a class="act-card" style="--c:${colorEje(a.eje)}" href="${esc(a.url || '#')}" target="_blank" rel="noopener noreferrer">
      <span class="ac-ico">${esc(a.icono || '🔬')}</span><b>${esc(a.nombre ? a.nombre.charAt(0).toUpperCase() + a.nombre.slice(1) : '')}</b>
      <p>${esc(a.descripcion || '')}</p><span class="ac-pie"><i>${esc(a.eje || '')}</i><em>Abrir ↗</em></span></a>`).join('') || '<p class="nota">No hay actividades para este eje.</p>';
}

/* ═══════════════ VENTANAS ═══════════════ */
let focoPrevio = null;
function abrir(n) {
  cerrar(); focoPrevio = document.activeElement;
  if (n === 'actividades') renderActividades(); if (n === 'progreso') renderProgreso();
  const m = $('#m-' + n); if (!m) return; S.modal = n;
  $('#velo').classList.remove('hidden'); m.classList.remove('hidden'); document.body.classList.add('con-modal');
  const x = m.querySelector('.m-x'); if (x) x.focus();
}
function cerrar(bienvenidaVista) {
  if (bienvenidaVista || S.modal === 'bienvenida') { pref.bienvenida = true; guardarPref(); }
  document.querySelectorAll('.modal').forEach(m => m.classList.add('hidden'));
  $('#velo').classList.add('hidden'); document.body.classList.remove('con-modal'); S.modal = null;
  if (focoPrevio && focoPrevio.focus) { try { focoPrevio.focus(); } catch (e) {} } focoPrevio = null;
}
function lupa(src) { $('#lupaImg').src = src; $('#lupa').classList.remove('hidden'); }
function cerrarLupa() { $('#lupa').classList.add('hidden'); }
function filtros(abrirlo) { document.body.classList.toggle('filtros-abiertos', !!abrirlo); }

/* ═══════════════ TECLADO ═══════════════ */
document.addEventListener('keydown', e => {
  if (e.target.matches('input, textarea, select') || e.metaKey || e.ctrlKey || e.altKey) return;
  if (e.key === 'Escape') { if (!$('#lupa').classList.contains('hidden')) return cerrarLupa(); if (S.modal) return cerrar(); return filtros(false); }
  if (S.modal) return;
  const k = e.key.toUpperCase(), p = actual();
  if (k === 'ENTER' && !S.iniciada && !e.target.closest('button, a')) { e.preventDefault(); iniciar(); }
  else if (/^[A-E]$/.test(k) && S.iniciada && S.seleccion === null && p && (p.alternativas ? k in p.alternativas : k <= 'D')) responder(k);
  else if (k === 'ARROWLEFT') mover(-1); else if (k === 'ARROWRIGHT') mover(1);
  else if (k === 'N') aleatoria(); else if (k === 'R' && S.iniciada) reiniciar();
});

/* ═══════════════ ARRANQUE ═══════════════ */
function init() {
  // enlaces del ecosistema
  const corto = Math.min(screen.width || 9999, screen.height || 9999, innerWidth || 9999);
  $('#lnkInicio').href = URL_PORTADA; $('#lnkTeoria').href = URL_LIBRO(corto < 600 ? 'celular' : 'pc');
  $('#recomendaciones').innerHTML = RECOMENDACIONES.map(t => `<li>${esc(t)}</li>`).join('');
  $('#fEnsayo').innerHTML = [5, 10, 20].map(n => `<button type="button" role="radio" aria-checked="${pref.ensayo === n}" class="${pref.ensayo === n ? 'on' : ''}" onclick="App.largoEnsayo(${n})">${n}</button>`).join('');
  const bus = $('#fBuscar'); let tb = 0; bus.addEventListener('input', () => { clearTimeout(tb); tb = setTimeout(() => { S.busqueda = bus.value.trim(); refrescar(); }, 160); });
  $('#fAutoBloq').addEventListener('change', e => { S.autoBloquear = e.target.checked; });
  // la barra de acción inferior aparece en celular cuando la tarjeta está a la vista
  if (!PROBLEMS.length) { $('#tarjeta').innerHTML = '<div class="portada"><h3>No se cargaron los problemas</h3><p>Verifica que <b>problemas.js</b> esté junto a index.html.</p></div>'; return; }
  const desdeHash = decodeURIComponent((location.hash || '').slice(1));
  S.idx = porNombre.has(desdeHash) ? porNombre.get(desdeHash) : Math.floor(Math.random() * PROBLEMS.length);
  T.dur = pref.tiempo;
  renderFiltros(); renderPregunta(); renderAvance();
  if (!pref.bienvenida && !desdeHash) abrir('bienvenida');
  if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol)) navigator.serviceWorker.register('sw.js').catch(() => {});
}
addEventListener('hashchange', () => { const k = decodeURIComponent(location.hash.slice(1)); if (porNombre.has(k) && k !== nombreDe(actual())) ir(k, true); });

/* ═══════════════ API PÚBLICA (para los botones) ═══════════════ */
const api = {
  prueba(p) { S.prueba = p; S.eje = 'Todos'; S.habilidades = []; S.contenidos = []; refrescar(); },
  eje(e) { S.eje = e; S.contenidos = []; refrescar(); },
  hab(h) { S.habilidades = S.habilidades.includes(h) ? S.habilidades.filter(x => x !== h) : [...S.habilidades, h]; refrescar(); },
  cont(c) { S.contenidos = S.contenidos.includes(c) ? S.contenidos.filter(x => x !== c) : [...S.contenidos, c]; refrescar(); },
  buscar(q) { S.busqueda = q; $('#fBuscar').value = q; refrescar(); },
  limpiar() { S.prueba = 'Todas'; S.eje = 'Todos'; S.habilidades = []; S.contenidos = []; S.busqueda = ''; $('#fBuscar').value = ''; refrescar(); },
  tiempo(v) { pref.tiempo = v; guardarPref(); if (!T.corriendo) { T.dur = v; renderPregunta(); } },
  largoEnsayo(n) { pref.ensayo = n; guardarPref(); document.querySelectorAll('#fEnsayo button').forEach(b => { const on = +b.textContent === n; b.classList.toggle('on', on); b.setAttribute('aria-checked', on); }); },
  ejeAct(e) { S.ejeAct = e; renderActividades(); },
  ir(k) { if (S.ensayo) return aviso('Estás en un mini ensayo: termínalo o sal con «Salir».'); ir(k); }, iniciar, responder, reiniciar, botonReloj, mover, aleatoria, alternarBloqueo, desbloquearTodas, compartir, video,
  iniciarEnsayo, siguienteEnsayo, salirEnsayo, revisar, borrarProgreso, abrir, cerrar, lupa, cerrarLupa, filtros,
  irArriba() { scrollTo({ top: 0, behavior: 'smooth' }); },
};
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
return api;
})();
