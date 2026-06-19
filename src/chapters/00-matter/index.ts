import { renderChapter, type ChapterData } from '../../ui/renderer.js';
import { wireTermLinks } from '../../ui/term-panel.js';
import { initAtomicModel } from '../../diagrams/three/AtomicModel.js';

const data: ChapterData = {
  id: '00-matter',
  part: { en: 'Part 0 — Foundation', it: 'Parte 0 — Fondamenta' },
  title: { en: 'Matter & Charge', it: 'Materia & Carica' },
  subtitle: {
    en: 'From quarks deep inside the nucleus to the macroscopic behavior of conductors — everything begins here.',
    it: 'Dai quark nel nucleo fino al comportamento macroscopico dei conduttori — tutto inizia qui.',
  },
  prereq: {
    text: {
      en: 'This is the first chapter. No prior physics required — we build everything from scratch.',
      it: 'Questo è il primo capitolo. Non è richiesta fisica precedente — costruiamo tutto da zero.',
    },
  },
  sections: [
    {
      id: 'matter-structure',
      title: { en: '1.1 The Structure of Matter', it: '1.1 La Struttura della Materia' },
      blocks: [
        {
          type: 'paragraph',
          text: {
            en: 'All matter is made of [[electron|atoms]]. An atom consists of a dense central nucleus surrounded by a cloud of [[electron|electrons]]. The nucleus itself is built from [[proton|protons]] and [[neutron|neutrons]], which are in turn composed of even smaller particles called [[quark|quarks]], bound together by [[gluon|gluons]].',
            it: 'Tutta la materia è composta di atomi. Un atomo consiste in un denso nucleo centrale circondato da una nuvola di [[electron|elettroni]]. Il nucleo è costruito da [[proton|protoni]] e [[neutron|neutroni]], a loro volta composti da [[quark|quark]], legati dai [[gluon|gluoni]].',
          },
        },
        {
          type: 'diagram',
          id: 'atom',
          title: { en: 'Interactive Atomic Model', it: 'Modello Atomico Interattivo' },
          caption: {
            en: 'Click to zoom: Atom → Nucleus → Quarks. Drag to rotate.',
            it: 'Clicca per ingrandire: Atomo → Nucleo → Quark. Trascina per ruotare.',
          },
        },
        {
          type: 'table',
          headers: [
            { en: 'Particle', it: 'Particella' },
            { en: 'Symbol', it: 'Simbolo' },
            { en: 'Charge', it: 'Carica' },
            { en: 'Mass', it: 'Massa' },
            { en: 'Location', it: 'Posizione' },
          ],
          rows: [
            [{ en: '[[proton|Proton]]', it: '[[proton|Protone]]' }, 'p', '+e', '938 MeV/c²', { en: 'Nucleus', it: 'Nucleo' }],
            [{ en: '[[neutron|Neutron]]', it: '[[neutron|Neutrone]]' }, 'n', '0', '939 MeV/c²', { en: 'Nucleus', it: 'Nucleo' }],
            [{ en: '[[electron|Electron]]', it: '[[electron|Elettrone]]' }, 'e⁻', '−e', '0.511 MeV/c²', { en: 'Shells', it: 'Gusci' }],
            [{ en: '[[quark|Up quark]]', it: '[[quark|Quark up]]' }, 'u', '+2/3 e', '2.2 MeV/c²', { en: 'In nucleon', it: 'Nel nucleone' }],
            [{ en: '[[quark|Down quark]]', it: '[[quark|Quark down]]' }, 'd', '−1/3 e', '4.7 MeV/c²', { en: 'In nucleon', it: 'Nel nucleone' }],
          ],
        },
        {
          type: 'callout',
          variant: 'note',
          title: { en: 'Quark composition', it: 'Composizione dei quark' },
          text: {
            en: 'A [[proton|proton]] is made of 2 up [[quark|quarks]] + 1 down quark: charge = 2(+2/3) + (−1/3) = +1.<br>A [[neutron|neutron]] is made of 1 up quark + 2 down quarks: charge = (+2/3) + 2(−1/3) = 0.',
            it: 'Un [[proton|protone]] è composto da 2 [[quark|quark]] up + 1 quark down: carica = 2(+2/3) + (−1/3) = +1.<br>Un [[neutron|neutrone]] è composto da 1 quark up + 2 quark down: carica = (+2/3) + 2(−1/3) = 0.',
          },
        },
      ],
    },
    {
      id: 'electric-charge',
      title: { en: '1.2 Electric Charge', it: '1.2 La Carica Elettrica' },
      blocks: [
        {
          type: 'paragraph',
          text: {
            en: '[[electric-charge|Electric charge]] is a fundamental property of matter, just like mass. It comes in two types: positive and negative. Like charges repel; unlike charges attract.',
            it: 'La [[electric-charge|carica elettrica]] è una proprietà fondamentale della materia, proprio come la massa. Esiste in due tipi: positiva e negativa. Cariche uguali si respingono; cariche opposte si attraggono.',
          },
        },
        {
          type: 'formula',
          label: { en: 'Charge quantization', it: 'Quantizzazione della carica' },
          latex: 'q = n e \\qquad n \\in \\mathbb{Z}',
          note: {
            en: 'where e = 1.602 × 10⁻¹⁹ C is the [[electron|elementary charge]].',
            it: 'dove e = 1.602 × 10⁻¹⁹ C è la [[electric-charge|carica elementare]].',
          },
        },
        {
          type: 'formula',
          label: { en: 'Conservation of charge', it: 'Conservazione della carica' },
          latex: '\\sum_i q_i = \\text{const}',
          note: {
            en: 'The total charge of any isolated system never changes.',
            it: 'La carica totale di qualsiasi sistema isolato non cambia mai.',
          },
        },
      ],
    },
    {
      id: 'conductors',
      title: { en: '1.3 Conductors, Insulators & Semiconductors', it: '1.3 Conduttori, Isolanti & Semiconduttori' },
      blocks: [
        {
          type: 'paragraph',
          text: {
            en: 'Materials respond to [[electric-field|electric fields]] differently depending on how freely [[electron|electrons]] can move:',
            it: 'I materiali rispondono ai [[electric-field|campi elettrici]] in modo diverso a seconda di quanto liberamente gli [[electron|elettroni]] possono muoversi:',
          },
        },
        {
          type: 'table',
          headers: [
            { en: 'Material', it: 'Materiale' },
            { en: 'Free electrons', it: 'Elettroni liberi' },
            { en: 'Resistivity (Ω·m)', it: 'Resistività (Ω·m)' },
            { en: 'Examples', it: 'Esempi' },
          ],
          rows: [
            [{ en: '[[conductor|Conductor]]', it: '[[conductor|Conduttore]]' }, { en: 'Many', it: 'Molti' }, '~10⁻⁸', 'Cu, Ag, Au'],
            ['Semiconductor', { en: 'Few, controllable', it: 'Pochi, controllabili' }, '10⁻³ – 10³', 'Si, Ge'],
            ['Insulator / [[dielectric|Insulator]]', { en: 'Essentially none', it: 'Essenzialmente nessuno' }, '~10¹⁵', { en: 'Rubber, glass', it: 'Gomma, vetro' }],
          ],
        },
        {
          type: 'paragraph',
          text: {
            en: 'An [[electric-dipole|electric dipole]] forms when positive and negative charges separate slightly inside a neutral material exposed to an external field. The dipole moment is $\\vec{p} = q\\vec{d}$.',
            it: 'Un [[electric-dipole|dipolo elettrico]] si forma quando cariche positive e negative si separano leggermente all\'interno di un materiale neutro esposto a un campo esterno. Il momento di dipolo è $\\vec{p} = q\\vec{d}$.',
          },
        },
        {
          type: 'key-formulas',
          items: [
            { name: { en: 'Elementary charge', it: 'Carica elementare' }, latex: 'e = 1.602 \\times 10^{-19}\\,\\text{C}' },
            { name: { en: 'Charge quantization', it: 'Quantizzazione' }, latex: 'q = ne' },
            { name: { en: 'Dipole moment', it: 'Momento di dipolo' }, latex: '\\vec{p} = q\\vec{d}' },
          ],
        },
      ],
    },
  ],
};

export function renderMatter(): string {
  return renderChapter(data);
}

export function initMatterDiagrams() {
  const wrapper = document.getElementById('atom-wrapper');
  if (!wrapper) return;
  try {
    initAtomicModel(wrapper);
  } catch {
    wrapper.innerHTML = `<div class="webgl-fallback">WebGL not available — 3D model requires a modern browser.</div>`;
  }
  wireTermLinks(document.getElementById('chapter-view')!);
}
