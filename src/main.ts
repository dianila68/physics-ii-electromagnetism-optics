import './styles/themes.css';
import './styles/book.css';
import './styles/components.css';
import './styles/term-panel.css';
import './styles/bookmarks.css';

import { getLang, setLang, toggleLang, applyLang } from './utils/lang.js';
import { initTermPanel, wireTermLinks } from './ui/term-panel.js';
import { loadTerms } from './content/terms.js';
import { buildTOC, registerNavigate, updateActiveLink, CHAPTERS } from './utils/nav.js';
import { initBookmarks, renderMarginBookmarkCard, wireMarginBookmarkBtn } from './ui/bookmarks.js';

import { renderHome, initHomeDiagrams } from './chapters/home.js';
import { renderMatter, initMatterDiagrams } from './chapters/00-matter/index.js';
import { renderElectrostatics, initElectrostaticsDiagrams } from './chapters/01-electrostatics/index.js';
import { renderCircuits, initCircuitsDiagrams } from './chapters/02-circuits/index.js';
import { renderMagnetism, initMagnetismDiagrams } from './chapters/03-magnetism/index.js';
import { renderInduction, initInductionDiagrams } from './chapters/04-induction/index.js';
import { renderMaxwell, initMaxwellDiagrams } from './chapters/05-maxwell/index.js';
import { renderGeoOptics, initGeoOpticsDiagrams } from './chapters/06-geo-optics/index.js';
import { renderWaveOptics, initWaveOpticsDiagrams } from './chapters/07-wave-optics/index.js';
import { renderDesign, initDesignDiagrams } from './chapters/design.js';

type ChapterId = 'home' | '00-matter' | '01-electrostatics' | '02-circuits' | '03-magnetism' | '04-induction' | '05-maxwell' | '06-geo-optics' | '07-wave-optics' | 'design';

const chapterRenderers: Record<ChapterId, () => Promise<string> | string> = {
  'home': renderHome,
  '00-matter': renderMatter,
  '01-electrostatics': renderElectrostatics,
  '02-circuits': renderCircuits,
  '03-magnetism': renderMagnetism,
  '04-induction': renderInduction,
  '05-maxwell': renderMaxwell,
  '06-geo-optics': renderGeoOptics,
  '07-wave-optics': renderWaveOptics,
  'design': renderDesign,
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
  'design': initDesignDiagrams,
};

const MARGIN_NOTES: Partial<Record<ChapterId, Array<{ label: string; formula: string; text: string }>>> = {
  '00-matter': [
    { label: 'Elementary charge', formula: 'e = 1.6 × 10⁻¹⁹ C', text: 'Charge is quantized — every observable charge is an integer multiple of e.' },
  ],
  '01-electrostatics': [
    { label: "Coulomb's Law", formula: 'F = k q₁q₂ / r²', text: 'k = 8.99 × 10⁹ N·m²/C². Force along the line joining the charges.' },
    { label: 'Electric field', formula: 'E = F / q₀', text: 'Field at a point equals force per unit positive test charge placed there.' },
  ],
  '02-circuits': [
    { label: "Ohm's Law", formula: 'V = IR', text: 'Voltage equals current times resistance. Valid for linear (ohmic) conductors.' },
    { label: 'Power', formula: 'P = IV = I²R', text: 'Power dissipated as heat in a resistor.' },
  ],
  '03-magnetism': [
    { label: 'Lorentz force', formula: 'F = qv × B', text: 'Magnetic force is perpendicular to both velocity and field — it does no work.' },
    { label: 'Biot-Savart', formula: 'dB = μ₀I dl×r̂ / 4πr²', text: 'Magnetic field from a current element.' },
  ],
  '04-induction': [
    { label: "Faraday's Law", formula: 'EMF = −dΦ/dt', text: 'A changing magnetic flux induces an EMF. The minus sign is Lenz\'s Law.' },
  ],
  '05-maxwell': [
    { label: 'Speed of light', formula: 'c = 1/√(ε₀μ₀)', text: '≈ 3 × 10⁸ m/s. Emerges from Maxwell\'s equations — light is an EM wave.' },
  ],
  '06-geo-optics': [
    { label: "Snell's Law", formula: 'n₁ sin θ₁ = n₂ sin θ₂', text: 'Light bends toward the normal when entering a denser medium.' },
  ],
  '07-wave-optics': [
    { label: 'Double-slit fringes', formula: 'd sin θ = mλ', text: 'Bright fringes where path difference equals integer wavelengths.' },
  ],
};

