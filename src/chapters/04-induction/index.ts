import { renderChapter, type ChapterData } from '../../ui/renderer.js';
import { initFaradayLoop } from '../../diagrams/canvas/FaradayLoop.js';
import { wireTermLinks } from '../../ui/term-panel.js';

const data: ChapterData = {
  id: '04-induction',
  part: { en: 'Part IV', it: 'Parte IV' },
  title: { en: 'Electromagnetic Induction', it: 'Induzione Elettromagnetica' },
  subtitle: {
    en: 'A changing [[magnetic-field|magnetic flux]] induces an EMF — the key discovery that makes generators, transformers, and wireless charging possible.',
    it: 'Un [[magnetic-field|flusso magnetico]] variabile induce una forza elettromotrice — la scoperta chiave che rende possibili generatori, trasformatori e ricarica wireless.',
  },
  prereq: {
    text: {
      en: 'Chapter 3: Magnetism — magnetic flux Φ = B·A·cosθ.',
      it: 'Capitolo 3: Magnetismo — flusso magnetico Φ = B·A·cosθ.',
    },
    links: [{ id: '03-magnetism', label: { en: 'Chapter 3: Magnetism', it: 'Capitolo 3: Magnetismo' } }],
  },
  sections: [
    {
      id: 'faraday-law',
      title: { en: '5.1 Faraday\'s Law', it: '5.1 Legge di Faraday' },
      blocks: [
        {
          type: 'paragraph',
          text: {
            en: 'Michael Faraday (1831) discovered that a changing [[magnetic-field|magnetic flux]] through a circuit loop induces an electromotive force (EMF):',
            it: 'Michael Faraday (1831) scoprì che un [[magnetic-field|flusso magnetico]] variabile attraverso una spira induce una forza elettromotrice (fem):',
          },
        },
        {
          type: 'formula',
          label: { en: 'Faraday\'s Law', it: 'Legge di Faraday' },
          latex: '\\mathcal{E} = -\\frac{d\\Phi_B}{dt} \\qquad \\Phi_B = \\int_S \\vec{B} \\cdot d\\vec{A}',
          note: {
            en: 'For N turns: ε = −N dΦ/dt. The minus sign is [[lenz-law|Lenz\'s Law]].',
            it: 'Per N spire: ε = −N dΦ/dt. Il segno meno è la [[lenz-law|legge di Lenz]].',
          },
        },
      ],
    },
    {
      id: 'lenz-law',
      title: { en: '5.2 Lenz\'s Law', it: '5.2 Legge di Lenz' },
      blocks: [
        {
          type: 'paragraph',
          text: {
            en: 'The induced EMF has a direction such that the induced current creates a [[magnetic-field|magnetic field]] that opposes the change in flux that caused it. This is a consequence of energy conservation.',
            it: 'La fem indotta ha una direzione tale che la corrente indotta crea un [[magnetic-field|campo magnetico]] che si oppone alla variazione di flusso che l\'ha causata. Questa è una conseguenza della conservazione dell\'energia.',
          },
        },
        {
          type: 'callout',
          variant: 'key',
          title: { en: 'Lenz\'s Law in words', it: 'Legge di Lenz in parole' },
          text: {
            en: 'Nature opposes change. If the flux through a loop increases, the induced current creates B opposing that increase. If flux decreases, the induced B tries to maintain it.',
            it: 'La natura si oppone al cambiamento. Se il flusso attraverso una spira aumenta, la corrente indotta crea B che si oppone a quell\'aumento. Se il flusso diminuisce, il B indotto cerca di mantenerlo.',
          },
        },
        {
          type: 'diagram',
          id: 'faraday',
          title: { en: 'Faraday Induction — Move the Magnet', it: 'Induzione di Faraday — Muovi il Magnete' },
          caption: {
            en: 'Drag the magnet left and right. Watch the induced EMF and current direction change.',
            it: 'Trascina il magnete a sinistra e a destra. Osserva come cambiano la fem indotta e la direzione della corrente.',
          },
        },
      ],
    },
    {
      id: 'self-inductance',
      title: { en: '5.3 Self-Inductance', it: '5.3 Autoinduzione' },
      blocks: [
        {
          type: 'paragraph',
          text: {
            en: 'A coil\'s own changing current induces an EMF in itself. The [[inductance|self-inductance]] L quantifies this:',
            it: 'La corrente variabile di una bobina induce una fem in sé stessa. L\'[[inductance|autoinduzione]] L quantifica questo:',
          },
        },
        {
          type: 'formula',
          latex: '\\mathcal{E}_L = -L \\frac{dI}{dt} \\qquad L = \\frac{N\\Phi_B}{I}',
          note: {
            en: 'For a solenoid: L = μ₀n²Vₛ where Vₛ is the solenoid volume.',
            it: 'Per un solenoide: L = μ₀n²Vₛ dove Vₛ è il volume del solenoide.',
          },
        },
        {
          type: 'paragraph',
          text: {
            en: 'Energy stored in an [[inductance|inductor]]:',
            it: 'Energia immagazzinata in un [[inductance|induttore]]:',
          },
        },
        {
          type: 'formula',
          latex: 'U_L = \\frac{1}{2}LI^2',
        },
      ],
    },
    {
      id: 'rl-lc-circuits',
      title: { en: '5.4 RL and LC Circuits', it: '5.4 Circuiti RL e LC' },
      blocks: [
        {
          type: 'paragraph',
          text: {
            en: 'In an RL circuit, current grows or decays exponentially:',
            it: 'In un circuito RL, la corrente cresce o decade esponenzialmente:',
          },
        },
        {
          type: 'formula',
          latex: 'I(t) = I_0\\left(1 - e^{-t/\\tau_L}\\right) \\quad \\tau_L = \\frac{L}{R} \\quad \\text{(charging)}',
        },
        {
          type: 'paragraph',
          text: {
            en: 'In an LC circuit, charge oscillates at the natural frequency:',
            it: 'In un circuito LC, la carica oscilla alla frequenza naturale:',
          },
        },
        {
          type: 'formula',
          latex: '\\omega_0 = \\frac{1}{\\sqrt{LC}} \\qquad Q(t) = Q_0 \\cos(\\omega_0 t + \\phi)',
        },
        {
          type: 'key-formulas',
          items: [
            { name: { en: 'Faraday\'s law', it: 'Legge di Faraday' }, latex: '\\mathcal{E} = -N\\,d\\Phi_B/dt' },
            { name: { en: 'Self-inductance', it: 'Autoinduzione' }, latex: '\\mathcal{E}_L = -L\\,dI/dt' },
            { name: { en: 'Inductor energy', it: 'Energia induttore' }, latex: 'U_L = \\frac{1}{2}LI^2' },
            { name: { en: 'LC frequency', it: 'Frequenza LC' }, latex: '\\omega_0 = 1/\\sqrt{LC}' },
          ],
        },
      ],
    },
  ],
};

export function renderInduction(): string {
  return renderChapter(data);
}

export function initInductionDiagrams() {
  const wrapper = document.getElementById('faraday-wrapper');
  if (!wrapper) return;
  const canvas = document.createElement('canvas');
  wrapper.style.height = '380px';
  wrapper.appendChild(canvas);
  canvas.width = wrapper.clientWidth;
  canvas.height = 380;
  initFaradayLoop(canvas);
  wireTermLinks(document.getElementById('chapter-view')!);
}
