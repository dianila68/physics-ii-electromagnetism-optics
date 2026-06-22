# data-pipeline — Wikipedia notes system

Implements the **Wikipedia-sourcing** part of [`PLAN.md`](./PLAN.md) (§4 `ingest → normalize → emit`)
as a runnable, self-contained tool. It systematically fills the book's hyperlink
targets ("terms") with factual notes sourced from Wikipedia.

It is **self-contained under `data-pipeline/`** and is *not* part of the app's `src`
build. It is **zero-dependency** (plain Node ESM, global `fetch`) — no install step.

> Scope note: the LLM tiers from the PLAN (Haiku condense/translate, Opus review —
> §3) are intentionally **not** implemented here. This tool does deterministic
> ingest + a sentence-trim so it runs with no API keys. Its `notes.json` output is
> the exact input those later stages consume.

## What it does

1. **Collect the term set** — scans the book for hyperlink targets `[[id]]` /
   `[[id|label]]` across `src/chapters/*/index.ts`, `src/content/narrative.ts`,
   and `src/main.ts` (margin notes), and unions that with the keys of
   `public/terms.json`. The `[[chapter:...]]` cross-reference syntax is excluded
   (it is not a term). See `src/termset.mjs`.
2. **Resolve each term to a Wikipedia article** — precedence:
   `overrides map` → `terms.json` `wikipedia` field → `labelEn` (flagged low-confidence).
   See `src/overrides.mjs`.
3. **Fetch from Wikipedia** (real HTTP, see `src/wiki.mjs`):
   - Action API `prop=extracts&exintro&explaintext&redirects=1` → EN lead (raw `longEn`)
     plus `prop=info` (the **revid** for attribution) and `prop=langlinks` (the IT title).
   - REST summary `/api/rest_v1/page/summary/<title>` → short extract (`shortEn` seed).
   - The IT article (from langlinks) lead is fetched as a **cross-check hint** only.
4. **Write an intermediate notes store** — `out/notes.json`, one record per term,
   with EN fields filled, IT marked `itNeedsTranslation` (never fabricated), and
   full `provenance` (article title, permalink-by-revid URL, CC BY-SA note).
5. **Optionally merge** into a candidate terms file — `out/terms.candidate.json`,
   a **non-destructive** copy of `terms.json` (fills only empty fields unless
   `--force`; IT is never overwritten with EN/Wikipedia text). The real
   `public/terms.json` and everything under `src/` are **never touched**.
6. **Emit a report** — `out/report.md` (provenance, flags, what changed).

## How to run

```bash
# Offline smoke test (built-in fixture; no network) — safe anywhere:
node data-pipeline/src/fetch-notes.mjs --fixture --merge --only electron,electric-field,coulombs-law,magnetic-field

# Live run, all terms, write notes.json + report.md:
node data-pipeline/src/fetch-notes.mjs

# Live run + non-destructive merge into a candidate terms file:
node data-pipeline/src/fetch-notes.mjs --merge

# Inspect without writing anything:
node data-pipeline/src/fetch-notes.mjs --dry-run --limit 5
```

### Flags

| Flag | Effect |
|---|---|
| `--fixture` | Use the built-in offline fixture (`fixtures/wiki-fixture.json`) instead of live HTTP. |
| `--merge` | Also write `out/terms.candidate.json` (non-destructive merge into `terms.json`). |
| `--force` | With `--merge`, overwrite non-empty EN fields too (IT is still never fabricated). |
| `--dry-run` | Resolve + report to stdout, write **no** files. |
| `--limit N` | Process only the first N term ids (alpha order). |
| `--only a,b,c` | Restrict to specific term ids. |
| `--timeout MS` | Per-request HTTP timeout (default 8000). Requests never hang. |

## Term → article override map

For ambiguous terms, `labelEn`/id alone resolves to the wrong article (e.g.
`polarization` → a disambiguation page, `conductor` → an orchestra conductor).
`src/overrides.mjs` pins the canonical EN title per term id. Edit that file to fix
or add a mapping; any id not listed falls back to the `wikipedia` field in
`terms.json`, then to `labelEn` (which is flagged low-confidence in the report).
IT article titles are **not** guessed — they come from the EN page's langlinks.

## Idempotency & caching

- **HTTP cache**: every Wikipedia response is cached on disk under
  `data-pipeline/cache/` keyed by `(source, lang, title)`. Re-runs read the cache,
  so a repeated run does not re-hit the network and successful terms are a no-op.
  Delete the cache dir to force a refresh.
- The output (`notes.json` / `terms.candidate.json`) is regenerated deterministically
  from cache + source, so re-running produces a stable result.
- (PLAN §4.3 also specifies revid-keyed cache invalidation and prompt-hash keys for
  the LLM stages; those apply once the model tiers are wired in.)

## Rate limiting / politeness

- Descriptive `User-Agent` on every request.
- `maxlag=5` on the Action API.
- ~120 ms sleep between requests.
- All requests use an `AbortController` timeout — the tool never hangs on a blocked
  or slow network. On `NetworkError` it reports clearly and (per term) falls back to
  the fixture if an entry exists, otherwise skips the term for a later retry.

## Licensing / attribution (PLAN §1.2)

Wikipedia prose is **CC BY-SA 4.0**; derived/condensed/translated text inherits
**attribution + share-alike**. Every note record carries `provenance` with the
source article title, a permalink URL pinned to the exact **revid**, and a license
note. `notes.json._meta.attribution` summarizes this for a credits surface.
Numeric constants should come from **Wikidata (CC0)** in the later LLM stage — this
Wikipedia-only tool does not fetch them.

## How generated notes flow back into `terms.json`

```
fetch-notes.mjs  →  out/notes.json            (intermediate store, all metadata)
                 →  out/terms.candidate.json   (non-destructive merge, --merge)
                 →  out/report.md              (provenance + flags + diff)

   ↓ human review (the tool never writes src/ or public/)

maintainer copies approved fields into  src/content/terms.ts
   ↓
node --experimental-strip-types dump_terms.ts   (regenerates public/terms.json)
```

EN fields are sourced here; **IT fields are left empty and flagged
`NEEDS TRANSLATION`** — the `itWikipediaHint` in `notes.json` is a cross-check, not
a drop-in. Per the PLAN, IT is produced by translating the approved EN (the LLM
translate stage), keeping EN/IT in lock-step rather than independently derived.

## Files

| Path | Purpose |
|---|---|
| `src/fetch-notes.mjs` | CLI orchestrator (ingest → normalize → emit). |
| `src/termset.mjs` | Scans the book for `[[id]]` hyperlink targets. |
| `src/wiki.mjs` | Wikipedia HTTP (extracts + summary + langlinks), caching, timeouts. |
| `src/overrides.mjs` | term id → canonical EN article title map. |
| `fixtures/wiki-fixture.json` | Offline fixture for the smoke test / network fallback. |
| `out/` | Generated artifacts (`notes.json`, `terms.candidate.json`, `report.md`). |
| `cache/` | On-disk HTTP cache (gitignored). |
