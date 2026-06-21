import { t } from '../../utils/lang.js';

export type Tool = 'select' | 'mass' | 'anchor' | 'spring' | 'charge-pos' | 'charge-neg' | 'atom' | 'erase';

interface ToolDef {
  tool: Tool;
  icon: string;
  labelEn: string;
  labelIt: string;
}

const TOOLS: ToolDef[] = [
  { tool: 'select', icon: '⤢', labelEn: 'Select / Drag', labelIt: 'Seleziona / Trascina' },
  { tool: 'mass', icon: '●', labelEn: 'Mass', labelIt: 'Massa' },
  { tool: 'anchor', icon: '◼', labelEn: 'Anchor', labelIt: 'Ancora' },
  { tool: 'spring', icon: '∿', labelEn: 'Spring', labelIt: 'Molla' },
  { tool: 'charge-pos', icon: '⊕', labelEn: 'Charge +', labelIt: 'Carica +' },
  { tool: 'charge-neg', icon: '⊖', labelEn: 'Charge −', labelIt: 'Carica −' },
  { tool: 'atom', icon: '⚛', labelEn: 'Atom', labelIt: 'Atomo' },
  { tool: 'erase', icon: '✕', labelEn: 'Erase', labelIt: 'Cancella' },
];

// Tool palette. Calls back into the editor on tool change and reflects the
// active tool visually.
export class Palette {
  readonly element: HTMLElement;
  private buttons = new Map<Tool, HTMLButtonElement>();

  constructor(onSelect: (tool: Tool) => void, initial: Tool = 'select') {
    this.element = document.createElement('div');
    this.element.className = 'editor-palette';

    for (const def of TOOLS) {
      const btn = document.createElement('button');
      btn.className = 'editor-tool';
      btn.innerHTML = `<span class="tool-icon">${def.icon}</span><span class="tool-label">${t(def.labelEn, def.labelIt)}</span>`;
      btn.title = t(def.labelEn, def.labelIt);
      btn.addEventListener('click', () => {
        this.setActive(def.tool);
        onSelect(def.tool);
      });
      this.buttons.set(def.tool, btn);
      this.element.appendChild(btn);
    }
    this.setActive(initial);
  }

  setActive(tool: Tool): void {
    for (const [key, btn] of this.buttons) {
      btn.classList.toggle('active', key === tool);
    }
  }
}
