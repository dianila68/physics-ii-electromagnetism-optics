#!/usr/bin/env node
// fetch-notes.mjs — the runnable Wikipedia-sourcing system (PLAN §4: ingest →
// normalize → emit). It is the implemented core of the planned pipeline: the
// LLM condense/translate/review tiers (§3) are deliberately out of scope here;
// this tool produces deterministic, attributed candidate notes from Wikipedia
// so a human (or the later LLM stages) can refine them.
//
// WHAT IT DOES
//   1. Collect the set of term ids the book hyperlinks to ([[id]] scan) ∪ terms.json keys.
//   2. Resolve each id to a Wikipedia article (override map > terms.json `wikipedia` > labelEn).
//   3. Fetch the EN lead extract (+revid+langlinks) and REST summary; resolve the IT
//      article via langlinks and fetch its lead (cross-check only).
//   4. Write an intermediate notes store: data-pipeline/out/notes.json (one record per term).
//   5. Optionally merge into a candidate terms file: data-pipeline/out/terms.candidate.json
//      (non-destructive: fills only EMPTY fields unless --force). EN is filled from Wikipedia;
//      IT is marked "needs translation" rather than fabricated (langlink IT lead kept as a hint).
//   6. Emit data-pipeline/out/report.md (provenance + what changed + flags).
//
// IMPORTANT: never touches src/ or public/terms.json. Output lives under data-pipeline/out/.
//
// USAGE
//   node data-pipeline/src/fetch-notes.mjs [options]
//     --dry-run        resolve + report, but do NOT write any files
//     --limit N        process only the first N terms (alpha order)
//     --fixture        use the built-in offline fixture instead of live HTTP
//     --merge          also write terms.candidate.json (non-destructive merge into terms.json)
//     --force          with --merge, overwrite non-empty fields too
//     --timeout MS     per-request HTTP timeout (default 8000)
//     --only id1,id2   restrict to specific term ids
//   Run with no flags = live fetch of all terms, write notes.json + report.md.

import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { collectReferencedTermIds } from './termset.mjs';
import { ARTICLE_OVERRIDES } from './overrides.mjs';
import {
  fetchExtract,
  fetchSummary,
  pageUrl,
  trimSentences,
  NetworkError,
} from './wiki.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '..', '..');
const PIPE_DIR = path.resolve(__dirname, '..');
const CACHE_DIR = path.join(PIPE_DIR, 'cache');
const OUT_DIR = path.join(PIPE_DIR, 'out');
const FIXTURE_PATH = path.join(PIPE_DIR, 'fixtures', 'wiki-fixture.json');
const TERMS_JSON = path.join(REPO_ROOT, 'public', 'terms.json');

const LONG_SENTENCES = 4; // PLAN: longEn is 3–5 sentences

function parseArgs(argv) {
  const args = {
    dryRun: false,
    fixture: false,
    merge: false,
    force: false,
    limit: Infinity,
    timeout: 8000,
    only: null,
  };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--dry-run') args.dryRun = true;
    else if (a === '--fixture') args.fixture = true;
    else if (a === '--merge') args.merge = true;
    else if (a === '--force') args.force = true;
    else if (a === '--limit') args.limit = Number(argv[++i]);
    else if (a === '--timeout') args.timeout = Number(argv[++i]);
    else if (a === '--only') args.only = argv[++i].split(',').map((s) => s.trim());
    else if (a === '--help' || a === '-h') args.help = true;
    else console.warn(`[warn] unknown arg: ${a}`);
  }
  return args;
}

function resolveArticle(id, term) {
  if (ARTICLE_OVERRIDES[id]) return { title: ARTICLE_OVERRIDES[id], from: 'override' };
  if (term?.wikipedia) return { title: term.wikipedia, from: 'terms.json' };
  if (term?.labelEn) return { title: term.labelEn, from: 'labelEn (low-confidence)' };
  return { title: id.replace(/-/g, ' '), from: 'id (low-confidence)' };
}

function isEmpty(v) {
  return v === undefined || v === null || String(v).trim() === '';
}

