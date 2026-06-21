import { getLang } from '../utils/lang.js';

export interface BookmarkEntry {
  id: string;
  titleEn: string;
  titleIt: string;
  partEn: string;
  partIt: string;
  savedAt: number;
}

const KEY = 'principia-bookmarks';

function loadBookmarks(): BookmarkEntry[] {
  try { return JSON.parse(localStorage.getItem(KEY) ?? '[]'); } catch { return []; }
}

function saveBookmark(entry: BookmarkEntry) {
  const bms = loadBookmarks().filter(b => b.id !== entry.id);
  bms.unshift(entry);
  localStorage.setItem(KEY, JSON.stringify(bms));
}

function removeBookmark(id: string) {
  localStorage.setItem(KEY, JSON.stringify(loadBookmarks().filter(b => b.id !== id)));
}

export function isBookmarked(id: string): boolean {
  return loadBookmarks().some(b => b.id === id);
}

let panelOpen = false;
let _navigate: ((id: string) => void) | null = null;

function openPanel() {
  document.getElementById('bookmarks-panel')!.classList.add('open');
  document.getElementById('bookmarks-overlay')!.classList.add('open');
  panelOpen = true;
  renderList();
}

function closePanel() {
  document.getElementById('bookmarks-panel')!.classList.remove('open');
  document.getElementById('bookmarks-overlay')!.classList.remove('open');
  panelOpen = false;
}

function renderList() {
  const bms = loadBookmarks();
  const lang = getLang();
  const listEl = document.getElementById('bm-chapters-list');
  const countEl = document.getElementById('bm-count');
  if (!listEl || !countEl) return;

  countEl.textContent = `${bms.length} saved`;

  if (!bms.length) {
    listEl.innerHTML = `<p class="bm-empty">No bookmarks yet — open a chapter and press "Save chapter" in the margin rail.</p>`;
    return;
  }

  listEl.innerHTML = bms.map(b => `
    <div class="bm-chapter-item" data-id="${b.id}">
      <div class="bm-item-info">
        <div class="bm-item-part">${lang === 'it' ? b.partIt : b.partEn}</div>
        <div class="bm-item-title">${lang === 'it' ? b.titleIt : b.titleEn}</div>
      </div>
      <button class="bm-remove icon-btn icon-btn-sm" data-id="${b.id}" aria-label="Remove bookmark" title="Remove">&#x2715;</button>
    </div>
  `).join('');

  listEl.querySelectorAll<HTMLElement>('.bm-chapter-item').forEach(item => {
    item.addEventListener('click', e => {
      if ((e.target as HTMLElement).closest('.bm-remove')) return;
      closePanel();
      _navigate?.(item.dataset.id!);
    });
  });

  listEl.querySelectorAll<HTMLButtonElement>('.bm-remove').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      const id = btn.dataset.id!;
      removeBookmark(id);
      renderList();
      syncMarginBtn(id);
    });
  });
}

function syncMarginBtn(chapterId: string) {
  const btn = document.getElementById('margin-bookmark-btn') as HTMLButtonElement | null;
  if (!btn || btn.dataset.chapter !== chapterId) return;
  const bmd = isBookmarked(chapterId);
  btn.innerHTML = bmd ? '&#9646; Saved' : '&#9647; Save chapter';
  btn.classList.toggle('active', bmd);
}

/** Returns HTML for the margin rail bookmark card. Wire with wireMarginBookmarkBtn() after injection. */
export function renderMarginBookmarkCard(
  chapterId: string,
  titleEn: string, titleIt: string,
  partEn: string, partIt: string,
): string {
  const bmd = isBookmarked(chapterId);
  const lang = getLang();
  const title = lang === 'it' ? titleIt : titleEn;
  return `
    <div class="margin-bookmark-card">
      <div class="eyebrow" style="margin-bottom:8px">This chapter</div>
      <div style="font-size:var(--t-caption);font-family:var(--font-serif);color:var(--text-strong);margin-bottom:12px;line-height:1.4">${title}</div>
      <button
        id="margin-bookmark-btn"
        class="btn btn-secondary btn-sm${bmd ? ' active' : ''}"
        data-chapter="${chapterId}"
        data-title-en="${titleEn.replace(/"/g, '&quot;')}"
        data-title-it="${titleIt.replace(/"/g, '&quot;')}"
        data-part-en="${partEn.replace(/"/g, '&quot;')}"
        data-part-it="${partIt.replace(/"/g, '&quot;')}"
        style="width:100%;justify-content:center"
        title="${bmd ? 'Remove bookmark' : 'Bookmark this chapter'}"
      >${bmd ? '&#9646; Saved' : '&#9647; Save chapter'}</button>
    </div>
  `;
}

/** Call after renderMarginBookmarkCard HTML is in the DOM. */
export function wireMarginBookmarkBtn() {
  const btn = document.getElementById('margin-bookmark-btn') as HTMLButtonElement | null;
  if (!btn) return;
  btn.addEventListener('click', () => {
    const id = btn.dataset.chapter!;
    if (isBookmarked(id)) {
      removeBookmark(id);
      btn.innerHTML = '&#9647; Save chapter';
      btn.classList.remove('active');
      btn.title = 'Bookmark this chapter';
    } else {
      saveBookmark({
        id,
        titleEn: btn.dataset.titleEn ?? id,
        titleIt: btn.dataset.titleIt ?? id,
        partEn: btn.dataset.partEn ?? '',
        partIt: btn.dataset.partIt ?? '',
        savedAt: Date.now(),
      });
      btn.innerHTML = '&#9646; Saved';
      btn.classList.add('active');
      btn.title = 'Remove bookmark';
    }
    if (panelOpen) renderList();
  });
}

export function initBookmarks(navigate: (id: string) => void) {
  _navigate = navigate;
  document.getElementById('bookmark-toggle')!.addEventListener('click', () => panelOpen ? closePanel() : openPanel());
  document.getElementById('bookmarks-close')!.addEventListener('click', closePanel);
  document.getElementById('bookmarks-overlay')!.addEventListener('click', closePanel);
}
