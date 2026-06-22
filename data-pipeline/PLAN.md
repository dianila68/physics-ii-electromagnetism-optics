# Data Pipeline — Plan (PLANNING ONLY)

A pipeline to (a) produce factual **term/definition** data for `public/terms.json` and
(b) produce **motivation/narrative** copy (chapter openers + end-of-chapter bridges) for
the `src/chapters/*/index.ts` `ChapterData` objects.

This document is a plan. **No production code is implemented here**, and the pipeline must
**never modify existing files in place**. It writes only to `data-pipeline/` and emits
*candidate* artifacts a human reviews and copies into the real source files via a normal
PR/commit.

Grounding (read before building):
- `src/content/terms.ts` — the `TermDef` interface (the contract every term emit must match).
- `public/terms.json` — the runtime artifact `loadTerms()` fetches; the final emit target.
- `update_terms.py` — the existing Wikipedia-extract fetcher (the starting point for ingest).
- `dump_terms.ts` — regenerates `public/terms.json` from `src/content/terms.ts`.
- `src/chapters/00-matter/index.ts` — canonical `ChapterData` shape (sections, blocks, `[[term-id|display]]` links, callout variants).
- `CONVENTIONS.md` — design vocabulary (callout variants, eyebrow, prose), tone.

---

## 0. The two content products

| Product | Source of truth | Target field(s) | How produced |
|---|---|---|---|
| **(a) Term definitions** | Wikipedia (REST/extracts) + Wikidata (quantities/constants) | `TermDef.shortEn/It`, `longEn/It`, `latex`, `seeAlso`, `wikipedia` in `terms.json` | scrape → normalize → (Haiku) condense/translate → (Opus) review |
| **(b) Motivation copy** | Chapter outlines + curriculum order (`part`/`title` from each `src/chapters/*/index.ts`) | new opener block + end-of-chapter bridge block injected into `ChapterData.sections[].blocks` | outline → (Haiku) draft → (Opus) review. **Not scraped** — generated from the book's own structure. |

The existing `TermDef` fields are the hard contract. We do **not** add fields to `terms.ts`
for definitions. For motivation copy we emit standard existing block shapes (`paragraph`,
`callout`) so no renderer change is needed — see §4.

---

## 1. Sources (factual data)

### 1.1 Which Wikipedia API
Two complementary endpoints; prefer the one that matches the need:

1. **`action=query&prop=extracts`** (already used by `update_terms.py`):
   `https://{lang}.wikipedia.org/w/api.php?action=query&prop=extracts&exintro&explaintext&redirects=1&titles=...&format=json`
   - Gives the plain-text lead section. This is the **primary** ingest source for `longEn/longIt`
     raw material. Keep `redirects=1` (handles "Electric field" → canonical title).
   - Add `&exsentences=N` is *not* reliable across wikis; instead pull the full intro and let
     the condense step (§3) trim — same as today.
2. **MediaWiki REST summary**: `https://{lang}.wikipedia.org/api/rest_v1/page/summary/{title}`
   - Returns a short `extract` + `extract_html` + canonical title + `description`. Good cheap
     candidate for `shortEn/It` seed and for confirming the canonical page (dedup against `wikipedia` field).
   - Note REST is per-language host; the IT page is fetched from `it.wikipedia.org`, not via langlinks.

