import { renderChapter, type ChapterData } from '../../ui/renderer.js';
import { initEMWave } from '../../diagrams/three/EMWave.js';
import { buildLayerToggles } from '../../utils/layers.js';
import { getLang } from '../../utils/lang.js';
import { wireTermLinks } from '../../ui/term-panel.js';

const data: ChapterData = {
  id: '05-maxwell',
  part: { en: 'Part V', it: 'Parte V' },
  title: { en: 'Maxwell\'s Equations & EM Waves', it: 'Equazioni di Maxwell & Onde EM' },
  subtitle: {
    en: 'Four elegant equations unify all of electricity and magnetism — and reveal that light itself is an [[em-wave|electromagnetic wave]].',
    it: 'Quattro eleganti equazioni unificano tutta l\'elettricità e il magnetismo — e rivelano che la luce stessa è un\'[[em-wave|onda elettromagnetica]].',
  },
  prereq: {
    text: {
      en: 'All previous chapters — [[maxwell-equations|Maxwell\'s equations]] synthesize everything we\'ve built so far.',
      it: 'Tutti i capitoli precedenti — le [[maxwell-equations|equazioni di Maxwell]] sintetizzano tutto ciò che abbiamo costruito finora.',
    },
  },
  sections: [
    {
      id: 'displacement-current',
      title: { en: '6.1 Displacement Current', it: '6.1 Corrente di Spostamento' },
      blocks: [
        {
          type: 'paragraph',
          text: {
            en: '[[ampere-law|Ampère\'s Law]] had a flaw: it wasn\'t consistent when applied to a capacitor being charged. Maxwell fixed this by adding the <strong>displacement current</strong> term — even when no real current flows, a changing [[electric-field|electric field]] acts like a current:',
            it: 'La [[ampere-law|legge di Ampère]] aveva un difetto: non era consistente se applicata a un condensatore in carica. Maxwell corresse questo aggiungendo il termine di <strong>corrente di spostamento</strong> — anche quando non scorre corrente reale, un [[electric-field|campo elettrico]] variabile agisce come una corrente:',
          },
        },
        {
          type: 'formula',
          label: { en: 'Displacement current', it: 'Corrente di spostamento' },
          latex: 'I_d = \\varepsilon_0 \\frac{d\\Phi_E}{dt}',
        },
      ],
    },
    {
      id: 'four-equations',
      title: { en: '6.2 Maxwell\'s Four Equations', it: '6.2 Le Quattro Equazioni di Maxwell' },
      blocks: [
        {
          type: 'paragraph',
          text: {
            en: 'With the displacement current, the full set of [[maxwell-equations|Maxwell\'s equations]] is:',
            it: 'Con la corrente di spostamento, il set completo delle [[maxwell-equations|equazioni di Maxwell]] è:',
          },
        },
        {
          type: 'formula',
          label: { en: 'I. Gauss\'s Law (Electric)', it: 'I. Legge di Gauss (Elettrica)' },
          latex: '\\oint \\vec{E} \\cdot d\\vec{A} = \\frac{Q_{\\text{enc}}}{\\varepsilon_0}',
          note: {
            en: '[[electric-field|Electric field]] lines originate from charges.',
            it: 'Le linee di [[electric-field|campo elettrico]] hanno origine dalle cariche.',
          },
        },
        {
          type: 'formula',
          label: { en: 'II. Gauss\'s Law (Magnetic)', it: 'II. Legge di Gauss (Magnetica)' },
          latex: '\\oint \\vec{B} \\cdot d\\vec{A} = 0',
          note: {
            en: 'No magnetic monopoles — [[magnetic-field|field lines]] always close on themselves.',
            it: 'Non esistono monopoli magnetici — le linee di [[magnetic-field|campo]] si chiudono sempre su sé stesse.',
          },
        },
        {
          type: 'formula',
          label: { en: 'III. Faraday\'s Law', it: 'III. Legge di Faraday' },
          latex: '\\oint \\vec{E} \\cdot d\\vec{\\ell} = -\\frac{d\\Phi_B}{dt}',
          note: {
            en: 'A changing [[magnetic-field|B field]] creates a circulating [[electric-field|E field]].',
            it: 'Un [[magnetic-field|campo B]] variabile crea un [[electric-field|campo E]] circolante.',
          },
        },
        {
          type: 'formula',
          label: { en: 'IV. Ampère-Maxwell Law', it: 'IV. Legge di Ampère-Maxwell' },
          latex: '\\oint \\vec{B} \\cdot d\\vec{\\ell} = \\mu_0 I_{\\text{enc}} + \\mu_0\\varepsilon_0 \\frac{d\\Phi_E}{dt}',
          note: {
            en: 'A changing [[electric-field|E field]] or current creates a circulating [[magnetic-field|B field]].',
            it: 'Un [[electric-field|campo E]] variabile o una corrente crea un [[magnetic-field|campo B]] circolante.',
          },
        },
        {
          type: 'callout',
          variant: 'key',
          title: { en: 'The Symmetry', it: 'La Simmetria' },
          text: {
            en: 'Maxwell\'s III and IV show a beautiful symmetry: a changing B creates E, and a changing E creates B. This self-sustaining loop is exactly what an [[em-wave|electromagnetic wave]] is.',
            it: 'Le equazioni III e IV di Maxwell mostrano una bella simmetria: un B variabile crea E, e un E variabile crea B. Questo loop auto-sostenuto è esattamente un\'[[em-wave|onda elettromagnetica]].',
          },
        },
      ],
    },
    {
      id: 'em-waves',
      title: { en: '6.3 Electromagnetic Waves', it: '6.3 Onde Elettromagnetiche' },
      blocks: [
        {
          type: 'paragraph',
          text: {
            en: 'From [[maxwell-equations|Maxwell\'s equations]] in vacuum (no charges, no currents), we can derive wave equations for E and B:',
            it: 'Dalle [[maxwell-equations|equazioni di Maxwell]] nel vuoto (senza cariche, senza correnti), possiamo derivare le equazioni delle onde per E e B:',
          },
        },
        {
          type: 'formula',
          latex: '\\nabla^2 \\vec{E} = \\mu_0\\varepsilon_0 \\frac{\\partial^2 \\vec{E}}{\\partial t^2} \\qquad \\nabla^2 \\vec{B} = \\mu_0\\varepsilon_0 \\frac{\\partial^2 \\vec{B}}{\\partial t^2}',
        },
        {
          type: 'paragraph',
          text: {
            en: 'The wave speed emerges from the equation:',
            it: 'La velocità dell\'onda emerge dall\'equazione:',
          },
        },
        {
          type: 'formula',
          label: { en: 'Speed of light', it: 'Velocità della luce' },
          latex: 'c = \\frac{1}{\\sqrt{\\mu_0 \\varepsilon_0}} = 2.998 \\times 10^8 \\, \\text{m/s}',
        },
        {
          type: 'paragraph',
          text: {
            en: 'Maxwell computed this speed from purely electrical and magnetic constants and recognized it as the speed of light — the first proof that light is an [[em-wave|electromagnetic wave]].',
            it: 'Maxwell calcolò questa velocità da costanti puramente elettriche e magnetiche e la riconobbe come la velocità della luce — la prima prova che la luce è un\'[[em-wave|onda elettromagnetica]].',
          },
        },
        {
          type: 'diagram',
          id: 'emwave',
          title: { en: '3D Electromagnetic Wave', it: 'Onda Elettromagnetica 3D' },
          caption: {
            en: 'E field (red) oscillates in y-direction, B field (blue) in z-direction, both propagating in x. Toggle layers to isolate each field.',
            it: 'Il campo E (rosso) oscilla nella direzione y, il campo B (blu) nella direzione z, entrambi propagantisi in x. Attiva/disattiva i layer per isolare ogni campo.',
          },
          hasLayers: ['E', 'B', 'planes'],
        },
      ],
    },
    {
      id: 'poynting-vector',
      title: { en: '6.4 Poynting Vector & Energy', it: '6.4 Vettore di Poynting & Energia' },
      blocks: [
        {
          type: 'paragraph',
          text: {
            en: 'The energy flux (power per unit area) of an [[em-wave|EM wave]] is given by the [[poynting-vector|Poynting vector]]:',
            it: 'Il flusso di energia (potenza per unità di area) di un\'[[em-wave|onda EM]] è dato dal [[poynting-vector|vettore di Poynting]]:',
          },
        },
        {
          type: 'formula',
          latex: '\\vec{S} = \\frac{1}{\\mu_0} \\vec{E} \\times \\vec{B} \\qquad \\langle S \\rangle = \\frac{E_0 B_0}{2\\mu_0} = \\frac{E_0^2}{2\\mu_0 c}',
        },
        {
          type: 'key-formulas',
          items: [
            { name: { en: 'Gauss E', it: 'Gauss E' }, latex: '\\oint \\vec{E}\\cdot d\\vec{A} = Q/\\varepsilon_0' },
            { name: { en: 'Gauss B', it: 'Gauss B' }, latex: '\\oint \\vec{B}\\cdot d\\vec{A} = 0' },
            { name: { en: 'Faraday', it: 'Faraday' }, latex: '\\oint \\vec{E}\\cdot d\\ell = -d\\Phi_B/dt' },
            { name: { en: 'Ampère-Maxwell', it: 'Ampère-Maxwell' }, latex: '\\oint \\vec{B}\\cdot d\\ell = \\mu_0 I + \\mu_0\\varepsilon_0\\,d\\Phi_E/dt' },
            { name: { en: 'Speed of light', it: 'Velocità della luce' }, latex: 'c = 1/\\sqrt{\\mu_0\\varepsilon_0}' },
            { name: { en: 'Poynting vector', it: 'Vettore di Poynting' }, latex: '\\vec{S} = \\vec{E}\\times\\vec{B}/\\mu_0' },
          ],
        },
      ],
    },
  ],
};

export function renderMaxwell(): string {
  return renderChapter(data);
}

export function initMaxwellDiagrams() {
  const wrapper = document.getElementById('emwave-wrapper');
  const layerEl = document.getElementById('emwave-layers');
  if (!wrapper || !layerEl) return;

  let ctrl: ReturnType<typeof initEMWave> | null = null;
  try {
    ctrl = initEMWave(wrapper);
  } catch {
    wrapper.innerHTML = `<div class="webgl-fallback">WebGL required for 3D wave visualization.</div>`;
    return;
  }

  buildLayerToggles(layerEl, [
    { id: 'E', labelEn: 'E field', labelIt: 'Campo E', defaultOn: true },
    { id: 'B', labelEn: 'B field', labelIt: 'Campo B', defaultOn: true },
    { id: 'planes', labelEn: 'Planes', labelIt: 'Piani', defaultOn: false },
  ], (id, active) => {
    if (!ctrl) return;
    if (id === 'E') ctrl.setShowE(active);
    if (id === 'B') ctrl.setShowB(active);
    if (id === 'planes') ctrl.setShowPlanes(active);
  }, getLang);
  wireTermLinks(document.getElementById('chapter-view')!);
}
