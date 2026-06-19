import { m, M } from '../../utils/katex-render.js';
import { t } from '../../utils/lang.js';
import { initEMWave } from '../../diagrams/three/EMWave.js';
import { buildLayerToggles } from '../../utils/layers.js';
import { wireTermLinks } from '../../ui/term-panel.js';
import { getLang } from '../../utils/lang.js';

export function renderMaxwell(): string {
  return `
<div class="chapter-header">
  <div class="part-label">${t('Part V', 'Parte V')}</div>
  <h1>${t('Maxwell\'s Equations &amp; EM Waves', 'Equazioni di Maxwell &amp; Onde EM')}</h1>
  <p>${t(
    'Four elegant equations unify all of electricity and magnetism — and reveal that light itself is an electromagnetic wave.',
    'Quattro eleganti equazioni unificano tutta l\'elettricità e il magnetismo — e rivelano che la luce stessa è un\'onda elettromagnetica.'
  )}</p>
</div>

<div class="callout prereq">
  <div class="callout-title">${t('Prerequisites', 'Prerequisiti')}</div>
  <p>${t(
    'All previous chapters — Maxwell\'s equations synthesize everything we\'ve built so far.',
    'Tutti i capitoli precedenti — le equazioni di Maxwell sintetizzano tutto ciò che abbiamo costruito finora.'
  )}</p>
</div>

<h2>${t('6.1 Displacement Current', '6.1 Corrente di Spostamento')}</h2>
<p>${t(
  'Ampère\'s Law had a flaw: it wasn\'t consistent when applied to a capacitor being charged. Maxwell fixed this by adding the <strong>displacement current</strong> term — even when no real current flows, a changing electric field acts like a current:',
  'La legge di Ampère aveva un difetto: non era consistente se applicata a un condensatore in carica. Maxwell corresse questo aggiungendo il termine di <strong>corrente di spostamento</strong> — anche quando non scorre corrente reale, un campo elettrico variabile agisce come una corrente:'
)}</p>

<div class="formula-block">
  <div class="formula-label">${t('Displacement current', 'Corrente di spostamento')}</div>
  ${M('I_d = \\varepsilon_0 \\frac{d\\Phi_E}{dt}')}
</div>

<h2>${t('6.2 Maxwell\'s Four Equations', '6.2 Le Quattro Equazioni di Maxwell')}</h2>
<p>${t(
  'With the displacement current, the full set of Maxwell\'s equations is:',
  'Con la corrente di spostamento, il set completo delle equazioni di Maxwell è:'
)}</p>

<div class="formula-block">
  <div class="formula-label">${t('I. Gauss\'s Law (Electric)', 'I. Legge di Gauss (Elettrica)')}</div>
  ${M('\\oint \\vec{E} \\cdot d\\vec{A} = \\frac{Q_{\\text{enc}}}{\\varepsilon_0}')}
  <p style="font-size:0.82rem;margin-top:6px;color:var(--text2)">${t('Electric field lines originate from charges.', 'Le linee di campo elettrico hanno origine dalle cariche.')}</p>
</div>

<div class="formula-block">
  <div class="formula-label">${t('II. Gauss\'s Law (Magnetic)', 'II. Legge di Gauss (Magnetica)')}</div>
  ${M('\\oint \\vec{B} \\cdot d\\vec{A} = 0')}
  <p style="font-size:0.82rem;margin-top:6px;color:var(--text2)">${t('No magnetic monopoles — field lines always close on themselves.', 'Non esistono monopoli magnetici — le linee di campo si chiudono sempre su sé stesse.')}</p>
</div>

<div class="formula-block">
  <div class="formula-label">${t('III. Faraday\'s Law', 'III. Legge di Faraday')}</div>
  ${M('\\oint \\vec{E} \\cdot d\\vec{\\ell} = -\\frac{d\\Phi_B}{dt}')}
  <p style="font-size:0.82rem;margin-top:6px;color:var(--text2)">${t('A changing B field creates a circulating E field.', 'Un campo B variabile crea un campo E circolante.')}</p>
</div>

<div class="formula-block">
  <div class="formula-label">${t('IV. Ampère-Maxwell Law', 'IV. Legge di Ampère-Maxwell')}</div>
  ${M('\\oint \\vec{B} \\cdot d\\vec{\\ell} = \\mu_0 I_{\\text{enc}} + \\mu_0\\varepsilon_0 \\frac{d\\Phi_E}{dt}')}
  <p style="font-size:0.82rem;margin-top:6px;color:var(--text2)">${t('A changing E field or current creates a circulating B field.', 'Un campo E variabile o una corrente crea un campo B circolante.')}</p>
</div>

<div class="callout key">
  <div class="callout-title">${t('The Symmetry', 'La Simmetria')}</div>
  <p>${t(
    'Maxwell\'s III and IV show a beautiful symmetry: a changing B creates E, and a changing E creates B. This self-sustaining loop is exactly what an electromagnetic wave is.',
    'Le equazioni III e IV di Maxwell mostrano una bella simmetria: un B variabile crea E, e un E variabile crea B. Questo loop auto-sostenuto è esattamente un\'onda elettromagnetica.'
  )}</p>
</div>

<h2>${t('6.3 Electromagnetic Waves', '6.3 Onde Elettromagnetiche')}</h2>
<p>${t(
  'From Maxwell\'s equations in vacuum (no charges, no currents), we can derive wave equations for E and B:',
  'Dalle equazioni di Maxwell nel vuoto (senza cariche, senza correnti), possiamo derivare le equazioni delle onde per E e B:'
)}</p>

<div class="formula-block">
  ${M('\\nabla^2 \\vec{E} = \\mu_0\\varepsilon_0 \\frac{\\partial^2 \\vec{E}}{\\partial t^2} \\qquad \\nabla^2 \\vec{B} = \\mu_0\\varepsilon_0 \\frac{\\partial^2 \\vec{B}}{\\partial t^2}')}
</div>

<p>${t('The wave speed emerges from the equation:', 'La velocità dell\'onda emerge dall\'equazione:')}</p>
<div class="formula-block">
  <div class="formula-label">${t('Speed of light', 'Velocità della luce')}</div>
  ${M('c = \\frac{1}{\\sqrt{\\mu_0 \\varepsilon_0}} = 2.998 \\times 10^8 \\, \\text{m/s}')}
</div>

<p>${t(
  'Maxwell computed this speed from purely electrical and magnetic constants and recognized it as the speed of light — the first proof that light is an electromagnetic wave.',
  'Maxwell calcolò questa velocità da costanti puramente elettriche e magnetiche e la riconobbe come la velocità della luce — la prima prova che la luce è un\'onda elettromagnetica.'
)}</p>

<div class="diagram-container">
  <div class="diagram-header">
    <span class="diagram-title">${t('3D Electromagnetic Wave', 'Onda Elettromagnetica 3D')}</span>
  </div>
  <div id="emwave-layers" class="layer-toggles"></div>
  <div class="diagram-body" id="emwave-canvas-wrapper"></div>
  <div class="diagram-caption">${t(
    'E field (red) oscillates in y-direction, B field (blue) in z-direction, both propagating in x. Toggle layers to isolate each field.',
    'Il campo E (rosso) oscilla nella direzione y, il campo B (blu) nella direzione z, entrambi propagantisi in x. Attiva/disattiva i layer per isolare ogni campo.'
  )}</div>
</div>

<h2>${t('6.4 Poynting Vector & Energy', '6.4 Vettore di Poynting & Energia')}</h2>
<p>${t('The energy flux (power per unit area) of an EM wave is given by the Poynting vector:', 'Il flusso di energia (potenza per unità di area) di un\'onda EM è dato dal vettore di Poynting:')}</p>
<div class="formula-block">
  ${M('\\vec{S} = \\frac{1}{\\mu_0} \\vec{E} \\times \\vec{B} \\qquad \\langle S \\rangle = \\frac{E_0 B_0}{2\\mu_0} = \\frac{E_0^2}{2\\mu_0 c}')}
</div>

<div class="key-formulas">
  <h4>${t('Chapter Summary', 'Riassunto del Capitolo')}</h4>
  <ul>
    <li><span class="formula-name">${t('Gauss E', 'Gauss E')}</span> ${m('\\oint \\vec{E}\\cdot d\\vec{A} = Q/\\varepsilon_0')}</li>
    <li><span class="formula-name">${t('Gauss B', 'Gauss B')}</span> ${m('\\oint \\vec{B}\\cdot d\\vec{A} = 0')}</li>
    <li><span class="formula-name">${t('Faraday', 'Faraday')}</span> ${m('\\oint \\vec{E}\\cdot d\\ell = -d\\Phi_B/dt')}</li>
    <li><span class="formula-name">${t('Ampère-Maxwell', 'Ampère-Maxwell')}</span> ${m('\\oint \\vec{B}\\cdot d\\ell = \\mu_0 I + \\mu_0\\varepsilon_0\\,d\\Phi_E/dt')}</li>
    <li><span class="formula-name">${t('Speed of light', 'Velocità della luce')}</span> ${m('c = 1/\\sqrt{\\mu_0\\varepsilon_0}')}</li>
    <li><span class="formula-name">${t('Poynting vector', 'Vettore di Poynting')}</span> ${m('\\vec{S} = \\vec{E}\\times\\vec{B}/\\mu_0')}</li>
  </ul>
</div>
`;
}

export function initMaxwellDiagrams() {
  const wrapper = document.getElementById('emwave-canvas-wrapper');
  const layerEl = document.getElementById('emwave-layers');
  if (!wrapper || !layerEl) return;

  let ctrl: ReturnType<typeof initEMWave> | null = null;
  try {
    ctrl = initEMWave(wrapper);
  } catch {
    wrapper.innerHTML = `<div class="webgl-fallback">WebGL required for 3D wave visualization.</div>`;
    return;
  }

  buildLayerToggles(layerEl, [
    { id: 'E', labelEn: 'E field', labelIt: 'Campo E', defaultOn: true },
    { id: 'B', labelEn: 'B field', labelIt: 'Campo B', defaultOn: true },
    { id: 'planes', labelEn: 'Planes', labelIt: 'Piani', defaultOn: false },
  ], (id, active) => {
    if (!ctrl) return;
    if (id === 'E') ctrl.setShowE(active);
    if (id === 'B') ctrl.setShowB(active);
    if (id === 'planes') ctrl.setShowPlanes(active);
  }, getLang);
  wireTermLinks(document.getElementById('chapter-view')!);
}
