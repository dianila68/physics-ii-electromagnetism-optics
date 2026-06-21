import { renderChapter, type ChapterData } from '../../ui/renderer.js';
import { initCoulombField } from '../../diagrams/canvas/CoulombField.js';
import { wireTermLinks } from '../../ui/term-panel.js';

const data: ChapterData = {
  id: '01-electrostatics',
  part: { en: 'Part I', it: 'Parte I' },
  title: { en: 'Electrostatics', it: 'Elettrostatica' },
  subtitle: {
    en: 'The study of [[electric-field|electric forces]] and fields produced by [[electric-charge|charges]] at rest.',
    it: 'Lo studio delle [[electric-field|forze elettriche]] e dei campi prodotti da [[electric-charge|cariche]] in quiete.',
  },
  prereq: {
    text: {
      en: 'Read Chapter 0: Matter & Charge first — especially [[electric-charge|electric charge]] and quantization.',
      it: 'Leggi prima il Capitolo 0: Materia & Carica — in particolare la [[electric-charge|carica elettrica]] e quantizzazione.',
    },
    links: [{ id: '00-matter', label: { en: 'Chapter 0: Matter & Charge', it: 'Capitolo 0: Materia & Carica' } }],
  },
  sections: [
    {
      id: 'coulombs-law',
      title: { en: '2.1 Coulomb\'s Law', it: '2.1 Legge di Coulomb' },
      blocks: [
        {
          type: 'paragraph',
          text: {
            en: 'In 1785, Charles-Augustin de Coulomb discovered that the force between two point [[electric-charge|charges]] is proportional to the product of their charges and inversely proportional to the square of their separation:',
            it: 'Nel 1785, Charles-Augustin de Coulomb scoprì che la forza tra due [[electric-charge|cariche]] puntiformi è proporzionale al prodotto delle loro cariche e inversamente proporzionale al quadrato della loro separazione:',
          },
        },
        {
          type: 'formula',
          label: { en: 'Coulomb\'s Law', it: 'Legge di Coulomb' },
          latex: '\\vec{F}_{12} = k_e \\frac{q_1 q_2}{r^2} \\hat{r}_{12}',
          note: {
            en: 'where kₑ = 8.99 × 10⁹ N·m²/C² is Coulomb\'s constant, r is the distance between charges, and r̂ is the unit vector from q₁ to q₂.',
            it: 'dove kₑ = 8.99 × 10⁹ N·m²/C² è la costante di Coulomb, r è la distanza tra le cariche, e r̂ è il vettore unitario da q₁ a q₂.',
          },
        },
        {
          type: 'callout',
          variant: 'note',
          title: { en: 'Coulomb vs Gravity', it: 'Coulomb vs Gravitazione' },
          text: {
            en: 'Compare with Newton\'s law of gravitation: F = G m₁m₂/r². Same r² dependence, but electric force can be repulsive (same-sign charges), and is ~10³⁶ times stronger than gravity between an electron and proton.',
            it: 'Confronta con la legge di gravitazione di Newton: F = G m₁m₂/r². Stessa dipendenza da r², ma la forza elettrica può essere repulsiva (cariche dello stesso segno), ed è ~10³⁶ volte più forte della gravità tra un elettrone e un protone.',
          },
        },
        {
          type: 'heading3',
          text: { en: 'Superposition Principle', it: 'Principio di Sovrapposizione' },
        },
        {
          type: 'paragraph',
          text: {
            en: 'The total force on a charge from multiple other charges is the vector sum of the individual Coulomb forces:',
            it: 'La forza totale su una carica da più cariche è la somma vettoriale delle singole forze di Coulomb:',
          },
        },
        {
          type: 'formula',
          latex: '\\vec{F}_{\\text{tot}} = \\sum_{i} \\vec{F}_i = k_e q \\sum_{i} \\frac{q_i}{r_i^2} \\hat{r}_i',
        },
        {
          type: 'diagram',
          id: 'coulomb',
          title: { en: 'Interactive Coulomb Field', it: 'Campo di Coulomb Interattivo' },
          caption: {
            en: 'Drag the charges to change their separation. Double-click to add/remove charges. Field lines shown for positive charges.',
            it: 'Trascina le cariche per cambiare la loro separazione. Doppio clic per aggiungere/rimuovere cariche. Le linee di campo sono mostrate per le cariche positive.',
          },
        },
      ],
    },
    {
      id: 'electric-field',
      title: { en: '2.2 The Electric Field', it: '2.2 Il Campo Elettrico' },
      blocks: [
        {
          type: 'paragraph',
          text: {
            en: 'Instead of thinking about forces between specific pairs of charges, we define the [[electric-field|electric field]] E at a point in space as the force per unit positive test charge placed at that point:',
            it: 'Invece di pensare alle forze tra coppie specifiche di cariche, definiamo il [[electric-field|campo elettrico]] E in un punto dello spazio come la forza per unità di carica di prova positiva posta in quel punto:',
          },
        },
        {
          type: 'formula',
          label: { en: 'Electric field definition', it: 'Definizione del campo elettrico' },
          latex: '\\vec{E} = \\lim_{q_0 \\to 0} \\frac{\\vec{F}}{q_0}',
        },
        {
          type: 'paragraph',
          text: {
            en: 'For a point charge Q, the [[electric-field|electric field]] at distance r is:',
            it: 'Per una carica puntiforme Q, il [[electric-field|campo elettrico]] a distanza r è:',
          },
        },
        {
          type: 'formula',
          latex: '\\vec{E} = k_e \\frac{Q}{r^2} \\hat{r}',
        },
        {
          type: 'heading3',
          text: { en: 'Field Lines', it: 'Linee di Campo' },
        },
        {
          type: 'paragraph',
          text: {
            en: 'Field lines are a visual tool: they point in the direction of E, and their density is proportional to the field magnitude. They originate at positive charges and terminate at negative charges.',
            it: 'Le linee di campo sono uno strumento visivo: puntano nella direzione di E, e la loro densità è proporzionale all\'intensità del campo. Hanno origine nelle cariche positive e terminano nelle cariche negative.',
          },
        },
      ],
    },
    {
      id: 'gauss-law',
      title: { en: '2.3 Gauss\'s Law', it: '2.3 Legge di Gauss' },
      blocks: [
        {
          type: 'paragraph',
          text: {
            en: '[[gauss-law|Gauss\'s Law]] relates the total electric flux through any closed surface to the total charge enclosed:',
            it: 'La [[gauss-law|legge di Gauss]] mette in relazione il flusso elettrico totale attraverso qualsiasi superficie chiusa con la carica totale racchiusa:',
          },
        },
        {
          type: 'formula',
          label: { en: 'Gauss\'s Law (integral form)', it: 'Legge di Gauss (forma integrale)' },
          latex: '\\oint_S \\vec{E} \\cdot d\\vec{A} = \\frac{Q_{\\text{enc}}}{\\varepsilon_0}',
          note: {
            en: '[[permittivity|ε₀]] = 8.85 × 10⁻¹² C²/(N·m²) is the permittivity of free space. Note: kₑ = 1/(4πε₀).',
            it: '[[permittivity|ε₀]] = 8.85 × 10⁻¹² C²/(N·m²) è la permettività del vuoto. Nota: kₑ = 1/(4πε₀).',
          },
        },
        {
          type: 'derivation',
          title: {
            en: 'Derivation: E field of a uniform sphere using Gauss\'s Law',
            it: 'Derivazione: Campo E di una sfera uniforme con la legge di Gauss',
          },
          blocks: [
            {
              type: 'paragraph',
              text: {
                en: 'For a uniformly charged sphere of radius R and total charge Q, we choose a Gaussian surface: a concentric sphere of radius r.',
                it: 'Per una sfera uniformemente carica di raggio R e carica totale Q, scegliamo una superficie gaussiana: una sfera concentrica di raggio r.',
              },
            },
            {
              type: 'paragraph',
              text: { en: '<strong>Outside (r > R):</strong>', it: '<strong>Fuori (r > R):</strong>' },
            },
            {
              type: 'formula',
              latex: 'E \\cdot 4\\pi r^2 = \\frac{Q}{\\varepsilon_0} \\implies E = \\frac{Q}{4\\pi\\varepsilon_0 r^2} = k_e \\frac{Q}{r^2}',
            },
            {
              type: 'paragraph',
              text: {
                en: 'The sphere looks like a point charge from outside!',
                it: 'La sfera appare come una carica puntiforme dall\'esterno!',
              },
            },
            {
              type: 'paragraph',
              text: { en: '<strong>Inside (r < R):</strong>', it: '<strong>Dentro (r < R):</strong>' },
            },
            {
              type: 'formula',
              latex: 'Q_{\\text{enc}} = Q \\frac{r^3}{R^3} \\implies E = \\frac{Qr}{4\\pi\\varepsilon_0 R^3}',
            },
            {
              type: 'paragraph',
              text: {
                en: 'The field grows linearly inside the sphere.',
                it: 'Il campo cresce linearmente all\'interno della sfera.',
              },
            },
          ],
        },
      ],
    },
    {
      id: 'electric-potential',
      title: { en: '2.4 Electric Potential', it: '2.4 Potenziale Elettrico' },
      blocks: [
        {
          type: 'paragraph',
          text: {
            en: 'The [[electric-potential|electric potential]] V at a point is the work done per unit charge to move a test charge from infinity to that point:',
            it: 'Il [[electric-potential|potenziale elettrico]] V in un punto è il lavoro fatto per unità di carica per spostare una carica di prova dall\'infinito a quel punto:',
          },
        },
        {
          type: 'formula',
          label: { en: 'Electric potential', it: 'Potenziale elettrico' },
          latex: 'V = -\\int_\\infty^r \\vec{E} \\cdot d\\vec{\\ell} \\qquad \\text{or} \\qquad V = k_e \\frac{Q}{r}',
        },
        {
          type: 'paragraph',
          text: {
            en: 'The relationship between [[electric-field|field]] and [[electric-potential|potential]]:',
            it: 'La relazione tra [[electric-field|campo]] e [[electric-potential|potenziale]]:',
          },
        },
        {
          type: 'formula',
          latex: '\\vec{E} = -\\nabla V = -\\left(\\frac{\\partial V}{\\partial x}\\hat{x} + \\frac{\\partial V}{\\partial y}\\hat{y} + \\frac{\\partial V}{\\partial z}\\hat{z}\\right)',
        },
      ],
    },
    {
      id: 'capacitance',
      title: { en: '2.5 Capacitance', it: '2.5 Capacità' },
      blocks: [
        {
          type: 'paragraph',
          text: {
            en: 'A [[capacitance|capacitor]] stores charge. The [[capacitance|capacitance]] C is the ratio of stored charge to voltage:',
            it: 'Un [[capacitance|condensatore]] immagazzina carica. La [[capacitance|capacità]] C è il rapporto tra carica immagazzinata e tensione:',
          },
        },
        {
          type: 'formula',
          label: { en: 'Capacitance', it: 'Capacità' },
          latex: 'C = \\frac{Q}{V} \\qquad [\\text{F = C/V}]',
        },
        {
          type: 'paragraph',
          text: {
            en: 'For a parallel-plate capacitor with area A and separation d:',
            it: 'Per un [[capacitance|condensatore]] a facce piane con area A e separazione d:',
          },
        },
        {
          type: 'formula',
          latex: 'C = \\varepsilon_0 \\frac{A}{d}',
        },
        {
          type: 'paragraph',
          text: {
            en: 'Energy stored in a capacitor:',
            it: 'Energia immagazzinata in un condensatore:',
          },
        },
        {
          type: 'formula',
          latex: 'U = \\frac{1}{2}CV^2 = \\frac{Q^2}{2C} = \\frac{1}{2}QV',
        },
        {
          type: 'key-formulas',
          items: [
            { name: { en: 'Coulomb\'s law', it: 'Legge di Coulomb' }, latex: 'F = k_e \\frac{q_1 q_2}{r^2}' },
            { name: { en: 'Electric field', it: 'Campo elettrico' }, latex: '\\vec{E} = k_e \\frac{Q}{r^2}\\hat{r}' },
            { name: { en: 'Gauss\'s law', it: 'Legge di Gauss' }, latex: '\\oint \\vec{E}\\cdot d\\vec{A} = Q_{\\text{enc}}/\\varepsilon_0' },
            { name: { en: 'Potential', it: 'Potenziale' }, latex: 'V = k_e Q/r,\\quad \\vec{E} = -\\nabla V' },
            { name: { en: 'Capacitance', it: 'Capacità' }, latex: 'C = Q/V = \\varepsilon_0 A/d' },
          ],
        },
      ],
    },
  ],
};

export function renderElectrostatics(): string {
  return renderChapter(data);
}

export function initElectrostaticsDiagrams() {
  const wrapper = document.getElementById('coulomb-wrapper');
  if (!wrapper) return;
  const canvas = document.createElement('canvas');
  wrapper.style.height = '380px';
  wrapper.appendChild(canvas);
  canvas.width = wrapper.clientWidth;
  canvas.height = 380;
  initCoulombField(canvas);
  wireTermLinks(document.getElementById('chapter-view')!);
}