**Wikidata** (`https://www.wikidata.org/w/api.php` / `https://query.wikidata.org/sparql`) for
**quantities, units, and physical constants** — the structured numeric facts that LLMs most
often hallucinate:
- elementary charge (Q2101), electron mass, speed of light, vacuum permittivity, etc.
- Pull the canonical value + unit + uncertainty from Wikidata statements and feed them into the
  `latex` field and into `short*` numerically (e.g. electron's `latex: e^- \\quad m_e = 9.109\\times10^{-31}\\,\\text{kg}`).
- Wikidata is the **authority for numbers**; prose comes from Wikipedia; the LLM only rewrites,
  it does not invent numeric values.

### 1.2 Licensing / attribution (load-bearing)
- Wikipedia prose is **CC BY-SA 4.0**. Text *derived* from it (paraphrase, translation,
  condensation) is a derivative work and inherits **share-alike + attribution** obligations.
- Implications for this pipeline:
  - **Attribution**: every term whose `long*`/`short*` derives from a Wikipedia article must
    record the source article + permalink (revision id) + license. We already have a `wikipedia`
    field for the EN title; the pipeline additionally records source metadata in the *intermediate*
    record (`provenance`, see §4 schema) so attribution can be surfaced (e.g. a credits page or a
    per-term "source" link in the term panel). Capture the **`revid`** (`prop=info` or REST `rev`)
    so attribution points at the exact revision used.
  - **Share-alike**: the book must be able to license the derived definition text under a
    CC BY-SA-compatible license, OR the derived text must be rewritten far enough to be an
    independent expression of the underlying facts (facts themselves are not copyrightable). The
    safe-by-default posture: treat `long*` as CC BY-SA-derived (attribute + SA), and treat
    `short*` (terse factual one-liners, often just the numeric facts) as fact statements.
  - **Wikidata** is **CC0** — no attribution required for the numeric values. Prefer Wikidata for
    anything that can be expressed as a fact/number to minimize SA scope.
  - **Open question for the maintainer** (see §6): confirm the book's overall license and whether
    a CC BY-SA section/credits page is acceptable. This gates how aggressively `long*` can be used.

### 1.3 Scoping articles per term / per chapter
- **Per term**: the term id (e.g. `electric-field`) maps to an explicit `wikipedia` title in the
  intermediate record. The pipeline does **not** guess from `labelEn` blindly (current
  `update_terms.py` falls back to `labelEn`, which mis-resolves for ambiguous terms). Instead:
  1. If `wikipedia` is set in `terms.ts`, use it.
  2. Else resolve via REST summary + `redirects=1`, then **flag for human confirmation** if the
     resolved `description` doesn't look physics-y (cheap heuristic + low-confidence flag, §5).
- **Per chapter**: term selection is driven by what chapters actually reference. Extract every
  `[[term-id|...]]` token from `src/chapters/*/index.ts` (the renderer already uses this syntax —
  see `00-matter/index.ts`). The union of referenced ids = the **required term set**. This both
  scopes ingest (don't fetch terms nothing links to) and feeds link-integrity validation (§5).
- IT article titles: prefer the term's `labelIt`, then Wikipedia **langlinks** from the EN page
  (more reliable than guessing), then REST summary on `it.wikipedia.org`.

---

## 2. Motivation content (generated, not scraped)

The pedagogy effort defines, per chapter:
- a **"why" opener** — "why study this / why physics / why this chapter" (chapter-opening hook), and
- an **end-of-chapter cliffhanger bridge** — a curiosity teaser pointing to the next chapter.

These are **authored from outlines**, never scraped:
- **Inputs** (all already in the repo): each chapter's `part`, `title`, `subtitle`, `prereq`, and
  the section titles (`sections[].title`) from `src/chapters/*/index.ts`; the global chapter order
  (00→07); plus a short per-chapter outline file the pedagogy team writes under
  `data-pipeline/outlines/<chapter-id>.md` (motivation brief, key tension, the "hook question",
  and what the next chapter unlocks).
- **Generation**: Haiku drafts EN from the outline; Haiku translates to IT; Opus reviews for
  pedagogy + tone (see §3). No external sources — this is original narrative copy, so **no CC BY-SA
  concern** and no attribution needed.
- **Bridges reference the next chapter**: the bridge prompt is given the *next* chapter's `title`
  + outline so the cliffhanger is accurate ("…but a moving charge breaks this symmetry — that's
  where magnetism begins"). The last chapter's bridge points outward (further study), not to a
  non-existent chapter.
- **Tone contract**: openers/bridges must match `CONVENTIONS.md` voice and use existing block
  shapes. An opener is emitted as a `callout` (`variant: 'insight'` or `'key'`) or a lead
  `paragraph`; a bridge as a `callout` (`variant: 'note'`). Bilingual `{en, it}` always.

---

## 3. Outsourcing generation to cheaper models (tiered strategy)

**Model tiers** (ids from the Claude API model catalog):

| Tier | Model id | Role | Why |
|---|---|---|---|
| Bulk draft + translate | `claude-haiku-4-5` ($1/$5 per MTok) | First-draft condensation of Wikipedia leads → `short*`/`long*`; EN↔IT translation; first-draft openers/bridges | Cheapest, fast, more than capable for "rewrite this factual paragraph to 2 sentences" and "translate EN→IT". Bulk volume lives here. |
| Review / final pass | `claude-opus-4-8` ($5/$25 per MTok) | Quality gate: fact-check rewrite vs source, LaTeX sanity, EN/IT semantic parity, pedagogy review of motivation copy, low-confidence adjudication | Only runs on items Haiku produced (or on flagged items), so the expensive model processes a fraction of total tokens. |

Rationale: the bulk work (hundreds of term definitions × 2 languages × 2 lengths, plus
translation) is mechanical rewriting where Haiku quality is sufficient. Opus is reserved for
*judgment* — does the paraphrase preserve the source's facts, is the LaTeX valid, do EN and IT
say the same thing, is the hook pedagogically sound. This keeps ~80–90% of tokens on the cheap
tier. A human gate sits after Opus (§3.4).

Defaults for both tiers: adaptive thinking (`thinking: {type: "adaptive"}`); `effort: "low"`
for Haiku bulk drafts (mechanical), `effort: "high"` for the Opus review pass. Use **structured
outputs** (`output_config.format` with a JSON schema) so every model returns the exact
intermediate record — no prefill, no brittle parsing. Parse tool/JSON output with a real JSON
parser, never string matching.

### 3.1 Batching
- Run drafts and translations through the **Message Batches API** (`client.messages.batches`)
  at **50% cost** — definition/translation work is not latency-sensitive. One batch request per
  term-language-task, keyed by a `custom_id` like `term:electric-field:longEn:draft`. Results
  arrive unordered → key by `custom_id`, never by position.
- **Prompt caching**: the system prompt + the style guide + the `TermDef`/schema contract are a
  stable prefix shared across every request → put them first with a `cache_control` breakpoint so
  the bulk run pays the large shared prefix once at ~0.1× thereafter. Keep the per-term content
  (the Wikipedia extract) *after* the breakpoint.

### 3.2 Example prompt templates
Stored under `data-pipeline/prompts/` (planning stubs, see those files):
- `term-condense.md` — Haiku: Wikipedia lead → `shortEn` + `longEn` (+ a confidence self-rating).
- `term-translate.md` — Haiku: EN field → IT field, physics-terminology-aware.
- `motivation-opener.md` — Haiku: chapter outline → bilingual opener.
- `motivation-bridge.md` — Haiku: this chapter + next chapter → bilingual cliffhanger.
- `review-gate.md` — Opus: given source + draft, return {approved | revised | reject} + reasons.

### 3.3 Cost/quality rationale (sketch)
For ~150 terms × (shortEn, shortIt, longEn, longIt) = 600 fields, each a short rewrite/translation:
- Haiku bulk via Batches dominates and is cheap (small inputs, small outputs, 50% batch discount,
  cached shared prefix). Opus review runs once per field on the *output* (smaller than re-deriving)
  and only at full price on flagged items. The expensive tier sees a minority of tokens.
- Re-baseline real costs with `count_tokens` against `claude-haiku-4-5` and `claude-opus-4-8` on a
  representative sample before committing to a budget — don't trust this sketch as a number.

### 3.4 Human / strong-model review gate
- Opus is the **automated** gate; a **human** is the final gate. The pipeline never writes to
  `terms.json` or chapter files directly. It emits candidate JSON + a human-readable diff report;
  a maintainer reviews and merges. Items Opus marks `reject` or low-confidence are surfaced first.

---

## 4. Pipeline stages & schema

### 4.1 Stages
```
ingest → normalize → generate → translate → review → emit
```

1. **ingest** — fetch Wikipedia extracts (EN + IT) + REST summary + Wikidata
   values for each required term id (term set derived from chapter `[[...]]` refs, §1.3).
   For motivation: read chapter outlines. Cache every raw HTTP response on disk keyed by
   `(source, title, lang, revid)` so re-runs don't re-hit the network.
2. **normalize** — clean extracts (strip residual markup), attach `provenance` (source title,
   url, **revid**, license), resolve canonical titles + langlinks, attach Wikidata numeric facts.
3. **generate** — Haiku drafts `shortEn`/`longEn` from the EN normalized source; drafts motivation
   openers/bridges from outlines. Emits a confidence self-rating.
4. **translate** — Haiku produces `shortIt`/`longIt` from the approved EN (translate EN→IT rather
   than independently condensing the IT Wikipedia article, so EN and IT stay in lock-step; the IT
   Wikipedia extract is kept as a cross-check, not the primary).
5. **review** — Opus checks each item against its source + the EN/IT pair against each other +
   LaTeX + pedagogy (motivation). Marks `approved`/`revised`/`reject` + confidence.
6. **emit** — write candidate artifacts to `data-pipeline/out/`:
   - `terms.candidate.json` — same shape as `public/terms.json`, ready for human review/merge.
   - `chapters/<id>.motivation.json` — the opener + bridge blocks to be inserted into that
     chapter's `ChapterData.sections`.
   - `report.md` — per-item provenance, confidence, and what changed vs current `terms.json`.

   **Emit never overwrites source files.** A separate, human-run merge step copies approved
   content into `src/content/terms.ts` (then `dump_terms.ts` regenerates `terms.json`) and into the
   chapter `index.ts` files.

### 4.2 Intermediate JSON schema → existing fields
The intermediate record (see `schema/term-record.schema.json`) is a superset of `TermDef` plus
pipeline metadata that is **dropped** on emit:

| Intermediate field | Maps to | Notes |
|---|---|---|
| `id` | object key in `terms.json` | from chapter `[[id|...]]` refs |
| `labelEn` / `labelIt` | `TermDef.labelEn` / `labelIt` | from `terms.ts` (preserved, not regenerated) |
| `shortEn` / `shortIt` | `TermDef.shortEn` / `shortIt` | Haiku draft/translate, Opus-reviewed |
| `longEn` / `longIt` | `TermDef.longEn` / `longIt` | derived from Wikipedia lead (CC BY-SA) |
| `latex` | `TermDef.latex` | from Wikidata values; validated §5 |
| `seeAlso` | `TermDef.seeAlso` | must be existing ids; validated §5 |
| `wikipedia` | `TermDef.wikipedia` | canonical EN title |
| `provenance` | *dropped on emit* | `{sourceTitle, url, revid, license}` for attribution/credits |
| `confidence` | *dropped on emit* | 0–1 self-rating + Opus rating; drives flags |
| `reviewStatus` | *dropped on emit* | `approved`/`revised`/`reject` |

Motivation records (`schema/motivation-record.schema.json`) carry `chapterId`, `kind`
(`opener`|`bridge`), and a `block` payload that is a valid `ChapterData` block (`callout` or
`paragraph`) with bilingual `{en, it}` text — so emit produces something insertable verbatim.

### 4.3 Idempotency, caching, rate limits, EN/IT sync
- **Idempotency**: cache key includes the Wikipedia **revid** and a hash of the prompt template +
  model id. If source revid and prompt are unchanged, the cached generation is reused — re-running
  the pipeline is a no-op and produces a byte-identical candidate. Changing a prompt template or
  bumping a model id invalidates only the affected stage.
- **Caching**: two layers — (1) on-disk HTTP cache for Wikipedia/Wikidata; (2) prompt caching on
  the shared system/style prefix (§3.1).
- **Rate limits**: Wikipedia/Wikidata — keep the existing `time.sleep` politeness + a descriptive
  `User-Agent`; obey `maxlag`. Claude — the SDK auto-retries 429/5xx with backoff; Batches sidesteps
  per-minute pressure for the bulk run.
- **EN/IT sync**: IT is generated **from approved EN** (translate, not re-derive), and the review
  step explicitly checks EN/IT semantic parity. A change to an EN field marks its IT counterpart
  stale (sync flag) so the pair is regenerated together — they never drift independently.

---

## 5. Validation

Run on every candidate before it reaches a human; failures become flags in `report.md`.

1. **LaTeX sanity** — every `latex` field and every inline `$...$` in `long*`/motivation text must
   parse. Render-check with the same KaTeX/MathJax the book uses (offline parse, no network); a
   parse error blocks emit for that field. Also balance-check `$` and `\(\)` and braces.
2. **Term-link integrity** — extract every `[[term-id|...]]` from emitted motivation blocks **and**
   every `seeAlso` id from term records; assert each id exists as a key in the final term set.
   Dangling reference → block. (Mirror the renderer's link syntax exactly; cf. `00-matter/index.ts`.)
   Also assert the reverse: every term referenced by a chapter has a record (no missing definitions).
3. **Factual review** — Opus diff of draft vs source: does the rewrite preserve the source's claims
   and (critically) its **numbers/units**? Numeric values are additionally hard-checked against the
   Wikidata value where one exists — an LLM-altered constant is a hard fail.
4. **Low-confidence flagging** — surface for mandatory human review when any of: Haiku
   self-confidence < threshold; Opus status ≠ `approved`; ambiguous/uncertain article resolution
   (§1.3); EN/IT length or claim-count mismatch beyond tolerance; numeric mismatch vs Wikidata;
   first-time term (no prior `terms.json` entry to diff against).
5. **Schema validation** — emitted `terms.candidate.json` must validate against the `TermDef`
   contract (required EN/IT fields present, types correct) before a human sees it.

---

## 6. Phased rollout, open questions, risks

### Phased rollout
1. **Phase 0 — scaffolding (no model calls):** build ingest + normalize + the on-disk cache;
   reproduce today's `update_terms.py` behavior but writing to `data-pipeline/out/` instead of
   overwriting `terms.json`. Derive the required term set from chapter `[[...]]` refs. Validate
   link integrity + schema only.
2. **Phase 1 — Haiku bulk on one chapter (00-matter):** condense + translate the ~dozen terms that
   chapter references; run validation; hand the candidate + report to a human. Tune prompts/thresholds.
3. **Phase 2 — add Opus review gate + Wikidata numeric authority + full validation;** expand to all
   chapters' term sets via Batches.
4. **Phase 3 — motivation content:** wire outlines, generate openers/bridges, pedagogy review,
   emit insertable blocks for one chapter, then all.
5. **Phase 4 — operationalize:** idempotent re-runs, EN/IT staleness tracking, credits/attribution
   surface, optional CI check that flags chapter `[[...]]` refs with no term record.

### Open questions
- **License**: what is the book's license, and is a CC BY-SA credits page / per-term source link
  acceptable? This gates how much Wikipedia-derived `long*` text can ship vs how much must be
  rewritten to independent expression. (§1.2)
- **`short*` policy**: keep `short*` as pure fact statements (minimize SA scope) or allow
  Wikipedia-derived phrasing (requires attribution)?
- **Term-set ownership**: is the chapter `[[...]]`-reference union the authoritative term list, or
  is there a separate canonical list the maintainer keeps? (Affects "missing definition" checks.)
- **Where attribution surfaces**: term panel, a credits page, or both? Needs a UI decision.
- **Motivation block placement**: exact insertion point in each `ChapterData` (opener as first
  block of the first section vs a dedicated lead; bridge as last block of the last section) —
  confirm with the pedagogy team and renderer.

### Risks
- **Hallucinated numbers** — mitigated by Wikidata-as-numeric-authority + hard numeric checks (§5.3),
  but novel constants without Wikidata coverage still need human eyes.
- **EN/IT drift** — mitigated by translate-from-EN + parity review; risk remains for physics idioms
  that don't map cleanly (flag for a bilingual reviewer).
- **Share-alike contamination** — over-using Wikipedia prose could impose SA on the whole book;
  mitigated by preferring Wikidata facts and by the rewrite-to-independent-expression posture, but
  ultimately a licensing decision (open question above).
- **Silent cache invalidation** — a timestamp/UUID slipping into the cached prompt prefix would
  destroy prompt-cache hits; keep the prefix byte-stable and verify `cache_read_input_tokens`.
- **Over-trusting Opus as the only gate** — keep the human merge step; Opus is a filter, not the
  final authority, for factual and pedagogical correctness.
