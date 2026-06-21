import './styles/themes.css';
import './styles/book.css';
import './styles/components.css';
import './styles/term-panel.css';

import { getLang, setLang, toggleLang, applyLang } from './utils/lang.js';
import { initTermPanel, wireTermLinks } from './ui/term-panel.js';
import { buildTOC, registerNavigate, updateActiveLink, CHAPTERS } from './utils/nav.js';

import { renderHome, initHomeDiagrams } from './chapters/home.js';
import { renderMatter, initMatterDiagrams } from './chapters/00-matter/index.js';
import { renderElectrostatics, initElectrostaticsDiagrams } from './chapters/01-electrostatics/index.js';
import { renderCircuits, initCircuitsDiagrams } from './chapters/02-circuits/index.js';
import { renderMagnetism, initMagnetismDiagrams } from './chapters/03-magnetism/index.js';
import { renderInduction, initInductionDiagrams } from './chapters/04-induction/index.js';
import { renderMaxwell, initMaxwellDiagrams } from './chapters/05-maxwell/index.js';
import { renderGeoOptics, initGeoOpticsDiagrams } from './chapters/06-geo-optics/index.js';
import { renderWaveOptics, initWaveOpticsDiagrams } from './chapters/07-wave-optics/index.js';
import { renderLab, initLabDiagrams } from './editor/index.js';

type ChapterId = 'home' | '00-matter' | '01-electrostatics' | '02-circuits' | '03-magnetism' | '04-induction' | '05-maxwell' | '06-geo-optics' | '07-wave-optics' | 'lab';

const chapterRenderers: Record<ChapterId, () => string> = {
  'home': renderHome,
  '00-matter': renderMatter,
  '01-electrostatics': renderElectrostatics,
  '02-circuits': renderCircuits,
  '03-magnetism': renderMagnetism,
  '04-induction': renderInduction,
  '05-maxwell': renderMaxwell,
  '06-geo-optics': renderGeoOptics,
  '07-wave-optics': renderWaveOptics,
  'lab': renderLab,
};

const chapterInits: Record<ChapterId, () => void> = {
  'home': initHomeDiagrams,
  '00-matter': initMatterDiagrams,
  '01-electrostatics': initElectrostaticsDiagrams,
  '02-circuits': initCircuitsDiagrams,
  '03-magnetism': initMagnetismDiagrams,
  '04-induction': initInductionDiagrams,
  '05-maxwell': initMaxwellDiagrams,
  '06-geo-optics': initGeoOpticsDiagrams,
  '07-wave-optics': initWaveOpticsDiagrams,
  'lab': initLabDiagrams,
};

let currentChapter: ChapterId = 'home';

function navigate(id: string) {
  const chId = id as ChapterId;
  if (!chapterRenderers[chId]) return;

  currentChapter = chId;
  const view = document.getElementById('chapter-view')!;
  view.innerHTML = chapterRenderers[chId]();
  chapterInits[chId]();

  addChapterNav(chId);
  updateActiveLink(chId);
  applyLang();

  // Wire term links and crossrefs after every render
  wireTermLinks(view);
  view.querySelectorAll<HTMLAnchorElement>('a.crossref[href^="#"], a[data-chapter]').forEach(a => {
    a.addEventListener('click', e => {
      e.preventDefault();
      const target = a.dataset.chapter ?? a.getAttribute('href')!.slice(1);
      navigate(target);
    });
  });

  window.scrollTo({ top: 0 });
  window.history.replaceState(null, '', `#${chId}`);
}

function addChapterNav(id: ChapterId) {
  const idx = CHAPTERS.findIndex(c => c.id === id);
  const prev = idx > 1 ? CHAPTERS[idx - 1] : null;
  const next = idx >= 0 && idx < CHAPTERS.length - 1 ? CHAPTERS[idx + 1] : null;
  const lang = getLang();

  if (!prev && !next) return;

  const view = document.getElementById('chapter-view')!;
  const nav = document.createElement('div');
  nav.className = 'chapter-nav';

  if (prev && prev.id !== 'home') {
    const a = document.createElement('a');
    a.href = `#${prev.id}`;
    a.innerHTML = `<span class="nav-label">&#8592; ${lang === 'en' ? 'Previous' : 'Precedente'}</span><span class="nav-title">${lang === 'en' ? prev.titleEn : prev.titleIt}</span>`;
    a.addEventListener('click', e => { e.preventDefault(); navigate(prev.id); });
    nav.appendChild(a);
  } else {
    nav.appendChild(document.createElement('div'));
  }

  if (next) {
    const a = document.createElement('a');
    a.href = `#${next.id}`;
    a.className = 'next';
    a.innerHTML = `<span class="nav-label">${lang === 'en' ? 'Next' : 'Successivo'} &#8594;</span><span class="nav-title">${lang === 'en' ? next.titleEn : next.titleIt}</span>`;
    a.addEventListener('click', e => { e.preventDefault(); navigate(next.id); });
    nav.appendChild(a);
  }

  view.appendChild(nav);
}

function initTheme() {
  const saved = localStorage.getItem('theme') ?? 'light';
  document.documentElement.dataset.theme = saved;
  const btn = document.getElementById('theme-toggle')!;
  btn.textContent = saved === 'dark' ? '☀' : '☽';
  btn.addEventListener('click', () => {
    const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    localStorage.setItem('theme', next);
    btn.textContent = next === 'dark' ? '☀' : '☽';
  });
}

function initLang() {
  const btn = document.getElementById('lang-toggle')!;
  const saved = getLang();
  btn.textContent = saved === 'en' ? 'EN | IT' : 'IT | EN';
  btn.addEventListener('click', () => {
    toggleLang();
    buildTOC();
    navigate(currentChapter);
  });
}

function initSidebar() {
  const sidebar = document.getElementById('sidebar')!;
  const content = document.getElementById('content')!;
  const toggleBtn = document.getElementById('sidebar-toggle')!;

  let open = true;

  function setSidebar(isOpen: boolean) {
    open = isOpen;
    sidebar.classList.toggle('hidden', !isOpen);
    content.classList.toggle('full-width', !isOpen);
    localStorage.setItem('sidebar', isOpen ? '1' : '0');
  }

  const savedSidebar = localStorage.getItem('sidebar');
  if (savedSidebar === '0' || window.innerWidth < 768) setSidebar(false);

  toggleBtn.addEventListener('click', () => setSidebar(!open));

  window.addEventListener('resize', () => {
    if (window.innerWidth < 768 && open) setSidebar(false);
  });
}

function initRouter() {
  const hash = window.location.hash.slice(1) as ChapterId;
  if (hash && chapterRenderers[hash]) {
    navigate(hash);
  } else {
    navigate('home');
  }
}

// Boot
initTheme();
initLang();
initTermPanel();
setLang(getLang());
buildTOC();
initSidebar();
registerNavigate(navigate);
initRouter();
