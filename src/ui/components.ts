/**
 * Vanilla TS component helpers — adapted from Principia Design System
 * (FigureSlider, Switch, Tabs, Badge, Btn).
 * Returns DOM elements (for interactive components) or HTML strings (for static ones).
 */

export type SliderAccent = 'ink' | 'blue' | 'red';

/**
 * Principia FigureSlider — thin hairline track, fill, square handle, live readout.
 * Draggable (not a native <input range>).
 */
export function makeFigureSlider(opts: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  accent?: SliderAccent;
  onChange: (v: number) => void;
}): HTMLElement {
  const { label, value: initial, min, max, step = 1, unit = '', accent = 'ink', onChange } = opts;

  const root = document.createElement('div');
  root.className = 'figure-slider';

  const header = document.createElement('div');
  header.className = 'figure-slider-header';

  const lbl = document.createElement('span');
  lbl.className = 'figure-slider-label';
  lbl.textContent = label;

  const readout = document.createElement('span');
  readout.className = 'figure-slider-value';
  readout.textContent = initial + unit;

  header.appendChild(lbl);
  header.appendChild(readout);

  const track = document.createElement('div');
  track.className = 'figure-slider-track';

  const rail = document.createElement('div');
  rail.className = 'figure-slider-rail';

  const fill = document.createElement('div');
  fill.className = `figure-slider-fill${accent !== 'ink' ? ' ' + accent : ''}`;

  const thumb = document.createElement('div');
  thumb.className = `figure-slider-thumb${accent !== 'ink' ? ' ' + accent : ''}`;

  track.appendChild(rail);
  track.appendChild(fill);
  track.appendChild(thumb);

  root.appendChild(header);
  root.appendChild(track);

  function update(v: number) {
    const pct = ((v - min) / (max - min)) * 100;
    fill.style.width = pct + '%';
    thumb.style.left = pct + '%';
    readout.textContent = v + unit;
  }

  function setFromClientX(clientX: number) {
    const r = track.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (clientX - r.left) / r.width));
    const raw = min + ratio * (max - min);
    const snapped = Math.round(raw / step) * step;
    const v = Math.min(max, Math.max(min, snapped));
    update(v);
    onChange(v);
  }

  track.addEventListener('mousedown', (e: MouseEvent) => {
    setFromClientX(e.clientX);
    const onMove = (ev: MouseEvent) => setFromClientX(ev.clientX);
    const onUp = () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  });

  track.addEventListener('touchstart', (e: TouchEvent) => {
    if (e.touches[0]) setFromClientX(e.touches[0].clientX);
  }, { passive: true });

  track.addEventListener('touchmove', (e: TouchEvent) => {
    if (e.touches[0]) setFromClientX(e.touches[0].clientX);
  }, { passive: true });

  update(initial);
  return root;
}

/**
 * Principia Switch — ink-filled toggle, 200ms slide, no bounce.
 */
export function makeSwitch(opts: {
  label?: string;
  checked?: boolean;
  onChange: (checked: boolean) => void;
}): HTMLElement {
  let { checked = false, label, onChange } = opts;

  const root = document.createElement('label');
  root.className = 'switch';

  const btn = document.createElement('button');
  btn.type = 'button';
  btn.role = 'switch';
  btn.setAttribute('aria-checked', String(checked));
  btn.className = `switch-track${checked ? ' checked' : ''}`;

  const knob = document.createElement('span');
  knob.className = 'switch-knob';
  btn.appendChild(knob);

  btn.addEventListener('click', () => {
    checked = !checked;
    btn.setAttribute('aria-checked', String(checked));
    btn.classList.toggle('checked', checked);
    onChange(checked);
  });

  root.appendChild(btn);

  if (label) {
    const lbl = document.createElement('span');
    lbl.className = 'switch-label';
    lbl.textContent = label;
    root.appendChild(lbl);
  }

  return root;
}

/**
 * Principia Tabs — underlined tab bar with indicator.
 */
export function makeTabs(opts: {
  items: Array<{ label: string; value: string }>;
  active: string;
  accent?: 'ink' | 'blue';
  onChange: (value: string) => void;
}): HTMLElement {
  const { items, accent = 'ink', onChange } = opts;
  let active = opts.active;

  const root = document.createElement('div');
  root.className = 'tabs';
  root.setAttribute('role', 'tablist');

  const buttons: HTMLButtonElement[] = [];

  items.forEach(item => {
    const btn = document.createElement('button');
    btn.className = `tab-btn${item.value === active ? ' active' : ''}${accent === 'blue' ? ' blue' : ''}`;
    btn.setAttribute('role', 'tab');
    btn.setAttribute('aria-selected', String(item.value === active));
    btn.textContent = item.label;
    btn.addEventListener('click', () => {
      active = item.value;
      buttons.forEach(b => {
        b.classList.toggle('active', b.textContent === item.label);
        b.setAttribute('aria-selected', String(b.textContent === item.label));
      });
      onChange(item.value);
    });
    buttons.push(btn);
    root.appendChild(btn);
  });

  return root;
}

/** Badge HTML string. Tone: 'neutral' | 'blue' | 'red' | 'outline' */
export function badge(text: string, tone: 'neutral' | 'blue' | 'red' | 'outline' = 'neutral'): string {
  return `<span class="badge badge-${tone}">${text}</span>`;
}

/** Button HTML string. */
export function btn(text: string, variant: 'primary' | 'secondary' | 'ghost' = 'secondary', size: 'sm' | 'md' | 'lg' = 'md'): string {
  const sz = size !== 'md' ? ` btn-${size}` : '';
  return `<button class="btn btn-${variant}${sz}" type="button">${text}</button>`;
}

// makeControl lives in src/utils/layers.ts — import from there for diagram controls.
