import { m, M } from '../../utils/katex-render.js';
import { t } from '../../utils/lang.js';
import { initDoubleSlitWave } from '../../diagrams/canvas/WaveOptics.js';
import { makeControl } from '../../utils/layers.js';
import { wireTermLinks } from '../../ui/term-panel.js';

export function renderWaveOptics(): string {
  return `
<div class="chapter-header">
  <div class="part-label">${t('Part VII', 'Parte VII')}</div>
  <h1>${t('Wave Optics', 'Ottica Ondulatoria')}</h1>
  <p>${t(
    'When light\'s wavelength is comparable to the scale of obstacles or openings, wave behavior — interference and diffraction — dominates.',
    'Quando la lunghezza d\'onda della luce è paragonabile alla scala degli ostacoli o delle aperture, il comportamento ondulatorio — interferenza e diffrazione — domina.'
  )}</p>
</div>

<div class="callout prereq">
  <div class="callout-title">${t('Prerequisites', 'Prerequisiti')}</div>
  <p>${t(
    '<a href="#05-maxwell" class="crossref">Chapter 5: EM Waves</a> — wavelength λ, frequency f, amplitude. <a href="#06-geo-optics" class="crossref">Chapter 6: Geo Optics</a> — refractive index n.',
    '<a href="#05-maxwell" class="crossref">Capitolo 5: Onde EM</a> — lunghezza d\'onda λ, frequenza f, ampiezza. <a href="#06-geo-optics" class="crossref">Capitolo 6: Ottica Geo</a> — indice di rifrazione n.'
  )}</p>
</div>

<h2>${t('8.1 Huygens\' Principle', '8.1 Principio di Huygens')}</h2>
<p>${t(
  'Every point on a wavefront acts as a secondary point source of spherical waves. The next wavefront is the envelope of all these secondary wavelets.',
  'Ogni punto di un fronte d\'onda agisce come sorgente secondaria di onde sferiche. Il fronte d\'onda successivo è l\'inviluppo di tutti questi ondine secondari.'
)}</p>

<h2>${t('8.2 Young\'s Double-Slit Experiment', '8.2 Esperimento delle Due Fenditure di Young')}</h2>
<p>${t(
  'Thomas Young (1801) passed light through two narrow slits separated by distance d. The two slits act as coherent sources, producing an interference pattern on a screen at distance L:',
  'Thomas Young (1801) fece passare la luce attraverso due fenditure strette separate dalla distanza d. Le due fenditure agiscono come sorgenti coerenti, producendo uno schema di interferenza su uno schermo a distanza L:'
)}</p>

<div class="formula-block">
  <div class="formula-label">${t('Bright fringes (constructive)', 'Frange chiare (costruttiva)')}</div>
  ${M('d \\sin\\theta = m\\lambda \\qquad m = 0, \\pm 1, \\pm 2, \\ldots')}
</div>

<div class="formula-block">
  <div class="formula-label">${t('Dark fringes (destructive)', 'Frange scure (distruttiva)')}</div>
  ${M('d \\sin\\theta = \\left(m + \\tfrac{1}{2}\\right)\\lambda')}
</div>

<p>${t('Fringe spacing on the screen (for small angles):', 'Spaziatura delle frange sullo schermo (per piccoli angoli):')}</p>
<div class="formula-block">
  ${M('\\Delta y = \\frac{\\lambda L}{d}')}
</div>

<div class="diagram-container">
  <div class="diagram-header">
    <span class="diagram-title">${t('Double-Slit Wave Simulation', 'Simulazione Onde Doppia Fenditura')}</span>
  </div>
  <div id="wave-controls" class="controls"></div>
  <div class="diagram-body" style="height:420px">
    <canvas id="wave-canvas" style="width:100%;height:420px"></canvas>
  </div>
  <div class="diagram-caption">${t(
    'Live wave superposition from two slits (left). Intensity pattern I(y) shown on right edge. Blue/red = constructive/destructive interference.',
    'Sovrapposizione d\'onde live da due fenditure (sinistra). Schema di intensità I(y) mostrato sul bordo destro. Blu/rosso = interferenza costruttiva/distruttiva.'
  )}</div>
</div>

<h2>${t('8.3 Single-Slit Diffraction', '8.3 Diffrazione da Singola Fenditura')}</h2>
<p>${t(
  'Even a single slit of width a produces a diffraction pattern. Minima occur at:',
  'Anche una singola fenditura di larghezza a produce uno schema di diffrazione. I minimi si trovano in:'
)}</p>
<div class="formula-block">
  ${M('a \\sin\\theta = m\\lambda \\qquad m = \\pm 1, \\pm 2, \\ldots')}
  <p style="font-size:0.82rem;margin-top:8px;color:var(--text2)">${t(
    'Note: this is the same as double-slit constructive formula but describes minima here!',
    'Nota: questa è la stessa formula costruttiva della doppia fenditura ma qui descrive i minimi!'
  )}</p>
</div>

<p>${t('Intensity pattern:', 'Schema di intensità:')}</p>
<div class="formula-block">
  ${M('I(\\theta) = I_0 \\left(\\frac{\\sin(\\beta/2)}{\\beta/2}\\right)^2 \\qquad \\beta = \\frac{2\\pi a \\sin\\theta}{\\lambda}')}
</div>

<h2>${t('8.4 Thin-Film Interference', '8.4 Interferenza a Film Sottile')}</h2>
<p>${t(
  'Light reflecting from the top and bottom surfaces of a thin film of thickness t and index n interferes. The optical path difference is 2nt. Phase shifts at reflection add complexity:',
  'La luce che si riflette dalle superfici superiore e inferiore di un film sottile di spessore t e indice n interferisce. La differenza di cammino ottico è 2nt. Gli sfasamenti alla riflessione aggiungono complessità:'
)}</p>

<div class="formula-block">
  <div class="formula-label">${t('Constructive (reflection with one phase shift)', 'Costruttiva (riflessione con uno sfasamento)')}</div>
  ${M('2nt = \\left(m + \\tfrac{1}{2}\\right)\\lambda \\qquad m = 0, 1, 2, \\ldots')}
</div>

<h2>${t('8.5 Polarization', '8.5 Polarizzazione')}</h2>
<p>${t(
  'EM waves are transverse — the E field oscillates perpendicular to propagation. <strong>Polarization</strong> describes the orientation of this oscillation.',
  'Le onde EM sono trasversali — il campo E oscilla perpendicolarmente alla propagazione. La <strong>polarizzazione</strong> descrive l\'orientamento di questa oscillazione.'
)}</p>

<div class="formula-block">
  <div class="formula-label">${t('Malus\'s Law', 'Legge di Malus')}</div>
  ${M('I = I_0 \\cos^2\\theta')}
  <p style="font-size:0.82rem;margin-top:8px;color:var(--text2)">${t(
    'Intensity of polarized light after passing through a polarizer at angle θ to the polarization direction.',
    'Intensità della luce polarizzata dopo aver attraversato un polarizzatore ad angolo θ rispetto alla direzione di polarizzazione.'
  )}</p>
</div>

<p>${t('Brewster\'s angle — angle at which reflected light is completely polarized:', 'Angolo di Brewster — angolo al quale la luce riflessa è completamente polarizzata:')}</p>
<div class="formula-block">
  ${M('\\tan\\theta_B = \\frac{n_2}{n_1}')}
</div>

<div class="key-formulas">
  <h4>${t('Chapter Summary', 'Riassunto del Capitolo')}</h4>
  <ul>
    <li><span class="formula-name">${t('Double-slit bright', 'Doppia fenditura chiara')}</span> ${m('d\\sin\\theta = m\\lambda')}</li>
    <li><span class="formula-name">${t('Fringe spacing', 'Spaziatura frange')}</span> ${m('\\Delta y = \\lambda L/d')}</li>
    <li><span class="formula-name">${t('Single-slit dark', 'Singola fenditura scura')}</span> ${m('a\\sin\\theta = m\\lambda')}</li>
    <li><span class="formula-name">${t('Thin film', 'Film sottile')}</span> ${m('2nt = (m+\\tfrac{1}{2})\\lambda')}</li>
    <li><span class="formula-name">${t('Malus\'s law', 'Legge di Malus')}</span> ${m('I = I_0\\cos^2\\theta')}</li>
    <li><span class="formula-name">${t('Brewster\'s angle', 'Angolo di Brewster')}</span> ${m('\\tan\\theta_B = n_2/n_1')}</li>
  </ul>
</div>
`;
}

export function initWaveOpticsDiagrams() {
  const canvas = document.getElementById('wave-canvas') as HTMLCanvasElement | null;
  const controlsEl = document.getElementById('wave-controls');
  if (!canvas || !controlsEl) return;
  canvas.width = canvas.parentElement!.clientWidth;
  canvas.height = 420;

  const sim = initDoubleSlitWave(canvas);

  controlsEl.appendChild(makeControl(
    t('Slit separation d', 'Separazione d'), 40, 200, 100, 5, '', v => sim.setSlitSep(v)
  ));
  controlsEl.appendChild(makeControl(
    t('Wavelength λ', 'Lunghezza d\'onda λ'), 20, 120, 60, 5, '', v => sim.setWavelength(v)
  ));
  wireTermLinks(document.getElementById('chapter-view')!);
}
