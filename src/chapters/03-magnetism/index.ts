import { renderChapter, type ChapterData } from '../../ui/renderer.js';
import { initLorentzParticle } from '../../diagrams/canvas/LorentzParticle.js';
import { makeControl } from '../../utils/layers.js';
import { t } from '../../utils/lang.js';
import { wireTermLinks } from '../../ui/term-panel.js';

const data: ChapterData = {
  id: '03-magnetism',
  part: { en: 'Part III', it: 'Parte III' },
  title: { en: 'Magnetism', it: 'Magnetismo' },
  subtitle: {
    en: '[[magnetic-field|Magnetic fields]] arise from moving charges and exert forces on other moving charges.',
    it: 'I [[magnetic-field|campi magnetici]] nascono da cariche in moto e esercitano forze su altre cariche in moto.',
  },
  prereq: {
    text: {
      en: 'Chapter 1: Electrostatics — [[electric-field|electric field]] concept. Chapter 2: Circuits — [[electric-current|electric current]].',
      it: 'Capitolo 1: Elettrostatica — concetto di [[electric-field|campo elettrico]]. Capitolo 2: Circuiti — [[electric-current|corrente elettrica]].',
    },
    links: [
      { id: '01-electrostatics', label: { en: 'Chapter 1: Electrostatics', it: 'Capitolo 1: Elettrostatica' } },
      { id: '02-circuits', label: { en: 'Chapter 2: Circuits', it: 'Capitolo 2: Circuiti' } },
    ],
  },
  sections: [
    {
      id: 'lorentz-force',
      title: { en: '4.1 The Lorentz Force', it: '4.1 La Forza di Lorentz' },
      blocks: [
        {
          type: 'paragraph',
          text: {
            en: 'A charged particle moving with velocity v in a [[magnetic-field|magnetic field]] B experiences a force perpendicular to both v and B:',
            it: 'Una particella carica che si muove con velocità v in un [[magnetic-field|campo magnetico]] B subisce una forza perpendicolare sia a v che a B:',
          },
        },
        {
          type: 'formula',
          label: { en: 'Lorentz Force', it: 'Forza di Lorentz' },
          latex: '\\vec{F} = q\\vec{v} \\times \\vec{B}',
          note: {
            en: 'The complete electromagnetic force ([[lorentz-force|Lorentz force]]) is: F = q(E + v × B)',
            it: 'La forza elettromagnetica completa ([[lorentz-force|forza di Lorentz]]) è: F = q(E + v × B)',
          },
        },
        {
          type: 'callout',
          variant: 'note',
          title: { en: 'Key property', it: 'Proprietà chiave' },
          text: {
            en: 'The [[lorentz-force|magnetic force]] is always perpendicular to the velocity. Therefore it does no work and cannot change the speed of the particle — only its direction.',
            it: 'La [[lorentz-force|forza magnetica]] è sempre perpendicolare alla velocità. Pertanto non compie lavoro e non può cambiare la velocità della particella — solo la sua direzione.',
          },
        },
        {
          type: 'heading3',
          text: { en: 'Circular Motion in a Magnetic Field', it: 'Moto Circolare in un Campo Magnetico' },
        },
        {
          type: 'paragraph',
          text: {
            en: 'When a charged particle moves perpendicular to a uniform [[magnetic-field|B field]], it undergoes uniform circular motion. The magnetic force provides the centripetal force:',
            it: 'Quando una particella carica si muove perpendicolarmente a un [[magnetic-field|campo B]] uniforme, compie un moto circolare uniforme. La forza magnetica fornisce la forza centripeta:',
          },
        },
        {
          type: 'formula',
          latex: 'qvB = \\frac{mv^2}{r} \\implies r = \\frac{mv}{|q|B} \\quad \\text{(cyclotron radius)}',
        },
        {
          type: 'diagram',
          id: 'lorentz',
          title: { en: 'Lorentz Force — Particle in Magnetic Field', it: 'Forza di Lorentz — Particella in Campo Magnetico' },
          caption: {
            en: '× symbols = B field into the screen. Particle traces circular/helical path due to [[lorentz-force|Lorentz force]].',
            it: '× simboli = campo B entrante nello schermo. La particella traccia un percorso circolare/elicoidale per la [[lorentz-force|forza di Lorentz]].',
          },
          hasControls: true,
        },
      ],
    },
    {
      id: 'biot-savart',
      title: { en: '4.2 Biot-Savart Law', it: '4.2 Legge di Biot-Savart' },
      blocks: [
        {
          type: 'paragraph',
          text: {
            en: 'The [[biot-savart|magnetic field]] dB produced by a current element Idℓ at position r is:',
            it: 'Il [[biot-savart|campo magnetico]] dB prodotto da un elemento di corrente Idℓ alla posizione r è:',
          },
        },
        {
          type: 'formula',
          label: { en: 'Biot-Savart Law', it: 'Legge di Biot-Savart' },
          latex: 'd\\vec{B} = \\frac{\\mu_0}{4\\pi} \\frac{I\\,d\\vec{\\ell} \\times \\hat{r}}{r^2}',
          note: {
            en: '[[permeability|μ₀]] = 4π × 10⁻⁷ T·m/A is the permeability of free space.',
            it: '[[permeability|μ₀]] = 4π × 10⁻⁷ T·m/A è la permeabilità del vuoto.',
          },
        },
        {
          type: 'paragraph',
          text: {
            en: 'For a long straight wire carrying [[electric-current|current]] I, the field at distance r is:',
            it: 'Per un filo rettilineo lungo che porta [[electric-current|corrente]] I, il campo alla distanza r è:',
          },
        },
        {
          type: 'formula',
          latex: 'B = \\frac{\\mu_0 I}{2\\pi r}',
        },
      ],
    },
    {
      id: 'ampere-law',
      title: { en: '4.3 Ampère\'s Law', it: '4.3 Legge di Ampère' },
      blocks: [
        {
          type: 'paragraph',
          text: {
            en: '[[ampere-law|Ampère\'s Law]] is the magnetic analogue of [[gauss-law|Gauss\'s Law]]. The line integral of B around any closed loop equals μ₀ times the total current through the loop:',
            it: 'La [[ampere-law|legge di Ampère]] è l\'analogo magnetico della [[gauss-law|legge di Gauss]]. L\'integrale di linea di B attorno a qualsiasi percorso chiuso è uguale a μ₀ per la corrente totale attraverso il percorso:',
          },
        },
        {
          type: 'formula',
          label: { en: 'Ampère\'s Law (integral form)', it: 'Legge di Ampère (forma integrale)' },
          latex: '\\oint_C \\vec{B} \\cdot d\\vec{\\ell} = \\mu_0 I_{\\text{enc}}',
        },
        {
          type: 'derivation',
          title: {
            en: 'Application: B field inside a solenoid',
            it: 'Applicazione: Campo B dentro un solenoide',
          },
          blocks: [
            {
              type: 'paragraph',
              text: {
                en: 'A solenoid has n turns per unit length, current I. Using a rectangular Amperian loop:',
                it: 'Un solenoide ha n spire per unità di lunghezza, corrente I. Usando un rettangolo amperiano:',
              },
            },
            {
              type: 'formula',
              latex: 'BL = \\mu_0 n L I \\implies B = \\mu_0 n I',
            },
            {
              type: 'paragraph',
              text: {
                en: 'The field is uniform inside and nearly zero outside — this is why solenoids are used as electromagnets.',
                it: 'Il campo è uniforme all\'interno e quasi nullo all\'esterno — ecco perché i solenoidi sono usati come elettromagneti.',
              },
            },
          ],
        },
        {
          type: 'key-formulas',
          items: [
            { name: { en: 'Lorentz force', it: 'Forza di Lorentz' }, latex: '\\vec{F} = q\\vec{v}\\times\\vec{B}' },
            { name: { en: 'Cyclotron radius', it: 'Raggio ciclotronico' }, latex: 'r = mv/(|q|B)' },
            { name: { en: 'Biot-Savart', it: 'Biot-Savart' }, latex: 'dB = \\frac{\\mu_0}{4\\pi}\\frac{I\\,d\\ell\\sin\\theta}{r^2}' },
            { name: { en: 'Long wire', it: 'Filo rettilineo' }, latex: 'B = \\mu_0 I/(2\\pi r)' },
            { name: { en: 'Ampère\'s law', it: 'Legge di Ampère' }, latex: '\\oint\\vec{B}\\cdot d\\vec{\\ell} = \\mu_0 I_{\\text{enc}}' },
            { name: { en: 'Solenoid', it: 'Solenoide' }, latex: 'B = \\mu_0 nI' },
          ],
        },
      ],
    },
  ],
};

export function renderMagnetism(): string {
  return renderChapter(data);
}

export function initMagnetismDiagrams() {
  const wrapper = document.getElementById('lorentz-wrapper');
  const controlsEl = document.getElementById('lorentz-controls');
  if (!wrapper || !controlsEl) return;

  const canvas = document.createElement('canvas');
  wrapper.style.height = '380px';
  wrapper.appendChild(canvas);
  canvas.width = wrapper.clientWidth;
  canvas.height = 380;

  const sim = initLorentzParticle(canvas);

  controlsEl.appendChild(makeControl(
    t('B field (T)', 'Campo B (T)'), -3, 3, 1.5, 0.1, ' T', v => sim.setB(v)
  ));
  controlsEl.appendChild(makeControl(
    t('Speed', 'Velocità'), 1, 6, 3, 0.5, '', v => sim.setSpeed(v)
  ));
  wireTermLinks(document.getElementById('chapter-view')!);
}
