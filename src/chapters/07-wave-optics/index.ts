import { renderChapter, type ChapterData } from '../../ui/renderer.js';
import { initDoubleSlitWave } from '../../diagrams/canvas/WaveOptics.js';
import { makeControl } from '../../utils/layers.js';
import { t } from '../../utils/lang.js';
import { wireTermLinks } from '../../ui/term-panel.js';

const data: ChapterData = {
  id: '07-wave-optics',
  part: { en: 'Part VII', it: 'Parte VII' },
  title: { en: 'Wave Optics', it: 'Ottica Ondulatoria' },
  subtitle: {
    en: 'When light\'s wavelength is comparable to the scale of obstacles or openings, wave behavior — [[interference|interference]] and [[diffraction|diffraction]] — dominates.',
    it: 'Quando la lunghezza d\'onda della luce è paragonabile alla scala degli ostacoli o delle aperture, il comportamento ondulatorio — [[interference|interferenza]] e [[diffraction|diffrazione]] — domina.',
  },
  prereq: {
    text: {
      en: 'Chapter 5: EM Waves — wavelength λ, frequency f, amplitude. Chapter 6: Geo Optics — [[refractive-index|refractive index]] n.',
      it: 'Capitolo 5: Onde EM — lunghezza d\'onda λ, frequenza f, ampiezza. Capitolo 6: Ottica Geo — [[refractive-index|indice di rifrazione]] n.',
    },
    links: [
      { id: '05-maxwell', label: { en: 'Chapter 5: EM Waves', it: 'Capitolo 5: Onde EM' } },
      { id: '06-geo-optics', label: { en: 'Chapter 6: Geo Optics', it: 'Capitolo 6: Ottica Geo' } },
    ],
  },
  sections: [
    {
      id: 'huygens',
      title: { en: '8.1 Huygens\' Principle', it: '8.1 Principio di Huygens' },
      blocks: [
        {
          type: 'paragraph',
          text: {
            en: '[[huygens|Huygens\' principle]]: every point on a wavefront acts as a secondary point source of spherical waves. The next wavefront is the envelope of all these secondary wavelets.',
            it: '[[huygens|Il principio di Huygens]]: ogni punto di un fronte d\'onda agisce come sorgente secondaria di onde sferiche. Il fronte d\'onda successivo è l\'inviluppo di tutti questi ondine secondari.',
          },
        },
      ],
    },
    {
      id: 'double-slit',
      title: { en: '8.2 Young\'s Double-Slit Experiment', it: '8.2 Esperimento delle Due Fenditure di Young' },
      blocks: [
        {
          type: 'paragraph',
          text: {
            en: 'Thomas Young (1801) passed light through two narrow slits separated by distance d. The two slits act as coherent sources, producing an [[interference|interference]] pattern on a screen at distance L:',
            it: 'Thomas Young (1801) fece passare la luce attraverso due fenditure strette separate dalla distanza d. Le due fenditure agiscono come sorgenti coerenti, producendo uno schema di [[interference|interferenza]] su uno schermo a distanza L:',
          },
        },
        {
          type: 'formula',
          label: { en: 'Bright fringes (constructive)', it: 'Frange chiare (costruttiva)' },
          latex: 'd \\sin\\theta = m\\lambda \\qquad m = 0, \\pm 1, \\pm 2, \\ldots',
        },
        {
          type: 'formula',
          label: { en: 'Dark fringes (destructive)', it: 'Frange scure (distruttiva)' },
          latex: 'd \\sin\\theta = \\left(m + \\tfrac{1}{2}\\right)\\lambda',
        },
        {
          type: 'paragraph',
          text: {
            en: 'Fringe spacing on the screen (for small angles):',
            it: 'Spaziatura delle frange sullo schermo (per piccoli angoli):',
          },
        },
        {
          type: 'formula',
          latex: '\\Delta y = \\frac{\\lambda L}{d}',
        },
        {
          type: 'diagram',
          id: 'wave',
          title: { en: 'Double-Slit Wave Simulation', it: 'Simulazione Onde Doppia Fenditura' },
          caption: {
            en: 'Live wave superposition from two slits (left). Intensity pattern I(y) shown on right edge. Blue/red = constructive/destructive [[interference|interference]].',
            it: 'Sovrapposizione d\'onde live da due fenditure (sinistra). Schema di intensità I(y) mostrato sul bordo destro. Blu/rosso = [[interference|interferenza]] costruttiva/distruttiva.',
          },
          hasControls: true,
        },
      ],
    },
    {
      id: 'single-slit',
      title: { en: '8.3 Single-Slit Diffraction', it: '8.3 Diffrazione da Singola Fenditura' },
      blocks: [
        {
          type: 'paragraph',
          text: {
            en: 'Even a single slit of width a produces a [[diffraction|diffraction]] pattern. Minima occur at:',
            it: 'Anche una singola fenditura di larghezza a produce uno schema di [[diffraction|diffrazione]]. I minimi si trovano in:',
          },
        },
        {
          type: 'formula',
          latex: 'a \\sin\\theta = m\\lambda \\qquad m = \\pm 1, \\pm 2, \\ldots',
          note: {
            en: 'Note: this is the same as double-slit constructive formula but describes minima here!',
            it: 'Nota: questa è la stessa formula costruttiva della doppia fenditura ma qui descrive i minimi!',
          },
        },
        {
          type: 'paragraph',
          text: { en: 'Intensity pattern:', it: 'Schema di intensità:' },
        },
        {
          type: 'formula',
          latex: 'I(\\theta) = I_0 \\left(\\frac{\\sin(\\beta/2)}{\\beta/2}\\right)^2 \\qquad \\beta = \\frac{2\\pi a \\sin\\theta}{\\lambda}',
        },
      ],
    },
    {
      id: 'thin-film',
      title: { en: '8.4 Thin-Film Interference', it: '8.4 Interferenza a Film Sottile' },
      blocks: [
        {
          type: 'paragraph',
          text: {
            en: 'Light reflecting from the top and bottom surfaces of a thin film of thickness t and [[refractive-index|index]] n interferes. The optical path difference is 2nt. Phase shifts at reflection add complexity:',
            it: 'La luce che si riflette dalle superfici superiore e inferiore di un film sottile di spessore t e [[refractive-index|indice]] n interferisce. La differenza di cammino ottico è 2nt. Gli sfasamenti alla riflessione aggiungono complessità:',
          },
        },
        {
          type: 'formula',
          label: { en: 'Constructive (reflection with one phase shift)', it: 'Costruttiva (riflessione con uno sfasamento)' },
          latex: '2nt = \\left(m + \\tfrac{1}{2}\\right)\\lambda \\qquad m = 0, 1, 2, \\ldots',
        },
      ],
    },
    {
      id: 'polarization',
      title: { en: '8.5 Polarization', it: '8.5 Polarizzazione' },
      blocks: [
        {
          type: 'paragraph',
          text: {
            en: '[[em-wave|EM waves]] are transverse — the E field oscillates perpendicular to propagation. <strong>[[polarization|Polarization]]</strong> describes the orientation of this oscillation.',
            it: 'Le [[em-wave|onde EM]] sono trasversali — il campo E oscilla perpendicolarmente alla propagazione. La <strong>[[polarization|polarizzazione]]</strong> descrive l\'orientamento di questa oscillazione.',
          },
        },
        {
          type: 'formula',
          label: { en: 'Malus\'s Law', it: 'Legge di Malus' },
          latex: 'I = I_0 \\cos^2\\theta',
          note: {
            en: 'Intensity of [[polarization|polarized light]] after passing through a polarizer at angle θ to the polarization direction.',
            it: 'Intensità della [[polarization|luce polarizzata]] dopo aver attraversato un polarizzatore ad angolo θ rispetto alla direzione di polarizzazione.',
          },
        },
        {
          type: 'paragraph',
          text: {
            en: 'Brewster\'s angle — angle at which reflected light is completely [[polarization|polarized]]:',
            it: 'Angolo di Brewster — angolo al quale la luce riflessa è completamente [[polarization|polarizzata]]:',
          },
        },
        {
          type: 'formula',
          latex: '\\tan\\theta_B = \\frac{n_2}{n_1}',
        },
        {
          type: 'key-formulas',
          items: [
            { name: { en: 'Double-slit bright', it: 'Doppia fenditura chiara' }, latex: 'd\\sin\\theta = m\\lambda' },
            { name: { en: 'Fringe spacing', it: 'Spaziatura frange' }, latex: '\\Delta y = \\lambda L/d' },
            { name: { en: 'Single-slit dark', it: 'Singola fenditura scura' }, latex: 'a\\sin\\theta = m\\lambda' },
            { name: { en: 'Thin film', it: 'Film sottile' }, latex: '2nt = (m+\\tfrac{1}{2})\\lambda' },
            { name: { en: 'Malus\'s law', it: 'Legge di Malus' }, latex: 'I = I_0\\cos^2\\theta' },
            { name: { en: 'Brewster\'s angle', it: 'Angolo di Brewster' }, latex: '\\tan\\theta_B = n_2/n_1' },
          ],
        },
      ],
    },
  ],
};

export function renderWaveOptics(): string {
  return renderChapter(data);
}

export function initWaveOpticsDiagrams() {
  const wrapper = document.getElementById('wave-wrapper');
  const controlsEl = document.getElementById('wave-controls');
  if (!wrapper || !controlsEl) return;

  const canvas = document.createElement('canvas');
  wrapper.style.height = '420px';
  wrapper.appendChild(canvas);
  canvas.width = wrapper.clientWidth;
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
