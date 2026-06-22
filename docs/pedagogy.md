# Pedagogy & Content-Formatting Guide

Physics II — Electromagnetism & Optics

Audience: **content authors** (people writing chapter prose, EN/IT) and **code authors**
(people extending the content model in `src/ui/renderer.ts` and the chapter objects in
`src/chapters/*/index.ts`). Every recommendation below is meant to be actionable by at
least one of those two roles, and most by both.

This guide is read-only with respect to the running app: nothing here requires changing
behavior to be useful. The "content model" section (§3) proposes *additive* block types
that keep the app building.

---

## 0. The one-paragraph thesis

Learners commit when they feel a **gap they want closed**, then retain when the material is
**sequenced concept-first, low-clutter, multi-representational, and revisited**. We operationalize
this with two narrative devices the book will use everywhere: a **Motivation Opener** at the start
of each chapter (the "why" — §1) and a **Curiosity Bridge / cliffhanger** at the end of each
chapter (the tension that opens the next one — §2). Underneath both sit five evidence-based
mechanics (§4): conceptual-before-mathematical sequencing, the 5E inquiry arc, cognitive-load /
worked-example discipline, retrieval practice, and multiple representations. Accessibility and
EN/IT parity (§5) are non-negotiable constraints, not features.

---

## 1. Motivation Openers — the "why" at the top

### 1.1 Why this works (evidence)

