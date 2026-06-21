/**
 * Renderer: converts content data objects → HTML strings.
 * To redesign the GUI: edit this file. Never touch src/content/ for visual changes.
 */

import { getLang } from '../utils/lang.js';
import { TERMS } from '../content/terms.js';
import { m, M } from '../utils/katex-render.js';

export type Lang = 'en' | 'it';

export interface BiText { en: string; it: string; }

export type ContentBlock =
  | { type: 'paragraph'; text: BiText }
  | { type: 'formula'; label?: BiText; latex: string; note?: BiText }
  | { type: 'callout'; variant: 'prereq' | 'note' | 'key' | 'warning' | 'insight' | 'law'; title: BiText; text: BiText }
  | { type: 'table'; headers: BiText[]; rows: (string | BiText)[][] }
  | { type: 'derivation'; title: BiText; blocks: ContentBlock[] }
  | { type: 'diagram'; id: string; title: BiText; caption: BiText; hasControls?: boolean; hasLayers?: string[] }
  | { type: 'key-formulas'; items: { name: BiText; latex: string }[] }
  | { type: 'heading2'; text: BiText }
  | { type: 'heading3'; text: BiText }
  | { type: 'list'; items: BiText[] }
  | { type: 'html'; content: string };

export interface Section {
  id: string;
  title: BiText;
  blocks: ContentBlock[];
}

export interface ChapterData {
  id: string;
  part: BiText;
  title: BiText;
  subtitle: BiText;
  prereq?: { text: BiText; links?: { id: string; label: BiText }[] };
  sections: Section[];
}

function lang(): Lang { return getLang() as Lang; }

function bi(t: BiText): string { return t[lang()]; }

function calloutTitle(variant: string, l: Lang): string {
  const titles: Record<string, Record<Lang, string>> = {
    prereq:  { en: 'Prerequisites', it: 'Prerequisiti' },
    note:    { en: 'Note', it: 'Nota' },
    key:     { en: 'Key concept', it: 'Concetto chiave' },
    warning: { en: 'Warning', it: 'Attenzione' },
    insight: { en: 'Key idea', it: 'Idea chiave' },
    law:     { en: 'Law', it: 'Legge' },
  };
  return titles[variant]?.[l] ?? variant;
}

/** Replace [[term-id]] and $$latex$$ with interactive/rendered HTML */
export function processText(text: string): string {
  // Replace [[chapter:target|Label]] with crossref links
  text = text.replace(/\[\[chapter:([^|\]]+)\|([^\]]+)\]\]/g, (_, target, label) => {
    const parts = target.split('#');
    const chId = parts[0];
    const hash = parts[1] ? `#${parts[1]}` : '';
    return `<a href="#${chId}${hash}" class="crossref" data-chapter="${chId}">${label}</a>`;
  });

  // Replace [[termId|Custom Label]]
  text = text.replace(/\[\[([a-z0-9-]+)\|([^\]]+)\]\]/g, (_, termId, customLabel) => {
    const term = TERMS[termId];
    if (!term) return customLabel;
    return `<span class="term-link" data-term="${termId}" role="button" tabindex="0">${customLabel}</span>`;
  });

  // Replace [[term-id]] with term link spans
  text = text.replace(/\[\[([a-z0-9-]+)\]\]/g, (_, termId) => {
    const term = TERMS[termId];
    if (!term) return termId;
    const label = lang() === 'it' ? term.labelIt : term.labelEn;
    return `<span class="term-link" data-term="${termId}" role="button" tabindex="0">${label}</span>`;
  });

  // Replace $$....$$ with display math
  text = text.replace(/\$\$([^$]+)\$\$/g, (_, tex) => M(tex));

  // Replace $...$ with inline math
  text = text.replace(/\$([^$]+)\$/g, (_, tex) => m(tex));

  return text;
}

