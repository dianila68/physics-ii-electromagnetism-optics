export interface LayerDef {
  id: string;
  labelEn: string;
  labelIt: string;
  defaultOn?: boolean;
  color?: string;
}

export function buildLayerToggles(
  container: HTMLElement,
  layers: LayerDef[],
  onToggle: (id: string, active: boolean) => void,
  lang: () => string
): void {
  const bar = document.createElement('div');
  bar.className = 'layer-toggles';

  layers.forEach(layer => {
    const btn = document.createElement('button');
    btn.className = 'layer-btn' + (layer.defaultOn !== false ? ' active' : '');
    btn.dataset.layer = layer.id;
    btn.textContent = lang() === 'it' ? layer.labelIt : layer.labelEn;
    if (layer.color && layer.defaultOn !== false) {
      btn.style.setProperty('--layer-color', layer.color);
    }

    btn.addEventListener('click', () => {
      const isActive = btn.classList.toggle('active');
      onToggle(layer.id, isActive);
    });

    bar.appendChild(btn);
  });

  container.appendChild(bar);
}

export function makeControl(
  label: string,
  min: number,
  max: number,
  value: number,
  step: number,
  unit: string,
  onChange: (v: number) => void
): HTMLElement {
  const group = document.createElement('div');
  group.className = 'control-group';

  const lbl = document.createElement('label');
  lbl.textContent = label;

  const valEl = document.createElement('span');
  valEl.className = 'val';
  valEl.textContent = `${value}${unit}`;

  const input = document.createElement('input');
  input.type = 'range';
  input.min = String(min);
  input.max = String(max);
  input.value = String(value);
  input.step = String(step);

  input.addEventListener('input', () => {
    const v = parseFloat(input.value);
    valEl.textContent = `${v.toFixed(step < 1 ? 2 : 0)}${unit}`;
    onChange(v);
  });

  group.appendChild(lbl);
  group.appendChild(input);
  group.appendChild(valEl);
  return group;
}
