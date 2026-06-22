// Wikipedia ingest (PLAN §1.1, §4.1 "ingest"/"normalize").
//
// Two endpoints, both real HTTP via global fetch:
//   1. action=query&prop=extracts&exintro&explaintext  -> plain-text lead (longEn raw)
//      + prop=info (revid) + prop=langlinks (resolve the IT article title)
//   2. REST summary /api/rest_v1/page/summary/<title>   -> short `extract` (shortEn seed)
//
// Robustness (sandbox-safe):
//   - every request has an AbortController timeout (default 8s) so we never hang
//   - responses are cached on disk under data-pipeline/cache keyed by
//     (source, lang, title) so re-runs are a no-op and don't re-hit the network
//   - on network failure we throw a typed NetworkError; the caller decides whether
//     to fall back to the built-in fixture (smoke test) or report and stop.
//
// Politeness (PLAN §4.3): descriptive User-Agent + small inter-request sleep,
// and we pass maxlag=5 on the Action API.

import { promises as fs } from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const USER_AGENT =
  'PhysicsII-DataPipeline/1.0 (https://github.com/; educational textbook term notes; contact: maintainer)';

export class NetworkError extends Error {
  constructor(message) {
    super(message);
    this.name = 'NetworkError';
  }
}

function cacheKey(source, lang, title) {
  const h = crypto.createHash('sha1').update(`${source}|${lang}|${title}`).digest('hex').slice(0, 16);
  const safe = title.replace(/[^a-z0-9]+/gi, '_').slice(0, 40);
  return `${source}.${lang}.${safe}.${h}.json`;
}

async function readCache(cacheDir, source, lang, title) {
  try {
    const p = path.join(cacheDir, cacheKey(source, lang, title));
    return JSON.parse(await fs.readFile(p, 'utf8'));
  } catch {
    return null;
  }
}

async function writeCache(cacheDir, source, lang, title, data) {
  await fs.mkdir(cacheDir, { recursive: true });
  const p = path.join(cacheDir, cacheKey(source, lang, title));
  await fs.writeFile(p, JSON.stringify(data, null, 2));
}

async function fetchJson(url, timeoutMs) {
  const ac = new AbortController();
  const t = setTimeout(() => ac.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      signal: ac.signal,
      headers: { 'User-Agent': USER_AGENT, Accept: 'application/json' },
    });
    if (!res.ok) throw new NetworkError(`HTTP ${res.status} for ${url}`);
    return await res.json();
  } catch (err) {
    if (err instanceof NetworkError) throw err;
    // AbortError, DNS/host-not-found, TLS, JSON parse on an error body, etc.
    throw new NetworkError(`fetch failed for ${url}: ${err.message}`);
  } finally {
    clearTimeout(t);
  }
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * Fetch the Action API extract (lead section) + revid + langlinks for one title.
 * Returns { title, extract, revid, pageid, langlink_it } or throws NetworkError.
 */
export async function fetchExtract({ title, lang = 'en', cacheDir, timeoutMs = 8000, sleepMs = 120 }) {
  const cached = await readCache(cacheDir, 'extract', lang, title);
  if (cached) return cached;

  const params = new URLSearchParams({
    action: 'query',
    prop: 'extracts|info|langlinks',
    exintro: '1',
    explaintext: '1',
    redirects: '1',
    lllang: lang === 'en' ? 'it' : 'en',
    lllimit: '1',
    inprop: '',
    maxlag: '5',
    format: 'json',
    formatversion: '2',
    titles: title,
  });
  const url = `https://${lang}.wikipedia.org/w/api.php?${params.toString()}`;
  const data = await fetchJson(url, timeoutMs);
  await sleep(sleepMs);

  const pages = data?.query?.pages ?? [];
  const page = Array.isArray(pages) ? pages[0] : Object.values(pages)[0];
  if (!page || page.missing) {
    const result = { title, lang, missing: true, extract: '', revid: null };
    await writeCache(cacheDir, 'extract', lang, title, result);
    return result;
  }
  const result = {
    title: page.title,
    lang,
    pageid: page.pageid ?? null,
    revid: page.lastrevid ?? null,
    extract: (page.extract ?? '').trim(),
    langlink: page.langlinks?.[0]?.title ?? null, // the cross-language title
    missing: false,
  };
  await writeCache(cacheDir, 'extract', lang, title, result);
  return result;
}

/**
 * Fetch the REST summary (short extract) for one title.
 * Returns { title, extract, description, url, revid } or throws NetworkError.
 */
export async function fetchSummary({ title, lang = 'en', cacheDir, timeoutMs = 8000, sleepMs = 120 }) {
  const cached = await readCache(cacheDir, 'summary', lang, title);
  if (cached) return cached;

  const url = `https://${lang}.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}?redirect=true`;
  const data = await fetchJson(url, timeoutMs);
  await sleep(sleepMs);

  const result = {
    title: data?.titles?.canonical ?? data?.title ?? title,
    lang,
    extract: (data?.extract ?? '').trim(),
    description: data?.description ?? '',
    url: data?.content_urls?.desktop?.page ?? `https://${lang}.wikipedia.org/wiki/${encodeURIComponent(title)}`,
    revid: data?.revision ? Number(data.revision) : null,
    missing: false,
  };
  await writeCache(cacheDir, 'summary', lang, title, result);
  return result;
}

export function pageUrl(lang, title, revid) {
  const base = `https://${lang}.wikipedia.org/wiki/${encodeURIComponent(title.replace(/ /g, '_'))}`;
  return revid ? `https://${lang}.wikipedia.org/w/index.php?title=${encodeURIComponent(title.replace(/ /g, '_'))}&oldid=${revid}` : base;
}

// Trim a Wikipedia plain-text lead to N sentences for the candidate longEn.
// (The PLAN's full pipeline hands the lead to an LLM to condense; this Wikipedia-
// sourcing tool does a deterministic sentence trim so it is runnable with no model.)
export function trimSentences(text, n) {
  if (!text) return '';
  const sentences = text.replace(/\s+/g, ' ').trim().match(/[^.!?]+[.!?]+(\s|$)/g);
  if (!sentences) return text.trim();
  return sentences.slice(0, n).join('').trim();
}