// --- live ingest for one term ---------------------------------------------
async function ingestLive(article, opts) {
  const en = await fetchExtract({ title: article, lang: 'en', cacheDir: CACHE_DIR, timeoutMs: opts.timeout });
  let summary = null;
  try {
    summary = await fetchSummary({ title: en.title || article, lang: 'en', cacheDir: CACHE_DIR, timeoutMs: opts.timeout });
  } catch {
    summary = null; // summary is a nice-to-have; degrade gracefully
  }
  let it = null;
  const itTitle = en.langlink || null;
  if (itTitle) {
    try {
      it = await fetchExtract({ title: itTitle, lang: 'it', cacheDir: CACHE_DIR, timeoutMs: opts.timeout });
    } catch {
      it = null;
    }
  }
  return {
    enTitle: en.title || article,
    enExtract: en.extract,
    enRevid: en.revid,
    enMissing: !!en.missing,
    enSummary: summary?.extract || '',
    enSummaryRevid: summary?.revid ?? null,
    itTitle: it?.title || itTitle,
    itExtract: it?.extract || '',
    itRevid: it?.revid ?? null,
  };
}

// --- fixture ingest for one term ------------------------------------------
function ingestFixture(article, fixture) {
  const f = fixture[article];
  if (!f) return null;
  return {
    enTitle: article,
    enExtract: f.extract_en || '',
    enRevid: f.revid_en ?? null,
    enMissing: false,
    enSummary: f.summary_en || '',
    enSummaryRevid: f.revid_en ?? null,
    itTitle: f.langlink_it || null,
    itExtract: f.extract_it || '',
    itRevid: f.revid_it ?? null,
  };
}

