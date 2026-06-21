/** Principia Design Reference page — color palette, type specimens, component gallery. */

function swatch(name: string, varName: string, light?: boolean): string {
  return `
    <div class="ds-swatch" style="background:var(${varName})">
      <span class="ds-swatch-label" style="color:${light ? 'var(--ink-900)' : 'var(--paper-0)'}">${name}</span>
    </div>
  `;
}

function swatchRow(title: string, swatches: string): string {
  return `
    <div class="ds-swatch-group">
      <div class="eyebrow" style="margin-bottom:10px">${title}</div>
      <div class="ds-swatch-row">${swatches}</div>
    </div>
  `;
}

export function renderDesign(): string {
  return `
<div class="chapter-header">
  <div class="eyebrow" style="margin-bottom:8px">Principia Design System</div>
  <h1>Design Reference</h1>
  <p style="margin-top:10px;font-family:var(--font-serif);color:var(--text-muted);font-size:var(--t-body);line-height:var(--lh-reading)">
    Tokens, typography, and components for Physics II. Navigate to <code style="font-family:var(--font-mono);font-size:0.9em;background:var(--paper-2);padding:2px 6px;border-radius:var(--r-1)">#design</code> to access this reference.
  </p>
</div>

<!-- ── COLOR ── -->
<section id="ds-color">
  <h2>Color Palette</h2>

  <div style="display:flex;flex-direction:column;gap:24px">
    ${swatchRow('Paper (surface)', `
      ${swatch('paper-0', '--paper-0', true)}
      ${swatch('paper-1', '--paper-1', true)}
      ${swatch('paper-2', '--paper-2', true)}
      ${swatch('paper-3', '--paper-3', true)}
    `)}
    ${swatchRow('Ink (text)', `
      ${swatch('ink-900', '--ink-900')}
      ${swatch('ink-800', '--ink-800')}
      ${swatch('ink-700', '--ink-700')}
      ${swatch('ink-600', '--ink-600')}
      ${swatch('ink-500', '--ink-500')}
      ${swatch('ink-400', '--ink-400')}
      ${swatch('ink-300', '--ink-300', true)}
      ${swatch('ink-200', '--ink-200', true)}
      ${swatch('ink-100', '--ink-100', true)}
    `)}
    ${swatchRow('Blue (accent / links)', `
      ${swatch('blue-700', '--blue-700')}
      ${swatch('blue-500', '--blue-500')}
      ${swatch('blue-100', '--blue-100', true)}
      ${swatch('blue-050', '--blue-050', true)}
    `)}
    ${swatchRow('Red (vectors / formula)', `
      ${swatch('red-700', '--red-700')}
      ${swatch('red-500', '--red-500')}
      ${swatch('red-100', '--red-100', true)}
    `)}
    ${swatchRow('Spectrum', `
      ${swatch('spec-violet', '--spec-violet')}
      ${swatch('spec-teal', '--spec-teal')}
      ${swatch('spec-amber', '--spec-amber', true)}
    `)}
    ${swatchRow('Semantic tokens', `
      ${swatch('surface-page', '--surface-page', true)}
      ${swatch('surface-card', '--surface-card', true)}
      ${swatch('surface-selected', '--surface-selected', true)}
      ${swatch('text-strong', '--text-strong')}
      ${swatch('text-body', '--text-body')}
      ${swatch('text-muted', '--text-muted')}
      ${swatch('text-faint', '--text-faint')}
      ${swatch('line-hair', '--line-hair', true)}
    `)}
  </div>
</section>

<!-- ── TYPOGRAPHY ── -->
<section id="ds-type">
  <h2>Typography</h2>

  <div class="ds-type-specimen">
    <div class="eyebrow" style="margin-bottom:16px">Display — Spectral 300, 56px</div>
    <div style="font-family:var(--font-serif);font-size:var(--t-display);font-weight:300;letter-spacing:-0.02em;color:var(--text-strong);line-height:1.05">
      The Electric Field
    </div>
  </div>

  <div class="ds-type-specimen">
    <div class="eyebrow" style="margin-bottom:16px">Heading 1 — Spectral 400, 40px</div>
    <h1 style="margin:0">Maxwell's Equations</h1>
  </div>

  <div class="ds-type-specimen">
    <div class="eyebrow" style="margin-bottom:16px">Heading 2 — Spectral 500, 30px</div>
    <h2 style="margin:0;border:none;padding:0">Gauss's Law</h2>
  </div>

  <div class="ds-type-specimen">
    <div class="eyebrow" style="margin-bottom:16px">Heading 3 — Spectral 500, 23px</div>
    <h3 style="margin:0">Point Charges</h3>
  </div>

  <div class="ds-type-specimen">
    <div class="eyebrow" style="margin-bottom:16px">Body — IBM Plex Sans 400, 17px</div>
    <p style="margin:0">The electric field <strong>E</strong> at a point in space is defined as the force per unit positive charge placed at that point. It is a vector quantity with SI units of newtons per coulomb (N/C).</p>
  </div>

  <div class="ds-type-specimen">
    <div class="eyebrow" style="margin-bottom:16px">Body large — IBM Plex Sans 400, 19px</div>
    <p class="prose" style="margin:0;max-width:none">The electric field <strong>E</strong> at a point in space is defined as the force per unit positive charge placed at that point.</p>
  </div>

  <div class="ds-type-specimen">
    <div class="eyebrow" style="margin-bottom:16px">Caption / mono label — IBM Plex Mono 500, 13px</div>
    <span style="font-size:var(--t-caption);font-family:var(--font-mono);color:var(--text-muted)">FIG. 1.2 — ELECTRIC FIELD LINES AROUND A POINT CHARGE</span>
  </div>

  <div class="ds-type-specimen">
    <div class="eyebrow" style="margin-bottom:16px">Eyebrow — Mono 600, 11px, tracked</div>
    <span class="eyebrow">Part I — Electrostatics</span>
  </div>

  <div class="ds-type-specimen">
    <div class="eyebrow" style="margin-bottom:16px">Font families</div>
    <div style="display:flex;flex-direction:column;gap:8px">
      <div style="font-family:var(--font-serif);font-size:18px;color:var(--text-strong)">Spectral — AaBbCcDd 0123456789 &amp;@#</div>
      <div style="font-family:var(--font-sans);font-size:18px;color:var(--text-strong)">IBM Plex Sans — AaBbCcDd 0123456789 &amp;@#</div>
      <div style="font-family:var(--font-mono);font-size:18px;color:var(--text-strong)">IBM Plex Mono — AaBbCcDd 0123456789 &amp;@#</div>
    </div>
  </div>
</section>

<!-- ── COMPONENTS ── -->
<section id="ds-components">
  <h2>Components</h2>

  <!-- Buttons -->
  <h3>Buttons</h3>
  <div class="ds-row">
    <button class="btn btn-primary">Primary</button>
    <button class="btn btn-primary btn-sm">Primary sm</button>
    <button class="btn btn-primary btn-lg">Primary lg</button>
  </div>
  <div class="ds-row" style="margin-top:10px">
    <button class="btn btn-secondary">Secondary</button>
    <button class="btn btn-ghost">Ghost</button>
    <button class="btn btn-secondary" disabled>Disabled</button>
  </div>

  <!-- Badges -->
  <h3>Badges</h3>
  <div class="ds-row">
    <span class="badge badge-neutral">Neutral</span>
    <span class="badge badge-blue">Blue</span>
    <span class="badge badge-red">Red</span>
    <span class="badge badge-outline">Outline</span>
  </div>

  <!-- Callouts -->
  <h3>Callouts</h3>
  <div class="callout prereq">
    <div class="callout-title">Prerequisites</div>
    <p>You should know Coulomb's law and basic vector operations.</p>
  </div>
  <div class="callout note">
    <div class="callout-title">Note</div>
    <p>The superposition principle holds for any number of charges.</p>
  </div>
  <div class="callout key">
    <div class="callout-title">Key concept</div>
    <p>The electric field exists independently of whether a test charge is placed there.</p>
  </div>
  <div class="callout insight">
    <div class="callout-title">Key idea</div>
    <p>Symmetry is the most powerful tool in applying Gauss's law.</p>
  </div>
  <div class="callout warning">
    <div class="callout-title">Warning</div>
    <p>Do not confuse electric potential with electric potential energy.</p>
  </div>
  <div class="callout law">
    <div class="callout-title">Law</div>
    <p>Gauss's law: the total electric flux through any closed surface equals the enclosed charge divided by ε₀.</p>
  </div>

  <!-- Cards -->
  <h3>Cards</h3>
  <div class="card" style="max-width:360px">
    <div class="eyebrow" style="margin-bottom:8px">Example card</div>
    <div style="font-family:var(--font-serif);font-size:var(--t-h3);color:var(--text-strong);margin-bottom:6px">Coulomb's Law</div>
    <p style="font-size:var(--t-caption);color:var(--text-muted);margin:0">F = kq₁q₂/r² — force between two point charges.</p>
  </div>

  <!-- Input fields -->
  <h3>Input</h3>
  <div class="ds-row" style="flex-direction:column;gap:12px;max-width:360px">
    <div class="input-wrapper">
      <input class="input-field" type="text" placeholder="Enter a value…" />
    </div>
    <div class="input-wrapper">
      <input class="input-field" type="text" placeholder="With suffix" />
      <span class="input-suffix">m/s</span>
    </div>
    <div class="input-wrapper has-error">
      <input class="input-field" type="text" value="invalid" />
      <span class="input-suffix">N/C</span>
    </div>
    <div class="input-wrapper">
      <input class="input-field input-mono" type="text" value="1.602e-19" placeholder="Mono mode" />
    </div>
  </div>

  <!-- Formula block -->
  <h3>Formula block</h3>
  <div class="formula-block">
    <div class="formula-label">Coulomb's law</div>
    <div style="font-size:22px;font-family:var(--font-mono);padding:8px 0;color:var(--text-strong)">F = k · q₁q₂ / r²</div>
  </div>

  <!-- Diagram container -->
  <h3>Diagram container</h3>
  <div class="diagram-container">
    <div class="diagram-header">
      <span class="diagram-title">FIG. 1.1 — ELECTRIC FIELD LINES</span>
    </div>
    <div class="diagram-body has-grid" style="height:120px;display:flex;align-items:center;justify-content:center">
      <span style="font-size:var(--t-caption);font-family:var(--font-mono);color:var(--text-faint)">canvas / svg output here</span>
    </div>
    <div class="diagram-caption">Electric field lines radiate outward from a positive point charge.</div>
  </div>

  <!-- Derivation -->
  <h3>Derivation (collapsible)</h3>
  <details class="derivation">
    <summary>Derivation of Coulomb's law from Gauss's law</summary>
    <div class="derivation-body">
      <p>Apply Gauss's law to a spherical Gaussian surface of radius r centred on a point charge q. By symmetry, <strong>E</strong> is radial and constant on the surface.</p>
      <p>The flux through the surface is E × 4πr², and Gauss's law gives E × 4πr² = q/ε₀, so E = q/(4πε₀r²) = kq/r².</p>
    </div>
  </details>

  <!-- Shadows -->
  <h3>Elevation (shadows)</h3>
  <div class="ds-row" style="flex-wrap:wrap;gap:20px">
    ${['shadow-1','shadow-2','shadow-3','shadow-4'].map((s, i) =>
      `<div style="width:100px;height:60px;border-radius:var(--r-3);background:var(--surface-card);box-shadow:var(--${s});display:flex;align-items:center;justify-content:center;font-size:var(--t-micro);font-family:var(--font-mono);color:var(--text-faint)">${i + 1}</div>`
    ).join('')}
    <div style="width:100px;height:60px;border-radius:var(--r-3);background:var(--surface-card);box-shadow:var(--shadow-float);display:flex;align-items:center;justify-content:center;font-size:var(--t-micro);font-family:var(--font-mono);color:var(--text-faint)">float</div>
  </div>

  <!-- Spacing -->
  <h3>Spacing scale</h3>
  <div style="display:flex;flex-direction:column;gap:6px">
    ${[1,2,3,4,5,6,7,8,9,10,11].map(n =>
      `<div style="display:flex;align-items:center;gap:12px">
        <span style="font-family:var(--font-mono);font-size:var(--t-micro);color:var(--text-faint);width:40px">sp-${n}</span>
        <div style="height:8px;background:var(--blue-500);border-radius:1px;width:var(--sp-${n})"></div>
        <span style="font-family:var(--font-mono);font-size:var(--t-micro);color:var(--text-muted)">${[4,6,8,12,16,24,32,40,56,80,128][n-1]}px</span>
      </div>`
    ).join('')}
  </div>

  <!-- Border radii -->
  <h3>Border radius</h3>
  <div class="ds-row">
    ${[['r-1','4px'],['r-2','6px'],['r-3','10px'],['r-4','16px'],['r-pill','999px']].map(([r, px]) =>
      `<div style="width:60px;height:36px;background:var(--blue-100);border:1px solid var(--blue-500);border-radius:var(--${r});display:flex;align-items:center;justify-content:center;font-size:var(--t-micro);font-family:var(--font-mono);color:var(--blue-700)">${px}</div>`
    ).join('')}
  </div>
</section>

<style>
  .ds-swatch-row { display: flex; flex-wrap: wrap; gap: 8px; }
  .ds-swatch { width: 80px; height: 56px; border-radius: var(--r-2); display: flex; align-items: flex-end; padding: 4px 6px; border: 1px solid var(--line-hair); }
  .ds-swatch-label { font-size: 9px; font-family: var(--font-mono); font-weight: 600; line-height: 1; letter-spacing: 0.04em; }
  .ds-type-specimen { margin-bottom: 28px; padding: 20px; background: var(--paper-1); border-radius: var(--r-3); border: 1px solid var(--line-hair); }
  .ds-row { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
</style>
`;
}

export function initDesignDiagrams(): void {}
