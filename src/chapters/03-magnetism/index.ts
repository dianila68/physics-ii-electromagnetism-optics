import { m, M } from '../../utils/katex-render.js';
import { t } from '../../utils/lang.js';
import { initLorentzParticle } from '../../diagrams/canvas/LorentzParticle.js';
import { makeControl } from '../../utils/layers.js';
import { wireTermLinks } from '../../ui/term-panel.js';

export function renderMagnetism(): string {
  return `
<div class="chapter-header">
  <div class="part-label">${t('Part III', 'Parte III')}</div>
  <h1>${t('Magnetism', 'Magnetismo')}</h1>
  <p>${t(
    'Magnetic fields arise from moving charges and exert forces on other moving charges.',
    'I campi magnetici nascono da cariche in moto e esercitano forze su altre cariche in moto.'
  )}</p>
</div>

<div class="callout prereq">
  <div class="callout-title">${t('Prerequisites', 'Prerequisiti')}</div>
  <p>${t(
    '<a href="#01-electrostatics" class="crossref">Chapter 1: Electrostatics</a> — electric field concept. <a href="#02-circuits" class="crossref">Chapter 2: Circuits</a> — electric current.',
    '<a href="#01-electrostatics" class="crossref">Capitolo 1: Elettrostatica</a> — concetto di campo elettrico. <a href="#02-circuits" class="crossref">Capitolo 2: Circuiti</a> — corrente elettrica.'
  )}</p>
</div>

<h2>${t('4.1 The Lorentz Force', '4.1 La Forza di Lorentz')}</h2>
<p>${t(
  'A charged particle moving with velocity v in a magnetic field B experiences a force perpendicular to both v and B:',
  'Una particella carica che si muove con velocità v in un campo magnetico B subisce una forza perpendicolare sia a v che a B:'
)}</p>

<div class="formula-block">
  <div class="formula-label">${t('Lorentz Force', 'Forza di Lorentz')}</div>
  ${M('\\vec{F} = q\\vec{v} \\times \\vec{B}')}
  <p style="font-size:0.82rem;margin-top:8px;color:var(--text2)">${t(
    'The complete electromagnetic force (Lorentz force) is: F = q(E + v × B)',
    'La forza elettromagnetica completa (forza di Lorentz) è: F = q(E + v × B)'
  )}</p>
</div>

<div class="callout note">
  <div class="callout-title">${t('Key property', 'Proprietà chiave')}</div>
  <p>${t(
    'The magnetic force is always perpendicular to the velocity. Therefore it does no work and cannot change the speed of the particle — only its direction.',
    'La forza magnetica è sempre perpendicolare alla velocità. Pertanto non compie lavoro e non può cambiare la velocità della particella — solo la sua direzione.'
  )}</p>
</div>

<h3>${t('Circular Motion in a Magnetic Field', 'Moto Circolare in un Campo Magnetico')}</h3>
<p>${t(
  'When a charged particle moves perpendicular to a uniform B field, it undergoes uniform circular motion. The magnetic force provides the centripetal force:',
  'Quando una particella carica si muove perpendicolarmente a un campo B uniforme, compie un moto circolare uniforme. La forza magnetica fornisce la forza centripeta:'
)}</p>
<div class="formula-block">
  ${M('qvB = \\frac{mv^2}{r} \\implies r = \\frac{mv}{|q|B} \\quad \\text{(cyclotron radius)}')}
</div>

<div class="diagram-container">
  <div class="diagram-header">
    <span class="diagram-title">${t('Lorentz Force — Particle in Magnetic Field', 'Forza di Lorentz — Particella in Campo Magnetico')}</span>
  </div>
  <div id="lorentz-controls" class="controls"></div>
  <div class="diagram-body" style="height:380px">
    <canvas id="lorentz-canvas" style="width:100%;height:380px"></canvas>
  </div>
  <div class="diagram-caption">${t(
    '× symbols = B field into the screen. Particle traces circular/helical path due to Lorentz force.',
    '× simboli = campo B entrante nello schermo. La particella traccia un percorso circolare/elicoidale per la forza di Lorentz.'
  )}</div>
</div>

<h2>${t('4.2 Biot-Savart Law', '4.2 Legge di Biot-Savart')}</h2>
<p>${t(
  'The magnetic field dB produced by a current element Idℓ at position r is:',
  'Il campo magnetico dB prodotto da un elemento di corrente Idℓ alla posizione r è:'
)}</p>
<div class="formula-block">
  <div class="formula-label">${t('Biot-Savart Law', 'Legge di Biot-Savart')}</div>
  ${M('d\\vec{B} = \\frac{\\mu_0}{4\\pi} \\frac{I\\,d\\vec{\\ell} \\times \\hat{r}}{r^2}')}
  <p style="font-size:0.82rem;margin-top:8px;color:var(--text2)">${t(
    'μ₀ = 4π × 10⁻⁷ T·m/A is the permeability of free space.',
    'μ₀ = 4π × 10⁻⁷ T·m/A è la permeabilità del vuoto.'
  )}</p>
</div>

<p>${t('For a long straight wire carrying current I, the field at distance r is:', 'Per un filo rettilineo lungo che porta corrente I, il campo alla distanza r è:')}</p>
<div class="formula-block">
  ${M('B = \\frac{\\mu_0 I}{2\\pi r}')}
</div>

<h2>${t('4.3 Ampère\'s Law', '4.3 Legge di Ampère')}</h2>
<p>${t(
  'Ampère\'s Law is the magnetic analogue of Gauss\'s Law. The line integral of B around any closed loop equals μ₀ times the total current through the loop:',
  'La legge di Ampère è l\'analogo magnetico della legge di Gauss. L\'integrale di linea di B attorno a qualsiasi percorso chiuso è uguale a μ₀ per la corrente totale attraverso il percorso:'
)}</p>
<div class="formula-block">
  <div class="formula-label">${t('Ampère\'s Law (integral form)', 'Legge di Ampère (forma integrale)')}</div>
  ${M('\\oint_C \\vec{B} \\cdot d\\vec{\\ell} = \\mu_0 I_{\\text{enc}}')}
</div>

<details class="derivation">
  <summary>${t('Application: B field inside a solenoid', 'Applicazione: Campo B dentro un solenoide')}</summary>
  <div class="derivation-body">
    <p>${t(
      'A solenoid has n turns per unit length, current I. Using a rectangular Amperian loop:',
      'Un solenoide ha n spire per unità di lunghezza, corrente I. Usando un rettangolo amperiano:'
    )}</p>
    ${M('BL = \\mu_0 n L I \\implies B = \\mu_0 n I')}
    <p>${t(
      'The field is uniform inside and nearly zero outside — this is why solenoids are used as electromagnets.',
      'Il campo è uniforme all\'interno e quasi nullo all\'esterno — ecco perché i solenoidi sono usati come elettromagneti.'
    )}</p>
  </div>
</details>

<div class="key-formulas">
  <h4>${t('Chapter Summary', 'Riassunto del Capitolo')}</h4>
  <ul>
    <li><span class="formula-name">${t('Lorentz force', 'Forza di Lorentz')}</span> ${m('\\vec{F} = q\\vec{v}\\times\\vec{B}')}</li>
    <li><span class="formula-name">${t('Cyclotron radius', 'Raggio ciclotronica')}</span> ${m('r = mv/(|q|B)')}</li>
    <li><span class="formula-name">${t('Biot-Savart', 'Biot-Savart')}</span> ${m('dB = \\frac{\\mu_0}{4\\pi}\\frac{I\\,d\\ell\\sin\\theta}{r^2}')}</li>
    <li><span class="formula-name">${t('Long wire', 'Filo rettilineo')}</span> ${m('B = \\mu_0 I/(2\\pi r)')}</li>
    <li><span class="formula-name">${t('Ampère\'s law', 'Legge di Ampère')}</span> ${m('\\oint\\vec{B}\\cdot d\\vec{\\ell} = \\mu_0 I_{\\text{enc}}')}</li>
    <li><span class="formula-name">${t('Solenoid', 'Solenoide')}</span> ${m('B = \\mu_0 nI')}</li>
  </ul>
</div>
`;
}

export function initMagnetismDiagrams() {
  const canvas = document.getElementById('lorentz-canvas') as HTMLCanvasElement | null;
  const controlsEl = document.getElementById('lorentz-controls');
  if (!canvas || !controlsEl) return;
  canvas.width = canvas.parentElement!.clientWidth;
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
