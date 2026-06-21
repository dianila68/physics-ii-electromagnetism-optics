# Principia Design Conventions — Physics II

Adaptation of the Principia Claude Design System for this vanilla TypeScript book.
Source: `packages/principia-ui/` (React components) → CSS classes + DOM helpers.

---

## Fonts

Loaded from Google Fonts (in `index.html`):

| Role | Family | Usage |
|------|--------|-------|
| Serif / reading | Spectral | Chapter titles (h1–h3), body prose, subtitle |
| UI sans | IBM Plex Sans | Buttons, labels, sidebar, controls |
| Mono / labels | IBM Plex Mono | Captions, eyebrows, formula labels, diagram titles, table headers |

---

## Token layers

`src/styles/themes.css` defines three layers:

1. **Raw palette** — `--paper-{0-3}`, `--ink-{100-900}`, `--blue-{050,100,500,700}`, `--red-{100,500,700}`, `--spec-{violet,teal,amber}`
2. **Semantic aliases** — `--text-strong`, `--text-body`, `--text-muted`, `--text-faint`, `--surface-page`, `--surface-card`, `--surface-selected`, `--line-hair`, `--focus-ring`, `--vector`
3. **Local aliases** — `--bg`, `--text`, `--accent`, `--border`, `--sidebar-bg`, etc. (kept for backwards compat)

**Rule:** always use semantic aliases in new component CSS. Fall back to raw palette only when semantic alias doesn't cover the case (e.g. `--ink-300` for dimmed number in `.card-num`).

---

## Themes

| Selector | When |
|----------|------|
| `:root` | Light (paper) — default |
| `[data-theme="ink"]` | Dark (graphite) — set by theme toggle |
| `[data-theme="dark"]` | Alias for ink — both work |

Toggle sets `document.documentElement.dataset.theme`. In JS, use `isInk(t)` which accepts both `'ink'` and `'dark'`.

**Ink shadow rule:** shadows in ink theme are *inner glows*, not cast shadows:
```css
/* light: outer drop-shadow */
--shadow-2: 0 2px 8px rgba(0,0,0,0.08);
/* ink: inner highlight */
--shadow-2: inset 0 1px 0 rgba(255,255,255,0.05), 0 2px 6px rgba(0,0,0,0.45);
```

---

## App shell

```
#app (flex column, 100vh)
  #topbar          (56px, flex none)
  #reader-shell    (flex row, flex 1, overflow hidden)
    #sidebar       (264px, flex none — hidden class → display:none)
    #content       (flex 1, overflow-y:auto)
      #chapter-view  (max-width 860px, margin auto, padding 48px 40px)
    #margin-rail   (264px, flex none — hidden class → display:none)
```

Mobile (< 768px): sidebar becomes `position:fixed` overlay; margin-rail is `display:none !important`.

---

## Typography scale

| Token | Value | Use |
|-------|-------|-----|
| `--t-display` | 56px | Home hero h1 |
| `--t-h1` | 40px | Chapter title |
| `--t-h2` | 30px | Section heading |
| `--t-h3` | 23px | Sub-section heading |
| `--t-body-lg` | 19px | `.prose` intro paragraph |
| `--t-body` | 17px | Default body text |
| `--t-caption` | 13px | Mono captions, diagram labels |
| `--t-micro` | 11px | Eyebrows, badge text, layer toggles |
| `--lh-reading` | 1.62 | All body/prose line-height |
| `--tr-eyebrow` | 0.16em | Eyebrow letter-spacing |

### Eyebrow pattern
```html
<div class="eyebrow">Part I — Electrostatics</div>
```
→ mono, 11px, 600 weight, uppercase, tracked, `--text-muted`.

---

## Component classes (CSS only, no JS)

| Class | Source | Description |
|-------|--------|-------------|
| `.card` | Card.jsx | Surface card with shadow-2, hover lift |
| `.badge-{neutral,blue,red,outline}` | Badge.jsx | Small status chips |
| `.btn-{primary,secondary,ghost}` | Button.jsx | Action buttons |
| `.btn-{sm,lg}` | — | Size modifiers |
| `.icon-btn` | IconButton.jsx | 38×38 square icon button |
| `.icon-btn.active` | — | Inverted (selected-surface bg) |
| `.icon-btn-sm` | — | 30×30 variant |
| `.callout.{prereq,note,key,warning,insight,law}` | Callout.jsx | Left-rule callout boxes |
| `.formula-block` | — | Red left-rule formula container |
| `.diagram-container` | FigureBlock | Card with header/body/caption |
| `.diagram-body.has-grid` | Figure.jsx | Engineering-paper grid background |
| `.input-field` | Input.jsx | Text input with focus ring |
| `.input-wrapper.has-error` | — | Red error state |
| `.input-mono` | — | Monospaced input |
| `.layer-btn.active` | — | Inverted pill for diagram layers |
| `.eyebrow` | — | Mono eyebrow label |
| `.prose` | — | 19px serif prose container |
| `.quantity` | — | Mono tabular-nums inline |
| `.body-list` | — | `<ul>` inside prose |

---

## Interactive component helpers (TypeScript)

Located in `src/ui/components.ts`:

```typescript
makeFigureSlider({ label, value, min, max, step?, unit?, accent?, onChange }) → HTMLElement
makeSwitch({ label?, checked?, onChange }) → HTMLElement
makeTabs({ items, active, accent?, onChange }) → HTMLElement
badge(text, tone) → string   // HTML
btn(text, variant, size) → string  // HTML
```

**`makeControl`** (existing range slider) lives in `src/utils/layers.ts`. Do not duplicate.

---

## Callout variants

```html
<div class="callout prereq">…</div>   <!-- blue  — prerequisites -->
<div class="callout note">…</div>     <!-- amber — side note -->
<div class="callout key">…</div>      <!-- teal  — key concept -->
<div class="callout insight">…</div>  <!-- blue  — key idea -->
<div class="callout warning">…</div>  <!-- red   — warning -->
<div class="callout law">…</div>      <!-- graphite border — physical law -->
```

Border: `border-left: 2px solid`, `border-radius: 0 var(--r-3) var(--r-3) 0` (left edge square).

---

## Bookmarks

`src/ui/bookmarks.ts` — localStorage persistence under `principia-bookmarks`.

```typescript
initBookmarks(navigate)         // call in boot(), wires #bookmark-toggle
renderMarginBookmarkCard(...)   // returns HTML for margin rail
wireMarginBookmarkBtn()         // call after injecting the card HTML
isBookmarked(id)                // check
```

---

## Design reference page

Navigate to `#design` to open the full design reference (color palette, type specimens, component gallery).

---

## Dev server

```bash
./node_modules/.bin/vite
```

Do NOT use `npm run dev` — the apostrophe in the project path breaks shell PATH resolution. Use the binary directly.
