import type { World } from '../core/world.js';
import { entityLayer, renderForKind } from '../core/world.js';
import type { Entity, Link, RenderStyle, ScaleLayer } from '../core/types.js';
import { t } from '../../utils/lang.js';
import { makeSwitch, makeTabs } from '../../ui/components.js';

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
  // Called when an edit changes simulation STRUCTURE (e.g. a body's layer,
  // which alters force-gating), so the host can re-sync the engine. Optional.
  private onStructureChange: () => void;

  constructor(world: World, onChange: () => void, onStructureChange?: () => void) {
    this.world = world;
    this.onChange = onChange;
    this.onStructureChange = onStructureChange ?? (() => {});
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
    h.className = 'eyebrow insp-heading';
    h.textContent = text;
    this.element.appendChild(h);
  }

  private subheading(text: string): void {
    const h = document.createElement('div');
    h.className = 'eyebrow insp-subheading';
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
    input.className = 'input-field input-mono';
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

  private switchField(label: string, value: boolean, set: (v: boolean) => void): void {
    const row = document.createElement('div');
    row.className = 'insp-row insp-row-switch';
    const sw = makeSwitch({
      label,
      checked: value,
      onChange: v => { set(v); this.onChange(); },
    });
    row.appendChild(sw);
    this.element.appendChild(row);
  }

  // A labelled segmented control (built on the design-system Tabs). `onPick`
  // fires the redraw; pass `structural: true` to also re-sync the engine.
  private segmentedField(
    label: string,
    items: Array<{ label: string; value: string }>,
    active: string,
    set: (v: string) => void,
    opts: { structural?: boolean } = {},
  ): void {
    const row = document.createElement('div');
    row.className = 'insp-row insp-row-segmented';
    const span = document.createElement('span');
    span.textContent = label;
    const tabs = makeTabs({
      items,
      active,
      accent: 'blue',
      onChange: v => {
        set(v);
        if (opts.structural) this.onStructureChange();
        this.onChange();
      },
    });
    row.append(span, tabs);
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
    const heading =
      e.kind === 'atom' ? t('Atom', 'Atomo')
      : e.kind === 'quark' ? t('Quark', 'Quark')
      : e.kind === 'electron' ? t('Electron (probability cloud)', 'Elettrone (nube di probabilità)')
      : e.fixed ? t('Anchor', 'Ancora')
      : t('Mass', 'Massa');
    this.heading(heading);
    if (!e.fixed) {
      this.numberField(t('Mass (kg)', 'Massa (kg)'), e.mass, v => (e.mass = Math.max(0.01, v)), { min: 0.01, step: 0.1 });
    }
    this.numberField(t('Radius (m)', 'Raggio (m)'), e.radius, v => (e.radius = Math.max(0.05, v)), { min: 0.05, step: 0.05 });
    this.numberField(t('Charge (C)', 'Carica (C)'), e.charge, v => (e.charge = v), { step: 0.1 });
    this.switchField(t('Pinned', 'Fissato'), e.fixed, v => {
      e.fixed = v;
      if (v) { e.vel.x = 0; e.vel.y = 0; }
    });
    this.colorField(t('Color', 'Colore'), e.color, v => (e.color = v));

    // Representation: any body can be shown as a hard sphere or a diffuse
    // probability cloud (not just electrons).
    this.segmentedField(
      t('Render', 'Resa'),
      [
        { label: t('Solid', 'Solido'), value: 'solid' },
        { label: t('Cloud', 'Nube'), value: 'cloud' },
      ],
      entityRenderStyle(e),
      v => (e.render = v as RenderStyle),
    );

    // Scale layer: lets emergence scenarios be built by hand. Changing the
    // layer re-gates the inter-layer forces, so it is a structural edit.
    this.segmentedField(
      t('Layer', 'Livello'),
      [
        { label: t('Sub', 'Sub'), value: 'subatomic' },
        { label: t('Atom', 'Atom'), value: 'atomic' },
        { label: t('Mol', 'Mol'), value: 'molecular' },
      ],
      entityLayer(e),
      v => (e.layer = v as ScaleLayer),
      { structural: true },
    );

    if (e.composite) {
      const layerName = {
        subatomic: t('subatomic', 'subatomico'),
        atomic: t('atomic', 'atomico'),
        molecular: t('molecular', 'molecolare'),
      }[entityLayer(e)];
      const note = document.createElement('div');
      note.className = 'insp-note';
      note.textContent = t(
        `composite · ${layerName} layer · ${e.composedOf?.length ?? 0} constituents`,
        `composito · livello ${layerName} · ${e.composedOf?.length ?? 0} costituenti`,
      );
      this.element.appendChild(note);
    }

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

    this.subheading(t('Electromagnetism', 'Elettromagnetismo'));
    this.numberField(t('Coulomb k', 'Coulomb k'), p.coulombK, v => (p.coulombK = Math.max(0, v)), { min: 0, step: 1 });
    this.numberField(t('E field x', 'Campo E x'), p.efield.x, v => (p.efield.x = v), { step: 0.5 });
    this.numberField(t('E field y', 'Campo E y'), p.efield.y, v => (p.efield.y = v), { step: 0.5 });
    this.numberField(t('B field (z)', 'Campo B (z)'), p.bfield, v => (p.bfield = v), { step: 0.2 });

    this.subheading(t('Molecular (Lennard-Jones)', 'Molecolare (Lennard-Jones)'));
    this.numberField(t('LJ ε (depth)', 'LJ ε (profondità)'), p.ljEpsilon, v => (p.ljEpsilon = Math.max(0, v)), { min: 0, step: 0.5 });
    this.numberField(t('LJ σ (size)', 'LJ σ (dimensione)'), p.ljSigma, v => (p.ljSigma = Math.max(0.1, v)), { min: 0.1, step: 0.1 });

    this.subheading(t('Subatomic (strong force)', 'Subatomico (forza forte)'));
    this.numberField(t('Confinement', 'Confinamento'), p.strongTension, v => (p.strongTension = Math.max(0, v)), { min: 0, step: 0.5 });
    this.numberField(t('Core repulsion', 'Repulsione nucleo'), p.strongCore, v => (p.strongCore = Math.max(0, v)), { min: 0, step: 0.1 });
  }
}

// An entity's effective render style (explicit field, else the kind default).
function entityRenderStyle(e: Entity): RenderStyle {
  return e.render ?? renderForKind(e.kind);
}