async function main() {
  const opts = parseArgs(process.argv.slice(2));
  if (opts.help) {
    console.log(await fs.readFile(fileURLToPath(import.meta.url), 'utf8').then((s) => s.split('\n').slice(1, 38).join('\n')));
    return;
  }

  // 1) term set
  const { ids: referenced, byFile } = await collectReferencedTermIds(REPO_ROOT);
  const terms = JSON.parse(await fs.readFile(TERMS_JSON, 'utf8'));
  const termKeys = Object.keys(terms);
  const allIds = [...new Set([...referenced, ...termKeys])].sort();

  let workIds = allIds;
  if (opts.only) workIds = workIds.filter((id) => opts.only.includes(id));
  if (Number.isFinite(opts.limit)) workIds = workIds.slice(0, opts.limit);

  const missingDef = referenced.filter((id) => !termKeys.includes(id)); // referenced but no record

  console.log(`[info] referenced term ids: ${referenced.length}`);
  console.log(`[info] terms.json records:  ${termKeys.length}`);
  console.log(`[info] processing:          ${workIds.length}${opts.only ? ' (--only)' : ''}${Number.isFinite(opts.limit) ? ` (--limit ${opts.limit})` : ''}`);
  if (missingDef.length) console.log(`[warn] referenced but NO terms.json record: ${missingDef.join(', ')}`);
  console.log(`[info] mode: ${opts.fixture ? 'FIXTURE' : 'LIVE HTTP'}${opts.dryRun ? ' + DRY-RUN' : ''}`);

  let fixture = null;
  if (opts.fixture) fixture = JSON.parse(await fs.readFile(FIXTURE_PATH, 'utf8'));

  const notes = {};
  const flags = [];
  let netFailed = false;

  for (const id of workIds) {
    const term = terms[id];
    const { title: article, from } = resolveArticle(id, term);
    let ing = null;

    if (opts.fixture) {
      ing = ingestFixture(article, fixture);
      if (!ing) {
        flags.push(`${id}: no fixture entry for "${article}" (skipped)`);
        continue;
      }
    } else {
      try {
        ing = await ingestLive(article, opts);
      } catch (err) {
        if (err instanceof NetworkError) {
          netFailed = true;
          console.error(`[network] ${id} (${article}): ${err.message}`);
          // graceful per-term fallback to fixture if available
          if (!fixture) {
            try {
              fixture = JSON.parse(await fs.readFile(FIXTURE_PATH, 'utf8'));
            } catch {
              fixture = {};
            }
          }
          ing = ingestFixture(article, fixture);
          if (!ing) {
            flags.push(`${id}: network failed AND no fixture for "${article}" — left for retry`);
            continue;
          }
          console.error(`[fallback] ${id}: using fixture for "${article}"`);
        } else {
          throw err;
        }
      }
    }

    if (ing.enMissing) flags.push(`${id}: EN article "${article}" is MISSING on Wikipedia — fix override map`);
    if (from.includes('low-confidence')) flags.push(`${id}: article resolved via ${from} — confirm "${article}"`);
    if (!ing.itTitle) flags.push(`${id}: no IT langlink found — IT needs manual article`);

    const longEn = trimSentences(ing.enExtract, LONG_SENTENCES);
    const shortEn = ing.enSummary || trimSentences(ing.enExtract, 1);

    notes[id] = {
      id,
      labelEn: term?.labelEn ?? '',
      labelIt: term?.labelIt ?? '',
      // EN derived from Wikipedia
      shortEn,
      longEn,
      // IT: NOT fabricated. We provide the IT Wikipedia lead as a hint and mark it
      // as needing translation from the approved EN (PLAN §4 translate-from-EN).
      shortIt: '',
      longIt: '',
      itNeedsTranslation: true,
      itWikipediaHint: trimSentences(ing.itExtract, LONG_SENTENCES),
      wikipedia: ing.enTitle,
      provenance: {
        sourceTitleEn: ing.enTitle,
        urlEn: pageUrl('en', ing.enTitle, ing.enRevid),
        revidEn: ing.enRevid,
        sourceTitleIt: ing.itTitle || null,
        urlIt: ing.itTitle ? pageUrl('it', ing.itTitle, ing.itRevid) : null,
        revidIt: ing.itRevid,
        license: 'CC-BY-SA-4.0',
        licenseNote:
          'Text derived from Wikipedia, licensed CC BY-SA 4.0. Attribution must cite the source article + revision; derived text inherits share-alike. See data-pipeline/README.md and PLAN.md §1.2.',
      },
      resolvedFrom: from,
      fetchedAt: new Date().toISOString(),
    };
    console.log(`  [ok] ${id} -> "${ing.enTitle}"${ing.itTitle ? ` / it:"${ing.itTitle}"` : ''} (${from})`);
  }

  if (netFailed && !opts.fixture) {
    console.warn('\n[warn] one or more live fetches failed (network likely blocked). Records that had a fixture entry used it; others were skipped. Re-run with --fixture for a full offline smoke test, or re-run later when network is available (cache makes successful terms a no-op).');
  }

  // attribution summary block
  const attribution = {
    license: 'CC-BY-SA-4.0',
    note: 'Notes in this store are derived from English (and where present Italian) Wikipedia article lead sections, licensed under CC BY-SA 4.0. Each record carries provenance.sourceTitle/url/revid pointing at the exact revision used. Reuse must preserve attribution and share-alike.',
    wikidataNote: 'Numeric constants (the LLM stages, PLAN §1.1) should be sourced from Wikidata (CC0); not fetched by this Wikipedia-only tool.',
  };

  if (opts.dryRun) {
    console.log(`\n[dry-run] would write ${Object.keys(notes).length} note records to ${path.relative(REPO_ROOT, path.join(OUT_DIR, 'notes.json'))}`);
    console.log(`[dry-run] flags: ${flags.length}`);
    flags.forEach((f) => console.log(`  - ${f}`));
    return;
  }

  await fs.mkdir(OUT_DIR, { recursive: true });

  // 4) intermediate notes store
  const notesStore = { _meta: { generatedAt: new Date().toISOString(), mode: opts.fixture ? 'fixture' : 'live', attribution }, notes };
  await fs.writeFile(path.join(OUT_DIR, 'notes.json'), JSON.stringify(notesStore, null, 2));
  console.log(`\n[write] ${path.relative(REPO_ROOT, path.join(OUT_DIR, 'notes.json'))} (${Object.keys(notes).length} records)`);

  // 5) optional non-destructive merge -> terms.candidate.json
  const changes = [];
  if (opts.merge) {
    const candidate = JSON.parse(JSON.stringify(terms)); // deep copy; we never touch the real file
    for (const [id, note] of Object.entries(notes)) {
      if (!candidate[id]) {
        candidate[id] = { labelEn: note.labelEn, labelIt: note.labelIt, shortEn: '', shortIt: '', longEn: '', longIt: '' };
        changes.push(`${id}: NEW record created`);
      }
      const rec = candidate[id];
      const fill = (field, value, lang) => {
        if (!value) return;
        if (opts.force || isEmpty(rec[field])) {
          if (rec[field] !== value) {
            rec[field] = value;
            changes.push(`${id}.${field}: ${opts.force && !isEmpty(rec[field]) ? 'OVERWROTE' : 'filled'} (${lang})`);
          }
        }
      };
      fill('shortEn', note.shortEn, 'EN');
      fill('longEn', note.longEn, 'EN');
      // IT: never fabricated. Only set a placeholder marker if empty, so the
      // translation stage knows it's pending. With --force we do NOT overwrite IT
      // with EN/Wikipedia text.
      if (isEmpty(rec.shortIt)) {
        rec.shortIt = '';
        // leave empty; flag below
      }
      if (isEmpty(rec.longIt)) {
        rec.longIt = '';
      }
      if (isEmpty(rec.shortIt) || isEmpty(rec.longIt)) {
        changes.push(`${id}: IT fields left empty — NEEDS TRANSLATION (hint in notes.json itWikipediaHint)`);
      }
      if (!rec.wikipedia && note.wikipedia) {
        rec.wikipedia = note.wikipedia;
        changes.push(`${id}.wikipedia: set "${note.wikipedia}"`);
      }
    }
    await fs.writeFile(path.join(OUT_DIR, 'terms.candidate.json'), JSON.stringify(candidate, null, 2));
    console.log(`[write] ${path.relative(REPO_ROOT, path.join(OUT_DIR, 'terms.candidate.json'))} (non-destructive${opts.force ? ', --force' : ''})`);
  }

  // 6) report
  const report = buildReport({ referenced, termKeys, allIds, workIds, missingDef, notes, flags, changes, opts, byFile, attribution });
  await fs.writeFile(path.join(OUT_DIR, 'report.md'), report);
  console.log(`[write] ${path.relative(REPO_ROOT, path.join(OUT_DIR, 'report.md'))}`);
  console.log(`\n[done] ${Object.keys(notes).length} notes, ${flags.length} flags, ${changes.length} candidate changes.`);
}

