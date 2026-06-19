export type Lang = 'en' | 'it';

let _lang: Lang = (localStorage.getItem('lang') as Lang) ?? 'en';

export function getLang(): Lang { return _lang; }

export function setLang(l: Lang) {
  _lang = l;
  localStorage.setItem('lang', l);
  applyLang();
  updateToggleBtn();
}

export function toggleLang() {
  setLang(_lang === 'en' ? 'it' : 'en');
}

export function applyLang() {
  document.querySelectorAll<HTMLElement>('[data-en]').forEach(el => {
    const text = el.dataset[_lang];
    if (text !== undefined) el.innerHTML = text;
  });
}

function updateToggleBtn() {
  const btn = document.getElementById('lang-toggle');
  if (btn) btn.textContent = _lang.toUpperCase() === 'EN' ? 'EN | IT' : 'IT | EN';
}

export function t(en: string, it: string): string {
  return _lang === 'en' ? en : it;
}
