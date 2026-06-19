import { m, M } from '../../utils/katex-render.js';
import { t } from '../../utils/lang.js';
import { initCoulombField } from '../../diagrams/canvas/CoulombField.js';
import { wireTermLinks } from '../../ui/term-panel.js';
import { processText } from '../../ui/renderer.js';

export function renderElectrostatics(): string {
  return `
<div class="chapter-header">
  <div class="part-label">${t('Part I', 'Parte I')}</div>
  <h1>${t('Electrostatics', 'Elettrostatica')}</h1>
  <p>${t(
    'The study of [[electric-field|electric forces]] and fields produced by [[electric-charge|charges]] at rest.',
    'Lo studio delle [[electric-field|forze elettriche]] e dei campi prodotti da [[electric-charge|cariche]] in quiete.'
  )}</p>
</div>

<div class="callout prereq">
  <div class="callout-title">${t('Prerequisites', 'Prerequisiti')}</div>
  <p>${t(
    'Read <a href="#00-matter" class="crossref" data-chapter="00-matter">Chapter 0: Matter &amp; Charge</a> first — especially [[electric-charge|electric charge]] and quantization.',
    'Leggi prima il <a href="#00-matter" class="crossref" data-chapter="00-matter">Capitolo 0: Materia &amp; Carica</a> — in particolare la [[electric-charge|carica elettrica]] e quantizzazione.'
  )}</p>
</div>

<h2>${t('2.1 Coulomb\'s Law', '2.1 Legge di Coulomb')}</h2>
<p>${processText(t(
  'In 1785, Charles-Augustin de Coulomb discovered that the force between two point [[electric-charge|charges]] is proportional to the product of their charges and inversely proportional to the square of their separation:',
  'Nel 1785, Charles-Augustin de Coulomb scoprì che la forza tra due [[electric-charge|cariche]] puntiformi è proporzionale al prodotto delle loro cariche e inversamente proporzionale al quadrato della loro separazione:'
))}</p>

<div class="formula-block">
  <div class="formula-label">${t('Coulomb\'s Law', 'Legge di Coulomb')}</div>
  ${M('\\vec{F}_{12} = k_e \\frac{q_1 q_2}{r^2} \\hat{r}_{12}')}
  <p style="font-size:0.82rem;margin-top:8px;color:var(--text2)">${t(
    'where kₑ = 8.99 × 10⁹ N·m²/C² is Coulomb\'s constant, r is the distance between charges, and r̂ is the unit vector from q₁ to q₂.',
    'dove kₑ = 8.99 × 10⁹ N·m²/C² è la costante di Coulomb, r è la distanza tra le cariche, e r̂ è il vettore unitario da q₁ a q₂.'
  )}</p>
</div>

<div class="callout note">
  <div class="callout-title">${t('Coulomb vs Gravity', 'Coulomb vs Gravitazione')}</div>
  <p>${t(
    'Compare with Newton\'s law of gravitation: F = G m₁m₂/r². Same r² dependence, but electric force can be repulsive (same-sign charges), and is ~10³⁶ times stronger than gravity between an electron and proton.',
    'Confronta con la legge di gravitazione di Newton: F = G m₁m₂/r². Stessa dipendenza da r², ma la forza elettrica può essere repulsiva (cariche dello stesso segno), ed è ~10³⁶ volte più forte della gravità tra un elettrone e un protone.'
  )}</p>
</div>

<h3>${t('Superposition Principle', 'Principio di Sovrapposizione')}</h3>
<p>${t(
  'The total force on a charge from multiple other charges is the vector sum of the individual Coulomb forces:',
  'La forza totale su una carica da più cariche è la somma vettoriale delle singole forze di Coulomb:'
)}</p>
<div class="formula-block">
  ${M('\\vec{F}_{\\text{tot}} = \\sum_{i} \\vec{F}_i = k_e q \\sum_{i} \\frac{q_i}{r_i^2} \\hat{r}_i')}
</div>

<div class="diagram-container">
  <div class="diagram-header">
    <span class="diagram-title">${t('Interactive Coulomb Field', 'Campo di Coulomb Interattivo')}</span>
  </div>
  <div class="diagram-body" style="height:380px">
    <canvas id="coulomb-canvas" style="width:100%;height:380px"></canvas>
  </div>
  <div class="diagram-caption">${t(
    'Drag the charges to change their separation. Double-click to add/remove charges. Field lines shown for positive charges.',
    'Trascina le cariche per cambiare la loro separazione. Doppio clic per aggiungere/rimuovere cariche. Le linee di campo sono mostrate per le cariche positive.'
  )}</div>
</div>

<h2>${t('2.2 The Electric Field', '2.2 Il Campo Elettrico')}</h2>
<p>${t(
  'Instead of thinking about forces between specific pairs of charges, we define the <strong>electric field</strong> E at a point in space as the force per unit positive test charge placed at that point:',
  'Invece di pensare alle forze tra coppie specifiche di cariche, definiamo il <strong>campo elettrico</strong> E in un punto dello spazio come la forza per unità di carica di prova positiva posta in quel punto:'
)}</p>

<div class="formula-block">
  <div class="formula-label">${t('Electric field definition', 'Definizione del campo elettrico')}</div>
  ${M('\\vec{E} = \\lim_{q_0 \\to 0} \\frac{\\vec{F}}{q_0}')}
</div>

<p>${t(
  'For a point charge Q, the electric field at distance r is:',
  'Per una carica puntiforme Q, il campo elettrico a distanza r è:'
)}</p>
<div class="formula-block">
  ${M('\\vec{E} = k_e \\frac{Q}{r^2} \\hat{r}')}
</div>

<h3>${t('Field Lines', 'Linee di Campo')}</h3>
<p>${t(
  'Field lines are a visual tool: they point in the direction of E, and their density is proportional to the field magnitude. They originate at positive charges and terminate at negative charges.',
  'Le linee di campo sono uno strumento visivo: puntano nella direzione di E, e la loro densità è proporzionale all\'intensità del campo. Hanno origine nelle cariche positive e terminano nelle cariche negative.'
)}</p>

<h2>${t('2.3 Gauss\'s Law', '2.3 Legge di Gauss')}</h2>
<p>${t(
  'Gauss\'s Law relates the total electric flux through any closed surface to the total charge enclosed:',
  'La legge di Gauss mette in relazione il flusso elettrico totale attraverso qualsiasi superficie chiusa con la carica totale racchiusa:'
)}</p>

<div class="formula-block">
  <div class="formula-label">${t('Gauss\'s Law (integral form)', 'Legge di Gauss (forma integrale)')}</div>
  ${M('\\oint_S \\vec{E} \\cdot d\\vec{A} = \\frac{Q_{\\text{enc}}}{\\varepsilon_0}')}
  <p style="font-size:0.82rem;margin-top:8px;color:var(--text2)">${t(
    'ε₀ = 8.85 × 10⁻¹² C²/(N·m²) is the permittivity of free space. Note: kₑ = 1/(4πε₀).',
    'ε₀ = 8.85 × 10⁻¹² C²/(N·m²) è la permettività del vuoto. Nota: kₑ = 1/(4πε₀).'
  )}</p>
</div>

<details class="derivation">
  <summary>${t('Derivation: E field of a uniform sphere using Gauss\'s Law', 'Derivazione: Campo E di una sfera uniforme con la legge di Gauss')}</summary>
  <div class="derivation-body">
    <p>${t(
      'For a uniformly charged sphere of radius R and total charge Q, we choose a Gaussian surface: a concentric sphere of radius r.',
      'Per una sfera uniformemente carica di raggio R e carica totale Q, scegliamo una superficie gaussiana: una sfera concentrica di raggio r.'
    )}</p>
    <p><strong>${t('Outside (r > R):', 'Fuori (r > R):')}</strong></p>
    ${M('E \\cdot 4\\pi r^2 = \\frac{Q}{\\varepsilon_0} \\implies E = \\frac{Q}{4\\pi\\varepsilon_0 r^2} = k_e \\frac{Q}{r^2}')}
    <p>${t('The sphere looks like a point charge from outside!', 'La sfera appare come una carica puntiforme dall\'esterno!')}</p>
    <p><strong>${t('Inside (r < R):', 'Dentro (r < R):')}</strong></p>
    ${M('Q_{\\text{enc}} = Q \\frac{r^3}{R^3} \\implies E = \\frac{Qr}{4\\pi\\varepsilon_0 R^3}')}
    <p>${t('The field grows linearly inside the sphere.', 'Il campo cresce linearmente all\'interno della sfera.')}</p>
  </div>
</details>

<h2>${t('2.4 Electric Potential', '2.4 Potenziale Elettrico')}</h2>
<p>${t(
  'The electric potential V at a point is the work done per unit charge to move a test charge from infinity to that point:',
  'Il potenziale elettrico V in un punto è il lavoro fatto per unità di carica per spostare una carica di prova dall\'infinito a quel punto:'
)}</p>

<div class="formula-block">
  <div class="formula-label">${t('Electric potential', 'Potenziale elettrico')}</div>
  ${M('V = -\\int_\\infty^r \\vec{E} \\cdot d\\vec{\\ell} \\qquad \\text{or} \\qquad V = k_e \\frac{Q}{r}')}
</div>

<p>${t(
  'The relationship between field and potential:',
  'La relazione tra campo e potenziale:'
)}</p>
<div class="formula-block">
  ${M('\\vec{E} = -\\nabla V = -\\left(\\frac{\\partial V}{\\partial x}\\hat{x} + \\frac{\\partial V}{\\partial y}\\hat{y} + \\frac{\\partial V}{\\partial z}\\hat{z}\\right)')}
</div>

<h2>${t('2.5 Capacitance', '2.5 Capacità')}</h2>
<p>${t(
  'A capacitor stores charge. The capacitance C is the ratio of stored charge to voltage:',
  'Un condensatore immagazzina carica. La capacità C è il rapporto tra carica immagazzinata e tensione:'
)}</p>

<div class="formula-block">
  <div class="formula-label">${t('Capacitance', 'Capacità')}</div>
  ${M('C = \\frac{Q}{V} \\qquad [\\text{F = C/V}]')}
</div>

<p>${t('For a parallel-plate capacitor with area A and separation d:', 'Per un condensatore a facce piane con area A e separazione d:')}</p>
<div class="formula-block">
  ${M('C = \\varepsilon_0 \\frac{A}{d}')}
</div>

<p>${t('Energy stored in a capacitor:', 'Energia immagazzinata in un condensatore:')}</p>
<div class="formula-block">
  ${M('U = \\frac{1}{2}CV^2 = \\frac{Q^2}{2C} = \\frac{1}{2}QV')}
</div>

<div class="key-formulas">
  <h4>${t('Chapter Summary', 'Riassunto del Capitolo')}</h4>
  <ul>
    <li><span class="formula-name">${t('Coulomb\'s law', 'Legge di Coulomb')}</span> ${m('F = k_e \\frac{q_1 q_2}{r^2}')}</li>
    <li><span class="formula-name">${t('Electric field', 'Campo elettrico')}</span> ${m('\\vec{E} = k_e \\frac{Q}{r^2}\\hat{r}')}</li>
    <li><span class="formula-name">${t('Gauss\'s law', 'Legge di Gauss')}</span> ${m('\\oint \\vec{E}\\cdot d\\vec{A} = Q_{\\text{enc}}/\\varepsilon_0')}</li>
    <li><span class="formula-name">${t('Potential', 'Potenziale')}</span> ${m('V = k_e Q/r,\\quad \\vec{E} = -\\nabla V')}</li>
    <li><span class="formula-name">${t('Capacitance', 'Capacità')}</span> ${m('C = Q/V = \\varepsilon_0 A/d')}</li>
  </ul>
</div>
`;
}

export function initElectrostaticsDiagrams() {
  const canvas = document.getElementById('coulomb-canvas') as HTMLCanvasElement | null;
  if (!canvas) return;
  canvas.width = canvas.parentElement!.clientWidth;
  canvas.height = 380;
  initCoulombField(canvas);
  wireTermLinks(document.getElementById('chapter-view')!);
}
