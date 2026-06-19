import { m, M } from '../../utils/katex-render.js';
import { t } from '../../utils/lang.js';
import { wireTermLinks } from '../../ui/term-panel.js';

export function renderCircuits(): string {
  return `
<div class="chapter-header">
  <div class="part-label">${t('Part II', 'Parte II')}</div>
  <h1>${t('Electric Current &amp; DC Circuits', 'Corrente Elettrica &amp; Circuiti DC')}</h1>
  <p>${t(
    'When charges flow, they carry energy. Current, resistance, and circuit laws govern how electrical energy is distributed.',
    'Quando le cariche scorrono, trasportano energia. Corrente, resistenza e leggi dei circuiti governano come l\'energia elettrica viene distribuita.'
  )}</p>
</div>

<div class="callout prereq">
  <div class="callout-title">${t('Prerequisites', 'Prerequisiti')}</div>
  <p>${t(
    '<a href="#01-electrostatics" class="crossref">Chapter 1: Electrostatics</a> — electric potential V and capacitance C.',
    '<a href="#01-electrostatics" class="crossref">Capitolo 1: Elettrostatica</a> — potenziale elettrico V e capacità C.'
  )}</p>
</div>

<h2>${t('3.1 Electric Current', '3.1 Corrente Elettrica')}</h2>
<p>${t(
  'Electric current I is the rate of charge flow through a cross-section:',
  'La corrente elettrica I è la velocità del flusso di carica attraverso una sezione:'
)}</p>
<div class="formula-block">
  <div class="formula-label">${t('Current', 'Corrente')}</div>
  ${M('I = \\frac{dq}{dt} \\qquad [\\text{A = C/s}]')}
</div>

<p>${t('Microscopically, current density j relates to drift velocity v_d of charge carriers with density n:', 'Microscopicamente, la densità di corrente j è legata alla velocità di deriva v_d dei portatori di carica con densità n:')}</p>
<div class="formula-block">
  ${M('\\vec{J} = nq\\vec{v}_d \\qquad I = \\int \\vec{J} \\cdot d\\vec{A}')}
</div>

<h2>${t('3.2 Resistance & Ohm\'s Law', '3.2 Resistenza & Legge di Ohm')}</h2>
<div class="formula-block">
  <div class="formula-label">${t('Ohm\'s Law (macroscopic)', 'Legge di Ohm (macroscopica)')}</div>
  ${M('V = IR \\qquad R = \\rho\\frac{L}{A}')}
  <p style="font-size:0.82rem;margin-top:8px;color:var(--text2)">${t(
    'ρ is resistivity (material property), L is length, A is cross-sectional area.',
    'ρ è la resistività (proprietà del materiale), L è la lunghezza, A è l\'area della sezione trasversale.'
  )}</p>
</div>

<div class="formula-block">
  <div class="formula-label">${t('Ohm\'s Law (microscopic)', 'Legge di Ohm (microscopica)')}</div>
  ${M('\\vec{J} = \\sigma \\vec{E} \\qquad \\sigma = \\frac{1}{\\rho}')}
</div>

<p>${t('Power dissipated in a resistor:', 'Potenza dissipata in una resistenza:')}</p>
<div class="formula-block">
  ${M('P = IV = I^2 R = \\frac{V^2}{R}')}
</div>

<h2>${t('3.3 Kirchhoff\'s Laws', '3.3 Leggi di Kirchhoff')}</h2>

<div class="formula-block">
  <div class="formula-label">${t('KCL — Current Law (node rule)', 'KCL — Legge delle Correnti (regola del nodo)')}</div>
  ${M('\\sum_{k} I_k = 0 \\quad \\text{(at any node)}')}
  <p style="font-size:0.82rem;margin-top:8px;color:var(--text2)">${t('Conservation of charge: currents in = currents out.', 'Conservazione della carica: correnti entranti = correnti uscenti.')}</p>
</div>

<div class="formula-block">
  <div class="formula-label">${t('KVL — Voltage Law (loop rule)', 'KVL — Legge delle Tensioni (regola della maglia)')}</div>
  ${M('\\sum_{k} V_k = 0 \\quad \\text{(around any closed loop)}')}
  <p style="font-size:0.82rem;margin-top:8px;color:var(--text2)">${t('Conservation of energy: voltage drops sum to zero around any loop.', 'Conservazione dell\'energia: le cadute di tensione si azzerano attorno a qualsiasi maglia.')}</p>
</div>

<h3>${t('Series and Parallel', 'Serie e Parallelo')}</h3>
<table>
  <thead><tr>
    <th></th>
    <th>${t('Series', 'Serie')}</th>
    <th>${t('Parallel', 'Parallelo')}</th>
  </tr></thead>
  <tbody>
    <tr><td>${t('Resistors', 'Resistori')}</td><td>${m('R_{tot} = \\sum R_i')}</td><td>${m('1/R_{tot} = \\sum 1/R_i')}</td></tr>
    <tr><td>${t('Capacitors', 'Condensatori')}</td><td>${m('1/C_{tot} = \\sum 1/C_i')}</td><td>${m('C_{tot} = \\sum C_i')}</td></tr>
  </tbody>
</table>

<h2>${t('3.4 RC Circuits', '3.4 Circuiti RC')}</h2>
<p>${t('Charging a capacitor C through resistor R from EMF ε:', 'Caricare un condensatore C attraverso una resistenza R da fem ε:')}</p>
<div class="formula-block">
  ${M('Q(t) = C\\mathcal{E}\\left(1 - e^{-t/\\tau}\\right) \\quad I(t) = \\frac{\\mathcal{E}}{R}e^{-t/\\tau} \\quad \\tau = RC')}
</div>
<p>${t('Discharging:', 'Scarica:')}</p>
<div class="formula-block">
  ${M('Q(t) = Q_0 e^{-t/\\tau} \\quad I(t) = \\frac{Q_0}{RC} e^{-t/\\tau}')}
</div>

<div class="key-formulas">
  <h4>${t('Chapter Summary', 'Riassunto del Capitolo')}</h4>
  <ul>
    <li><span class="formula-name">${t('Current', 'Corrente')}</span> ${m('I = dq/dt')}</li>
    <li><span class="formula-name">${t('Ohm\'s law', 'Legge di Ohm')}</span> ${m('V = IR')}</li>
    <li><span class="formula-name">${t('Power', 'Potenza')}</span> ${m('P = IV = I^2R')}</li>
    <li><span class="formula-name">${t('KCL', 'KCL')}</span> ${m('\\sum I_k = 0')}</li>
    <li><span class="formula-name">${t('KVL', 'KVL')}</span> ${m('\\sum V_k = 0')}</li>
    <li><span class="formula-name">${t('RC time constant', 'Costante di tempo RC')}</span> ${m('\\tau = RC')}</li>
  </ul>
</div>
`;
}

export function initCircuitsDiagrams() {
  // No interactive diagram in this chapter yet
  wireTermLinks(document.getElementById('chapter-view')!);
}
