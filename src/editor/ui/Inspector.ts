import type { World } from '../core/world.js';
import type { Entity, Link } from '../core/types.js';
import { t } from '../../utils/lang.js';

export type Selection =
  | { type: 'entity'; entity: Entity }
  | { type: 'link'; link: Link }
  | { type: 'world' }
  | null;

// Property panel. Shows editable fields for the current selection — an
// entity, a link, or (when nothing is selected) the world parameters.
// Edits mutate the live objects; onChange triggers a redraw.
export class Inspector {
  readonly element: HTMLElement;
  private world: World;
  private onChange: () => void;

  constructor(world: World, onChange: () => void) {
    this.world = world;
    this.onChange = onChange;
    this.element = document.createElement('div');
    this.element.className = 'editor-inspector';
  }

  show(sel: Selection): void {
    this.element.innerHTML = '';
    if (sel === null || sel.type === 'world') {
      this.renderWorld();
    } else if (sel.type === 'entity') {
      this.renderEntity(sel.entity);
    } else {
      this.renderLink(sel.link);
    }
  }

  private heading(text: string): void {
    const h = document.createElement('div');
    h.className = 'insp-heading';
    h.textContent = text;
    this.element.appendChild(h);
  }

  private numberField(
    label: string,
    value: number,
    set: (v: number) => void,
    opts: { min?: number; max?: number; step?: number } = {},
  ): void {
    const row = document.createElement('label');
    row.className = 'insp-row';
    const span = document.createElement('span');
    span.textContent = label;
    const input = document.createElement('input');
    input.type = 'number';
    if (opts.min !== undefined) input.min = String(opts.min);
    if (opts.max !== undefined) input.max = String(opts.max);
    input.step = String(opts.step ?? 0.1);
    input.value = String(value);
    input.addEventListener('input', () => {
      const n = parseFloat(input.value);
      if (!Number.isNaN(n)) { set(n); this.onChange(); }
    });
    row.append(span, input);
    this.element.appendChild(row);
  }

  private checkboxField(label: string, value: boolean, set: (v: boolean) => void): void {
    const row = document.createElement('label');
    row.className = 'insp-row insp-row-check';
    const span = document.createElement('span');
    span.textContent = label;
    const input = document.createElement('input');
    input.type = 'checkbox';
    input.checked = value;
    input.addEventListener('change', () => { set(input.checked); this.onChange(); });
    row.append(span, input);
    this.element.appendChild(row);
  }

  private colorField(label: string, value: string, set: (v: string) => void): void {
    const row = document.createElement('label');
    row.className = 'insp-row';
    const span = document.createElement('span');
    span.textContent = label;
    const input = document.createElement('input');
    input.type = 'color';
    input.value = value;
    input.addEventListener('input', () => { set(input.value); this.onChange(); });
    row.append(span, input);
    this.element.appendChild(row);
  }

  private renderEntity(e: Entity): void {
    this.heading(e.fixed ? t('Anchor', 'Ancora') : t('Mass', 'Massa'));
    if (!e.fixed) {
      this.numberField(t('Mass (kg)', 'Massa (kg)'), e.mass, v => (e.mass = Math.max(0.01, v)), { min: 0.01, step: 0.1 });
    }
    this.numberField(t('Radius (m)', 'Raggio (m)'), e.radius, v => (e.radius = Math.max(0.05, v)), { min: 0.05, step: 0.05 });
    this.numberField(t('Charge (C)', 'Carica (C)'), e.charge, v => (e.charge = v), { step: 0.1 });
    this.checkboxField(t('Pinned', 'Fissato'), e.fixed, v => {
      e.fixed = v;
      if (v) { e.vel.x = 0; e.vel.y = 0; }
    });
    this.colorField(t('Color', 'Colore'), e.color, v => (e.color = v));

    const pos = document.createElement('div');
    pos.className = 'insp-note';
    pos.textContent = `x=${e.pos.x.toFixed(2)}  y=${e.pos.y.toFixed(2)}  |v|=${Math.hypot(e.vel.x, e.vel.y).toFixed(2)} m/s`;
    this.element.appendChild(pos);
  }

  private renderLink(l: Link): void {
    this.heading(t('Spring', 'Molla'));
    this.numberField(t('Stiffness k (N/m)', 'Rigidità k (N/m)'), l.stiffness, v => (l.stiffness = Math.max(0, v)), { min: 0, step: 1 });
    this.numberField(t('Rest length (m)', 'Lunghezza a riposo (m)'), l.rest, v => (l.rest = Math.max(0, v)), { min: 0, step: 0.1 });
    this.numberField(t('Damping (N·s/m)', 'Smorzamento (N·s/m)'), l.damping, v => (l.damping = Math.max(0, v)), { min: 0, step: 0.1 });
  }

  private renderWorld(): void {
    const p = this.world.params;
    this.heading(t('World', 'Mondo'));
    const note = document.createElement('div');
    note.className = 'insp-note';
    note.textContent = t('Nothing selected — editing world parameters.', 'Niente selezionato — modifica dei parametri del mondo.');
    this.element.appendChild(note);

    this.numberField(t('Gravity (m/s²)', 'Gravità (m/s²)'), p.gravity.y, v => (p.gravity.y = v), { step: 0.5 });
    this.numberField(t('Linear damping', 'Smorzamento lineare'), p.linearDamping, v => (p.linearDamping = Math.max(0, v)), { min: 0, step: 0.01 });
    this.numberField(t('Restitution', 'Restituzione'), p.restitution, v => (p.restitution = Math.min(1, Math.max(0, v))), { min: 0, max: 1, step: 0.05 });
  }
}