function renderBlock(block: ContentBlock): string {
  switch (block.type) {
    case 'paragraph':
      return `<p>${processText(bi(block.text))}</p>`;

    case 'heading2':
      return `<h2>${processText(bi(block.text))}</h2>`;

    case 'heading3':
      return `<h3>${processText(bi(block.text))}</h3>`;

    case 'formula': {
      const label = block.label ? `<div class="formula-label">${bi(block.label)}</div>` : '';
      const note = block.note ? `<p style="font-size:var(--t-caption);margin-top:8px;color:var(--text-muted)">${processText(bi(block.note))}</p>` : '';
      return `<div class="formula-block">${label}${M(block.latex)}${note}</div>`;
    }

    case 'callout': {
      const l = lang();
      const title = bi(block.title) || calloutTitle(block.variant, l);
      return `<div class="callout ${block.variant}">
        <div class="callout-title">${title}</div>
        <p>${processText(bi(block.text))}</p>
      </div>`;
    }

    case 'table': {
      const headers = block.headers.map(h => `<th>${processText(bi(h))}</th>`).join('');
      const rows = block.rows.map(row => {
        const cells = row.map(cell => {
          const txt = typeof cell === 'string' ? cell : bi(cell);
          return `<td>${processText(txt)}</td>`;
        }).join('');
        return `<tr>${cells}</tr>`;
      }).join('');
      return `<table><thead><tr>${headers}</tr></thead><tbody>${rows}</tbody></table>`;
    }

    case 'derivation': {
      const inner = block.blocks.map(renderBlock).join('');
      return `<details class="derivation">
        <summary>${bi(block.title)}</summary>
        <div class="derivation-body">${inner}</div>
      </details>`;
    }

    case 'diagram': {
      const controlsId = block.hasControls ? `id="${block.id}-controls" class="controls"` : '';
      const controls = block.hasControls ? `<div ${controlsId}></div>` : '';
      const layerBar = block.hasLayers ? `<div id="${block.id}-layers" class="layer-toggles"></div>` : '';
      return `<div class="diagram-container">
        <div class="diagram-header">
          <span class="diagram-title">${bi(block.title)}</span>
        </div>
        ${layerBar}
        ${controls}
        <div class="diagram-body" id="${block.id}-wrapper"></div>
        <div class="diagram-caption">${processText(bi(block.caption))}</div>
      </div>`;
    }

    case 'key-formulas': {
      const l = lang();
      const items = block.items.map(item =>
        `<li><span class="formula-name">${item.name[l]}</span>${m(item.latex)}</li>`
      ).join('');
      const title = l === 'it' ? 'Riassunto del Capitolo' : 'Chapter Summary';
      return `<div class="key-formulas"><h4>${title}</h4><ul>${items}</ul></div>`;
    }

    case 'list': {
      const items = block.items.map(item => `<li>${processText(bi(item))}</li>`).join('');
      return `<ul class="body-list">${items}</ul>`;
    }

    case 'html':
      return block.content;
  }
}

export function renderChapter(data: ChapterData): string {
  const l = lang();

  const prereqHtml = data.prereq ? (() => {
    const links = (data.prereq!.links ?? []).map(link =>
      `<a href="#${link.id}" class="crossref" data-chapter="${link.id}">${link.label[l]}</a>`
    ).join(', ');
    const text = processText(bi(data.prereq!.text));
    const body = links ? `${text} ${links}.` : text;
    return `<div class="callout prereq">
      <div class="callout-title">${l === 'it' ? 'Prerequisiti' : 'Prerequisites'}</div>
      <p>${body}</p>
    </div>`;
  })() : '';

  const sectionsHtml = data.sections.map(section => {
    const blocks = section.blocks.map(renderBlock).join('');
    return `<section id="${section.id}">
      <h2>${bi(section.title)}</h2>
      ${blocks}
    </section>`;
  }).join('');

  return `
<div class="chapter-header">
  <div class="eyebrow" style="margin-bottom:8px">${bi(data.part)}</div>
  <h1>${bi(data.title)}</h1>
  <p class="prose" style="margin-top:10px;font-family:var(--font-serif);color:var(--text-muted)">${bi(data.subtitle)}</p>
</div>
${prereqHtml}
${sectionsHtml}
`;
}
