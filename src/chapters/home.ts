import { t } from '../utils/lang.js';
import { CHAPTERS } from '../utils/nav.js';
import { navigate } from '../utils/nav.js';

export function renderHome(): string {
  const chapters = CHAPTERS.filter(c => c.id !== 'home');

  const cards = chapters.map((ch, i) => {
    const num = String(i).padStart(2, '0');
    return `
    <a class="chapter-card" href="#${ch.id}" data-chapter="${ch.id}">
      <div class="card-num">${num}</div>
      <div class="card-body">
        <div class="card-part">${t(ch.part, ch.partIt)}</div>
        <h3>${t(ch.titleEn, ch.titleIt)}</h3>
        <p>${t(ch.subtitleEn, ch.subtitleIt)}</p>
        <div class="card-progress"><div class="card-progress-fill" style="width:0%"></div></div>
      </div>
    </a>
  `;
  }).join('');

  return `
<div class="home-hero">
  <div class="eyebrow" style="margin-bottom:14px">${t('Physics II · Electromagnetism &amp; Optics', 'Fisica II · Elettromagnetismo &amp; Ottica')}</div>
  <h1>${t('From charge to light', 'Dalla carica alla luce')}</h1>
  <p class="subtitle">${t(
    'Eight chapters. Every law you can touch — drag a field, launch a particle, watch energy travel as a wave. Built from first principles.',
    'Otto capitoli. Ogni legge che puoi toccare — trascina un campo, lancia una particella, guarda l\'energia viaggiare come un\'onda. Costruito dai principi fondamentali.'
  )}</p>
</div>

<div style="display:flex; align-items:baseline; justify-content:space-between; border-bottom:1px solid var(--line-hair); padding-bottom:12px; margin-bottom:24px;">
  <span style="font-size:var(--t-body); font-weight:600; font-family:var(--font-sans); color:var(--text-strong)">${t('Chapters', 'Capitoli')}</span>
  <span style="font-size:var(--t-caption); font-family:var(--font-mono); color:var(--text-faint)">8 ${t('chapters', 'capitoli')}</span>
</div>

<div class="callout note" style="margin-bottom:32px">
  <div class="callout-title">${t('How to use this book', 'Come usare questo libro')}</div>
  <p>${t(
    'Chapters build sequentially. Start from Part 0 for foundations. Use the sidebar to navigate, EN IT to switch language, and the notes panel (⋮) for key formulas.',
    'I capitoli si costruiscono sequenzialmente. Inizia dalla Parte 0 per le basi. Usa la barra laterale per navigare, EN IT per cambiare lingua, e il pannello note (⋮) per le formule chiave.'
  )}</p>
</div>

<div class="chapter-grid">${cards}</div>
`;
}

export function initHomeDiagrams() {
  document.querySelectorAll<HTMLElement>('.chapter-card[data-chapter]').forEach(card => {
    card.addEventListener('click', e => {
      e.preventDefault();
      const id = card.dataset.chapter!;
      navigate(id);
    });
  });
}
