/**
 * Narrative scaffolding for the book's learning arc.
 *
 * Implements the two patterns from docs/pedagogy.md:
 *  - OPENERS: a per-chapter motivation hook (stake → lens → gap, ending on a
 *    question). Rendered as a `motivation` callout at the top of the chapter.
 *  - BRIDGES: a per-chapter curiosity cliffhanger (restate the result → push
 *    past its assumptions → show the break → point through the door to the next
 *    chapter, via a [[chapter:...]] crossref). Rendered as a `bridge` callout
 *    at the end of the chapter.
 *
 * Keyed by chapter id (see src/utils/nav.ts). Bilingual EN/IT. The next
 * chapter's opener back-references the same tension named in the previous
 * bridge, so the seam reinforces itself and doubles as spaced retrieval.
 */

import type { BiText } from '../ui/renderer.js';

export interface Narrative {
  title: BiText;
  text: BiText;
}

export const OPENERS: Record<string, Narrative> = {
  '00-matter': {
    title: { en: 'Why start here?', it: 'Perché partire da qui?' },
    text: {
      en: 'Every wire, field and signal in this book rests on one thing: [[electric-charge|electric charge]]. Physics works by hunting for the smallest invariant building blocks, so before we move charge around we ask what it even *is*. Why does charge come in indivisible lumps, carried by the [[electron]] and the [[proton]], and where does it live inside matter?',
      it: 'Ogni filo, campo e segnale di questo libro poggia su una cosa: la [[electric-charge|carica elettrica]]. La fisica procede cercando i più piccoli mattoni invarianti, quindi prima di spostare la carica chiediamoci cosa *sia*. Perché la carica esiste solo in grumi indivisibili, portati dall\'[[electron|elettrone]] e dal [[proton|protone]], e dove risiede dentro la materia?',
    },
  },
  '01-electrostatics': {
    title: { en: 'Why this chapter?', it: 'Perché questo capitolo?' },
    text: {
      en: 'Control the force between charges and you can hold matter together and build technology. But cataloguing every pair with [[coulombs-law|Coulomb\'s law]] is hopeless — the physicist\'s move is to find one object that carries the force everywhere: the [[electric-field|field]]. How does one charge "know" another is there across empty space?',
      it: 'Controlla la forza tra le cariche e potrai tenere insieme la materia e costruire tecnologia. Ma catalogare ogni coppia con la [[coulombs-law|legge di Coulomb]] è impossibile: la mossa del fisico è trovare un oggetto che trasporti la forza ovunque — il [[electric-field|campo]]. Come fa una carica a "sapere" che un\'altra è presente attraverso lo spazio vuoto?',
    },
  },
  '02-circuits': {
    title: { en: 'Why this chapter?', it: 'Perché questo capitolo?' },
    text: {
      en: 'Every device you use runs on a sustained [[electric-current|flow of charge]], not on static charge sitting still. So we shift our question from equilibrium to flow. A charged [[conductor]] settles until the field inside vanishes — so what keeps charge moving in a steady, unending stream, and what holds it back?',
      it: 'Ogni dispositivo che usi funziona grazie a un [[electric-current|flusso continuo di carica]], non a carica statica ferma. Spostiamo quindi la domanda dall\'equilibrio al flusso. Un [[conductor|conduttore]] carico si assesta finché il campo interno svanisce — cosa mantiene allora la carica in un flusso costante e ininterrotto, e cosa la frena?',
    },
  },
  '03-magnetism': {
    title: { en: 'Why this chapter?', it: 'Perché questo capitolo?' },
    text: {
      en: 'Motors, generators and data storage all live here. The guiding question is one of symmetry: what changes when charge starts to move? Hold a compass near a [[electric-current|current]]-carrying wire and the needle swings. Why do *moving* charges create — and feel — a [[magnetic-field|magnetic force]] that [[chapter:01-electrostatics|electrostatics]] never predicted?',
      it: 'Motori, generatori e memorie vivono qui. La domanda guida è di simmetria: cosa cambia quando la carica si muove? Avvicina una bussola a un filo percorso da [[electric-current|corrente]] e l\'ago ruota. Perché le cariche *in moto* creano — e sentono — una [[magnetic-field|forza magnetica]] che l\'[[chapter:01-electrostatics|elettrostatica]] non prevedeva?',
    },
  },
  '04-induction': {
    title: { en: 'Why this chapter?', it: 'Perché questo capitolo?' },
    text: {
      en: 'This is how nearly all our electricity is generated. The lead is symmetry again: if currents make [[magnetic-field|magnetism]], can magnetism make currents? Hold a charge perfectly still and move a magnet past it instead — a current appears, yet the velocity is zero, so the [[lorentz-force]] cannot be the cause. What drives it?',
      it: 'È così che si genera quasi tutta la nostra elettricità. Il filo conduttore è di nuovo la simmetria: se le correnti creano [[magnetic-field|magnetismo]], il magnetismo può creare correnti? Tieni una carica perfettamente ferma e muovi invece un magnete — appare una corrente, eppure la velocità è zero, perciò la [[lorentz-force|forza di Lorentz]] non può esserne la causa. Cosa la produce?',
    },
  },
  '05-maxwell': {
    title: { en: 'Why this chapter?', it: 'Perché questo capitolo?' },
    text: {
      en: 'Here four separate laws snap together into the [[maxwell-equations|Maxwell equations]] and, astonishingly, predict light itself. The lever is pure consistency: the equations must not contradict each other. Apply [[ampere-law|Ampère\'s law]] to a charging capacitor and it gives two different answers. What is missing?',
      it: 'Qui quattro leggi separate si incastrano nelle [[maxwell-equations|equazioni di Maxwell]] e, sorprendentemente, predicono la luce stessa. La leva è la pura coerenza: le equazioni non devono contraddirsi. Applica la [[ampere-law|legge di Ampère]] a un condensatore in carica e otterrai due risposte diverse. Cosa manca?',
    },
  },
  '06-geo-optics': {
    title: { en: 'Why this chapter?', it: 'Perché questo capitolo?' },
    text: {
      en: 'Lenses, eyes, cameras and optical fibre all obey the rules here. When the wavelength is tiny compared to the obstacles, we can forget the wave and simply follow rays. The [[chapter:05-maxwell|Maxwell equations]] in vacuum give a self-sustaining [[em-wave|electromagnetic wave]] at speed $c$ — if light is that wave, how does it travel, bend and bounce?',
      it: 'Lenti, occhi, fotocamere e fibre ottiche obbediscono alle regole di qui. Quando la lunghezza d\'onda è minuscola rispetto agli ostacoli, possiamo dimenticare l\'onda e seguire semplicemente i raggi. Le [[chapter:05-maxwell|equazioni di Maxwell]] nel vuoto danno un\'[[em-wave|onda elettromagnetica]] autosostenuta alla velocità $c$ — se la luce è quell\'onda, come viaggia, si piega e rimbalza?',
    },
  },
  '07-wave-optics': {
    title: { en: 'Why this chapter?', it: 'Perché questo capitolo?' },
    text: {
      en: 'This is why we can measure atoms with light and why every lens and screen has a sharpness limit. We drop the ray approximation and treat light as the [[em-wave|wave]] it truly is. Narrow a slit until rays predict a crisp shadow — but the edges shimmer with bright and dark [[interference|fringes]]. Why?',
      it: 'È per questo che possiamo misurare gli atomi con la luce e perché ogni lente e schermo ha un limite di nitidezza. Abbandoniamo l\'approssimazione dei raggi e trattiamo la luce come l\'[[em-wave|onda]] che è davvero. Restringi una fenditura finché i raggi prevedono un\'ombra netta — ma i bordi brillano di [[interference|frange]] chiare e scure. Perché?',
    },
  },
};

