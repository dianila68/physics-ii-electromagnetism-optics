import { TERMS, type TermDef } from '../content/terms.js';
import { getLang } from '../utils/lang.js';
import { math } from '../utils/katex-render.js';

let panelEl: HTMLElement | null = null;
let overlayEl: HTMLElement | null = null;
let currentTermId: string | null = null;
let expanded = false;

export function initTermPanel() {
  // Overlay (for expanded mode)
  overlayEl = document.createElement('div');
  overlayEl.id = 'term-overlay';
  overlayEl.addEventListener('click', closePanelIfOverlay);
  document.body.appendChild(overlayEl);

  // Panel element
  panelEl = document.createElement('aside');
  panelEl.id = 'term-panel';
  panelEl.setAttribute('aria-live', 'polite');
  panelEl.setAttribute('role', 'complementary');
  panelEl.innerHTML = `
    <div class="term-panel-header">
      <span class="term-panel-title"></span>
      <div class="term-panel-actions">
        <button class="term-action-expand" title="Expand" aria-label="Expand definition">⤢</button>
        <button class="term-action-close" aria-label="Close">✕</button>
      </div>
    </div>
    <div class="term-panel-body"></div>
    <div class="term-panel-see-also"></div>
  `;
  document.body.appendChild(panelEl);

  panelEl.querySelector('.term-action-close')!.addEventListener('click', closePanel);
  panelEl.querySelector('.term-action-expand')!.addEventListener('click', toggleExpanded);

  // Keyboard: Escape closes
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closePanel();
  });
}

export function openTerm(termId: string) {
  const term = TERMS[termId];
  if (!term || !panelEl) return;
  currentTermId = termId;
  expanded = false;
  overlayEl!.classList.remove('active');
  panelEl.classList.remove('expanded');
  renderPanel(term);
  panelEl.classList.add('open');
  panelEl.focus();
}

function renderPanel(term: TermDef) {
  if (!panelEl) return;
  const lang = getLang();
  const label = lang === 'it' ? term.labelIt : term.labelEn;
  const short = lang === 'it' ? term.shortIt : term.shortEn;
  const long = lang === 'it' ? term.longIt : term.longEn;

  panelEl.querySelector<HTMLElement>('.term-panel-title')!.textContent = label;

  const body = panelEl.querySelector<HTMLElement>('.term-panel-body')!;
  body.innerHTML = `
    <p class="term-short">${short}</p>
    <p class="term-long">${long}</p>
    ${term.latex ? `<div class="term-formula">${math(term.latex, true)}</div>` : ''}
  `;

  const seeAlso = panelEl.querySelector<HTMLElement>('.term-panel-see-also')!;
  if (term.seeAlso && term.seeAlso.length > 0) {
    const links = term.seeAlso
      .filter(id => TERMS[id])
      .map(id => {
        const t = TERMS[id];
        const lbl = lang === 'it' ? t.labelIt : t.labelEn;
        return `<button class="term-see-also-link" data-term="${id}">${lbl}</button>`;
      }).join('');
    seeAlso.innerHTML = `<span class="see-also-label">${lang === 'it' ? 'Vedi anche' : 'See also'}:</span> ${links}`;
    seeAlso.querySelectorAll<HTMLButtonElement>('.term-see-also-link').forEach(btn => {
      btn.addEventListener('click', () => openTerm(btn.dataset.term!));
    });
  } else {
    seeAlso.innerHTML = '';
  }

  // Wikipedia link
  if (term.wikipedia) {
    const a = document.createElement('a');
    a.href = `https://en.wikipedia.org/wiki/${encodeURIComponent(term.wikipedia)}`;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    a.className = 'term-wiki-link';
    a.textContent = lang === 'it' ? 'Wikipedia →' : 'Wikipedia →';
    body.appendChild(a);
  }
}

function toggleExpanded() {
  if (!panelEl) return;
  expanded = !expanded;
  panelEl.classList.toggle('expanded', expanded);
  overlayEl!.classList.toggle('active', expanded);
  const btn = panelEl.querySelector<HTMLButtonElement>('.term-action-expand')!;
  btn.textContent = expanded ? '⤡' : '⤢';
  btn.title = expanded ? 'Collapse' : 'Expand';
}

export function closePanel() {
  panelEl?.classList.remove('open', 'expanded');
  overlayEl?.classList.remove('active');
  expanded = false;
  currentTermId = null;
}

export function getCurrentTermId(): string | null { return currentTermId; }

function closePanelIfOverlay(e: MouseEvent) {
  if (e.target === overlayEl) closePanel();
}

export function wireTermLinks(container: HTMLElement) {
  container.querySelectorAll<HTMLElement>('[data-term]').forEach(el => {
    el.classList.add('term-link');
    el.setAttribute('role', 'button');
    el.setAttribute('tabindex', '0');
    el.addEventListener('click', () => openTerm(el.dataset.term!));
    el.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') openTerm(el.dataset.term!);
    });
  });
}

export function termLink(termId: string, lang: string): string {
  const term = TERMS[termId];
  if (!term) return termId;
  const label = lang === 'it' ? term.labelIt : term.labelEn;
  return `<span class="term-link" data-term="${termId}" role="button" tabindex="0">${label}</span>`;
}
