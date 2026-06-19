import { m, M } from '../../utils/katex-render.js';
import { t } from '../../utils/lang.js';
import { initSnellRefraction } from '../../diagrams/canvas/SnellRefraction.js';
import { makeControl } from '../../utils/layers.js';
import { wireTermLinks } from '../../ui/term-panel.js';

export function renderGeoOptics(): string {
  return `
<div class="chapter-header">
  <div class="part-label">${t('Part VI', 'Parte VI')}</div>
  <h1>${t('Geometrical Optics', 'Ottica Geometrica')}</h1>
  <p>${t(
    'When the wavelength of light is much smaller than the objects involved, light travels in straight rays — the regime of geometrical optics.',
    'Quando la lunghezza d\'onda della luce è molto più piccola degli oggetti coinvolti, la luce viaggia in raggi rettilinei — il regime dell\'ottica geometrica.'
  )}</p>
</div>

<div class="callout prereq">
  <div class="callout-title">${t('Prerequisites', 'Prerequisiti')}</div>
  <p>${t(
    '<a href="#05-maxwell" class="crossref">Chapter 5: Maxwell\'s Equations</a> — light as EM wave, speed c in vacuum.',
    '<a href="#05-maxwell" class="crossref">Capitolo 5: Equazioni di Maxwell</a> — luce come onda EM, velocità c nel vuoto.'
  )}</p>
</div>

<h2>${t('7.1 Reflection', '7.1 Riflessione')}</h2>
<p>${t(
  'When light hits a smooth surface, the angle of incidence equals the angle of reflection (both measured from the normal):',
  'Quando la luce colpisce una superficie liscia, l\'angolo di incidenza è uguale all\'angolo di riflessione (entrambi misurati dalla normale):'
)}</p>
<div class="formula-block">
  <div class="formula-label">${t('Law of Reflection', 'Legge della Riflessione')}</div>
  ${M('\\theta_i = \\theta_r')}
</div>

<h2>${t('7.2 Refraction & Snell\'s Law', '7.2 Rifrazione & Legge di Snell')}</h2>
<p>${t(
  'When light crosses the boundary between two media of different refractive indices n₁ and n₂, its direction changes. The refractive index n = c/v, where v is the speed of light in the medium.',
  'Quando la luce attraversa il confine tra due mezzi con indici di rifrazione diversi n₁ e n₂, la sua direzione cambia. L\'indice di rifrazione n = c/v, dove v è la velocità della luce nel mezzo.'
)}</p>

<div class="formula-block">
  <div class="formula-label">${t('Snell\'s Law', 'Legge di Snell')}</div>
  ${M('n_1 \\sin\\theta_1 = n_2 \\sin\\theta_2')}
</div>

<div class="diagram-container">
  <div class="diagram-header">
    <span class="diagram-title">${t('Interactive Snell\'s Law', 'Legge di Snell Interattiva')}</span>
  </div>
  <div id="snell-controls" class="controls"></div>
  <div class="diagram-body" style="height:380px">
    <canvas id="snell-canvas" style="width:100%;height:380px"></canvas>
  </div>
  <div class="diagram-caption">${t(
    'Drag the incident ray to change the angle. Adjust n₁ and n₂ with the sliders.',
    'Trascina il raggio incidente per cambiare l\'angolo. Regola n₁ e n₂ con i cursori.'
  )}</div>
</div>

<h3>${t('Total Internal Reflection', 'Riflessione Totale Interna')}</h3>
<p>${t(
  'When light travels from a denser to a less dense medium (n₁ > n₂), there exists a <strong>critical angle</strong> θ_c beyond which no refraction occurs — all light is reflected:',
  'Quando la luce viaggia da un mezzo più denso a uno meno denso (n₁ > n₂), esiste un <strong>angolo critico</strong> θ_c oltre il quale non avviene rifrazione — tutta la luce viene riflessa:'
)}</p>
<div class="formula-block">
  ${M('\\sin\\theta_c = \\frac{n_2}{n_1} \\quad (n_1 > n_2)')}
</div>

<p>${t(
  'This is the principle behind optical fibers — light is trapped inside the fiber by total internal reflection.',
  'Questo è il principio alla base delle fibre ottiche — la luce è intrappolata all\'interno della fibra dalla riflessione totale interna.'
)}</p>

<h2>${t('7.3 Thin Lenses', '7.3 Lenti Sottili')}</h2>
<p>${t('The thin lens equation relates object distance, image distance, and focal length:', 'L\'equazione della lente sottile mette in relazione la distanza dell\'oggetto, la distanza dell\'immagine e la lunghezza focale:')}</p>
<div class="formula-block">
  <div class="formula-label">${t('Thin Lens Equation', 'Equazione della Lente Sottile')}</div>
  ${M('\\frac{1}{f} = \\frac{1}{d_o} + \\frac{1}{d_i}')}
  <p style="font-size:0.82rem;margin-top:8px;color:var(--text2)">${t(
    'Sign convention: real objects have d_o > 0; real images have d_i > 0 (opposite side from object for converging lens).',
    'Convenzione dei segni: oggetti reali hanno d_o > 0; immagini reali hanno d_i > 0 (lato opposto all\'oggetto per lenti convergenti).'
  )}</p>
</div>

<p>${t('Lateral magnification:', 'Ingrandimento laterale:')}</p>
<div class="formula-block">
  ${M('m = -\\frac{d_i}{d_o}')}
</div>

<p>${t('The lensmaker\'s equation relates focal length to lens geometry:', 'L\'equazione dell\'ottico mette in relazione la lunghezza focale alla geometria della lente:')}</p>
<div class="formula-block">
  ${M('\\frac{1}{f} = (n-1)\\left(\\frac{1}{R_1} - \\frac{1}{R_2}\\right)')}
</div>

<details class="derivation">
  <summary>${t('Ray diagrams for converging lenses', 'Diagrammi a raggi per lenti convergenti')}</summary>
  <div class="derivation-body">
    <p>${t('Three key rays to draw:', 'Tre raggi chiave da disegnare:')}</p>
    <ol style="margin-left:20px;margin-top:8px">
      <li>${t('Ray parallel to axis → refracts through far focal point F\'', 'Raggio parallelo all\'asse → rifrange attraverso il fuoco lontano F\'')}</li>
      <li>${t('Ray through near focal point F → exits parallel to axis', 'Raggio attraverso il fuoco vicino F → esce parallelo all\'asse')}</li>
      <li>${t('Ray through lens center → passes straight through (undeviated)', 'Raggio attraverso il centro della lente → passa dritto (non deviato)')}</li>
    </ol>
    <p style="margin-top:12px">${t('Where these three rays meet: the image location.', 'Dove questi tre raggi si incontrano: la posizione dell\'immagine.')}</p>
  </div>
</details>

<div class="key-formulas">
  <h4>${t('Chapter Summary', 'Riassunto del Capitolo')}</h4>
  <ul>
    <li><span class="formula-name">${t('Reflection', 'Riflessione')}</span> ${m('\\theta_i = \\theta_r')}</li>
    <li><span class="formula-name">${t('Snell\'s law', 'Legge di Snell')}</span> ${m('n_1\\sin\\theta_1 = n_2\\sin\\theta_2')}</li>
    <li><span class="formula-name">${t('Critical angle', 'Angolo critico')}</span> ${m('\\sin\\theta_c = n_2/n_1')}</li>
    <li><span class="formula-name">${t('Thin lens', 'Lente sottile')}</span> ${m('1/f = 1/d_o + 1/d_i')}</li>
    <li><span class="formula-name">${t('Magnification', 'Ingrandimento')}</span> ${m('m = -d_i/d_o')}</li>
  </ul>
</div>
`;
}

export function initGeoOpticsDiagrams() {
  const canvas = document.getElementById('snell-canvas') as HTMLCanvasElement | null;
  const controlsEl = document.getElementById('snell-controls');
  if (!canvas || !controlsEl) return;
  canvas.width = canvas.parentElement!.clientWidth;
  canvas.height = 380;

  const sim = initSnellRefraction(canvas);

  controlsEl.appendChild(makeControl('n₁', 1.0, 2.5, 1.0, 0.05, '', v => sim.setN1(v)));
  controlsEl.appendChild(makeControl('n₂', 1.0, 2.5, 1.5, 0.05, '', v => sim.setN2(v)));
  wireTermLinks(document.getElementById('chapter-view')!);
}