Curiosity is, in Loewenstein's **information-gap theory**, "a cognitive induced deprivation
that arises from the perception of a gap in knowledge"; a *small priming dose* of information
sharply raises the desire to close the gap, and closing it is itself rewarding
([Golman & Loewenstein, *Curiosity, Information Gaps, and the Utility of Knowledge*](https://www.cmu.edu/dietrich/sds/docs/golman/golman_loewenstein_curiosity.pdf)).
An opener's job is to *manufacture that gap deliberately* — name a question the reader cannot
yet answer, and promise the chapter answers it.

The 5E model's first phase, **Engage**, exists for exactly this: a "student-centered… motivational
period that can create a desire to learn more" and surfaces prior knowledge / misconceptions
([Bybee et al., *The 5E Instructional Model*](https://files.eric.ed.gov/fulltext/EJ1058007.pdf);
[HMH, *5E Instructional Model Explained*](https://www.hmhco.com/blog/5e-instructional-model)).

One honest caveat that shapes our house style: **context is not automatically motivating.**
A large study found that while teachers believe contextualized problems boost motivation,
*older students often report the opposite* when the "context" is a contrived word-problem wrapper
([Phys. Rev. PER, *Can contextualized physics problems enhance student motivation?*](https://link.aps.org/doi/10.1103/2g1b-hmhq)).
The takeaway: an opener motivates through a **genuine conceptual gap or paradox**, not through a
forced real-world veneer ("imagine you are an electrician…"). Prefer "here is something that
*shouldn't* work but does" over "here is a job where you'd use this."

### 1.2 The reusable opener structure

Every chapter opens with a short, three-beat motivation block answering, in order:

1. **Why study this at all? (the human stake)** — one or two sentences on what becomes
   *possible* or *understandable* once you have this idea. Concrete phenomenon, not a syllabus
   line. E.g. for induction: "Every power station on Earth turns a magnet to make your lights work.
   Nobody pushed a charge — so where did the energy come from?"
2. **Why physics (and not just a rule)? (the lens)** — why the *physicist's* move here is to find an
   invariant / field / symmetry rather than memorize cases. Establishes that we explain, not catalog.
3. **Why THIS chapter, here, now? (the gap)** — the specific question the *previous* chapter left
   open, or the paradox this chapter resolves. This is the information gap. End it on a question.

Keep the whole opener under ~120 words per language. It is a hook, not a summary.

### 1.3 Authoring template (drop-in)

In a chapter's `data.sections[0]`, lead with a dedicated opener. Until a custom block exists
(see §3) you can author it today with existing blocks: a `callout` of a new/borrowed variant plus a
closing `paragraph` whose last sentence is the gap question.

```ts
{
  id: 'why',
  title: { en: 'Why this chapter', it: 'Perché questo capitolo' },
  blocks: [
    {
      type: 'callout',
      variant: 'insight', // or new 'motivation' variant — see §3
      title: { en: 'The question', it: 'La domanda' },
      text: {
        en: 'Stake → lens → gap, ending on an open question.',
        it: 'Posta in gioco → lente → lacuna, che termina con una domanda aperta.',
      },
    },
  ],
}
```

---

## 2. Curiosity Bridges — the cliffhanger at the bottom

### 2.1 The idea

Re-asking "why?" from scratch at every chapter start gets tiring and feels artificial. The
stronger move — and the user's framing idea — is to make the **end** of a chapter generate the
**next** chapter's motivation for free. This is the information gap again, but now *earned*: the
reader has a result in hand, we push it to a limit until it visibly breaks or contradicts something,
and the broken edge *is* the door to the next chapter. The opener of chapter N+1 can then simply
*recall the unresolved tension* rather than inventing a new one.

This matches Loewenstein's "priming dose" mechanism (a known result + one unanswered question is
maximally curiosity-inducing) and the 5E **Elaborate** phase, where students "elaborate on possible
effects… and predict potential outcomes based on different variables"
([Bybee et al.](https://files.eric.ed.gov/fulltext/EJ1058007.pdf)).

### 2.2 The narrative pattern (four beats)

1. **Restate the law/result you just earned** in one line ("We can now compute any static field.").
2. **Apply it past its comfort zone** — change one assumption: let it move, let it vary in time,
   make it very fast, very small, very strong.
3. **Show the break** — a contradiction, an unexplained force, a quantity that won't conserve, a
   prediction that disagrees with reality. *Name the tension explicitly.*
4. **Point through the door** — pose the question whose answer is the next chapter. Link forward
   with a crossref so it's clickable.

### 2.3 The chapter-bridge map (the actual sequence)

| From → To | Result earned | Push it until… | Break / tension | Question that opens the next chapter |
|---|---|---|---|---|
| **00 Matter → 01 Electrostatics** | Charge is real, quantized, conserved. | Put two charges near each other. | They push/pull *across empty space* with nothing touching. | How does one charge "know" the other is there? → the **field**. |
| **01 Electrostatics → 02 Circuits** | Static fields; conductors reach equilibrium (E=0 inside). | Don't let it reach equilibrium — keep pumping charge. | A *sustained* flow needs a source that never settles; statics can't describe steady current. | What keeps charge moving forever, and what resists it? → EMF, current, resistance. |
| **02 Circuits → 03 Magnetism** | Steady currents in wires, driven by potential difference. | Put a compass next to a current-carrying wire; then set a charge *moving*. | Moving charges deflect each other in a way *no static electric field predicts* — a force perpendicular to motion. | Why do **moving** charges behave differently? → a new field, **B**. |
| **03 Magnetism → 04 Induction** | B from currents; force on moving charge (Lorentz). | Hold the charge still but **move the magnet** / change B in time. | A force appears on charges that *aren't moving* — F=qv×B can't be the source. | A **changing** magnetic field drives current. Why? → Faraday's law, induction. |
| **04 Induction → 05 Maxwell** | Changing B makes E (Faraday). | Look at Ampère's law for a charging capacitor — a current with a gap in it. | Ampère's law is *inconsistent*: the enclosed current depends on the surface you choose. | What fixes the contradiction? → **displacement current**; symmetry: changing E makes B. |
| **05 Maxwell → 06 Geometric Optics** | The four equations; E and B regenerate each other. | Solve them in vacuum, no charges at all. | A self-sustaining wave falls out — speed = c. **Light is an EM wave.** | If light is a field that travels in straight lines, how does it reflect, bend, and form images? → rays. |
| **06 Geo-Optics → 07 Wave Optics** | Rays: reflection, refraction, lenses, images. | Send light through a slit *narrower and narrower*. | Rays predict a sharp shadow; reality shows fringes — rays **break down**. | What does light do that rays can't capture? → it's a **wave**: interference & diffraction. |

> Authoring note: bridge beat 4 should `[[chapter:NN-target#section|label]]`-link forward, and the
> *next* chapter's opener (§1) should back-reference the same tension by name, so the two halves of
> the seam reinforce each other. Chapter 07 closes the EM→optics arc; its bridge can point *outward*
> (quantum: a single photon still makes fringes) rather than to an in-book chapter.

### 2.4 Authoring template (drop-in)

Author the bridge as the **last section** of the chapter:

```ts
{
  id: 'bridge',
  title: { en: 'Where this breaks', it: 'Dove tutto si rompe' },
  blocks: [
    {
      type: 'callout',
      variant: 'warning', // tension; or new 'bridge' variant — see §3
      title: { en: 'Push it to the limit', it: 'Spingilo al limite' },
      text: {
        en: 'Beats 1–3: restate → push → break.',
        it: 'Battute 1–3: ripeti → spingi → rompi.',
      },
    },
    {
      type: 'paragraph',
      text: {
        en: 'Beat 4 — the door. …so [[chapter:04-induction|the next chapter]] answers: why does a *changing* field push charges?',
        it: 'Battuta 4 — la porta. …quindi [[chapter:04-induction|il prossimo capitolo]] risponde: perché un campo *variabile* spinge le cariche?',
      },
    },
  ],
}
```

---

## 3. Mapping onto the existing content model

The content model is the `ContentBlock` discriminated union in
`src/ui/renderer.ts` (lines 14–25), rendered by `renderBlock` (line 92). Chapters are
`ChapterData` objects in `src/chapters/*/index.ts`. Bilingual text is the `BiText`
(`{ en, it }`) type; **every authored string must be `BiText`** (or a plain string only when the
two languages are identical, e.g. symbols like `p`, `Cu`). Term links use
`[[term-id|label]]` / `[[term-id]]`; forward chapter links use `[[chapter:NN-id#section|label]]`.
Both are expanded in `processText` (lines 59–90).

### 3.1 Can we do it with what exists today?

Yes — openers and bridges can be authored **right now** with `callout` + `paragraph`, as the
templates in §1.3 and §2.4 show. Ship content first; add semantic block types as a polish pass.

### 3.2 Recommended *additive* changes (keep the app building)

Two tiers, smallest first. Each is backward compatible — existing chapters keep rendering.

**Tier A — two new callout variants (smallest, recommended first).**
Add to the variant union in `renderer.ts` line 17 and to `calloutTitle` (lines 46–56), plus CSS in
`src/styles/` matching the existing `.callout.{...}` pattern in `CONVENTIONS.md`:

- `'motivation'` — the opener's "the question" box. Suggest a warm accent (`--spec-amber` or
  `--spec-violet`) distinct from the cooler `insight`/`key`. Default title EN "The question" / IT "La domanda".
- `'bridge'` — the cliffhanger box. Suggest `--spec-violet` or a forward-pointing accent. Default
  title EN "Where this leads" / IT "Dove conduce".

```ts
// renderer.ts line 17 — extend the variant union:
| { type: 'callout'; variant: 'prereq'|'note'|'key'|'warning'|'insight'|'law'|'motivation'|'bridge'; title: BiText; text: BiText }
```
```ts
// calloutTitle map — add:
motivation: { en: 'The question', it: 'La domanda' },
bridge:     { en: 'Where this leads', it: 'Dove conduce' },
```

**Tier B — first-class structural blocks (optional, if openers/bridges should be styled distinctly
from callouts or carry extra fields).** Add new members to the `ContentBlock` union and a `case`
in `renderBlock`:

- `{ type: 'opener'; stake: BiText; lens: BiText; gap: BiText }` — renders the three beats with
  consistent typography and an eyebrow ("Why this chapter" / "Perché questo capitolo"). Guarantees
  every chapter has all three beats (a content-completeness lint becomes possible).
- `{ type: 'bridge'; restate: BiText; push: BiText; broke: BiText; door: BiText; next?: string }` —
  renders the four beats; `next` is a chapter id used to auto-build the forward crossref so authors
  can't forget the link.

Tier B is more work but makes the *narrative arc machine-checkable*: a script can assert "every
chapter has exactly one `opener` and one `bridge`, and every `bridge.next` resolves to a real
chapter id." Recommend Tier A now, Tier B only if/when the arc is locked.

**Optional Tier C — retrieval block** (supports §4.4):
`{ type: 'recall'; prompt: BiText; answer: BiText }` rendered as a `<details>` (reuse the existing
`derivation` pattern, lines 130–136) so the answer is hidden until the reader has *tried* to recall.

### 3.3 Where openers/bridges live in a `ChapterData`

- **Opener**: the first `Section` of `data.sections`, `id: 'why'`. It complements (does not replace)
  the existing `prereq` block, which stays factual ("you need Ch.1's field concept"). Prereq =
  *what you need*; opener = *why you'd want to*.
- **Bridge**: the last `Section`, `id: 'bridge'`, placed after the `key-formulas` summary so the
  reader leaves on the cliffhanger, not the formula list. (Today `00-matter` ends on `key-formulas`;
  the bridge section would slot in after it.)

### 3.4 Bilingual discipline

- Author EN and IT **together**, never EN-only "to translate later" — drift is the failure mode.
- Keep `[[term-id]]` ids identical across languages; only the *label* localizes
  (`[[proton|Proton]]` / `[[proton|Protone]]`). Term definitions themselves live in
  `src/content/terms.ts` / `public/terms.json`.
- Keep math identical across languages (LaTeX is language-neutral); only `label`/`note` localize.
- IT prose runs ~10–15% longer than EN; don't pad EN to match. Let callouts size to content.

---

## 4. The five mechanics under the hood

### 4.1 Conceptual before mathematical

Introduce the *idea and its picture* before the equation. The Lorentz-force section in
`03-magnetism/index.ts` is the model to copy: a plain-language paragraph ("force perpendicular to
both v and B") → the `formula` → a `callout` interpreting it ("does no work… only changes
direction"). The equation arrives as the *compression* of an idea the reader already holds, which
is what keeps **intrinsic load** manageable
([Cognitive Load Theory & Worked Examples](https://files.eric.ed.gov/fulltext/EJ1161818.pdf)).
Rule of thumb: a reader who skipped every formula block should still understand the chapter's story.

### 4.2 The 5E arc, mapped to our blocks

| 5E phase | In our chapter | Block(s) |
|---|---|---|
| **Engage** | Motivation opener (§1) | `opener` / `motivation` callout |
| **Explore** | Interactive diagram first, label later | `diagram` (`hasControls`/`hasLayers`) |
| **Explain** | Prose + formula + interpreting callout | `paragraph`, `formula`, `callout` |
| **Elaborate** | Worked example, edge cases, the bridge | `derivation`, `bridge` |
| **Evaluate** | Retrieval prompts, recap | `recall` (§3.2-C), `key-formulas` |

Inquiry-first ordering (let the reader *manipulate* the `diagram` before being told the rule) is
tied to "significantly better acquisition of scientific concepts" than text-first instruction
([5E with high-school physics](https://scholarworks.montana.edu/items/f1736680-a88b-424a-bdda-502f2cd321ec)).

### 4.3 Cognitive load & worked examples

- **Strip extraneous load.** Every callout, color, and label must earn its place; decoration that
  doesn't carry meaning is load, not richness
  ([CLT in physics](https://files.eric.ed.gov/fulltext/EJ1161818.pdf)).
- **Worked examples before problems.** When introducing a calculation, show a fully worked solution
  with reasoning visible (use the `derivation` `<details>` block) *before* asking the reader to do
  one. Narrated, step-revealed solutions reduce extraneous load and improve transfer more than
  unguided practice
  ([Worked examples / multimedia](https://www.researchgate.net/publication/320159720_Cognitive_Load_Theory_and_the_Use_of_Worked_Examples_as_an_Instructional_Strategy_in_Physics_for_Distance_Learners_A_Preliminary_Study)).
- **Coherence/contiguity.** Keep a diagram's explanatory text *next to* the diagram, not pages away
  — the renderer's `diagram-caption` is the right home for the one-line takeaway.

### 4.4 Retrieval & spacing

Practice testing and distributed practice are, across 242 studies / 169k participants, the two
most effective study techniques, and they reduce exam anxiety rather than adding it
([Spacing & retrieval practice, *Nature Reviews Psychology*](https://www.nature.com/articles/s44159-022-00089-1);
[Evidence Based Education](https://evidencebased.education/resource/retrieval-and-spaced-practice-study-strategies-that-must-be-combined/)).
For a textbook that means:

- End each section (not just each chapter) with a **recall prompt** the reader answers *from memory*
  before revealing the answer — the `recall` `<details>` block (§3.2-C) enforces the "try first" gap.
- **Space across chapters.** A bridge's "restate the result" beat and the next opener's
  back-reference are themselves spaced retrieval of the prior chapter — the narrative device doubles
  as a memory device. Lean into it: phrase the restate as a question first.

### 4.5 Multiple representations

Every core concept should appear in **at least two** of: prose, equation, diagram, table,
interactive. Multiple external representations "substantially facilitate the learning and
understanding of science" per the Cognitive Theory of Multimedia Learning
([Multiple Representations in Physics & Science Education](https://www.researchgate.net/publication/318675720_Multiple_Representations_in_Physics_and_Science_Education_-_Why_Should_We_Use_Them)).
The model already supports this richly: `paragraph` + `formula` + `diagram` + `table` +
`key-formulas`. The discipline is to make representations **say the same thing differently**, not
introduce new facts only in the picture (that strands non-visual readers — see §5).

---

## 5. Accessibility & bilingual constraints

Treat WCAG 2.1 AA as the floor for STEM content
([AEM Center, *Creating Accessible STEM Materials*](https://aem.cast.org/create/accessible-stem-materials);
[Colorado State, *Math Content*](https://www.chhs.colostate.edu/accessibility/best-practices-how-tos/math-content/)).

- **Math is real markup, never an image.** We already render via KaTeX (`m`/`M` in
  `katex-render.js`), which emits MathML for screen readers and lets users resize/translate
  equations — exactly the recommended approach over flat images
  ([JHU, *Making Equations Accessible*](https://support.cmts.jhu.edu/hc/en-us/articles/360036149352-Making-Equations-in-Online-Learning-Accessible)).
  Keep authoring equations as LaTeX in `formula`/`key-formulas`/inline `$...$`; never paste a
  rendered-math screenshot.
- **No information lives only in a diagram.** Every `diagram` needs a `caption` that states the
  takeaway in words, and the surrounding prose must convey the physics independently. Interactive
  3D/canvas figures must have a meaningful fallback — `00-matter` already does this with its WebGL
  fallback (`index.ts` lines 151–155); copy that pattern.
- **Plain-language gloss for dense math.** Alongside any non-trivial equation, give a one-sentence
  word version (the `formula.note` field is built for this). This is both pedagogy (§4.1) and
  accessibility — screen-reader users navigating nested expressions rely on the narrative gloss
  ([Colorado State](https://www.chhs.colostate.edu/accessibility/best-practices-how-tos/math-content/)).
- **Color is never the only signal.** Callout meaning currently rides on left-rule color; the
  `callout-title` text label (rendered in `renderBlock`) is what carries meaning for color-blind and
  screen-reader users — always give callouts a real title, don't rely on the variant's hue alone.
- **Bilingual parity is an accessibility property.** A concept explained only in EN is inaccessible
  to an IT reader and vice-versa. EN/IT must be authored together (§3.4).
- **Interactive controls need labels.** Sliders/switches/tabs (`makeFigureSlider`, `makeSwitch`,
  `makeTabs`, `makeControl`) must pass a localized `label`; term-link spans already carry
  `role="button"` and `tabindex` (renderer lines 72, 80) — preserve that when adding markup.

---

## 6. House style for prose

**Voice.** Second person, present tense, active voice. "You push the magnet; the field changes."
Not "The magnet is pushed by the experimenter." Confident and curious, never breathless. We explain
a result and then *interrogate* it; we don't sell it.

**Sentence length.** Default short. Aim ~15–20 words average; one idea per sentence. Vary rhythm —
a short punch after a longer build is how the bridge's "the break" beat should land. Never chain
three subordinate clauses in physics exposition; split them.

**Words vs. formulas.** State the idea in words first, then the formula as its compact form, then
(if non-trivial) one sentence of what the symbols *do*. If a sentence and an equation say the same
thing, keep both only when one serves accessibility/intuition and the other precision — otherwise
cut one. Reserve display formulas (`formula` block) for results worth remembering; keep incidental
algebra inline (`$...$`) or inside a `derivation` `<details>`.

**Figure captions.** One sentence, declarative, states the *takeaway* not the contents. Good:
"The force flips when the velocity reverses." Weak: "Diagram of a charge in a magnetic field." If
the figure is interactive, the caption may add a one-clause instruction ("drag to rotate"), as
`00-matter`'s atom caption does.

**Term links.** Link a term `[[term-id|label]]` on its **first meaningful use** in a section, not on
every occurrence (repeated links are visual noise and load). Link where a reader might genuinely
want the definition, not as decoration. Keep the visible label natural in the sentence; keep the id
canonical and identical across EN/IT. Use `[[chapter:NN-id#section|label]]` for forward/backward
crossrefs, especially in bridge beat 4 and opener back-references.

**Callouts.** Match variant to intent: `prereq` (what you need first), `note` (aside),
`key`/`insight` (the idea to hold onto), `warning` (common error or tension), `law` (a stated
physical law), and the proposed `motivation`/`bridge` (§3.2) for the narrative seams. One main idea
per callout; if it needs three paragraphs it's a section, not a callout.

**Numbers & units.** Wrap inline quantities in the `.quantity` style where mono/tabular alignment
helps; always pair a number with its unit; use the same symbol set as the existing chapters
(e.g. `e`, `c`, `B`, `\vec{F}`).

---

## 7. Author checklist (per chapter)

- [ ] Opener present as first section (`id: 'why'`): stake → lens → gap, ends on a question, < ~120 words/lang.
- [ ] `prereq` is factual and separate from the opener.
- [ ] Each core concept appears in ≥ 2 representations (prose/eqn/diagram/table/interactive) saying the *same* thing.
- [ ] Concept stated in words before its equation; every non-trivial formula has a one-line word gloss (`note`).
- [ ] At least one worked example uses a `derivation` `<details>` before asking the reader to apply it.
- [ ] Section-level recall prompt(s) where useful (`recall` block / `<details>`).
- [ ] Bridge present as last section (`id: 'bridge'`), after `key-formulas`: restate → push → break → door, with a forward crossref.
- [ ] Bridge's forward tension matches the named arc in §2.3; next chapter's opener back-references it.
- [ ] EN and IT both authored, term ids identical, math identical, labels localized.
- [ ] Every diagram has a takeaway caption; no fact lives only in a figure; interactive figures have a fallback.
- [ ] Every callout has a real title (meaning never rides on color alone).

---

## Sources

- Golman & Loewenstein — [Curiosity, Information Gaps, and the Utility of Knowledge](https://www.cmu.edu/dietrich/sds/docs/golman/golman_loewenstein_curiosity.pdf)
- Bybee et al. — [The 5E Instructional Model (ERIC)](https://files.eric.ed.gov/fulltext/EJ1058007.pdf)
- HMH — [5E Instructional Model Explained](https://www.hmhco.com/blog/5e-instructional-model)
- Edutopia — [How to Use the 5E Model in Science Classes](https://www.edutopia.org/article/how-use-5e-model-your-science-classroom/)
- Montana State — [Guided inquiry using the 5E model with high-school physics](https://scholarworks.montana.edu/items/f1736680-a88b-424a-bdda-502f2cd321ec)
- ERIC — [Cognitive Load Theory and the Use of Worked Examples](https://files.eric.ed.gov/fulltext/EJ1161818.pdf)
- [Cognitive Load Theory & Worked Examples in Physics (distance learners)](https://www.researchgate.net/publication/320159720_Cognitive_Load_Theory_and_the_Use_of_Worked_Examples_as_an_Instructional_Strategy_in_Physics_for_Distance_Learners_A_Preliminary_Study)
- [Multiple Representations in Physics and Science Education — Why Should We Use Them?](https://www.researchgate.net/publication/318675720_Multiple_Representations_in_Physics_and_Science_Education_-_Why_Should_We_Use_Them)
- Nature Reviews Psychology — [The science of effective learning with spacing and retrieval practice](https://www.nature.com/articles/s44159-022-00089-1)
- Evidence Based Education — [Retrieval and Spaced Practice](https://evidencebased.education/resource/retrieval-and-spaced-practice-study-strategies-that-must-be-combined/)
- Phys. Rev. PER — [Can contextualized physics problems enhance student motivation?](https://link.aps.org/doi/10.1103/2g1b-hmhq)
- AEM Center / CAST — [Creating Accessible STEM Materials](https://aem.cast.org/create/accessible-stem-materials)
- Colorado State — [Math Content accessibility best practices](https://www.chhs.colostate.edu/accessibility/best-practices-how-tos/math-content/)
- Johns Hopkins Engineering — [Making Equations in Online Learning Accessible](https://support.cmts.jhu.edu/hc/en-us/articles/360036149352-Making-Equations-in-Online-Learning-Accessible)
