import katex from 'katex';

export function renderMath(container: HTMLElement = document.body) {
  container.querySelectorAll<HTMLElement>('.math-display').forEach(el => {
    try {
      katex.render(el.dataset.tex ?? el.textContent ?? '', el, {
        displayMode: true,
        throwOnError: false,
        trust: true,
      });
    } catch {}
  });

  container.querySelectorAll<HTMLElement>('.math-inline').forEach(el => {
    try {
      katex.render(el.dataset.tex ?? el.textContent ?? '', el, {
        displayMode: false,
        throwOnError: false,
      });
    } catch {}
  });
}

export function math(tex: string, display = true): string {
  try {
    return katex.renderToString(tex, { displayMode: display, throwOnError: false });
  } catch {
    return `<span class="math-error">${tex}</span>`;
  }
}

export function m(tex: string): string { return math(tex, false); }
export function M(tex: string): string { return math(tex, true); }
