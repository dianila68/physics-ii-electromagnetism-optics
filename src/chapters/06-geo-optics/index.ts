import { renderChapter, type ChapterData } from '../../ui/renderer.js';
import { initSnellRefraction } from '../../diagrams/canvas/SnellRefraction.js';
import { makeControl } from '../../utils/layers.js';
import { wireTermLinks } from '../../ui/term-panel.js';

const data: ChapterData = {
  id: '06-geo-optics',
  part: { en: 'Part VI', it: 'Parte VI' },
  title: { en: 'Geometrical Optics', it: 'Ottica Geometrica' },
  subtitle: {
    en: 'When the wavelength of light is much smaller than the objects involved, light travels in straight rays — the regime of geometrical optics.',
    it: 'Quando la lunghezza d\'onda della luce è molto più piccola degli oggetti coinvolti, la luce viaggia in raggi rettilinei — il regime dell\'ottica geometrica.',
  },
  prereq: {
    text: {
      en: 'Chapter 5: Maxwell\'s Equations — light as [[em-wave|EM wave]], speed c in vacuum.',
      it: 'Capitolo 5: Equazioni di Maxwell — luce come [[em-wave|onda EM]], velocità c nel vuoto.',
    },
    links: [{ id: '05-maxwell', label: { en: 'Chapter 5: Maxwell\'s Equations', it: 'Capitolo 5: Equazioni di Maxwell' } }],
  },
  sections: [
    {
      id: 'reflection',
      title: { en: '7.1 Reflection', it: '7.1 Riflessione' },
      blocks: [
        {
          type: 'paragraph',
          text: {
            en: 'When light hits a smooth surface, the angle of incidence equals the angle of reflection (both measured from the normal):',
            it: 'Quando la luce colpisce una superficie liscia, l\'angolo di incidenza è uguale all\'angolo di riflessione (entrambi misurati dalla normale):',
          },
        },
        {
          type: 'formula',
          label: { en: 'Law of Reflection', it: 'Legge della Riflessione' },
          latex: '\\theta_i = \\theta_r',
        },
      ],
    },
    {
      id: 'refraction',
      title: { en: '7.2 Refraction & Snell\'s Law', it: '7.2 Rifrazione & Legge di Snell' },
      blocks: [
        {
          type: 'paragraph',
          text: {
            en: 'When light crosses the boundary between two media of different [[refractive-index|refractive indices]] n₁ and n₂, its direction changes. The [[refractive-index|refractive index]] n = c/v, where v is the speed of light in the medium.',
            it: 'Quando la luce attraversa il confine tra due mezzi con [[refractive-index|indici di rifrazione]] diversi n₁ e n₂, la sua direzione cambia. L\'[[refractive-index|indice di rifrazione]] n = c/v, dove v è la velocità della luce nel mezzo.',
          },
        },
        {
          type: 'formula',
          label: { en: 'Snell\'s Law', it: 'Legge di Snell' },
          latex: 'n_1 \\sin\\theta_1 = n_2 \\sin\\theta_2',
        },
        {
          type: 'diagram',
          id: 'snell',
          title: { en: 'Interactive Snell\'s Law', it: 'Legge di Snell Interattiva' },
          caption: {
            en: 'Drag the incident ray to change the angle. Adjust n₁ and n₂ with the sliders.',
            it: 'Trascina il raggio incidente per cambiare l\'angolo. Regola n₁ e n₂ con i cursori.',
          },
          hasControls: true,
        },
        {
          type: 'heading3',
          text: { en: 'Total Internal Reflection', it: 'Riflessione Totale Interna' },
        },
        {
          type: 'paragraph',
          text: {
            en: 'When light travels from a denser to a less dense medium (n₁ > n₂), there exists a <strong>critical angle</strong> θ_c beyond which no refraction occurs — all light is reflected ([[total-internal-reflection|total internal reflection]]):',
            it: 'Quando la luce viaggia da un mezzo più denso a uno meno denso (n₁ > n₂), esiste un <strong>angolo critico</strong> θ_c oltre il quale non avviene rifrazione — tutta la luce viene riflessa ([[total-internal-reflection|riflessione totale interna]]):',
          },
        },
        {
          type: 'formula',
          latex: '\\sin\\theta_c = \\frac{n_2}{n_1} \\quad (n_1 > n_2)',
        },
        {
          type: 'paragraph',
          text: {
            en: 'This is the principle behind optical fibers — light is trapped inside the fiber by [[total-internal-reflection|total internal reflection]].',
            it: 'Questo è il principio alla base delle fibre ottiche — la luce è intrappolata all\'interno della fibra dalla [[total-internal-reflection|riflessione totale interna]].',
          },
        },
      ],
    },
    {
      id: 'thin-lenses',
      title: { en: '7.3 Thin Lenses', it: '7.3 Lenti Sottili' },
      blocks: [
        {
          type: 'paragraph',
          text: {
            en: 'The thin lens equation relates object distance, image distance, and focal length:',
            it: 'L\'equazione della lente sottile mette in relazione la distanza dell\'oggetto, la distanza dell\'immagine e la lunghezza focale:',
          },
        },
        {
          type: 'formula',
          label: { en: 'Thin Lens Equation', it: 'Equazione della Lente Sottile' },
          latex: '\\frac{1}{f} = \\frac{1}{d_o} + \\frac{1}{d_i}',
          note: {
            en: 'Sign convention: real objects have d_o > 0; real images have d_i > 0 (opposite side from object for converging lens).',
            it: 'Convenzione dei segni: oggetti reali hanno d_o > 0; immagini reali hanno d_i > 0 (lato opposto all\'oggetto per lenti convergenti).',
          },
        },
        {
          type: 'paragraph',
          text: {
            en: 'Lateral magnification:',
            it: 'Ingrandimento laterale:',
          },
        },
        {
          type: 'formula',
          latex: 'm = -\\frac{d_i}{d_o}',
        },
        {
          type: 'paragraph',
          text: {
            en: 'The lensmaker\'s equation relates focal length to lens geometry:',
            it: 'L\'equazione dell\'ottico mette in relazione la lunghezza focale alla geometria della lente:',
          },
        },
        {
          type: 'formula',
          latex: '\\frac{1}{f} = (n-1)\\left(\\frac{1}{R_1} - \\frac{1}{R_2}\\right)',
        },
        {
          type: 'derivation',
          title: { en: 'Ray diagrams for converging lenses', it: 'Diagrammi a raggi per lenti convergenti' },
          blocks: [
            {
              type: 'paragraph',
              text: { en: 'Three key rays to draw:', it: 'Tre raggi chiave da disegnare:' },
            },
            {
              type: 'list',
              items: [
                {
                  en: 'Ray parallel to axis → refracts through far focal point F\'',
                  it: 'Raggio parallelo all\'asse → rifrange attraverso il fuoco lontano F\'',
                },
                {
                  en: 'Ray through near focal point F → exits parallel to axis',
                  it: 'Raggio attraverso il fuoco vicino F → esce parallelo all\'asse',
                },
                {
                  en: 'Ray through lens center → passes straight through (undeviated)',
                  it: 'Raggio attraverso il centro della lente → passa dritto (non deviato)',
                },
              ],
            },
            {
              type: 'paragraph',
              text: {
                en: 'Where these three rays meet: the image location.',
                it: 'Dove questi tre raggi si incontrano: la posizione dell\'immagine.',
              },
            },
          ],
        },
        {
          type: 'key-formulas',
          items: [
            { name: { en: 'Reflection', it: 'Riflessione' }, latex: '\\theta_i = \\theta_r' },
            { name: { en: 'Snell\'s law', it: 'Legge di Snell' }, latex: 'n_1\\sin\\theta_1 = n_2\\sin\\theta_2' },
            { name: { en: 'Critical angle', it: 'Angolo critico' }, latex: '\\sin\\theta_c = n_2/n_1' },
            { name: { en: 'Thin lens', it: 'Lente sottile' }, latex: '1/f = 1/d_o + 1/d_i' },
            { name: { en: 'Magnification', it: 'Ingrandimento' }, latex: 'm = -d_i/d_o' },
          ],
        },
      ],
    },
  ],
};

export function renderGeoOptics(): string {
  return renderChapter(data);
}

export function initGeoOpticsDiagrams() {
  const wrapper = document.getElementById('snell-wrapper');
  const controlsEl = document.getElementById('snell-controls');
  if (!wrapper || !controlsEl) return;

  const canvas = document.createElement('canvas');
  wrapper.style.height = '380px';
  wrapper.appendChild(canvas);
  canvas.width = wrapper.clientWidth;
  canvas.height = 380;

  const sim = initSnellRefraction(canvas);

  controlsEl.appendChild(makeControl('n₁', 1.0, 2.5, 1.0, 0.05, '', v => sim.setN1(v)));
  controlsEl.appendChild(makeControl('n₂', 1.0, 2.5, 1.5, 0.05, '', v => sim.setN2(v)));
  wireTermLinks(document.getElementById('chapter-view')!);
}
