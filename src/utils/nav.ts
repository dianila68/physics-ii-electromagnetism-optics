import { getLang } from './lang.js';

export interface ChapterMeta {
  id: string;
  part: string;
  partIt: string;
  titleEn: string;
  titleIt: string;
  subtitleEn: string;
  subtitleIt: string;
}

export const CHAPTERS: ChapterMeta[] = [
  {
    id: 'home',
    part: '', partIt: '',
    titleEn: 'Home', titleIt: 'Home',
    subtitleEn: '', subtitleIt: '',
  },
  {
    id: '00-matter',
    part: 'Part 0', partIt: 'Parte 0',
    titleEn: 'Matter & Charge',
    titleIt: 'Materia & Carica',
    subtitleEn: 'From quarks to atoms — the origin of electric charge',
    subtitleIt: 'Dai quark agli atomi — l\'origine della carica elettrica',
  },
  {
    id: '01-electrostatics',
    part: 'Part I', partIt: 'Parte I',
    titleEn: 'Electrostatics',
    titleIt: 'Elettrostatica',
    subtitleEn: 'Coulomb\'s law, electric fields, Gauss\'s law, and electric potential',
    subtitleIt: 'Legge di Coulomb, campi elettrici, legge di Gauss e potenziale elettrico',
  },
  {
    id: '02-circuits',
    part: 'Part II', partIt: 'Parte II',
    titleEn: 'Electric Current & DC Circuits',
    titleIt: 'Corrente Elettrica & Circuiti DC',
    subtitleEn: 'Current, resistance, Kirchhoff\'s laws, and RC circuits',
    subtitleIt: 'Corrente, resistenza, leggi di Kirchhoff e circuiti RC',
  },
  {
    id: '03-magnetism',
    part: 'Part III', partIt: 'Parte III',
    titleEn: 'Magnetism',
    titleIt: 'Magnetismo',
    subtitleEn: 'Lorentz force, Biot-Savart law, and Ampère\'s law',
    subtitleIt: 'Forza di Lorentz, legge di Biot-Savart e legge di Ampère',
  },
  {
    id: '04-induction',
    part: 'Part IV', partIt: 'Parte IV',
    titleEn: 'Electromagnetic Induction',
    titleIt: 'Induzione Elettromagnetica',
    subtitleEn: 'Faraday\'s law, Lenz\'s law, inductance, and LC circuits',
    subtitleIt: 'Legge di Faraday, legge di Lenz, induttanza e circuiti LC',
  },
  {
    id: '05-maxwell',
    part: 'Part V', partIt: 'Parte V',
    titleEn: 'Maxwell\'s Equations & EM Waves',
    titleIt: 'Equazioni di Maxwell & Onde EM',
    subtitleEn: 'Displacement current, Maxwell\'s equations, and electromagnetic waves',
    subtitleIt: 'Corrente di spostamento, equazioni di Maxwell e onde elettromagnetiche',
  },
  {
    id: '06-geo-optics',
    part: 'Part VI', partIt: 'Parte VI',
    titleEn: 'Geometrical Optics',
    titleIt: 'Ottica Geometrica',
    subtitleEn: 'Reflection, refraction, Snell\'s law, lenses and mirrors',
    subtitleIt: 'Riflessione, rifrazione, legge di Snell, lenti e specchi',
  },
  {
    id: '07-wave-optics',
    part: 'Part VII', partIt: 'Parte VII',
    titleEn: 'Wave Optics',
    titleIt: 'Ottica Ondulatoria',
    subtitleEn: 'Huygens\' principle, interference, diffraction, and polarization',
    subtitleIt: 'Principio di Huygens, interferenza, diffrazione e polarizzazione',
  },
  {
    id: 'lab',
    part: 'Lab', partIt: 'Laboratorio',
    titleEn: 'Physics Sandbox',
    titleIt: 'Sandbox di Fisica',
    subtitleEn: 'Interactive multi-scale physics editor with a pluggable engine',
    subtitleIt: 'Editor di fisica multi-scala interattivo con motore sostituibile',
  },
];

export function buildTOC() {
  const toc = document.getElementById('toc')!;
  toc.innerHTML = '';
  const lang = getLang();

  let currentPart = '';
  CHAPTERS.forEach(ch => {
    if (ch.id === 'home') return;
    if (ch.part !== currentPart) {
      currentPart = ch.part;
      const li = document.createElement('li');
      li.className = 'toc-part';
      li.textContent = lang === 'en' ? ch.part : ch.partIt;
      toc.appendChild(li);
    }
    const li = document.createElement('li');
    li.className = 'toc-chapter';
    const a = document.createElement('a');
    a.href = `#${ch.id}`;
    a.textContent = lang === 'en' ? ch.titleEn : ch.titleIt;
    a.addEventListener('click', e => {
      e.preventDefault();
      navigate(ch.id);
    });
    li.appendChild(a);
    toc.appendChild(li);
  });
}

let _navigate: ((id: string) => void) | null = null;

export function registerNavigate(fn: (id: string) => void) {
  _navigate = fn;
}

export function navigate(id: string) {
  if (_navigate) _navigate(id);
}

export function updateActiveLink(id: string) {
  document.querySelectorAll('#toc a').forEach(a => {
    a.classList.toggle('active', (a as HTMLAnchorElement).href.endsWith(`#${id}`));
  });
}