function buildReport({ referenced, termKeys, workIds, missingDef, notes, flags, changes, opts, attribution }) {
  const lines = [];
  lines.push('# Wikipedia notes — run report', '');
  lines.push(`- generated: ${new Date().toISOString()}`);
  lines.push(`- mode: ${opts.fixture ? 'fixture (offline)' : 'live HTTP'}${opts.merge ? ' + merge' : ''}${opts.force ? ' + force' : ''}`);
  lines.push(`- referenced term ids (book [[...]] scan): ${referenced.length}`);
  lines.push(`- terms.json records: ${termKeys.length}`);
  lines.push(`- processed: ${workIds.length}`);
  lines.push(`- note records produced: ${Object.keys(notes).length}`);
  lines.push('');
  lines.push('## Licensing / attribution');
  lines.push(attribution.note, '', `> ${attribution.wikidataNote}`, '');
  if (missingDef.length) {
    lines.push('## Referenced but missing a terms.json record');
    missingDef.forEach((id) => lines.push(`- \`${id}\``));
    lines.push('');
  }
  lines.push('## Flags (need human attention)');
  if (!flags.length) lines.push('_none_');
  else flags.forEach((f) => lines.push(`- ${f}`));
  lines.push('');
  if (opts.merge) {
    lines.push('## Candidate changes (terms.candidate.json)');
    if (!changes.length) lines.push('_no changes — all target fields already populated (run with --force to overwrite)_');
    else changes.forEach((c) => lines.push(`- ${c}`));
    lines.push('');
  }
  lines.push('## Per-term provenance');
  for (const [id, n] of Object.entries(notes)) {
    lines.push(`### ${id}`);
    lines.push(`- article (EN): [${n.provenance.sourceTitleEn}](${n.provenance.urlEn}) rev ${n.provenance.revidEn ?? '?'}`);
    if (n.provenance.sourceTitleIt) lines.push(`- article (IT): [${n.provenance.sourceTitleIt}](${n.provenance.urlIt}) rev ${n.provenance.revidIt ?? '?'}`);
    lines.push(`- resolved from: ${n.resolvedFrom}`);
    lines.push(`- shortEn: ${n.shortEn || '_(empty)_'}`);
    lines.push(`- longEn: ${n.longEn ? n.longEn.slice(0, 200) + (n.longEn.length > 200 ? '…' : '') : '_(empty)_'}`);
    lines.push(`- IT: ${n.itNeedsTranslation ? 'needs translation (EN→IT)' : 'present'}`);
    lines.push('');
  }
  return lines.join('\n');
}

main().catch((err) => {
  console.error('[fatal]', err);
  process.exitCode = 1;
});