export const BRIDGES: Record<string, Narrative> = {
  '00-matter': {
    title: { en: 'Where this breaks →', it: 'Dove si rompe →' },
    text: {
      en: 'We have found charge, and that like charges repel. Now place two charges far apart in empty space — nothing connects them, nothing touches. Yet each still pushes on the other. How can a force cross a vacuum? [[chapter:01-electrostatics|Electrostatics]] answers by filling that empty space with a field.',
      it: 'Abbiamo trovato la carica, e che cariche uguali si respingono. Ora metti due cariche lontane nello spazio vuoto — nulla le connette, nulla si tocca. Eppure ciascuna spinge sull\'altra. Come può una forza attraversare il vuoto? L\'[[chapter:01-electrostatics|Elettrostatica]] risponde riempiendo quel vuoto con un campo.',
    },
  },
  '01-electrostatics': {
    title: { en: 'Where this breaks →', it: 'Dove si rompe →' },
    text: {
      en: 'The field gives the force everywhere, and inside a conductor charges rearrange until the field vanishes — equilibrium. But keep supplying charge instead of letting it settle, and it flows without end. Statics cannot describe a steady river of charge. [[chapter:02-circuits|Circuits]] introduces EMF, current and resistance.',
      it: 'Il campo dà la forza ovunque, e dentro un conduttore le cariche si riorganizzano finché il campo svanisce — equilibrio. Ma continua a fornire carica invece di lasciarla assestare, e scorrerà senza fine. La statica non può descrivere un fiume costante di carica. I [[chapter:02-circuits|Circuiti]] introducono f.e.m., corrente e resistenza.',
    },
  },
  '02-circuits': {
    title: { en: 'Where this breaks →', it: 'Dove si rompe →' },
    text: {
      en: 'Steady currents obey Ohm\'s and Kirchhoff\'s laws cleanly. Now bring a compass near the wire: the needle swings. A current exerts a force electrostatics never predicted — and a charge set moving feels it too. [[chapter:03-magnetism|Magnetism]] is the physics of moving charge.',
      it: 'Le correnti stazionarie obbediscono in modo pulito alle leggi di Ohm e Kirchhoff. Ora avvicina una bussola al filo: l\'ago ruota. Una corrente esercita una forza che l\'elettrostatica non prevedeva — e anche una carica in moto la sente. Il [[chapter:03-magnetism|Magnetismo]] è la fisica della carica in movimento.',
    },
  },
  '03-magnetism': {
    title: { en: 'Where this breaks →', it: 'Dove si rompe →' },
    text: {
      en: 'Moving charges make and feel a magnetic force through $\\vec{F}=q\\vec{v}\\times\\vec{B}$. Now hold the charge perfectly still and move the *magnet* instead. A current still appears — but with $v=0$, the term $q\\vec{v}\\times\\vec{B}$ is zero. Something else must drive it. [[chapter:04-induction|Induction]] reveals the changing flux.',
      it: 'Le cariche in moto creano e sentono una forza magnetica tramite $\\vec{F}=q\\vec{v}\\times\\vec{B}$. Ora tieni la carica perfettamente ferma e muovi invece il *magnete*. Appare comunque una corrente — ma con $v=0$ il termine $q\\vec{v}\\times\\vec{B}$ è nullo. Qualcos\'altro deve produrla. L\'[[chapter:04-induction|Induzione]] svela il flusso che varia.',
    },
  },
  '04-induction': {
    title: { en: 'Where this breaks →', it: 'Dove si rompe →' },
    text: {
      en: 'A changing magnetic flux induces an EMF — beautifully symmetric with magnetism. Now apply Ampère\'s law to a charging capacitor, across the gap where no charge flows: the law gives two different answers depending on the surface you choose. It is inconsistent. [[chapter:05-maxwell|Maxwell\'s equations]] repair it with the displacement current.',
      it: 'Un flusso magnetico variabile induce una f.e.m. — splendidamente simmetrica al magnetismo. Ora applica la legge di Ampère a un condensatore in carica, attraverso lo spazio dove non scorre carica: la legge dà due risposte diverse secondo la superficie scelta. È incoerente. Le [[chapter:05-maxwell|equazioni di Maxwell]] la riparano con la corrente di spostamento.',
    },
  },
  '05-maxwell': {
    title: { en: 'Where this breaks → (open the door)', it: 'Dove si rompe → (apri la porta)' },
    text: {
      en: 'Completed and consistent, the four equations look finished. Now solve them in empty space, far from any charge. They force a self-sustaining ripple of $\\vec{E}$ and $\\vec{B}$ travelling at $c = 1/\\sqrt{\\varepsilon_0\\mu_0}$ — exactly the measured speed of light. Light *is* electromagnetism. [[chapter:06-geo-optics|Geometrical optics]] follows it as rays.',
      it: 'Complete e coerenti, le quattro equazioni sembrano finite. Ora risolvile nello spazio vuoto, lontano da ogni carica. Impongono un\'increspatura autosostenuta di $\\vec{E}$ e $\\vec{B}$ che viaggia a $c = 1/\\sqrt{\\varepsilon_0\\mu_0}$ — esattamente la velocità misurata della luce. La luce *è* elettromagnetismo. L\'[[chapter:06-geo-optics|Ottica geometrica]] la segue come raggi.',
    },
  },
  '06-geo-optics': {
    title: { en: 'Where this breaks →', it: 'Dove si rompe →' },
    text: {
      en: 'Treating light as straight rays explains lenses, mirrors and images perfectly. Now shrink an aperture down toward the wavelength of light. Rays predict an ever-sharper shadow — but the real pattern spreads into alternating bright and dark fringes. Rays are not enough. [[chapter:07-wave-optics|Wave optics]] brings interference and diffraction.',
      it: 'Trattare la luce come raggi rettilinei spiega perfettamente lenti, specchi e immagini. Ora restringi un\'apertura fin verso la lunghezza d\'onda della luce. I raggi prevedono un\'ombra sempre più netta — ma il pattern reale si allarga in frange chiare e scure alternate. I raggi non bastano. L\'[[chapter:07-wave-optics|Ottica ondulatoria]] porta interferenza e diffrazione.',
    },
  },
  '07-wave-optics': {
    title: { en: 'Where this breaks → (beyond this book)', it: 'Dove si rompe → (oltre questo libro)' },
    text: {
      en: 'Superposition of waves explains every fringe and diffraction pattern we have seen. Now dim the source until just one photon crosses the apparatus at a time. The fringes still build up, dot by dot — a wave that arrives in indivisible lumps, each landing somewhere only probability can foretell. That paradox is the doorway to quantum mechanics.',
      it: 'La sovrapposizione delle onde spiega ogni frangia e figura di diffrazione che abbiamo visto. Ora attenua la sorgente finché un solo fotone alla volta attraversa l\'apparato. Le frange si formano comunque, punto per punto — un\'onda che arriva in grumi indivisibili, ciascuno depositato dove solo la probabilità può predire. Quel paradosso è la porta verso la meccanica quantistica.',
    },
  },
};