function updateMarginRail(id: ChapterId) {
  const notes = document.getElementById('margin-notes');
  if (!notes) return;

  // Prepend bookmark card for real chapters (not home or design)
  const meta = CHAPTERS.find(c => c.id === id);
  const bookmarkCardHtml = meta && id !== 'home' && id !== 'design'
    ? renderMarginBookmarkCard(id, meta.titleEn, meta.titleIt, meta.part, meta.partIt)
    : '';

  const items = MARGIN_NOTES[id] ?? [];
  const notesHtml = items.length
    ? items.map(n => `
        <div class="margin-note-card">
          <div class="margin-note-label">${n.label}</div>
          <div class="margin-note-formula">${n.formula}</div>
          <div class="margin-note-text">${n.text}</div>
        </div>
      `).join('')
    : `<p style="font-size:var(--t-caption);color:var(--text-faint);font-family:var(--font-serif);line-height:1.6">Key quantities for this chapter will appear here.</p>`;

  notes.innerHTML = bookmarkCardHtml + notesHtml;
  wireMarginBookmarkBtn();
}

let currentChapter: ChapterId = 'home';

async function navigate(id: string) {
  const chId = id as ChapterId;
  if (!chapterRenderers[chId]) return;

  currentChapter = chId;
  const view = document.getElementById('chapter-view')!;
  view.innerHTML = await chapterRenderers[chId]();
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

  updateMarginRail(chId);
  document.getElementById('content')!.scrollTop = 0;
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
  const isInk = (t: string) => t === 'ink' || t === 'dark';
  btn.textContent = isInk(saved) ? '☀' : '☽';
  btn.addEventListener('click', () => {
    const cur = document.documentElement.dataset.theme ?? 'light';
    const next = isInk(cur) ? 'light' : 'ink';
    document.documentElement.dataset.theme = next;
    localStorage.setItem('theme', next);
    btn.textContent = next === 'ink' ? '☀' : '☽';
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
  const toggleBtn = document.getElementById('sidebar-toggle')!;

  let open = window.innerWidth >= 768;

  function setSidebar(isOpen: boolean) {
    open = isOpen;
    sidebar.classList.toggle('hidden', !isOpen);
    localStorage.setItem('sidebar', isOpen ? '1' : '0');
  }

  const savedSidebar = localStorage.getItem('sidebar');
  if (savedSidebar === '0' || window.innerWidth < 768) setSidebar(false);
  else setSidebar(true);

  toggleBtn.addEventListener('click', () => setSidebar(!open));

  window.addEventListener('resize', () => {
    if (window.innerWidth < 768 && open) setSidebar(false);
  });
}

function initMarginRail() {
  const rail = document.getElementById('margin-rail')!;
  const btn = document.getElementById('margin-toggle')!;

  let open = false;

  btn.addEventListener('click', () => {
    open = !open;
    rail.classList.toggle('hidden', !open);
    localStorage.setItem('margin-rail', open ? '1' : '0');
  });

  if (localStorage.getItem('margin-rail') === '1' && window.innerWidth >= 1024) {
    open = true;
    rail.classList.remove('hidden');
  }
}

function initRouter() {
  const hash = window.location.hash.slice(1) as ChapterId;
  if (hash && chapterRenderers[hash]) {
    navigate(hash);
  } else {
    navigate('home');
  }
}

async function boot() {
  await loadTerms();
  initTheme();
  initLang();
  initTermPanel();
  initBookmarks(navigate);
  setLang(getLang());
  buildTOC();
  initSidebar();
  initMarginRail();
  registerNavigate(navigate);
  initRouter();
}

boot();
