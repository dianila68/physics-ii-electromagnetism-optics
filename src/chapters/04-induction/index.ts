import { m, M } from '../../utils/katex-render.js';
import { t } from '../../utils/lang.js';
import { initFaradayLoop } from '../../diagrams/canvas/FaradayLoop.js';
import { wireTermLinks } from '../../ui/term-panel.js';

export function renderInduction(): string {
  return `
<div class="chapter-header">
  <div class="part-label">${t('Part IV', 'Parte IV')}</div>
  <h1>${t('Electromagnetic Induction', 'Induzione Elettromagnetica')}</h1>
  <p>${t(
    'A changing magnetic flux induces an EMF — the key discovery that makes generators, transformers, and wireless charging possible.',
    'Un flusso magnetico variabile induce una forza elettromotrice — la scoperta chiave che rende possibili generatori, trasformatori e ricarica wireless.'
  )}</p>
</div>

<div class="callout prereq">
  <div class="callout-title">${t('Prerequisites', 'Prerequisiti')}</div>
  <p>${t(
    '<a href="#03-magnetism" class="crossref">Chapter 3: Magnetism</a> — magnetic flux Φ = B·A·cosθ.',
    '<a href="#03-magnetism" class="crossref">Capitolo 3: Magnetismo</a> — flusso magnetico Φ = B·A·cosθ.'
  )}</p>
</div>

<h2>${t('5.1 Faraday\'s Law', '5.1 Legge di Faraday')}</h2>
<p>${t(
  'Michael Faraday (1831) discovered that a changing magnetic flux through a circuit loop induces an electromotive force (EMF):',
  'Michael Faraday (1831) scoprì che un flusso magnetico variabile attraverso una spira induce una forza elettromotrice (fem):'
)}</p>

<div class="formula-block">
  <div class="formula-label">${t('Faraday\'s Law', 'Legge di Faraday')}</div>
  ${M('\\mathcal{E} = -\\frac{d\\Phi_B}{dt} \\qquad \\Phi_B = \\int_S \\vec{B} \\cdot d\\vec{A}')}
  <p style="font-size:0.82rem;margin-top:8px;color:var(--text2)">${t(
    'For N turns: ε = −N dΦ/dt. The minus sign is Lenz\'s Law.',
    'Per N spire: ε = −N dΦ/dt. Il segno meno è la legge di Lenz.'
  )}</p>
</div>

<h2>${t('5.2 Lenz\'s Law', '5.2 Legge di Lenz')}</h2>
<p>${t(
  'The induced EMF has a direction such that the induced current creates a magnetic field that opposes the change in flux that caused it. This is a consequence of energy conservation.',
  'La fem indotta ha una direzione tale che la corrente indotta crea un campo magnetico che si oppone alla variazione di flusso che l\'ha causata. Questa è una conseguenza della conservazione dell\'energia.'
)}</p>

<div class="callout key">
  <div class="callout-title">${t('Lenz\'s Law in words', 'Legge di Lenz in parole')}</div>
  <p>${t(
    'Nature opposes change. If the flux through a loop increases, the induced current creates B opposing that increase. If flux decreases, the induced B tries to maintain it.',
    'La natura si oppone al cambiamento. Se il flusso attraverso una spira aumenta, la corrente indotta crea B che si oppone a quell\'aumento. Se il flusso diminuisce, il B indotto cerca di mantenerlo.'
  )}</p>
</div>

<div class="diagram-container">
  <div class="diagram-header">
    <span class="diagram-title">${t('Faraday Induction — Move the Magnet', 'Induzione di Faraday — Muovi il Magnete')}</span>
  </div>
  <div class="diagram-body" style="height:380px">
    <canvas id="faraday-canvas" style="width:100%;height:380px"></canvas>
  </div>
  <div class="diagram-caption">${t(
    'Drag the magnet left and right. Watch the induced EMF and current direction change.',
    'Trascina il magnete a sinistra e a destra. Osserva come cambiano la fem indotta e la direzione della corrente.'
  )}</div>
</div>

<h2>${t('5.3 Self-Inductance', '5.3 Autoinduzione')}</h2>
<p>${t(
  'A coil\'s own changing current induces an EMF in itself. The self-inductance L quantifies this:',
  'La corrente variabile di una bobina induce una fem in sé stessa. L\'autoinduzione L quantifica questo:'
)}</p>
<div class="formula-block">
  ${M('\\mathcal{E}_L = -L \\frac{dI}{dt} \\qquad L = \\frac{N\\Phi_B}{I}')}
  <p style="font-size:0.82rem;margin-top:8px;color:var(--text2)">${t(
    'For a solenoid: L = μ₀n²Vₛ where Vₛ is the solenoid volume.',
    'Per un solenoide: L = μ₀n²Vₛ dove Vₛ è il volume del solenoide.'
  )}</p>
</div>

<p>${t('Energy stored in an inductor:', 'Energia immagazzinata in un induttore:')}</p>
<div class="formula-block">
  ${M('U_L = \\frac{1}{2}LI^2')}
</div>

<h2>${t('5.4 RL and LC Circuits', '5.4 Circuiti RL e LC')}</h2>
<p>${t('In an RL circuit, current grows or decays exponentially:', 'In un circuito RL, la corrente cresce o decade esponenzialmente:')}</p>
<div class="formula-block">
  ${M('I(t) = I_0\\left(1 - e^{-t/\\tau_L}\\right) \\quad \\tau_L = \\frac{L}{R} \\quad \\text{(charging)}')}
</div>

<p>${t('In an LC circuit, charge oscillates at the natural frequency:', 'In un circuito LC, la carica oscilla alla frequenza naturale:')}</p>
<div class="formula-block">
  ${M('\\omega_0 = \\frac{1}{\\sqrt{LC}} \\qquad Q(t) = Q_0 \\cos(\\omega_0 t + \\phi)')}
</div>

<div class="key-formulas">
  <h4>${t('Chapter Summary', 'Riassunto del Capitolo')}</h4>
  <ul>
    <li><span class="formula-name">${t('Faraday\'s law', 'Legge di Faraday')}</span> ${m('\\mathcal{E} = -N\\,d\\Phi_B/dt')}</li>
    <li><span class="formula-name">${t('Self-inductance', 'Autoinduzione')}</span> ${m('\\mathcal{E}_L = -L\\,dI/dt')}</li>
    <li><span class="formula-name">${t('Inductor energy', 'Energia induttore')}</span> ${m('U_L = \\frac{1}{2}LI^2')}</li>
    <li><span class="formula-name">${t('LC frequency', 'Frequenza LC')}</span> ${m('\\omega_0 = 1/\\sqrt{LC}')}</li>
  </ul>
</div>
`;
}

export function initInductionDiagrams() {
  const canvas = document.getElementById('faraday-canvas') as HTMLCanvasElement | null;
  if (!canvas) return;
  canvas.width = canvas.parentElement!.clientWidth;
  canvas.height = 380;
  initFaradayLoop(canvas);
  wireTermLinks(document.getElementById('chapter-view')!);
}
