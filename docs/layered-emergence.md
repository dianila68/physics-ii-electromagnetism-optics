# Layered Emergence — design notes

Status: implemented in the Physics Lab editor (`src/editor/**`). This document
describes the model; the code is the source of truth.

## Goal

Show how matter at one scale is *built from* the scale below it, while keeping
the simulation honest about a hard rule the user asked for:

> Emergent behaviour may propagate across **one** layer boundary at a time —
> never two consecutive ones. You can show subatomic → atomic **or**
> atomic → molecular, but never subatomic → molecular directly.

The ordered scales are:

```
subatomic (quarks)  →  atomic (nucleons / atoms)  →  molecular (molecules)
```

## Realistic-ish subatomic force

`applyStrongForce` (`src/editor/engine/cpu/forces.ts`) now models the strong
interaction on the phenomenological **Cornell potential** used for heavy-quark
bound states:

```
V(r) = − strongCore / r        (short-range, ~Coulombic one-gluon term)
       + strongTension · r      (long-range linear confinement)
```

The constant confinement term means quarks cannot be pulled apart (the flux
"string"). A short-range hard core keeps the bound state finite and the
explicit integrator stable. It is **illustrative, not a QCD solver** — the
caveat is preserved in the code comments and surfaced in the Lab UI.

## Data model

`src/editor/core/types.ts`:

- `ScaleLayer = 'subatomic' | 'atomic' | 'molecular'`, with ordered
  `SCALE_LAYERS` giving each a rank for the adjacency check.
- `EmergenceBoundary = 'subatomic-atomic' | 'atomic-molecular'` — the two (and
  only two) adjacent pairs.
- `Entity` gains `layer?: ScaleLayer` and, for aggregates, `composite?: boolean`
  + `composedOf?: string[]` (the constituent ids it absorbed).
- `WorldParams` gains `activeBoundary: EmergenceBoundary | null`,
  `emergenceBindRadius`, and `emergenceMinCluster`.

`src/editor/core/world.ts` adds `layerForKind` (quarks → subatomic, everything
else → atomic by default) and `entityLayer(e)` (explicit field, else by kind).
`addEntity`/`toScene`/`loadScene`/`cloneParams` all round-trip the new fields,
with back-compat defaults so older saved scenes still load.

## The one-level rule — how it is enforced

1. **Single active boundary.** `World.params.activeBoundary` is one value, never
   a set, so at most one layer pair is ever coupled.
2. **Adjacency guard.** `isAdjacentBoundary` (`src/editor/engine/Emergence.ts`)
   rejects any pair whose layers are not exactly one rank apart, so a future
   non-adjacent boundary value can never silently couple skipped layers.
3. **Force gating by layer.** Pairwise forces only act within the appropriate
   layer: e.g. `applyLennardJones` filters to `kind === 'atom' && entityLayer(e)
   === 'atomic'`, so once atoms have aggregated into a molecular composite that
   composite (an `atom` body at the `molecular` layer) no longer feels its
   constituents' LJ pull — the coupling has already "emerged" into one body.

## Aggregation ("artificial tie")

`runEmergence(world)` (`src/editor/engine/Emergence.ts`) runs one pass against
the active boundary:

1. Collect the **lower-layer** constituents (`entityLayer === lower`, not fixed).
2. `findBoundClusters` groups them by single-link proximity within
   `emergenceBindRadius` (union-find flood fill), keeping only clusters of at
   least `emergenceMinCluster` members that are *compact* (every member within
   the bind radius of the centroid).
3. Each bound cluster is replaced by a single **composite** at the upper layer
   (`compositeFor`): centre-of-mass position/velocity (momentum-conserving),
   summed mass and charge, an enclosing radius, `composite: true`, and
   `composedOf` listing the absorbed ids. Constituents are then removed.

The composite is rendered as one body and behaves as a rigid aggregate at the
next layer up — which may itself aggregate further only if the user moves the
active boundary up one step. Repeated calls are safe: composites live at the
upper layer and are not re-scanned as constituents.

## Editor decision surface

`src/editor/ui/EditorApp.ts` adds an **emergence control** in the top bar:
a boundary selector (none / subatomic→atomic / atomic→molecular) wired to
`World.params.activeBoundary`, plus an **Emerge** action that calls
`runEmergence` and re-syncs the engine. Because the selector offers only the
two adjacent pairs, the "one level at a time" decision is literally the only
thing the user can express. The Inspector shows each body's layer and, for
composites, the constituent count.

## Engine coverage

Both engines honour layer gating. The CPU engine filters directly on
`entityLayer(e)`. The GPU engine packs the layer into the attribute buffer
(`packed = kind + 4*fixed + 16*layer`) and decodes it in the WGSL kernel, so
Lennard-Jones is gated to atomic-layer atoms exactly as on the CPU — a
molecular composite no longer feels its constituents' pull. The strong force is
keyed on quark kind (only ever at the subatomic layer), so it needs no extra
gate. `runEmergence` is engine-agnostic: it mutates the World, which both
engines re-sync from.

## Presets

Two presets demonstrate the feature end to end (`src/editor/presets.ts`):

- **Emergence: quarks → nucleons** — three quark triplets with the confining
  force on and `activeBoundary: 'subatomic-atomic'`. Play until each triplet
  binds, then press *Emerge* to promote each into a nucleon one layer up.
- **Emergence: atoms → molecule** — a pool of atoms condensing under
  Lennard-Jones with `activeBoundary: 'atomic-molecular'`. Once bound, *Emerge*
  ties the cluster into a single molecule.

## Suggested follow-ups

- Optional auto-run of `runEmergence` on an interval while playing, instead of
  only on the manual Emerge action.
