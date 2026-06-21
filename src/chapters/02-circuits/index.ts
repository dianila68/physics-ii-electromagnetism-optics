import { renderChapter, type ChapterData } from '../../ui/renderer.js';
import { wireTermLinks } from '../../ui/term-panel.js';

const data: ChapterData = {
  id: '02-circuits',
  part: { en: 'Part II', it: 'Parte II' },
  title: { en: 'Electric Current & DC Circuits', it: 'Corrente Elettrica & Circuiti DC' },
  subtitle: {
    en: 'When charges flow, they carry energy. Current, resistance, and circuit laws govern how electrical energy is distributed.',
    it: 'Quando le cariche scorrono, trasportano energia. Corrente, resistenza e leggi dei circuiti governano come l\'energia elettrica viene distribuita.',
  },
  prereq: {
    text: {
      en: 'Chapter 1: Electrostatics — [[electric-potential|electric potential]] V and [[capacitance|capacitance]] C.',
      it: 'Capitolo 1: Elettrostatica — [[electric-potential|potenziale elettrico]] V e [[capacitance|capacità]] C.',
    },
    links: [{ id: '01-electrostatics', label: { en: 'Chapter 1: Electrostatics', it: 'Capitolo 1: Elettrostatica' } }],
  },
  sections: [
    {
      id: 'electric-current',
      title: { en: '3.1 Electric Current', it: '3.1 Corrente Elettrica' },
      blocks: [
        {
          type: 'paragraph',
          text: {
            en: '[[electric-current|Electric current]] I is the rate of charge flow through a cross-section:',
            it: 'La [[electric-current|corrente elettrica]] I è la velocità del flusso di carica attraverso una sezione:',
          },
        },
        {
          type: 'formula',
          label: { en: 'Current', it: 'Corrente' },
          latex: 'I = \\frac{dq}{dt} \\qquad [\\text{A = C/s}]',
        },
        {
          type: 'paragraph',
          text: {
            en: 'Microscopically, current density j relates to drift velocity v_d of charge carriers with density n:',
            it: 'Microscopicamente, la densità di corrente j è legata alla velocità di deriva v_d dei portatori di carica con densità n:',
          },
        },
        {
          type: 'formula',
          latex: '\\vec{J} = nq\\vec{v}_d \\qquad I = \\int \\vec{J} \\cdot d\\vec{A}',
        },
      ],
    },
    {
      id: 'ohms-law',
      title: { en: '3.2 Resistance & Ohm\'s Law', it: '3.2 Resistenza & Legge di Ohm' },
      blocks: [
        {
          type: 'formula',
          label: { en: 'Ohm\'s Law (macroscopic)', it: 'Legge di Ohm (macroscopica)' },
          latex: 'V = IR \\qquad R = \\rho\\frac{L}{A}',
          note: {
            en: 'ρ is resistivity (material property), L is length, A is cross-sectional area.',
            it: 'ρ è la resistività (proprietà del materiale), L è la lunghezza, A è l\'area della sezione trasversale.',
          },
        },
        {
          type: 'formula',
          label: { en: 'Ohm\'s Law (microscopic)', it: 'Legge di Ohm (microscopica)' },
          latex: '\\vec{J} = \\sigma \\vec{E} \\qquad \\sigma = \\frac{1}{\\rho}',
        },
        {
          type: 'paragraph',
          text: {
            en: 'Power dissipated in a [[resistance|resistor]]:',
            it: 'Potenza dissipata in una [[resistance|resistenza]]:',
          },
        },
        {
          type: 'formula',
          latex: 'P = IV = I^2 R = \\frac{V^2}{R}',
        },
      ],
    },
    {
      id: 'kirchhoff',
      title: { en: '3.3 Kirchhoff\'s Laws', it: '3.3 Leggi di Kirchhoff' },
      blocks: [
        {
          type: 'formula',
          label: { en: 'KCL — Current Law (node rule)', it: 'KCL — Legge delle Correnti (regola del nodo)' },
          latex: '\\sum_{k} I_k = 0 \\quad \\text{(at any node)}',
          note: {
            en: 'Conservation of charge: currents in = currents out.',
            it: 'Conservazione della carica: correnti entranti = correnti uscenti.',
          },
        },
        {
          type: 'formula',
          label: { en: 'KVL — Voltage Law (loop rule)', it: 'KVL — Legge delle Tensioni (regola della maglia)' },
          latex: '\\sum_{k} V_k = 0 \\quad \\text{(around any closed loop)}',
          note: {
            en: 'Conservation of energy: voltage drops sum to zero around any loop.',
            it: 'Conservazione dell\'energia: le cadute di tensione si azzerano attorno a qualsiasi maglia.',
          },
        },
        {
          type: 'heading3',
          text: { en: 'Series and Parallel', it: 'Serie e Parallelo' },
        },
        {
          type: 'table',
          headers: [
            { en: '', it: '' },
            { en: 'Series', it: 'Serie' },
            { en: 'Parallel', it: 'Parallelo' },
          ],
          rows: [
            [{ en: 'Resistors', it: 'Resistori' }, '$R_{tot} = \\sum R_i$', '$1/R_{tot} = \\sum 1/R_i$'],
            [{ en: 'Capacitors', it: 'Condensatori' }, '$1/C_{tot} = \\sum 1/C_i$', '$C_{tot} = \\sum C_i$'],
          ],
        },
      ],
    },
    {
      id: 'rc-circuits',
      title: { en: '3.4 RC Circuits', it: '3.4 Circuiti RC' },
      blocks: [
        {
          type: 'paragraph',
          text: {
            en: 'Charging a [[capacitance|capacitor]] C through [[resistance|resistor]] R from EMF ε:',
            it: 'Caricare un [[capacitance|condensatore]] C attraverso una [[resistance|resistenza]] R da fem ε:',
          },
        },
        {
          type: 'formula',
          latex: 'Q(t) = C\\mathcal{E}\\left(1 - e^{-t/\\tau}\\right) \\quad I(t) = \\frac{\\mathcal{E}}{R}e^{-t/\\tau} \\quad \\tau = RC',
        },
        {
          type: 'paragraph',
          text: {
            en: 'Discharging:',
            it: 'Scarica:',
          },
        },
        {
          type: 'formula',
          latex: 'Q(t) = Q_0 e^{-t/\\tau} \\quad I(t) = \\frac{Q_0}{RC} e^{-t/\\tau}',
        },
        {
          type: 'key-formulas',
          items: [
            { name: { en: 'Current', it: 'Corrente' }, latex: 'I = dq/dt' },
            { name: { en: 'Ohm\'s law', it: 'Legge di Ohm' }, latex: 'V = IR' },
            { name: { en: 'Power', it: 'Potenza' }, latex: 'P = IV = I^2R' },
            { name: { en: 'KCL', it: 'KCL' }, latex: '\\sum I_k = 0' },
            { name: { en: 'KVL', it: 'KVL' }, latex: '\\sum V_k = 0' },
            { name: { en: 'RC time constant', it: 'Costante di tempo RC' }, latex: '\\tau = RC' },
          ],
        },
      ],
    },
  ],
};

export function renderCircuits(): string {
  return renderChapter(data);
}

export function initCircuitsDiagrams() {
  wireTermLinks(document.getElementById('chapter-view')!);
}
