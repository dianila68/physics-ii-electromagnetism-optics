# Physics II: Electromagnetism & Optics

Interactive book-like webpage covering Physics II from first principles (quarks → Maxwell's equations → wave optics). Bilingual EN/IT, with 3D diagrams (Three.js), interactive 2D simulations (Canvas/D3), and clickable term definitions.

---

## Running Locally

### Prerequisites

- **Node.js** ≥ 18  
  Check: `node --version`  
  Install: https://nodejs.org (use LTS) or via your package manager:
  ```bash
  # Arch Linux
  sudo pacman -S nodejs npm

  # Ubuntu/Debian
  sudo apt install nodejs npm
  ```

### First-time Setup (from scratch)

```bash
# Clone the repo
git clone https://github.com/luigidelle05/physics-ii-electromagnetism-optics.git
cd "physics-ii-electromagnetism-optics"

# Install dependencies
npm install
```

### Run the Dev Server

```bash
npm run dev
```

Open **http://localhost:5173** in your browser. Hot-reload is active — changes to source files update instantly.

### On Every Reboot

Dependencies are already installed after the first `npm install`. Just run:

```bash
cd "/path/to/physics-ii-electromagnetism-optics"
npm run dev
```

The dev server starts on **port 5173** by default. If that port is taken, Vite will try 5174, 5175, etc. — check the terminal output for the actual URL.

### Build for Production

```bash
npm run build
```

Output goes to `dist/`. Serve with any static file server:

```bash
# Quick local preview of the production build
npm run preview
# or
npx serve dist
```

---

## Project Structure

```
src/
├── content/
│   ├── terms.ts          ← all physics term definitions (EN + IT), independent of UI
│   └── chapters/         ← chapter content as structured data objects
│       ├── 00-matter.ts
│       ├── 01-electrostatics.ts
│       └── ...
├── ui/
│   ├── renderer.ts       ← converts content objects → HTML (swap this to change the GUI)
│   └── term-panel.ts     ← slide-in definition panel system
├── diagrams/
│   ├── three/            ← Three.js 3D diagrams
│   ├── canvas/           ← Canvas 2D simulations
│   └── d3/               ← D3.js graphs
├── utils/
│   ├── lang.ts           ← EN/IT toggle state
│   ├── katex-render.ts   ← KaTeX math helper
│   ├── nav.ts            ← sidebar + chapter routing
│   └── layers.ts         ← multilayer diagram toggle
├── styles/
│   ├── themes.css        ← CSS variables (light/dark)
│   ├── book.css          ← layout, typography
│   └── components.css    ← callouts, formulas, diagrams
└── main.ts               ← boot: theme, lang, router
```

### Physics Lab (interactive editor)

The **Lab** chapter (`src/editor/`) is an interactive multi-scale physics
sandbox: place masses, anchors and springs on a canvas, edit their
properties, and press **Play** to simulate. Save/load scenes as JSON.

It is built around two swappable seams so heavier backends can drop in
later without touching the UI:

```
src/editor/
├── core/        ← engine-agnostic model: World, Entity, Link, units, serialize
├── engine/
│   ├── PhysicsEngine.ts   ← the pluggable simulation interface
│   ├── cpu/               ← default: symplectic-Euler integrator + force registry
│   └── gpu/               ← WebGPU backend stub (Phase 5), same interface
├── render/
│   ├── Renderer.ts        ← viewport interface
│   └── Canvas2DRenderer.ts← 2D viewport (a Three.js 3D renderer can follow)
├── ui/          ← Palette, Timeline, Inspector, EditorApp orchestrator
└── presets.ts   ← demo scenes (spring pendulum, spring chain, bouncing masses)
```

**Phasing:** Phase 1 ships macro mechanics (masses, springs, gravity,
damping, wall collisions). The model already carries `charge` for the EM
scale, and the engine/renderer interfaces are the boundary where the EM,
atomic, subatomic, and GPU phases plug in.

### Swapping the GUI

Content and presentation are fully separated:

- **Content lives in** `src/content/` — structured TypeScript objects, no HTML
- **Rendering lives in** `src/ui/renderer.ts` — takes content objects, produces HTML
- To redesign the look: edit `src/ui/renderer.ts` and `src/styles/` without touching content files
- To add new content: add entries to `src/content/terms.ts` and `src/content/chapters/`

---

## Tech Stack

| Layer | Tool |
|-------|------|
| Build | Vite + TypeScript |
| Math | KaTeX (CDN) |
| 3D | Three.js |
| 2D interactive | Canvas API |
| Styling | Pure CSS (custom properties) |

---

## Adding a New Term Definition

In `src/content/terms.ts`, add an entry to the `TERMS` object:

```typescript
'your-term-id': {
  labelEn: 'Your Term',
  labelIt: 'Il Tuo Termine',
  shortEn: 'One sentence definition.',
  shortIt: 'Definizione in una frase.',
  longEn: `Full explanation, can include LaTeX via $$...$$`,
  longIt: `Spiegazione completa.`,
  seeAlso: ['related-term-id'],
},
```

Then use it anywhere in chapter content:

```typescript
// In a paragraph text:
'The [[electric-field]] at point P is...'
// → renders as a clickable term link that opens the definition panel
```
